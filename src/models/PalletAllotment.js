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
    defaultValue: 0
  },
  ParkingSystemId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'parking_system',
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
  Level: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  Column: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  UserGivenPalletNumber: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  CarId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'cars',
      key: 'Id'
    }
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
  tableName: 'PalletDetails',
  timestamps: true,
  createdAt: 'CreatedAt',
  updatedAt: 'UpdatedAt'
});

module.exports = PalletAllotment;

