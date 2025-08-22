const jwt = require('jsonwebtoken');
const sendVerificationEmail = require('./mailer');
require('dotenv').config();

const { User } = require('../models');
/**
 * Middleware to send verification email
 * Assumes: req.body.email exists
 */
async function sendVerificationEmailMiddleware(req, res, next) {

  const id = req.userData?.userId || req.userId;

  if (!id) {
    return res.status(400).json({ success: false, message: 'User Not Found' });
  }

  try {
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (!user.email_verified) {

      const { email } = user;

      if (!email) return res.status(400).json({ success: false, message: "Email is required" });

       console.log(email);
      const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1d' });
      await sendVerificationEmail(email, token);
    }

    if (req.userData?.userId) return res.status(200).json({ success: true, message: "Verification Link Sent" });

    return next();
  } catch (error) {
    console.error("Email sending error:", error);
    res.status(500).json({ message: "Failed to send verification email" });
  }
}

module.exports = sendVerificationEmailMiddleware;
