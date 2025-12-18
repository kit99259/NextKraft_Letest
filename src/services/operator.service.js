const { Op } = require('sequelize');
const notificationService = require('./notification.service');
const { User, Operator, Project, ParkingSystem, PalletAllotment, Customer, Car, Request, RequestQueue, ParkingRequest } = require('../models/associations');

// Helper function to get IST time
const getISTTime = () => {
  const now = new Date();
  // IST is UTC+5:30
  // Get UTC time in milliseconds
  const utcTime = now.getTime();
  // IST offset is +5:30 (5 hours 30 minutes = 19800000 milliseconds)
  const istOffset = 5.5 * 60 * 60 * 1000;
  // Create IST time
  const istTime = new Date(utcTime + istOffset);
  return istTime;
};

// Create Operator Service
const createOperator = async (operatorData) => {
  // Step 1: Create user first
  // Check if user already exists
  const existingUser = await User.findOne({ where: { Username: operatorData.Username } });
  
  if (existingUser) {
    throw new Error('Username already exists');
  }

  // Create new user with operator role
  const user = await User.create({
    Username: operatorData.Username,
    Password: operatorData.Password,
    Role: 'operator'
  });

  const userId = user.Id;

  // Step 2: Validate project exists
  if (operatorData.ProjectId) {
    const project = await Project.findByPk(operatorData.ProjectId);
    if (!project) {
      // Rollback: delete the created user
      await user.destroy();
      throw new Error('Project not found');
    }
  }

  // Step 3: Validate parking system exists (if provided)
  if (operatorData.ParkingSystemId) {
    const parkingSystem = await ParkingSystem.findByPk(operatorData.ParkingSystemId);
    if (!parkingSystem) {
      // Rollback: delete the created user
      await user.destroy();
      throw new Error('Parking system not found');
    }
  }

  // Step 4: Determine status and approval details based on admin role
  let status = 'Pending';
  let approvedBy = null;
  let approvedAt = null;

  if (operatorData.AdminRole === 'admin') {
    status = 'Approved';
    approvedBy = operatorData.AdminUserId;
    approvedAt = getISTTime();
  }

  // Step 5: Get IST time for CreatedAt and UpdatedAt
  const istTime = getISTTime();

  // Step 6: Create operator record
  const operator = await Operator.create({
    UserId: userId,
    FirstName: operatorData.FirstName,
    LastName: operatorData.LastName,
    Email: operatorData.Email,
    MobileNumber: operatorData.MobileNumber,
    ProjectId: operatorData.ProjectId,
    ParkingSystemId: operatorData.ParkingSystemId,
    Status: status,
    ApprovedBy: approvedBy,
    ApprovedAt: approvedAt,
    CreatedAt: istTime,
    UpdatedAt: istTime
  });

  return {
    user: {
      id: user.Id,
      username: user.Username,
      role: user.Role,
      createdAt: user.CreatedAt,
      updatedAt: user.UpdatedAt
    },
    operator: {
      id: operator.Id,
      userId: operator.UserId,
      firstName: operator.FirstName,
      lastName: operator.LastName,
      email: operator.Email,
      mobileNumber: operator.MobileNumber,
      projectId: operator.ProjectId,
      parkingSystemId: operator.ParkingSystemId,
      status: operator.Status,
      approvedBy: operator.ApprovedBy,
      approvedAt: operator.ApprovedAt,
      createdAt: operator.CreatedAt,
      updatedAt: operator.UpdatedAt
    }
  };
};

// Get Operator Profile Service
const getOperatorProfile = async (userId) => {
  // Find operator by userId
  const operator = await Operator.findOne({
    where: { UserId: userId },
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['Id', 'Username', 'Role', 'CreatedAt', 'UpdatedAt']
      },
      {
        model: Project,
        as: 'project',
        attributes: ['Id', 'ProjectName', 'SocietyName']
      },
      {
        model: ParkingSystem,
        as: 'parkingSystem',
        attributes: ['Id', 'WingName', 'Type', 'Level', 'Column']
      }
    ]
  });

  if (!operator) {
    throw new Error('Operator profile not found');
  }

  return {
    user: {
      id: operator.user.Id,
      username: operator.user.Username,
      role: operator.user.Role,
      createdAt: operator.user.CreatedAt,
      updatedAt: operator.user.UpdatedAt
    },
    operator: {
      id: operator.Id,
      userId: operator.UserId,
      firstName: operator.FirstName,
      lastName: operator.LastName,
      email: operator.Email,
      mobileNumber: operator.MobileNumber,
      projectId: operator.ProjectId,
      project: operator.project ? {
        id: operator.project.Id,
        projectName: operator.project.ProjectName,
        societyName: operator.project.SocietyName
      } : null,
      parkingSystemId: operator.ParkingSystemId,
      parkingSystem: operator.parkingSystem ? {
        id: operator.parkingSystem.Id,
        wingName: operator.parkingSystem.WingName,
        type: operator.parkingSystem.Type,
        level: operator.parkingSystem.Level,
        column: operator.parkingSystem.Column
      } : null,
      status: operator.Status,
      hasPalletPower: operator.HasPalletPower,
      approvedBy: operator.ApprovedBy,
      approvedAt: operator.ApprovedAt,
      createdAt: operator.CreatedAt,
      updatedAt: operator.UpdatedAt
    }
  };
};

// Get Operator List Service (Admin only)
const getOperatorList = async () => {
  // Find all operators with related data
  const operators = await Operator.findAll({
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['Id', 'Username', 'Role', 'CreatedAt', 'UpdatedAt']
      },
      {
        model: Project,
        as: 'project',
        attributes: ['Id', 'ProjectName', 'SocietyName']
      },
      {
        model: ParkingSystem,
        as: 'parkingSystem',
        attributes: ['Id', 'WingName', 'Type', 'Level', 'Column']
      }
    ],
    order: [['CreatedAt', 'DESC']]
  });

  return operators.map(operator => ({
    id: operator.Id,
    userId: operator.UserId,
    user: {
      id: operator.user.Id,
      username: operator.user.Username,
      role: operator.user.Role,
      createdAt: operator.user.CreatedAt,
      updatedAt: operator.user.UpdatedAt
    },
    firstName: operator.FirstName,
    lastName: operator.LastName,
    email: operator.Email,
    mobileNumber: operator.MobileNumber,
    projectId: operator.ProjectId,
    project: operator.project ? {
      id: operator.project.Id,
      projectName: operator.project.ProjectName,
      societyName: operator.project.SocietyName
    } : null,
    parkingSystemId: operator.ParkingSystemId,
    parkingSystem: operator.parkingSystem ? {
      id: operator.parkingSystem.Id,
      wingName: operator.parkingSystem.WingName,
      type: operator.parkingSystem.Type,
      level: operator.parkingSystem.Level,
      column: operator.parkingSystem.Column
    } : null,
    status: operator.Status,
    hasPalletPower: operator.HasPalletPower,
    approvedBy: operator.ApprovedBy,
    approvedAt: operator.ApprovedAt,
    createdAt: operator.CreatedAt,
    updatedAt: operator.UpdatedAt
  }));
};

// Get Operator Project with Parking Systems Service
const getOperatorProjectWithParkingSystems = async (userId) => {
  // Find operator by userId
  const operator = await Operator.findOne({
    where: { UserId: userId },
    include: [
      {
        model: Project,
        as: 'project',
        attributes: ['Id', 'ProjectName', 'SocietyName', 'CreatedAt', 'UpdatedAt']
      }
    ]
  });

  if (!operator) {
    throw new Error('Operator profile not found');
  }

  if (!operator.ProjectId) {
    throw new Error('Operator is not assigned to any project');
  }

  const projectId = operator.ProjectId;

  // Get all parking systems for this project (basic details only, no pallet details)
  const parkingSystems = await ParkingSystem.findAll({
    where: { ProjectId: projectId },
    attributes: [
      'Id',
      'WingName',
      'ProjectId',
      'Type',
      'Level',
      'Column',
      'TotalNumberOfPallet',
      'TimeForEachLevel',
      'TimeForHorizontalMove',
      'CreatedAt',
      'UpdatedAt'
    ],
    order: [['CreatedAt', 'ASC']]
  });

  return {
    project: {
      id: operator.project.Id,
      projectName: operator.project.ProjectName,
      societyName: operator.project.SocietyName,
      createdAt: operator.project.CreatedAt,
      updatedAt: operator.project.UpdatedAt
    },
    parkingSystems: parkingSystems.map(parkingSystem => ({
      id: parkingSystem.Id,
      wingName: parkingSystem.WingName,
      projectId: parkingSystem.ProjectId,
      type: parkingSystem.Type,
      level: parkingSystem.Level,
      column: parkingSystem.Column,
      totalNumberOfPallet: parkingSystem.TotalNumberOfPallet,
      timeForEachLevel: parkingSystem.TimeForEachLevel,
      timeForHorizontalMove: parkingSystem.TimeForHorizontalMove,
      createdAt: parkingSystem.CreatedAt,
      updatedAt: parkingSystem.UpdatedAt
    })),
    count: parkingSystems.length
  };
};

// Assign Pallet to Customer Service
const assignPalletToCustomer = async (operatorUserId, palletId, customerId, carId) => {
  // Step 1: Validate operator exists and get operator details
  const operator = await Operator.findOne({
    where: { UserId: operatorUserId }
  });

  if (!operator) {
    throw new Error('Operator profile not found');
  }

  // Step 2: Find the pallet
  const pallet = await PalletAllotment.findByPk(palletId, {
    include: [
      {
        model: Project,
        as: 'project',
        attributes: ['Id', 'ProjectName', 'SocietyName']
      },
      {
        model: ParkingSystem,
        as: 'parkingSystem',
        attributes: ['Id', 'WingName', 'Type', 'Level', 'Column']
      }
    ]
  });

  if (!pallet) {
    throw new Error('Pallet not found');
  }

  // Step 3: Validate pallet is released (not already assigned)
  if (pallet.Status === 'Assigned' && pallet.UserId !== 0) {
    throw new Error('Pallet is already assigned to another customer');
  }

  // Step 4: Validate operator has access to this project
  if (operator.ProjectId !== pallet.ProjectId) {
    throw new Error('Operator does not have access to this project');
  }

  // Step 5: Find customer
  const customer = await Customer.findByPk(customerId, {
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['Id', 'Username', 'Role']
      }
    ]
  });

  if (!customer) {
    throw new Error('Customer not found');
  }

  // Step 6: Validate customer is approved
  if (customer.Status !== 'Approved') {
    throw new Error('Customer is not approved. Only approved customers can be assigned to pallets');
  }

  // Step 7: Validate customer belongs to the same project
  if (customer.ProjectId !== pallet.ProjectId) {
    throw new Error('Customer does not belong to the same project as the pallet');
  }

  // Step 8: Get or validate car
  let car = null;
  if (carId) {
    car = await Car.findOne({
      where: {
        Id: carId,
        UserId: customer.UserId
      }
    });

    if (!car) {
      throw new Error('Car not found or does not belong to the customer');
    }
  } else {
    // If carId not provided, get customer's first car
    car = await Car.findOne({
      where: { UserId: customer.UserId },
      order: [['CreatedAt', 'ASC']]
    });

    if (!car) {
      throw new Error('Customer has no cars. Please provide a car ID or add a car first');
    }
  }

  // Step 9: Check if car is already assigned to another pallet
  const existingPalletAssignment = await PalletAllotment.findOne({
    where: {
      CarId: car.Id,
      Status: 'Assigned',
      Id: { [require('sequelize').Op.ne]: palletId } // Exclude current pallet
    }
  });

  if (existingPalletAssignment) {
    throw new Error('Car is already assigned to another pallet');
  }

  // Step 10: Update pallet with customer and car information
  const istTime = getISTTime();

  await pallet.update({
    UserId: customer.UserId,
    CarId: car.Id,
    Status: 'Assigned',
    UpdatedAt: istTime
  });

  // Step 10.1: Mark active parking requests for this user and car as completed
  await ParkingRequest.update(
    {
      Status: 'Completed',
      UpdatedAt: istTime
    },
    {
      where: {
        UserId: customer.UserId,
        CarId: car.Id,
        Status: { [Op.notIn]: ['Completed', 'Cancelled'] }
      }
    }
  );

  // Step 11: Reload pallet with associations
  await pallet.reload({
    include: [
      {
        model: Car,
        as: 'car',
        attributes: ['Id', 'CarType', 'CarModel', 'CarCompany', 'CarNumber'],
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['Id', 'Username']
          }
        ]
      },
      {
        model: Project,
        as: 'project',
        attributes: ['Id', 'ProjectName', 'SocietyName']
      },
      {
        model: ParkingSystem,
        as: 'parkingSystem',
        attributes: ['Id', 'WingName', 'Type', 'Level', 'Column']
      }
    ]
  });

  // Send notification to customer when pallet is assigned
  if (customer && customer.user) {
    const palletInfo = pallet.UserGivenPalletNumber || `Level ${pallet.Level}, Column ${pallet.Column}`;
    const carInfo = pallet.car ? `${pallet.car.CarCompany} ${pallet.car.CarModel} (${pallet.car.CarNumber})` : 'your car';
    
    await notificationService.sendNotificationToUser(
      customer.UserId,
      'Pallet Assigned',
      `A pallet (${palletInfo}) has been assigned to you for ${carInfo}`,
      {
        type: 'pallet_assigned',
        palletId: palletId.toString(),
        customerId: customerId.toString(),
        carId: car ? car.Id.toString() : null
      }
    );
  }

  return {
    pallet: {
      id: pallet.Id,
      userId: pallet.UserId,
      projectId: pallet.ProjectId,
      parkingSystemId: pallet.ParkingSystemId,
      level: pallet.Level,
      column: pallet.Column,
      userGivenPalletNumber: pallet.UserGivenPalletNumber,
      carId: pallet.CarId,
      car: pallet.car ? {
        id: pallet.car.Id,
        carType: pallet.car.CarType,
        carModel: pallet.car.CarModel,
        carCompany: pallet.car.CarCompany,
        carNumber: pallet.car.CarNumber,
        user: pallet.car.user ? {
          id: pallet.car.user.Id,
          username: pallet.car.user.Username
        } : null
      } : null,
      status: pallet.Status,
      createdAt: pallet.CreatedAt,
      updatedAt: pallet.UpdatedAt
    },
    customer: {
      id: customer.Id,
      userId: customer.UserId,
      firstName: customer.FirstName,
      lastName: customer.LastName,
      email: customer.Email,
      mobileNumber: customer.MobileNumber,
      projectId: customer.ProjectId,
      parkingSystemId: customer.ParkingSystemId,
      flatNumber: customer.FlatNumber,
      profession: customer.Profession,
      status: customer.Status
    },
    project: {
      id: pallet.project.Id,
      projectName: pallet.project.ProjectName,
      societyName: pallet.project.SocietyName
    },
    parkingSystem: {
      id: pallet.parkingSystem.Id,
      wingName: pallet.parkingSystem.WingName,
      type: pallet.parkingSystem.Type,
      level: pallet.parkingSystem.Level,
      column: pallet.parkingSystem.Column
    }
  };
};

// Get Operator Requests Service
const getOperatorRequests = async (operatorUserId) => {
  // Step 1: Find operator by userId
  const operator = await Operator.findOne({
    where: { UserId: operatorUserId }
  });

  if (!operator) {
    throw new Error('Operator profile not found');
  }

  // Step 2: Find all requests assigned to this operator
  const requests = await Request.findAll({
    where: {
      OperatorId: operator.Id
    },
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['Id', 'Username', 'Role']
      },
      {
        model: PalletAllotment,
        as: 'palletAllotment',
        attributes: ['Id', 'Level', 'Column', 'UserGivenPalletNumber', 'Status'],
        include: [
          {
            model: Car,
            as: 'car',
            attributes: ['Id', 'CarType', 'CarModel', 'CarCompany', 'CarNumber'],
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['Id', 'Username']
              }
            ]
          },
          {
            model: ParkingSystem,
            as: 'parkingSystem',
            attributes: ['Id', 'WingName', 'Type', 'Level', 'Column']
          },
          {
            model: Project,
            as: 'project',
            attributes: ['Id', 'ProjectName', 'SocietyName']
          }
        ]
      },
      {
        model: Operator,
        as: 'operator',
        attributes: ['Id'],
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['Id', 'Username']
          }
        ]
      }
    ],
    order: [
      ['Status', 'ASC'], // Order by status: Pending first, then Accepted, Started, Completed, Cancelled
      ['CreatedAt', 'DESC'] // Then by creation date (newest first)
    ]
  });

  return requests.map(request => ({
    id: request.Id,
    userId: request.UserId,
    customer: request.user ? {
      id: request.user.Id,
      username: request.user.Username,
      role: request.user.Role
    } : null,
    palletAllotmentId: request.PalletAllotmentId,
    pallet: request.palletAllotment ? {
      id: request.palletAllotment.Id,
      level: request.palletAllotment.Level,
      column: request.palletAllotment.Column,
      userGivenPalletNumber: request.palletAllotment.UserGivenPalletNumber,
      status: request.palletAllotment.Status,
      car: request.palletAllotment.car ? {
        id: request.palletAllotment.car.Id,
        carType: request.palletAllotment.car.CarType,
        carModel: request.palletAllotment.car.CarModel,
        carCompany: request.palletAllotment.car.CarCompany,
        carNumber: request.palletAllotment.car.CarNumber,
        user: request.palletAllotment.car.user ? {
          id: request.palletAllotment.car.user.Id,
          username: request.palletAllotment.car.user.Username
        } : null
      } : null,
      parkingSystem: request.palletAllotment.parkingSystem ? {
        id: request.palletAllotment.parkingSystem.Id,
        wingName: request.palletAllotment.parkingSystem.WingName,
        type: request.palletAllotment.parkingSystem.Type,
        level: request.palletAllotment.parkingSystem.Level,
        column: request.palletAllotment.parkingSystem.Column
      } : null,
      project: request.palletAllotment.project ? {
        id: request.palletAllotment.project.Id,
        projectName: request.palletAllotment.project.ProjectName,
        societyName: request.palletAllotment.project.SocietyName
      } : null
    } : null,
    operatorId: request.OperatorId,
    operator: request.operator ? {
      id: request.operator.Id,
      user: request.operator.user ? {
        id: request.operator.user.Id,
        username: request.operator.user.Username
      } : null
    } : null,
    status: request.Status,
    estimatedTime: request.EstimatedTime,
    estimatedTimeFormatted: `${Math.floor(request.EstimatedTime / 60)} minutes ${request.EstimatedTime % 60} seconds`,
    createdAt: request.CreatedAt,
    updatedAt: request.UpdatedAt
  }));
};

// Update Request Status Service
const updateRequestStatus = async (operatorUserId, requestId, newStatus) => {
  // Step 1: Find operator by userId
  const operator = await Operator.findOne({
    where: { UserId: operatorUserId }
  });

  if (!operator) {
    throw new Error('Operator profile not found');
  }

  // Step 2: Find the request
  const request = await Request.findOne({
    where: {
      Id: requestId,
      OperatorId: operator.Id
    },
    include: [
      {
        model: PalletAllotment,
        as: 'palletAllotment',
        attributes: ['Id', 'UserId', 'CarId', 'Status', 'Level', 'Column', 'UserGivenPalletNumber']
      },
      {
        model: User,
        as: 'user',
        attributes: ['Id', 'Username', 'Role']
      }
    ]
  });

  if (!request) {
    throw new Error('Request not found or not assigned to you');
  }

  // Step 3: Validate status transition
  const validTransitions = {
    'Pending': ['Accepted', 'Cancelled'],
    'Accepted': ['Started', 'Cancelled'],
    'Started': ['Completed', 'Cancelled'],
    'Completed': [], // Cannot change from Completed
    'Cancelled': [] // Cannot change from Cancelled
  };

  if (!validTransitions[request.Status] || !validTransitions[request.Status].includes(newStatus)) {
    throw new Error(`Invalid status transition from ${request.Status} to ${newStatus}`);
  }

  // Step 4: Update request status
  const istTime = getISTTime();

  await request.update({
    Status: newStatus,
    UpdatedAt: istTime
  });

  // Step 5: If status is "Completed", release pallet, move to RequestQueue, then remove request
  if (newStatus === 'Completed') {
    if (request.palletAllotment) {
      const pallet = request.palletAllotment;

      // Release the pallet: set UserId to 0, CarId to null, Status to 'Released'
      await pallet.update({
        UserId: 0,
        CarId: null,
        Status: 'Released',
        UpdatedAt: istTime
      });
    }

    // Insert into RequestQueue as history
    await RequestQueue.create({
      UserId: request.UserId,
      PalletAllotmentId: request.PalletAllotmentId,
      OperatorId: request.OperatorId,
      Status: request.Status,
      EstimatedTime: request.EstimatedTime,
      CreatedAt: request.CreatedAt,
      UpdatedAt: istTime
    });

    // Delete original request
    await request.destroy();

    return {
      request: null,
      message: 'Request completed, logged to history, and removed from active requests. Pallet has been released.'
    };
  }

  // Step 6: Reload request with all associations for non-completed statuses
  await request.reload({
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['Id', 'Username', 'Role']
      },
      {
        model: PalletAllotment,
        as: 'palletAllotment',
        attributes: ['Id', 'UserId', 'CarId', 'Status', 'Level', 'Column', 'UserGivenPalletNumber'],
        include: [
          {
            model: Car,
            as: 'car',
            attributes: ['Id', 'CarType', 'CarModel', 'CarCompany', 'CarNumber'],
            required: false
          },
          {
            model: ParkingSystem,
            as: 'parkingSystem',
            attributes: ['Id', 'WingName', 'Type', 'Level', 'Column']
          },
          {
            model: Project,
            as: 'project',
            attributes: ['Id', 'ProjectName', 'SocietyName']
          }
        ]
      },
      {
        model: Operator,
        as: 'operator',
        attributes: ['Id'],
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['Id', 'Username']
          }
        ]
      }
    ]
  });

  // Send notification to customer when operator changes request status
  if (request.user) {
    const statusMessages = {
      'Accepted': 'Your car release request has been accepted by the operator',
      'Started': 'The operator has started processing your car release request',
      'Completed': 'Your car has been released successfully',
      'Cancelled': 'Your car release request has been cancelled'
    };

    const message = statusMessages[newStatus] || `Your car release request status has been updated to ${newStatus}`;
    
    await notificationService.sendNotificationToUser(
      request.user.Id,
      'Request Status Updated',
      message,
      {
        type: 'request_status_update',
        requestId: requestId.toString(),
        status: newStatus
      }
    );
  }

  return {
    request: {
      id: request.Id,
      userId: request.UserId,
      customer: request.user ? {
        id: request.user.Id,
        username: request.user.Username,
        role: request.user.Role
      } : null,
      palletAllotmentId: request.PalletAllotmentId,
      pallet: request.palletAllotment ? {
        id: request.palletAllotment.Id,
        userId: request.palletAllotment.UserId,
        carId: request.palletAllotment.CarId,
        level: request.palletAllotment.Level,
        column: request.palletAllotment.Column,
        userGivenPalletNumber: request.palletAllotment.UserGivenPalletNumber,
        status: request.palletAllotment.Status,
        car: request.palletAllotment.car ? {
          id: request.palletAllotment.car.Id,
          carType: request.palletAllotment.car.CarType,
          carModel: request.palletAllotment.car.CarModel,
          carCompany: request.palletAllotment.car.CarCompany,
          carNumber: request.palletAllotment.car.CarNumber
        } : null,
        parkingSystem: request.palletAllotment.parkingSystem ? {
          id: request.palletAllotment.parkingSystem.Id,
          wingName: request.palletAllotment.parkingSystem.WingName,
          type: request.palletAllotment.parkingSystem.Type,
          level: request.palletAllotment.parkingSystem.Level,
          column: request.palletAllotment.parkingSystem.Column
        } : null,
        project: request.palletAllotment.project ? {
          id: request.palletAllotment.project.Id,
          projectName: request.palletAllotment.project.ProjectName,
          societyName: request.palletAllotment.project.SocietyName
        } : null
      } : null,
      operatorId: request.OperatorId,
      operator: request.operator ? {
        id: request.operator.Id,
        user: request.operator.user ? {
          id: request.operator.user.Id,
          username: request.operator.user.Username
        } : null
      } : null,
      status: request.Status,
      estimatedTime: request.EstimatedTime,
      estimatedTimeFormatted: `${Math.floor(request.EstimatedTime / 60)} minutes ${request.EstimatedTime % 60} seconds`,
      createdAt: request.CreatedAt,
      updatedAt: request.UpdatedAt
    },
    message: `Request status updated to ${newStatus} successfully.`
  };
};

// Update Operator Pallet Power Service (Admin only)
const updateOperatorPalletPower = async (operatorId, hasPalletPower) => {
  // Step 1: Find the operator by ID
  const operator = await Operator.findByPk(operatorId);

  if (!operator) {
    throw new Error('Operator not found');
  }

  // Step 2: Get IST time for UpdatedAt
  const istTime = getISTTime();

  // Step 3: Update the HasPalletPower field
  await operator.update({
    HasPalletPower: hasPalletPower,
    UpdatedAt: istTime
  });

  // Step 4: Reload operator with associations
  await operator.reload({
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['Id', 'Username', 'Role']
      },
      {
        model: Project,
        as: 'project',
        attributes: ['Id', 'ProjectName', 'SocietyName']
      },
      {
        model: ParkingSystem,
        as: 'parkingSystem',
        attributes: ['Id', 'WingName', 'Type', 'Level', 'Column']
      }
    ]
  });

  return {
    operator: {
      id: operator.Id,
      userId: operator.UserId,
      user: {
        id: operator.user.Id,
        username: operator.user.Username,
        role: operator.user.Role
      },
      firstName: operator.FirstName,
      lastName: operator.LastName,
      email: operator.Email,
      mobileNumber: operator.MobileNumber,
      projectId: operator.ProjectId,
      project: operator.project ? {
        id: operator.project.Id,
        projectName: operator.project.ProjectName,
        societyName: operator.project.SocietyName
      } : null,
      parkingSystemId: operator.ParkingSystemId,
      parkingSystem: operator.parkingSystem ? {
        id: operator.parkingSystem.Id,
        wingName: operator.parkingSystem.WingName,
        type: operator.parkingSystem.Type,
        level: operator.parkingSystem.Level,
        column: operator.parkingSystem.Column
      } : null,
      status: operator.Status,
      hasPalletPower: operator.HasPalletPower,
      approvedBy: operator.ApprovedBy,
      approvedAt: operator.ApprovedAt,
      createdAt: operator.CreatedAt,
      updatedAt: operator.UpdatedAt
    }
  };
};

// Get Customers (with cars) for Operator's Project & Parking System
const getOperatorCustomersWithCars = async (operatorUserId) => {
  // Find operator by userId to determine scope
  const operator = await Operator.findOne({
    where: { UserId: operatorUserId }
  });

  if (!operator) {
    throw new Error('Operator profile not found');
  }

  if (!operator.ProjectId) {
    throw new Error('Operator is not assigned to any project');
  }

  if (!operator.ParkingSystemId) {
    throw new Error('Operator is not assigned to any parking system');
  }

  // Fetch customers belonging to operator's project and parking system
  const customers = await Customer.findAll({
    where: {
      ProjectId: operator.ProjectId,
      ParkingSystemId: operator.ParkingSystemId
    },
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['Id', 'Username', 'Role', 'CreatedAt', 'UpdatedAt']
      }
    ],
    order: [['CreatedAt', 'DESC']]
  });

  // Pull all cars for these customer users in one query
  const userIds = customers.map(customer => customer.UserId);
  let carsByUserId = {};

  if (userIds.length) {
    const cars = await Car.findAll({
      where: { UserId: { [Op.in]: userIds } },
      attributes: ['Id', 'UserId', 'CarType', 'CarModel', 'CarCompany', 'CarNumber', 'CreatedAt', 'UpdatedAt'],
      order: [['CreatedAt', 'DESC']]
    });

    carsByUserId = cars.reduce((acc, car) => {
      if (!acc[car.UserId]) {
        acc[car.UserId] = [];
      }
      acc[car.UserId].push({
        id: car.Id,
        userId: car.UserId,
        carType: car.CarType,
        carModel: car.CarModel,
        carCompany: car.CarCompany,
        carNumber: car.CarNumber,
        createdAt: car.CreatedAt,
        updatedAt: car.UpdatedAt
      });
      return acc;
    }, {});
  }

  return {
    customers: customers.map(customer => ({
      id: customer.Id,
      userId: customer.UserId,
      firstName: customer.FirstName,
      lastName: customer.LastName,
      email: customer.Email,
      mobileNumber: customer.MobileNumber,
      projectId: customer.ProjectId,
      parkingSystemId: customer.ParkingSystemId,
      flatNumber: customer.FlatNumber,
      profession: customer.Profession,
      status: customer.Status,
      approvedBy: customer.ApprovedBy,
      approvedAt: customer.ApprovedAt,
      createdAt: customer.CreatedAt,
      updatedAt: customer.UpdatedAt,
      cars: carsByUserId[customer.UserId] || []
    })),
    count: customers.length
  };
};

// Approve Customer (Operator)
const approveCustomer = async (operatorUserId, customerId) => {
  // Validate operator exists
  const operator = await Operator.findOne({
    where: { UserId: operatorUserId }
  });

  if (!operator) {
    throw new Error('Operator profile not found');
  }

  // Validate customer exists
  const customer = await Customer.findByPk(customerId);
  if (!customer) {
    throw new Error('Customer not found');
  }

  // Ensure operator and customer belong to same project (when operator has project)
  if (operator.ProjectId && customer.ProjectId && operator.ProjectId !== customer.ProjectId) {
    throw new Error('Customer does not belong to the same project as the operator');
  }

  const istTime = getISTTime();
  await customer.update({
    Status: 'Approved',
    ApprovedBy: operatorUserId,
    ApprovedAt: istTime,
    UpdatedAt: istTime
  });

  return {
    id: customer.Id,
    userId: customer.UserId,
    firstName: customer.FirstName,
    lastName: customer.LastName,
    email: customer.Email,
    mobileNumber: customer.MobileNumber,
    projectId: customer.ProjectId,
    parkingSystemId: customer.ParkingSystemId,
    status: customer.Status,
    approvedBy: customer.ApprovedBy,
    approvedAt: customer.ApprovedAt,
    updatedAt: customer.UpdatedAt
  };
};

module.exports = {
  createOperator,
  getOperatorProfile,
  getOperatorList,
  getOperatorProjectWithParkingSystems,
  assignPalletToCustomer,
  getOperatorRequests,
  updateRequestStatus,
  updateOperatorPalletPower,
  getOperatorCustomersWithCars,
  approveCustomer
};

