const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Customer = sequelize.define('Customer', {
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
  Email: {
    type: DataTypes.STRING(150),
    allowNull: true
  },
  MobileNumber: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  UserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'Id'
    }
  },
  ProjectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'projects',
      key: 'Id'
    }
  },
  SocietyName: {
    type: DataTypes.STRING(150),
    allowNull: true
  },
  WingName: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  FlatNumber: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  Profession: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  Status: {
    type: DataTypes.ENUM('Approved', 'Rejected', 'Pending'),
    defaultValue: 'Pending'
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
  tableName: 'customers',
  timestamps: true,
  createdAt: 'CreatedAt',
  updatedAt: 'UpdatedAt'
});

module.exports = Customer;

