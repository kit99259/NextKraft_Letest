const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ParkingSystem = sequelize.define('ParkingSystem', {
  Id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  WingName: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  ProjectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'projects',
      key: 'Id'
    }
  },
  Type: {
    type: DataTypes.ENUM('Tower', 'Puzzle'),
    allowNull: false
  },
  Level: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  Column: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  TotalNumberOfPallet: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  TimeForEachLevel: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  TimeForHorizontalMove: {
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
  tableName: 'parking_system',
  timestamps: true,
  createdAt: 'CreatedAt',
  updatedAt: 'UpdatedAt'
});

module.exports = ParkingSystem;

