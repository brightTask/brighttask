const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
});

function sendVerificationEmail(email, token) {
  const url = `${process.env.BASE_URL}/verify-email?token=${token}`;
  return transporter.sendMail({
    from: `"Bright Task" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Please verify your email",
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; padding: 30px; text-align: center; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
          <h2 style="color: #00bfa6;">Welcome to BrightTask!</h2>
          <p style="color: #333;">
            To protect your account and give you full access to BrightTask, please verify your email address.
          </p>
          <a href="${url}" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #00bfa6 60%); color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px;">Verify My Email</a>
          <p style="margin-top: 30px; font-size: 12px; color: #999;">
            If you did not sign up for BrightTask, please ignore this email.
          </p>
        </div>
      </div>
    `
  });
}

module.exports = sendVerificationEmail;
