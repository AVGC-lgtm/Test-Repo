// controllers/authController.js
const bcrypt      = require('bcryptjs');
const jwt         = require('jsonwebtoken');
const nodemailer  = require('nodemailer');
const User        = require('../models/User');
const {
  getPasswordResetOTPTemplate,
  getWelcomeEmailTemplate,
  getPasswordChangedTemplate
} = require('../utils/emailTemplates');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const register = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const exists = await User.findOne({ where: { email } });
    if (exists) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword });

    const { subject, html, text } = getWelcomeEmailTemplate(email);
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject,
      html,
      text
    });

    return res.status(201).json({
      message: 'User registered successfully',
      user: { id: user.id, email }
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const user = await User.findOne({ where: { email } });
    const valid = user && await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, email }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email required' });
  }

  let user;
  try {
    user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiration = new Date(Date.now() + 10 * 60 * 1000);
    const otpHash = await bcrypt.hash(otp, 10);

    user.otpHash = otpHash;
    user.otpExpiration = otpExpiration;
    await user.save();

    const { subject, html, text } = getPasswordResetOTPTemplate(otp);
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to:   email,
      subject,
      html,
      text
    });

    return res.json({ message: 'OTP sent to your email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    if (user) {
      user.otpHash = null;
      user.otpExpiration = null;
      await user.save().catch(() => {});
    }
    return res.status(500).json({ error: 'Server error' });
  }
};

const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP required' });
  }

  try {
    const user = await User.findOne({ where: { email } });
    const now = new Date();
    const validOtp = user &&
      user.otpHash &&
      user.otpExpiration &&
      now <= user.otpExpiration &&
      await bcrypt.compare(otp, user.otpHash);

    if (!validOtp) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    user.otpHash = null;
    user.otpExpiration = null;
    await user.save();

    return res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

const resetPassword = async (req, res) => {
  const { email, newPassword, confirmPassword } = req.body;
  if (!email || !newPassword || !confirmPassword) {
    return res.status(400).json({ error: 'Email and new passwords required' });
  }
  if (newPassword !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be ≥ 6 characters' });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (user.otpHash !== null || user.otpExpiration !== null) {
      return res.status(400).json({ error: 'Please verify OTP first' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    const { subject, html, text } = getPasswordChangedTemplate();
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to:   email,
      subject,
      html,
      text
    });

    return res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

const logout = (req, res) => {
  return res.json({ message: 'Logout successful' });
};

module.exports = {
  register,
  login,
  forgotPassword,
  verifyOtp,
  resetPassword,
  logout
};
