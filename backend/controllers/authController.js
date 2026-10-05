const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { executeQuery, executeTransaction } = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');
const { sendOTPEmail, sendPasswordResetEmail } = require('../utils/email');
const {
  generateOTP,
  generateResetToken,
  hashToken,
  sendTokenResponse,
  verifyToken
} = require('../utils/jwt');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    password,
    phone,
    date_of_birth,
    gender
  } = req.body;

  // Validation
  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required fields'
    });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address'
    });
  }

  // Password validation - strong password requirements
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)'
    });
  }

  // Check if user already exists
  const existingUser = await executeQuery(
    'SELECT id FROM users WHERE email = ?',
    [email]
  );

  if (existingUser.rows.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'User already exists with this email'
    });
  }

  // Hash password
  const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Generate OTP (ensure it's a clean 6-digit string)
  const otp = String(generateOTP()).trim();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Create user with transaction to handle race conditions
  try {
    const insertUserQuery = `
      INSERT INTO users (
        first_name, last_name, email, password, phone,
        date_of_birth, gender, email_verification_token, email_verification_expires
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const userValues = [
      first_name,
      last_name,
      email,
      hashedPassword,
      phone || null,
      date_of_birth || null,
      gender || 'other',
      otp, // Store as clean string
      otpExpires
    ];

    const result = await executeQuery(insertUserQuery, userValues);
    const userId = result.insertId;

    // Send OTP email
    const emailResult = await sendOTPEmail(email, otp, 'verification');
    if (!emailResult.success) {
      console.warn('⚠️ OTP email could not be sent, but registration completed. User can request resend OTP.');
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email for verification OTP.',
      userId
    });
  } catch (error) {
    // Handle duplicate email error (race condition)
    if (error.code === 'ER_DUP_ENTRY' || error.message.includes('Duplicate entry')) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email. Please try logging in instead.'
      });
    }
    throw error; // Re-throw other errors
  }
});

// @desc    Verify email with OTP
// @route   POST /api/auth/verify-email
// @access  Public
const verifyEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email and OTP'
    });
  }

  // Trim and validate OTP (should be 6 digits)
  const cleanOTP = String(otp).trim();
  if (cleanOTP.length !== 6 || !/^\d{6}$/.test(cleanOTP)) {
    return res.status(400).json({
      success: false,
      message: 'OTP must be a 6-digit number'
    });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address'
    });
  }

  // First check if user exists and get current OTP
  const userCheck = await executeQuery(
    'SELECT id, first_name, last_name, email, role, is_email_verified, email_verification_token, email_verification_expires FROM users WHERE email = ?',
    [email]
  );

  if (userCheck.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const user = userCheck.rows[0];

  // Check if already verified
  if (user.is_email_verified) {
    return res.status(400).json({
      success: false,
      message: 'Email is already verified'
    });
  }

  // Check if OTP exists
  if (!user.email_verification_token) {
    return res.status(400).json({
      success: false,
      message: 'No OTP found. Please request a new OTP.'
    });
  }

  // Check if OTP is expired
  if (!user.email_verification_expires || new Date(user.email_verification_expires) < new Date()) {
    return res.status(400).json({
      success: false,
      message: 'OTP has expired. Please request a new OTP.'
    });
  }

  // Clean stored OTP (remove any whitespace and ensure it's a string)
  const storedOTP = String(user.email_verification_token || '').trim();

  // Compare OTP (exact string comparison after cleaning)
  if (storedOTP !== cleanOTP) {
    // Debug logging in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 OTP Mismatch Debug (Verify Email):', {
        received: cleanOTP,
        stored: storedOTP,
        receivedLength: cleanOTP.length,
        storedLength: storedOTP.length,
        receivedType: typeof cleanOTP,
        storedType: typeof storedOTP,
        receivedCharCodes: cleanOTP.split('').map(c => c.charCodeAt(0)),
        storedCharCodes: storedOTP.split('').map(c => c.charCodeAt(0))
      });
    }
    return res.status(400).json({
      success: false,
      message: 'Invalid OTP. Please check and try again.'
    });
  }

  // Log successful match in development
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ OTP verified successfully for:', email);
  }

  // OTP is valid - Update user as verified
  await executeQuery(
    'UPDATE users SET is_email_verified = 1, email_verification_token = NULL, email_verification_expires = NULL WHERE id = ?',
    [user.id]
  );

  // Remove sensitive fields
  delete user.email_verification_token;
  delete user.email_verification_expires;

  // Send token response
  sendTokenResponse(user, 200, res, 'Email verified successfully');
});

// @desc    Resend verification OTP
// @route   POST /api/auth/resend-otp
// @access  Public
const resendOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email'
    });
  }

  // Find user
  const { rows } = await executeQuery(
    'SELECT id, is_email_verified FROM users WHERE email = ?',
    [email]
  );

  if (rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  if (rows[0].is_email_verified) {
    return res.status(400).json({
      success: false,
      message: 'Email already verified'
    });
  }

  // Generate new OTP (ensure it's a clean 6-digit string)
  const otp = String(generateOTP()).trim();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

  // Update user with new OTP
  await executeQuery(
    'UPDATE users SET email_verification_token = ?, email_verification_expires = ? WHERE email = ?',
    [otp, otpExpires, email]
  );

  // Send OTP email
  const emailResult = await sendOTPEmail(email, otp, 'verification');
  if (!emailResult.success) {
    return res.status(500).json({
      success: false,
      message: 'Failed to send email. Please check email configuration or try again later.'
    });
  }

  res.json({
    success: true,
    message: 'OTP sent successfully'
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email and password'
    });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address'
    });
  }

  // Find user
  const { rows } = await executeQuery(
    'SELECT id, first_name, last_name, email, password, role, is_active, is_email_verified FROM users WHERE email = ?',
    [email]
  );

  if (rows.length === 0) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  const user = rows[0];

  // Check if user is active
  if (!user.is_active) {
    return res.status(401).json({
      success: false,
      message: 'Account is deactivated'
    });
  }

  // For admin users, skip email verification check
  // For regular users, check email verification
  if (user.role !== 'admin' && user.role !== 'super_admin' && !user.is_email_verified) {
    return res.status(401).json({
      success: false,
      message: 'Please verify your email before logging in. Check your email for verification OTP.'
    });
  }

  // Check password
  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Remove password from user object
  delete user.password;

  // Send token response
  sendTokenResponse(user, 200, res, 'Login successful');
});

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: 'User logged out successfully',
  });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await executeQuery(
    'SELECT id, first_name, last_name, email, phone, date_of_birth, gender, profile_image, is_email_verified, role, created_at FROM users WHERE id = ?',
    [req.user.id]
  );

  res.status(200).json({
    success: true,
    data: user.rows[0],
  });
});

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
const updateDetails = asyncHandler(async (req, res) => {
  const fieldsToUpdate = {
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    phone: req.body.phone,
    date_of_birth: req.body.date_of_birth,
    gender: req.body.gender,
  };

  // Remove undefined fields
  Object.keys(fieldsToUpdate).forEach(key => {
    if (fieldsToUpdate[key] === undefined) {
      delete fieldsToUpdate[key];
    }
  });

  if (Object.keys(fieldsToUpdate).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Please provide fields to update'
    });
  }

  // Build update query
  const setClause = Object.keys(fieldsToUpdate).map(key => `${key} = ?`).join(', ');
  const values = Object.values(fieldsToUpdate);
  values.push(req.user.id);

  await executeQuery(
    `UPDATE users SET ${setClause} WHERE id = ?`,
    values
  );

  // Get updated user
  const updatedUser = await executeQuery(
    'SELECT id, first_name, last_name, email, phone, date_of_birth, gender, profile_image, is_email_verified, role FROM users WHERE id = ?',
    [req.user.id]
  );

  res.status(200).json({
    success: true,
    message: 'User details updated successfully',
    data: updatedUser.rows[0],
  });
});

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Please provide current password and new password'
    });
  }

  // Get user with password
  const { rows } = await executeQuery(
    'SELECT password FROM users WHERE id = ?',
    [req.user.id]
  );

  // Check current password
  const isMatch = await bcrypt.compare(currentPassword, rows[0].password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }

  // Hash new password
  const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  // Update password
  await executeQuery(
    'UPDATE users SET password = ? WHERE id = ?',
    [hashedPassword, req.user.id]
  );

  res.status(200).json({
    success: true,
    message: 'Password updated successfully',
  });
});

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email'
    });
  }

  const { rows } = await executeQuery(
    'SELECT id FROM users WHERE email = ? AND is_active = 1',
    [email]
  );

  if (rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Generate reset token
  const resetToken = generateResetToken();
  const hashedToken = hashToken(resetToken);
  const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Save hashed token to database
  await executeQuery(
    'UPDATE users SET reset_password_token = ?, reset_password_expires = ? WHERE email = ?',
    [hashedToken, resetExpires, email]
  );

  // Send email
  try {
    await sendPasswordResetEmail(email, resetToken);
  } catch (emailError) {
    console.error('Email sending failed:', emailError);
    return res.status(500).json({
      success: false,
      message: 'Failed to send email'
    });
  }

  res.json({
    success: true,
    message: 'Password reset email sent'
  });
});

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const resetToken = req.params.resettoken;

  if (!password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide new password'
    });
  }

  // Hash the token to compare with stored hash
  const hashedToken = hashToken(resetToken);

  // Find user with valid reset token
  const { rows } = await executeQuery(
    'SELECT id FROM users WHERE reset_password_token = ? AND reset_password_expires > NOW()',
    [hashedToken]
  );

  if (rows.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired reset token'
    });
  }

  // Hash new password
  const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Update password and clear reset token
  await executeQuery(
    'UPDATE users SET password = ?, reset_password_token = NULL, reset_password_expires = NULL WHERE id = ?',
    [hashedPassword, rows[0].id]
  );

  res.json({
    success: true,
    message: 'Password reset successful'
  });
});

// @desc    Send OTP for login
// @route   POST /api/auth/send-login-otp
// @access  Public
const sendLoginOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email'
    });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address'
    });
  }

  // Find user
  const { rows } = await executeQuery(
    'SELECT id, first_name, last_name, email, is_active, is_email_verified FROM users WHERE email = ?',
    [email]
  );

  if (rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'User not found with this email'
    });
  }

  const user = rows[0];

  // Check if user is active
  if (!user.is_active) {
    return res.status(401).json({
      success: false,
      message: 'Account is deactivated'
    });
  }

  // Generate OTP (ensure it's a clean 6-digit string)
  const otp = String(generateOTP()).trim();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Update user with login OTP
  await executeQuery(
    'UPDATE users SET login_otp_token = ?, login_otp_expires = ? WHERE email = ?',
    [otp, otpExpires, email]
  );

  // Send OTP email
  const emailResult = await sendOTPEmail(email, otp, 'login');
  if (!emailResult.success) {
    return res.status(500).json({
      success: false,
      message: 'Failed to send OTP email. Please check email configuration or try again later.'
    });
  }

  res.json({
    success: true,
    message: 'OTP sent successfully to your email'
  });
});

// @desc    Login with OTP
// @route   POST /api/auth/login-with-otp
// @access  Public
const loginWithOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email and OTP'
    });
  }

  // Trim and validate OTP (should be 6 digits)
  const cleanOTP = String(otp).trim();
  if (cleanOTP.length !== 6 || !/^\d{6}$/.test(cleanOTP)) {
    return res.status(400).json({
      success: false,
      message: 'OTP must be a 6-digit number'
    });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address'
    });
  }

  // First check if user exists and get current login OTP
  const userCheck = await executeQuery(
    'SELECT id, first_name, last_name, email, role, is_active, is_email_verified, login_otp_token, login_otp_expires FROM users WHERE email = ?',
    [email]
  );

  if (userCheck.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'User not found with this email'
    });
  }

  const user = userCheck.rows[0];

  // Check if user is active
  if (!user.is_active) {
    return res.status(401).json({
      success: false,
      message: 'Account is deactivated'
    });
  }

  // Check if login OTP exists
  if (!user.login_otp_token) {
    return res.status(400).json({
      success: false,
      message: 'No OTP found. Please request a new OTP.'
    });
  }

  // Check if login OTP is expired
  if (!user.login_otp_expires || new Date(user.login_otp_expires) < new Date()) {
    return res.status(400).json({
      success: false,
      message: 'OTP has expired. Please request a new OTP.'
    });
  }

  // Clean stored login OTP (remove any whitespace and ensure it's a string)
  const storedOTP = String(user.login_otp_token || '').trim();

  // Compare OTP (exact string comparison after cleaning)
  if (storedOTP !== cleanOTP) {
    // Debug logging in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 OTP Mismatch Debug (Login):', {
        received: cleanOTP,
        stored: storedOTP,
        receivedLength: cleanOTP.length,
        storedLength: storedOTP.length,
        receivedType: typeof cleanOTP,
        storedType: typeof storedOTP,
        receivedCharCodes: cleanOTP.split('').map(c => c.charCodeAt(0)),
        storedCharCodes: storedOTP.split('').map(c => c.charCodeAt(0))
      });
    }
    return res.status(400).json({
      success: false,
      message: 'Invalid OTP. Please check and try again.'
    });
  }

  // Log successful match in development
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ OTP verified successfully for login:', email);
  }

  // OTP is valid - Clear login OTP after successful login
  await executeQuery(
    'UPDATE users SET login_otp_token = NULL, login_otp_expires = NULL WHERE id = ?',
    [user.id]
  );

  // Remove sensitive fields
  delete user.login_otp_token;
  delete user.login_otp_expires;

  // Send token response
  sendTokenResponse(user, 200, res, 'Login successful');
});

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Public
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: 'Refresh token required'
    });
  }

  try {
    // Verify refresh token
    const decoded = verifyToken(refreshToken);

    // Get user
    const { rows } = await executeQuery(
      'SELECT id, first_name, last_name, email, role, is_active FROM users WHERE id = ? AND is_active = 1',
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Send new token response
    sendTokenResponse(rows[0], 200, res, 'Token refreshed successfully');
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
});

module.exports = {
  register,
  verifyEmail,
  resendOTP,
  login,
  sendLoginOTP,
  loginWithOTP,
  logout,
  getMe,
  updateDetails,
  updatePassword,
  forgotPassword,
  resetPassword,
  refreshToken,
};
