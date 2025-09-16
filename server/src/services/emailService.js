import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter
const createTransporter = () => {
  console.log('🔍 Checking email credentials...');
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASS length:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 'undefined');

  // Check if email credentials are configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS ||
      process.env.EMAIL_USER === 'your-gmail@gmail.com' ||
      process.env.EMAIL_PASS === 'your-app-password') {
    console.log('⚠️  Email credentials not configured. Using console output for testing.');
    return null;
  }

  console.log('✅ Email credentials found, creating transporter...');
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send password reset email
export const sendPasswordResetEmail = async (email, resetToken) => {
  try {
    const transporter = createTransporter();
    const resetUrl = `${process.env.FRONTEND_URL}/?reset-token=${resetToken}`;

    // If email not configured, simulate sending for testing
    if (!transporter) {
      console.log('\n🔗 PASSWORD RESET LINK (Copy this to test):');
      console.log(`${resetUrl}`);
      console.log(`📧 Would be sent to: ${email}\n`);
      return { success: true, messageId: 'simulated-for-testing' };
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Reset Your Password - ITSO ID Tracker',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 40px 20px;">
            
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 40px;">
              <div style="background-color: #4f46e5; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h1 style="margin: 0; font-size: 24px;">🔐 ITSO ID Tracker</h1>
              </div>
            </div>
            
            <!-- Content -->
            <div style="text-align: center;">
              <h2 style="color: #333; margin-bottom: 20px;">Reset Your Password</h2>
              
              <p style="color: #666; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
                We received a request to reset your password for your ITSO ID Tracker account.
                Click the button below to create a new password.
              </p>
              
              <!-- Reset Button -->
              <div style="margin: 30px 0;">
                <a href="${resetUrl}" 
                   style="background-color: #2563eb; 
                          color: white; 
                          padding: 15px 30px; 
                          text-decoration: none; 
                          border-radius: 8px; 
                          font-weight: 600;
                          font-size: 16px;
                          display: inline-block;">
                  Reset Your Password
                </a>
              </div>
              
              <p style="color: #888; font-size: 14px; margin-top: 30px;">
                This link will expire in 1 hour for security reasons.
              </p>
              
              <p style="color: #888; font-size: 14px; margin-top: 20px;">
                If you didn't request this password reset, please ignore this email.
                Your password will remain unchanged.
              </p>
              
              <!-- Footer -->
              <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
                <p style="color: #999; font-size: 12px;">
                  © 2024 ITSO ID Tracker - NU Dasmariñas
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    console.log('📧 Attempting to send email with options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    console.error('❌ Error details:', {
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode
    });
    return { success: false, error: error.message };
  }
};

// Test email configuration
export const testEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('Email configuration is valid');
    return true;
  } catch (error) {
    console.error('Email configuration error:', error);
    return false;
  }
};
