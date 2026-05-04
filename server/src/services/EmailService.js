import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: process.env.SMTP_PORT || 2525,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const EmailService = {
  async sendPasswordResetEmail(email, token) {
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${token}`;

    const mailOptions = {
      from: `"BlinkChat Security" <${process.env.EMAIL_FROM || 'security@blinkchat.com'}>`,
      to: email,
      subject: 'Reset Your BlinkChat Password',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #06b6d4;">BlinkChat Security</h2>
          <p>Hello,</p>
          <p>You requested to reset your password. Click the button below to set a new one. This link will expire in 1 hour.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: #06b6d4; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #64748b; font-size: 0.875rem;">If you didn't request this, you can ignore this email.</p>
          <p style="margin-top: 20px; font-size: 0.75rem; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px;">
            BlinkChat Team
          </p>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Email sent to ${email}`);
    } catch (error) {
      console.error('Error sending email:', error);
      // We don't throw here to avoid crashing the background task
    }
  },
};
