import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 Testing email configuration...');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS length:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 'undefined');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

console.log('🔍 Testing SMTP connection...');
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP Connection failed:', error);
    console.error('❌ Error details:', {
      code: error.code,
      command: error.command,
      response: error.response
    });
  } else {
    console.log('✅ SMTP Connection successful!');
    
   
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: 'Test Email - ITSO ID Tracker',
      text: 'This is a test email to verify the email configuration is working.'
    };
    
    console.log('📧 Sending test email...');
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('❌ Test email failed:', error);
      } else {
        console.log('✅ Test email sent successfully:', info.messageId);
      }
      process.exit(0);
    });
  }
});

