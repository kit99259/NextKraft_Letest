const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Request = sequelize.define('Request', {
  Id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  UserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'Id'
    }
  },
  PalletAllotmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'pallet_allotment',
      key: 'Id'
    }
  },
  OperatorId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'operators',
      key: 'Id'
    }
  },
  Status: {
    type: DataTypes.ENUM('Pending', 'Accepted', 'Started', 'Completed', 'Cancelled'),
    defaultValue: 'Pending'
  },
  EstimatedTime: {
    type: DataTypes.INTEGER,
    defaultValue: 0
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
  tableName: 'requests',
  timestamps: true,
  createdAt: 'CreatedAt',
  updatedAt: 'UpdatedAt'
});

module.exports = Request;

