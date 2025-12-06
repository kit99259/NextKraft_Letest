const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Operator = sequelize.define('Operator', {
  Id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  FirstName: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  LastName: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  MobileNumber: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  Email: {
    type: DataTypes.STRING(150),
    allowNull: true
  },
  Status: {
    type: DataTypes.ENUM('Approved', 'Rejected', 'Pending'),
    defaultValue: 'Pending'
  },
  ProjectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'projects',
      key: 'Id'
    }
  },
  ParkingSystemId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'parking_system',
      key: 'Id'
    }
  },
  HasPalletPower: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  ApprovedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  ApprovedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'Id'
    }
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
  tableName: 'operators',
  timestamps: true,
  createdAt: 'CreatedAt',
  updatedAt: 'UpdatedAt'
});

module.exports = Operator;

