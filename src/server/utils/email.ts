import nodemailer from 'nodemailer';
import { logger } from '../config/logger';

// Create transporter
const createTransporter = () => {
  // Check if email is properly configured with safe environment variable access
  const emailUser = process.env.EMAIL_USER || '';
  const emailPass = process.env.EMAIL_PASS || '';
  const emailHost = process.env.EMAIL_HOST || '';
  
  const isEmailConfigured = emailUser && 
                           emailUser !== 'your-email@gmail.com' && 
                           emailPass && 
                           emailPass !== 'your-app-password' &&
                           emailHost;
  
  if (!isEmailConfigured) {
    throw new Error('Email not configured');
  }
  
  return nodemailer.createTransport({
    host: emailHost,
    port: parseInt(process.env['EMAIL_PORT'] || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Send password reset email
export const sendPasswordResetEmail = async (email: string, resetToken: string): Promise<void> => {
  try {
    const transporter = createTransporter();
    
    const resetUrl = `${process.env['CLIENT_URL'] || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: process.env['EMAIL_FROM'] || 'noreply@jelppharm.com',
      to: email,
      subject: 'Password Reset Request - JelpPharm PMS',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
            <h1 style="color: #007bff; margin: 0;">JelpPharm PMS</h1>
            <p style="color: #6c757d; margin: 10px 0;">Pharmacy Management System</p>
          </div>
          
          <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; margin-top: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request</h2>
            
            <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
              You recently requested to reset your password for your JelpPharm PMS account. 
              Click the button below to reset it.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #007bff; color: #ffffff; padding: 12px 30px; 
                        text-decoration: none; border-radius: 5px; display: inline-block; 
                        font-weight: bold; font-size: 16px;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
              If you did not request a password reset, please ignore this email or contact support 
              if you have concerns.
            </p>
            
            <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
              <strong>Note:</strong> This password reset link will expire in 1 hour for security reasons.
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #999; font-size: 14px; text-align: center; margin: 0;">
              If the button above doesn't work, copy and paste this link into your browser:<br>
              <a href="${resetUrl}" style="color: #007bff;">${resetUrl}</a>
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
            <p>© ${new Date().getFullYear()} JelpPharm. All rights reserved.</p>
            <p>This is an automated email, please do not reply.</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    
    logger.info(`Password reset email sent to ${email}: ${info.messageId}`);
    
  } catch (error) {
    logger.error('Failed to send password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

// Send welcome email
export const sendWelcomeEmail = async (email: string, fullName: string): Promise<void> => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env['EMAIL_FROM'] || 'noreply@jelppharm.com',
      to: email,
      subject: 'Welcome to JelpPharm PMS',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
            <h1 style="color: #007bff; margin: 0;">JelpPharm PMS</h1>
            <p style="color: #6c757d; margin: 10px 0;">Pharmacy Management System</p>
          </div>
          
          <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; margin-top: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-bottom: 20px;">Welcome, ${fullName}!</h2>
            
            <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
              Thank you for joining JelpPharm PMS. Your account has been successfully created and 
              you can now access the pharmacy management system.
            </p>
            
            <div style="background-color: #e8f5e8; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #28a745; margin-top: 0;">Getting Started</h3>
              <ul style="color: #555; line-height: 1.6; margin: 0; padding-left: 20px;">
                <li>Log in to your account using your credentials</li>
                <li>Complete your profile information</li>
                <li>Familiarize yourself with the system features</li>
                <li>Contact support if you need assistance</li>
              </ul>
            </div>
            
            <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
              If you have any questions or need help getting started, please don't hesitate to 
              contact our support team.
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #999; font-size: 14px; text-align: center; margin: 0;">
              Welcome to the JelpPharm family!
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
            <p>© ${new Date().getFullYear()} JelpPharm. All rights reserved.</p>
            <p>This is an automated email, please do not reply.</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    
    logger.info(`Welcome email sent to ${email}: ${info.messageId}`);
    
  } catch (error) {
    logger.error('Failed to send welcome email:', error);
    // Don't throw error for welcome email as it's not critical
  }
};

// Send account lockout notification
export const sendAccountLockoutEmail = async (email: string, fullName: string): Promise<void> => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env['EMAIL_FROM'] || 'noreply@jelppharm.com',
      to: email,
      subject: 'Account Security Alert - JelpPharm PMS',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; text-align: center;">
            <h1 style="color: #856404; margin: 0;">⚠️ Security Alert</h1>
            <p style="color: #856404; margin: 10px 0;">JelpPharm PMS</p>
          </div>
          
          <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; margin-top: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-bottom: 20px;">Account Temporarily Locked</h2>
            
            <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
              Dear ${fullName},
            </p>
            
            <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
              We detected multiple failed login attempts on your JelpPharm PMS account. 
              For your security, your account has been temporarily locked.
            </p>
            
            <div style="background-color: #f8d7da; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #721c24; margin-top: 0;">What Happened?</h3>
              <p style="color: #721c24; margin: 0;">
                Your account was locked after multiple failed login attempts. This is a 
                security measure to protect your account from unauthorized access.
              </p>
            </div>
            
            <div style="background-color: #d1ecf1; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #0c5460; margin-top: 0;">What You Can Do</h3>
              <ul style="color: #0c5460; line-height: 1.6; margin: 0; padding-left: 20px;">
                <li>Wait 15 minutes for the automatic unlock</li>
                <li>Ensure you're using the correct password</li>
                <li>Check if Caps Lock is enabled</li>
                <li>Contact support if you continue having issues</li>
              </ul>
            </div>
            
            <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
              If you believe this was an error or need immediate assistance, please contact 
              our support team.
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #999; font-size: 14px; text-align: center; margin: 0;">
              Thank you for your understanding and for helping us keep your account secure.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
            <p>© ${new Date().getFullYear()} JelpPharm. All rights reserved.</p>
            <p>This is an automated email, please do not reply.</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    
    logger.info(`Account lockout email sent to ${email}: ${info.messageId}`);
    
  } catch (error) {
    logger.error('Failed to send account lockout email:', error);
    // Don't throw error for lockout email as it's not critical
  }
};

// Test email configuration
export const testEmailConfig = async (): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    logger.info('Email configuration is valid');
    return true;
  } catch (error) {
    logger.error('Email configuration test failed:', error);
    return false;
  }
};
