import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10) || 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async ({ to, subject, html, attachments = [] }) => {
  try {
    const info = await transporter.sendMail({
      from: `"VendorBridge System" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      attachments,
    });
    
    console.log(`[EmailService] Message sent: ${info.messageId}`);
    
    // For Ethereal, log the preview URL
    if (process.env.SMTP_HOST.includes('ethereal')) {
      console.log(`[EmailService] Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
    
    return { success: true, messageId: info.messageId, previewUrl: nodemailer.getTestMessageUrl(info) };
  } catch (error) {
    console.error(`[EmailService] Error sending email to ${to}:`, error.message);
    throw new Error('Failed to send email');
  }
};
