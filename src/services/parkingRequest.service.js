const { User, Customer, Operator, Car, ParkingRequest } = require('../models/associations');

const getISTTime = () => {
  const now = new Date();
  const utcTime = now.getTime();
  const istOffset = 5.5 * 60 * 60 * 1000;
  return new Date(utcTime + istOffset);
};

// Customer raises a parking request for a specific car
const createParkingRequest = async (userId, carId) => {
  // Validate car belongs to the user
  const car = await Car.findOne({
    where: { Id: carId, UserId: userId }
  });
  if (!car) {
    throw new Error('Car not found for this user');
  }

  // Fetch customer profile to get project/parking system
  const customer = await Customer.findOne({
    where: { UserId: userId }
  });
  if (!customer) {
    throw new Error('Customer profile not found');
  }

  // Find operator assigned to same project and parking system (approved)
  const operator = await Operator.findOne({
    where: {
      ProjectId: customer.ProjectId,
      ParkingSystemId: customer.ParkingSystemId,
      Status: 'Approved'
    }
  });

  if (!operator) {
    throw new Error('No operator assigned to this parking system');
  }

  const istTime = getISTTime();

  const parkingRequest = await ParkingRequest.create({
    UserId: userId,
    OperatorId: operator.Id,
    CarId: car.Id,
    Status: 'Pending',
    CreatedAt: istTime,
    UpdatedAt: istTime
  });

  // Reload with associations for detailed response
  await parkingRequest.reload({
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['Id', 'Username', 'Role']
      },
      {
        model: Operator,
        as: 'operator',
        attributes: ['Id', 'ProjectId', 'ParkingSystemId', 'Status']
      },
      {
        model: Car,
        as: 'car',
        attributes: ['Id', 'UserId', 'CarType', 'CarModel', 'CarCompany', 'CarNumber']
      }
    ]
  });

  return {
    id: parkingRequest.Id,
    userId: parkingRequest.UserId,
    user: parkingRequest.user ? {
      id: parkingRequest.user.Id,
      username: parkingRequest.user.Username,
      role: parkingRequest.user.Role
    } : null,
    operatorId: parkingRequest.OperatorId,
    operator: parkingRequest.operator ? {
      id: parkingRequest.operator.Id,
      projectId: parkingRequest.operator.ProjectId,
      parkingSystemId: parkingRequest.operator.ParkingSystemId,
      status: parkingRequest.operator.Status
    } : null,
    carId: parkingRequest.CarId,
    car: parkingRequest.car ? {
      id: parkingRequest.car.Id,
      userId: parkingRequest.car.UserId,
      carType: parkingRequest.car.CarType,
      carModel: parkingRequest.car.CarModel,
      carCompany: parkingRequest.car.CarCompany,
      carNumber: parkingRequest.car.CarNumber
    } : null,
    status: parkingRequest.Status,
    createdAt: parkingRequest.CreatedAt,
    updatedAt: parkingRequest.UpdatedAt
  };
};

// Operator fetches parking requests assigned to them
const getOperatorParkingRequests = async (operatorUserId) => {
  const operator = await Operator.findOne({ where: { UserId: operatorUserId } });
  if (!operator) {
    throw new Error('Operator profile not found');
  }

  const requests = await ParkingRequest.findAll({
    where: { OperatorId: operator.Id },
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['Id', 'Username', 'Role']
      },
      {
        model: Car,
        as: 'car',
        attributes: ['Id', 'UserId', 'CarType', 'CarModel', 'CarCompany', 'CarNumber']
      }
    ],
    order: [['CreatedAt', 'DESC']]
  });

  return requests.map(req => ({
    id: req.Id,
    userId: req.UserId,
    user: req.user ? {
      id: req.user.Id,
      username: req.user.Username,
      role: req.user.Role
    } : null,
    operatorId: req.OperatorId,
    carId: req.CarId,
    car: req.car ? {
      id: req.car.Id,
      userId: req.car.UserId,
      carType: req.car.CarType,
      carModel: req.car.CarModel,
      carCompany: req.car.CarCompany,
      carNumber: req.car.CarNumber
    } : null,
    status: req.Status,
    createdAt: req.CreatedAt,
    updatedAt: req.UpdatedAt
  }));
};

// Operator updates parking request status
const updateParkingRequestStatus = async (operatorUserId, parkingRequestId, newStatus) => {
  const operator = await Operator.findOne({ where: { UserId: operatorUserId } });
  if (!operator) {
    throw new Error('Operator profile not found');
  }

  const parkingRequest = await ParkingRequest.findOne({
    where: { Id: parkingRequestId, OperatorId: operator.Id }
  });

  if (!parkingRequest) {
    throw new Error('Parking request not found or not assigned to you');
  }

  const validTransitions = {
    Pending: ['Accepted', 'Completed'],
    Accepted: ['Completed'],
    Completed: []
  };

  if (!validTransitions[parkingRequest.Status] || !validTransitions[parkingRequest.Status].includes(newStatus)) {
    throw new Error(`Invalid status transition from ${parkingRequest.Status} to ${newStatus}`);
  }

  const istTime = getISTTime();

  await parkingRequest.update({
    Status: newStatus,
    UpdatedAt: istTime
  });

  return {
    id: parkingRequest.Id,
    userId: parkingRequest.UserId,
    operatorId: parkingRequest.OperatorId,
    carId: parkingRequest.CarId,
    status: parkingRequest.Status,
    createdAt: parkingRequest.CreatedAt,
    updatedAt: parkingRequest.UpdatedAt
  };
};

module.exports = {
  createParkingRequest,
  getOperatorParkingRequests,
  updateParkingRequestStatus
};


