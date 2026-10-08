const jwt = require('jsonwebtoken');
const crypto = require('crypto');
require('dotenv').config();

// Generate JWT token
const generateToken = (payload, expiresIn = process.env.JWT_EXPIRE || '7d') => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

// Generate refresh token
const generateRefreshToken = (payload, expiresIn = process.env.JWT_REFRESH_EXPIRE || '30d') => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, { expiresIn });
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw error;
  }
};

// Verify refresh token
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
  } catch (error) {
    throw error;
  }
};

// Generate OTP
const generateOTP = () => {
  return String(crypto.randomInt(100000, 1000000));
};

// Generate reset password token
const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Hash token for storage (for password reset tokens)
const hashToken = (token) => {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(token).digest('hex');
};

// Create token payload
const createTokenPayload = (user) => {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    firstName: user.first_name,
    lastName: user.last_name,
  };
};

const getAuthCookieOptions = () => ({
  expires: new Date(Date.now() + (Number(process.env.JWT_COOKIE_EXPIRE) || 7) * 24 * 60 * 60 * 1000),
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.COOKIE_SAME_SITE || (process.env.NODE_ENV === 'production' ? 'none' : 'lax'),
});

// Send token response
const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  // Create token payload
  const payload = createTokenPayload(user);

  // Create token
  const token = generateToken(payload);
  const refreshToken = generateRefreshToken({ id: user.id });

  // Remove password from user object
  const userResponse = { ...user };
  delete userResponse.password;

  // Send response
  res
    .status(statusCode)
    .cookie('token', token, getAuthCookieOptions())
    .json({
      success: true,
      message,
      token,
      refreshToken,
      user: userResponse,
    });
};

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
  generateOTP,
  generateResetToken,
  hashToken,
  createTokenPayload,
  sendTokenResponse,
  getAuthCookieOptions,
};
