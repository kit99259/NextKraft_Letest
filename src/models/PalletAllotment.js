const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PalletAllotment = sequelize.define('PalletAllotment', {
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
    allowNull: false,
    references: {
      model: 'parking_system',
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
  PalletDetails: {
    type: DataTypes.JSON,
    allowNull: true
  },
  Status: {
    type: DataTypes.ENUM('Assigned', 'Released'),
    defaultValue: 'Assigned'
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
  tableName: 'pallet_allotment',
  timestamps: true,
  createdAt: 'CreatedAt',
  updatedAt: 'UpdatedAt'
});

module.exports = PalletAllotment;

