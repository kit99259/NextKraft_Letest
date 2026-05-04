const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ErrorLog = sequelize.define('ErrorLog', {
  Id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  PlcLogId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
  },
  Type: {
    type: DataTypes.STRING(255),
    allowNull: false,
    defaultValue: ''
  },
  LogKey: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  LogValue: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  CreatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  UpdatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'error_logs',
  timestamps: true,
  createdAt: 'CreatedAt',
  updatedAt: 'UpdatedAt'
});

module.exports = ErrorLog;
