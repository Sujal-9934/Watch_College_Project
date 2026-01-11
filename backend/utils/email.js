const nodemailer = require('nodemailer');
require('dotenv').config();

// Create reusable transporter instance
let transporter = null;

// Create or get transporter
const getTransporter = () => {
  // Check if email configuration is available
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return null;
  }

  // Create new transporter if doesn't exist or connection is closed
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      pool: true, // Use connection pooling
      maxConnections: 1,
      maxMessages: 100,
      rateDelta: 1000,
      rateLimit: 5,
    });

    // Handle transporter errors
    transporter.on('error', (error) => {
      console.error('❌ Email transporter error:', error.message);
      // Reset transporter on error so it can be recreated
      transporter = null;
    });
  }

  return transporter;
};

// Reset transporter (useful for reconnection)
const resetTransporter = () => {
  if (transporter) {
    transporter.close();
    transporter = null;
  }
};

// Send email
const sendEmail = async (options) => {
  let retryCount = 0;
  const maxRetries = 2;

  while (retryCount <= maxRetries) {
    try {
      // Check if email configuration is available
      if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('⚠️ Email configuration not found. Email will not be sent.');
        return {
          success: false,
          message: 'Email configuration not available'
        };
      }

      const transporter = getTransporter();
      
      if (!transporter) {
        return {
          success: false,
          message: 'Email transporter not available'
        };
      }

      const mailOptions = {
        from: `${process.env.EMAIL_FROM_NAME || 'Watch Store'} <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', info.messageId);

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      console.error(`❌ Email sending failed (attempt ${retryCount + 1}/${maxRetries + 1}):`, error.message);
      
      if (error.code === 'EAUTH') {
        console.error('Email authentication failed. Please check EMAIL_USER and EMAIL_PASS in .env file');
        return {
          success: false,
          message: 'Email authentication failed',
          error: error.message
        };
      } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
        // Reset transporter and retry
        if (retryCount < maxRetries) {
          console.log('🔄 Resetting transporter and retrying...');
          resetTransporter();
          retryCount++;
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        } else {
          console.error('Email connection failed after retries. Please check EMAIL_HOST and EMAIL_PORT in .env file');
          return {
            success: false,
            message: 'Email connection failed',
            error: error.message
          };
        }
      } else {
        // For other errors, don't retry
        return {
          success: false,
          message: 'Email could not be sent',
          error: error.message
        };
      }
    }
  }

  return {
    success: false,
    message: 'Email sending failed after retries'
  };
};

// Send OTP email
const sendOTPEmail = async (email, otp, type = 'verification') => {
  // Ensure OTP is a clean string (no whitespace)
  const cleanOTP = String(otp).trim();
  
  // Log OTP in development for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log(`📧 Sending OTP email to ${email}: ${cleanOTP}`);
  }
  
  const subject = type === 'verification'
    ? 'Verify Your Email - Watch Store'
    : type === 'login'
    ? 'Login OTP - Watch Store'
    : 'Password Reset OTP - Watch Store';

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .otp-code { font-size: 32px; font-weight: bold; color: #667eea; text-align: center; margin: 20px 0; letter-spacing: 5px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Premium Watch Store</h1>
        <p>Your trusted destination for luxury timepieces</p>
      </div>
      <div class="content">
        <h2>${type === 'verification' ? 'Verify Your Email' : type === 'login' ? 'Login to Your Account' : 'Reset Your Password'}</h2>
        <p>Hello,</p>
        <p>${type === 'verification'
          ? 'Thank you for registering with Premium Watch Store. Please use the following OTP to verify your email address:'
          : type === 'login'
          ? 'You requested to login to your Premium Watch Store account. Please use the following OTP to complete your login:'
          : 'We received a request to reset your password. Please use the following OTP to proceed:'}
        </p>
        <div class="otp-code">${cleanOTP}</div>
        <p><strong>Important:</strong> This OTP will expire in 10 minutes for security reasons.</p>
        <p>If you didn't request this ${type === 'verification' ? 'verification' : type === 'login' ? 'login' : 'password reset'}, please ignore this email.</p>
        <p>Best regards,<br>The Premium Watch Store Team</p>
      </div>
      <div class="footer">
        <p>&copy; 2024 Premium Watch Store. All rights reserved.</p>
        <p>This is an automated message, please do not reply.</p>
      </div>
    </body>
    </html>
  `;

  const text = `
    Premium Watch Store

    ${type === 'verification' ? 'Verify Your Email' : type === 'login' ? 'Login to Your Account' : 'Reset Your Password'}

    Your OTP is: ${cleanOTP}

    This OTP will expire in 10 minutes.

    If you didn't request this, please ignore this email.
  `;

  return await sendEmail({
    to: email,
    subject,
    html,
    text,
  });
};

// Send order confirmation email
const sendOrderConfirmationEmail = async (email, orderDetails) => {
  const { orderNumber, items, totalAmount, shippingAddress } = orderDetails;

  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <strong>${item.name}</strong><br>
        <small>SKU: ${item.sku}</small>
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price.toLocaleString()}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.total.toLocaleString()}</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation - Premium Watch Store</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .order-number { font-size: 24px; font-weight: bold; color: #667eea; text-align: center; margin: 20px 0; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background: #667eea; color: white; padding: 12px; text-align: left; }
        .total { font-weight: bold; font-size: 18px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Order Confirmed!</h1>
        <p>Thank you for shopping with Premium Watch Store</p>
      </div>
      <div class="content">
        <h2>Order Confirmation</h2>
        <div class="order-number">Order #${orderNumber}</div>

        <h3>Shipping Address</h3>
        <p>
          ${shippingAddress.first_name} ${shippingAddress.last_name}<br>
          ${shippingAddress.address_line_1}<br>
          ${shippingAddress.address_line_2 ? shippingAddress.address_line_2 + '<br>' : ''}
          ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postal_code}<br>
          ${shippingAddress.country}
        </p>

        <h3>Order Details</h3>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <p class="total">Total Amount: ₹${totalAmount.toLocaleString()}</p>

        <p>You will receive tracking information once your order is shipped.</p>

        <p>Best regards,<br>The Premium Watch Store Team</p>
      </div>
      <div class="footer">
        <p>&copy; 2024 Premium Watch Store. All rights reserved.</p>
        <p>Need help? Contact us at support@watchstore.com</p>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: email,
    subject: `Order Confirmation - ${orderNumber}`,
    html,
  });
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset - Premium Watch Store</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Premium Watch Store</h1>
        <p>Password Reset Request</p>
      </div>
      <div class="content">
        <h2>Reset Your Password</h2>
        <p>Hello,</p>
        <p>You requested a password reset for your Premium Watch Store account. Please click the button below to reset your password:</p>

        <a href="${resetUrl}" class="button">Reset Password</a>

        <p><strong>Important:</strong> This link will expire in 1 hour for security reasons.</p>
        <p>If you didn't request this password reset, please ignore this email.</p>

        <p>Best regards,<br>The Premium Watch Store Team</p>
      </div>
      <div class="footer">
        <p>&copy; 2024 Premium Watch Store. All rights reserved.</p>
        <p>This is an automated message, please do not reply.</p>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: email,
    subject: 'Password Reset - Premium Watch Store',
    html,
  });
};

module.exports = {
  sendEmail,
  sendOTPEmail,
  sendOrderConfirmationEmail,
  sendPasswordResetEmail,
  resetTransporter,
  getTransporter,
};
