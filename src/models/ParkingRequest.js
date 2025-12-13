const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ParkingRequest = sequelize.define('ParkingRequest', {
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
  OperatorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'operators',
      key: 'Id'
    }
  },
  CarId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'cars',
      key: 'Id'
    }
  },
  Status: {
    type: DataTypes.ENUM('Pending', 'Accepted', 'Completed'),
    defaultValue: 'Pending'
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
  tableName: 'parking_requests',
  timestamps: true,
  createdAt: 'CreatedAt',
  updatedAt: 'UpdatedAt'
});

module.exports = ParkingRequest;


