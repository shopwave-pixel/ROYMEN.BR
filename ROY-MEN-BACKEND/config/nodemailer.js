import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  pool: true, // Use SMTP pooled connections
  maxConnections: 5
});

/**
 * Send Multi-language English/Bengali OTP Email
 * @param {string} email - Destination email address
 * @param {string} otpCode - Generated 6-digit numeric OTP code
 */
export const sendOTPEmail = async (email, otpCode) => {
  const mailOptions = {
    from: `"ROY MEN Security" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "ROY MEN - Verification Security OTP Code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-b: 2px solid #f1f5f9;">
          <h2 style="color: #12141c; font-size: 28px; margin: 0; letter-spacing: 2px; font-weight: 800;">ROY MEN</h2>
          <span style="color: #d4af37; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px;">Wear Confidence</span>
        </div>
        <p style="font-size: 15px; color: #475569; line-height: 1.6;">Hello,</p>
        <p style="font-size: 15px; color: #475569; line-height: 1.6;">You requested a secure verification code to access your ROY MEN account. Use the session-bound OTP code below to authenticate. This OTP is valid for <strong>10 minutes</strong>.</p>
        <div style="text-align: center; margin: 32px 0;">
          <div style="background-color: #f8fafc; border: 2px dashed #d4af37; display: inline-block; padding: 12px 36px; border-radius: 6px;">
            <span style="font-size: 32px; font-weight: bold; color: #12141c; letter-spacing: 6px; font-family: 'Courier New', monospace;">${otpCode}</span>
          </div>
        </div>
        <p style="font-size: 14px; color: #64748b; line-height: 1.6;">
          <strong>Security Notice:</strong> Never share this code with anyone. ROY MEN personnel will never ask for your authentication OTP.
        </p>
        <p style="font-size: 13px; color: #94a3b8; line-height: 1.5; margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
          If you did not request this code, please ignore this email. Your email address remains secure.
          <br/><br/>
          &copy; 2026 ROY MEN Bangladesh. All Rights Reserved.
        </p>
      </div>
    `
  };

  return await transporter.sendMail(mailOptions);
};

export default transporter;
