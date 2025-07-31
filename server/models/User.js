const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// User model without firstLogin field
const User = sequelize.define('User', {
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  // otp: { type: DataTypes.STRING, allowNull: true }, // OTP for reset
  otpHash: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
  otpExpiration: { type: DataTypes.DATE, allowNull: true }, // OTP expiration time
}, {});

module.exports = User;
