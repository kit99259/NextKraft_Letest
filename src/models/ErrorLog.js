const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ErrorLog = sequelize.define('ErrorLog', {
  Id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  SyncUuid: {
    type: DataTypes.STRING(64),
    allowNull: false,
    unique: true
  },
  PlcLogId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  ProjectId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  ParkingSystemId: {
    type: DataTypes.INTEGER,
    allowNull: true
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
  Message: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: ''
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
  updatedAt: 'UpdatedAt',
  indexes: [
    { fields: ['ParkingSystemId', 'PlcLogId'], name: 'idx_error_logs_ps_plclogid' },
    { fields: ['ProjectId'], name: 'idx_error_logs_projectid' },
    { fields: ['ParkingSystemId'], name: 'idx_error_logs_parkingsystemid' }
  ]
});

module.exports = ErrorLog;
