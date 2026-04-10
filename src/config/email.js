const nodemailer = require('nodemailer');

// Email configuration using Gmail SMTP
const createEmailTransporter = () => {
  // Check if email credentials are configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('Email credentials not configured in .env file');
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Your Gmail address
      pass: process.env.EMAIL_PASS, // Your App Password (not regular password)
    },
  });
};

// Send OTP email function
const sendOtpEmail = async (email, otp) => {
  try {
    const transporter = createEmailTransporter();
    
    // If transporter is null, credentials are not configured
    if (!transporter) {
      console.log('Email not configured - OTP will only be logged to console');
      return false;
    }
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset OTP - Your Therapy App',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
          <p style="color: #666; font-size: 16px;">
            You requested to reset your password. Use the OTP below to proceed:
          </p>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <span style="font-size: 24px; font-weight: bold; color: #007bff; letter-spacing: 3px;">
              ${otp}
            </span>
          </div>
          <p style="color: #666; font-size: 14px;">
            This OTP will expire in 10 minutes. If you didn't request this, please ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

module.exports = {
  sendOtpEmail,
};
