const User = require('./User');
const Project = require('./Project');
const Customer = require('./Customer');
const Operator = require('./Operator');
const ParkingSystem = require('./ParkingSystem');
const Car = require('./Car');
const PalletAllotment = require('./PalletAllotment');
const RequestQueue = require('./RequestQueue');
const Request = require('./Request');

// User associations
User.hasMany(Customer, { foreignKey: 'UserId', as: 'customers' });
User.hasMany(Car, { foreignKey: 'UserId', as: 'cars' });
User.hasMany(Operator, { foreignKey: 'UserId', as: 'operators' });
User.hasMany(RequestQueue, { foreignKey: 'UserId', as: 'requestQueues' });
User.hasMany(Request, { foreignKey: 'UserId', as: 'requests' });
User.hasMany(Customer, { foreignKey: 'ApprovedBy', as: 'approvedCustomers' });
User.hasMany(Operator, { foreignKey: 'ApprovedBy', as: 'approvedOperators' });

// Project associations
Project.hasMany(Customer, { foreignKey: 'ProjectId', as: 'customers' });
Project.hasMany(Operator, { foreignKey: 'ProjectId', as: 'operators' });
Project.hasMany(ParkingSystem, { foreignKey: 'ProjectId', as: 'parkingSystems' });
Project.hasMany(PalletAllotment, { foreignKey: 'ProjectId', as: 'palletAllotments' });

// Customer associations
Customer.belongsTo(User, { foreignKey: 'UserId', as: 'user' });
Customer.belongsTo(Project, { foreignKey: 'ProjectId', as: 'project' });
Customer.belongsTo(ParkingSystem, { foreignKey: 'ParkingSystemId', as: 'parkingSystem' });
Customer.belongsTo(User, { foreignKey: 'ApprovedBy', as: 'approver' });

// Operator associations
Operator.belongsTo(User, { foreignKey: 'UserId', as: 'user' });
Operator.belongsTo(Project, { foreignKey: 'ProjectId', as: 'project' });
Operator.belongsTo(ParkingSystem, { foreignKey: 'ParkingSystemId', as: 'parkingSystem' });
Operator.belongsTo(User, { foreignKey: 'ApprovedBy', as: 'approver' });
Operator.hasMany(RequestQueue, { foreignKey: 'OperatorId', as: 'requestQueues' });
Operator.hasMany(Request, { foreignKey: 'OperatorId', as: 'requests' });

// ParkingSystem associations
ParkingSystem.belongsTo(Project, { foreignKey: 'ProjectId', as: 'project' });
ParkingSystem.hasMany(Operator, { foreignKey: 'ParkingSystemId', as: 'operators' });
ParkingSystem.hasMany(Customer, { foreignKey: 'ParkingSystemId', as: 'customers' });
ParkingSystem.hasMany(PalletAllotment, { foreignKey: 'ParkingSystemId', as: 'palletAllotments' });

// Car associations
Car.belongsTo(User, { foreignKey: 'UserId', as: 'user' });
Car.hasMany(PalletAllotment, { foreignKey: 'CarId', as: 'palletAllotments' });

// PalletAllotment associations
PalletAllotment.belongsTo(Project, { foreignKey: 'ProjectId', as: 'project' });
PalletAllotment.belongsTo(ParkingSystem, { foreignKey: 'ParkingSystemId', as: 'parkingSystem' });
PalletAllotment.belongsTo(Car, { foreignKey: 'CarId', as: 'car' });
PalletAllotment.hasMany(RequestQueue, { foreignKey: 'PalletAllotmentId', as: 'requestQueues' });
PalletAllotment.hasMany(Request, { foreignKey: 'PalletAllotmentId', as: 'requests' });

// RequestQueue associations
RequestQueue.belongsTo(User, { foreignKey: 'UserId', as: 'user' });
RequestQueue.belongsTo(PalletAllotment, { foreignKey: 'PalletAllotmentId', as: 'palletAllotment' });
RequestQueue.belongsTo(Operator, { foreignKey: 'OperatorId', as: 'operator' });

// Request associations
Request.belongsTo(User, { foreignKey: 'UserId', as: 'user' });
Request.belongsTo(PalletAllotment, { foreignKey: 'PalletAllotmentId', as: 'palletAllotment' });
Request.belongsTo(Operator, { foreignKey: 'OperatorId', as: 'operator' });

module.exports = {
  User,
  Project,
  Customer,
  Operator,
  ParkingSystem,
  Car,
  PalletAllotment,
  RequestQueue,
  Request
};

