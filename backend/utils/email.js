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
      port: Number(process.env.EMAIL_PORT || 587),
      secure: process.env.EMAIL_SECURE === 'true',
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

    // Verify connection configuration
    transporter.verify((error, success) => {
      if (error) {
        console.error('❌ Email SMTP connection failed:', error);
      } else {
        console.log('✅ Email SMTP server is ready to take our messages');
      }
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

// Send order confirmation email with product details
const sendOrderConfirmationEmail = async (email, orderDetails) => {
  const { orderNumber, orderDate, items, subtotal, taxAmount, shippingAmount, totalAmount, shippingAddress, paymentMethod } = orderDetails;

  const itemsHtml = items.map(item => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 15px; vertical-align: top;">
        <strong style="color: #1F2937; font-size: 14px;">${item.product_name || item.name || 'Product'}</strong><br>
        <small style="color: #6B7280; font-size: 12px;">SKU: ${item.product_sku || item.sku || 'N/A'}</small>
      </td>
      <td style="padding: 15px; text-align: center; color: #374151;">${item.quantity || 1}</td>
      <td style="padding: 15px; text-align: right; color: #374151;">₹${parseFloat(item.unit_price || item.price || 0).toFixed(2)}</td>
      <td style="padding: 15px; text-align: right; font-weight: bold; color: #1F2937;">₹${parseFloat(item.total_price || item.total || 0).toFixed(2)}</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation - My Clock</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 700px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; }
        .container { background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #1F2937 0%, #111827 100%); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; font-size: 14px; }
        .content { padding: 30px; }
        .order-badge { background: linear-gradient(135deg, #D4AF37 0%, #B8860B 100%); color: #000; padding: 15px 30px; border-radius: 8px; text-align: center; margin: 20px 0; font-size: 20px; font-weight: bold; }
        .section { margin: 25px 0; }
        .section-title { font-size: 18px; font-weight: 700; color: #1F2937; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #D4AF37; }
        .address-box { background: #F9FAFB; padding: 15px; border-radius: 8px; border-left: 4px solid #D4AF37; }
        .address-box p { margin: 5px 0; color: #374151; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; background: white; }
        th { background: #1F2937; color: white; padding: 12px; text-align: left; font-weight: 600; font-size: 13px; }
        td { padding: 12px; }
        .summary-box { background: #F9FAFB; padding: 20px; border-radius: 8px; margin-top: 20px; }
        .summary-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #E5E7EB; }
        .summary-row:last-child { border-bottom: none; font-weight: bold; font-size: 18px; color: #D4AF37; }
        .total-row { font-size: 20px; font-weight: bold; color: #1F2937; }
        .footer { background: #1F2937; color: white; padding: 25px; text-align: center; font-size: 12px; }
        .footer a { color: #D4AF37; text-decoration: none; }
        .info-box { background: #EFF6FF; border-left: 4px solid #3B82F6; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .info-box p { margin: 5px 0; color: #1E40AF; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>My Clock</h1>
          <p>Premium Timepieces</p>
        </div>
        <div class="content">
          <div class="order-badge">Order Confirmed! 🎉</div>
          
          <div class="section">
            <div class="section-title">Order Information</div>
            <p><strong>Order Number:</strong> ${orderNumber}</p>
            <p><strong>Order Date:</strong> ${orderDate || new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            <p><strong>Payment Method:</strong> ${(paymentMethod || 'COD').toUpperCase()}</p>
          </div>

          <div class="section">
            <div class="section-title">Shipping Address</div>
            <div class="address-box">
              <p><strong>${shippingAddress?.first_name || ''} ${shippingAddress?.last_name || ''}</strong></p>
              <p>${shippingAddress?.address || ''}</p>
              <p>${shippingAddress?.city || ''}, ${shippingAddress?.state || ''} - ${shippingAddress?.zip_code || ''}</p>
              <p>${shippingAddress?.country || 'India'}</p>
              ${shippingAddress?.phone ? `<p><strong>Phone:</strong> ${shippingAddress.phone}</p>` : ''}
            </div>
          </div>

          <div class="section">
            <div class="section-title">Product Details</div>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Unit Price</th>
                  <th style="text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>

          <div class="summary-box">
            <div class="summary-row">
              <span>Subtotal</span>
              <span>₹${parseFloat(subtotal || 0).toFixed(2)}</span>
            </div>
            ${taxAmount > 0 ? `
            <div class="summary-row">
              <span>Tax (GST 18%)</span>
              <span>₹${parseFloat(taxAmount).toFixed(2)}</span>
            </div>
            ` : ''}
            <div class="summary-row">
              <span>Shipping</span>
              <span>${shippingAmount > 0 ? `₹${parseFloat(shippingAmount).toFixed(2)}` : 'Free'}</span>
            </div>
            <div class="summary-row total-row">
              <span>Total Amount</span>
              <span style="color: #D4AF37;">₹${parseFloat(totalAmount || 0).toFixed(2)}</span>
            </div>
          </div>

          <div class="info-box">
            <p><strong>📦 What's Next?</strong></p>
            <p>Your order has been successfully placed and is being processed. You will receive tracking information via email once your order is shipped.</p>
            <p>Expected delivery: 5-7 business days</p>
          </div>

          <p style="margin-top: 30px; color: #6B7280; font-size: 14px;">
            Thank you for choosing My Clock! We appreciate your business and look forward to serving you again.
          </p>
        </div>
        <div class="footer">
          <p><strong>My Clock</strong> - Premium Timepieces</p>
          <p>For any queries, contact us at: <a href="mailto:customercare@myclock.in">customercare@myclock.in</a></p>
          <p>Phone: +91 80806 56656</p>
          <p style="margin-top: 15px; opacity: 0.8;">&copy; ${new Date().getFullYear()} My Clock. All rights reserved.</p>
          <p style="opacity: 0.7; font-size: 11px;">This is an automated email. Please do not reply to this message.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    My Clock - Order Confirmation
    
    Order Number: ${orderNumber}
    Order Date: ${orderDate || new Date().toLocaleDateString()}
    
    Shipping Address:
    ${shippingAddress?.first_name || ''} ${shippingAddress?.last_name || ''}
    ${shippingAddress?.address || ''}
    ${shippingAddress?.city || ''}, ${shippingAddress?.state || ''} - ${shippingAddress?.zip_code || ''}
    ${shippingAddress?.country || 'India'}
    
    Product Details:
    ${items.map(item => `${item.product_name || item.name} x ${item.quantity || 1} - ₹${parseFloat(item.total_price || item.total || 0).toFixed(2)}`).join('\n')}
    
    Total Amount: ₹${parseFloat(totalAmount || 0).toFixed(2)}
    
    Thank you for your purchase!
    
    For queries: customercare@myclock.in
    Phone: +91 80806 56656
  `;

  return await sendEmail({
    to: email,
    subject: `Order Confirmation - ${orderNumber} | My Clock`,
    html,
    text,
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
