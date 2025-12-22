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
      'BufferTime',
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
      bufferTime: parkingSystem.BufferTime,
      createdAt: parkingSystem.CreatedAt,
      updatedAt: parkingSystem.UpdatedAt
    })),
    count: parkingSystems.length
  };
};

// Assign Pallet to Customer Service
const assignPalletToCustomer = async (operatorUserId, palletId, parkingRequestId = null, carNumber = null) => {
  // Step 1: Validate operator exists and get operator details
  const operator = await Operator.findOne({
    where: { UserId: operatorUserId }
  });

  if (!operator) {
    throw new Error('Operator profile not found');
  }

  // Step 2: Validate operator has parking system assigned
  if (!operator.ParkingSystemId || !operator.ProjectId) {
    throw new Error('Operator is not assigned to a project and parking system');
  }

  let parkingRequest = null;
  let customer = null;
  let car = null;

  // Step 3: Handle two scenarios: parkingRequestId OR carNumber
  if (parkingRequestId) {
    // Scenario 1: parkingRequestId provided - follow current flow
    parkingRequest = await ParkingRequest.findOne({
      where: {
        Id: parkingRequestId,
        ProjectId: operator.ProjectId,
        ParkingSystemId: operator.ParkingSystemId
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['Id', 'Username', 'Role']
        },
        {
          model: Car,
          as: 'car',
          attributes: ['Id', 'CarType', 'CarModel', 'CarCompany', 'CarNumber']
        }
      ]
    });

    if (!parkingRequest) {
      throw new Error('Parking request not found or does not belong to your parking system');
    }

    // Validate parking request status (should be Pending or Accepted)
    if (!['Pending', 'Accepted', 'Queued'].includes(parkingRequest.Status)) {
      throw new Error(`Cannot assign pallet to a parking request with status: ${parkingRequest.Status}`);
    }

    // Find customer from parking request
    customer = await Customer.findOne({
      where: {
        UserId: parkingRequest.UserId,
        ProjectId: operator.ProjectId,
        ParkingSystemId: operator.ParkingSystemId
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['Id', 'Username', 'Role']
        }
      ]
    });

    if (!customer) {
      throw new Error('Customer not found for this parking request');
    }

    // Validate customer is approved
    if (customer.Status !== 'Approved') {
      throw new Error('Customer is not approved. Only approved customers can be assigned to pallets');
    }

    // Get car from parking request
    car = parkingRequest.car;
    if (!car) {
      throw new Error('Car not found in parking request');
    }

  } else if (carNumber) {
    // Scenario 2: carNumber provided - new flow
    // Step 3.1: Check if car exists
    car = await Car.findOne({
      where: { CarNumber: carNumber },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['Id', 'Username', 'Role']
        }
      ]
    });

    let userId = null;

    if (!car) {
      // Car doesn't exist - need to create user, customer, and car
      const dummyUsername = 'erhtghgkdgdutng534653';
      
      // Check if user with this username exists
      let user = await User.findOne({ where: { Username: dummyUsername } });
      
      if (!user) {
        // Create user with dummy password
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash('dummy123', 10);
        
        user = await User.create({
          Username: dummyUsername,
          Password: hashedPassword,
          Role: 'customer'
        });

        // Create dummy customer
        const istTime = getISTTime();
        customer = await Customer.create({
          UserId: user.Id,
          FirstName: 'Dummy',
          LastName: 'Customer',
          Email: null,
          MobileNumber: null,
          ProjectId: operator.ProjectId,
          ParkingSystemId: operator.ParkingSystemId,
          FlatNumber: null,
          Profession: null,
          Status: 'Approved', // Auto-approve dummy customer
          ApprovedBy: operatorUserId,
          ApprovedAt: istTime,
          CreatedAt: istTime,
          UpdatedAt: istTime
        });
        
        // Reload with user association
        await customer.reload({
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['Id', 'Username', 'Role']
            }
          ]
        });
      } else {
        // User exists - find or create customer
        customer = await Customer.findOne({
          where: {
            UserId: user.Id,
            ProjectId: operator.ProjectId,
            ParkingSystemId: operator.ParkingSystemId
          },
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['Id', 'Username', 'Role']
            }
          ]
        });

        if (!customer) {
          // Create customer for existing user
          const istTime = getISTTime();
          customer = await Customer.create({
            UserId: user.Id,
            FirstName: 'Dummy',
            LastName: 'Customer',
            Email: null,
            MobileNumber: null,
            ProjectId: operator.ProjectId,
            ParkingSystemId: operator.ParkingSystemId,
            FlatNumber: null,
            Profession: null,
            Status: 'Approved', // Auto-approve dummy customer
            ApprovedBy: operatorUserId,
            ApprovedAt: istTime,
            CreatedAt: istTime,
            UpdatedAt: istTime
          });
          
          // Reload with user association
          await customer.reload({
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['Id', 'Username', 'Role']
              }
            ]
          });
        }
      }

      userId = user.Id;

      // Create car for the user
      const istTime = getISTTime();
      car = await Car.create({
        UserId: userId,
        CarType: null,
        CarModel: null,
        CarCompany: null,
        CarNumber: carNumber,
        CreatedAt: istTime,
        UpdatedAt: istTime
      });
    } else {
      // Car exists - get user and customer
      userId = car.UserId;
      
      customer = await Customer.findOne({
        where: {
          UserId: userId,
          ProjectId: operator.ProjectId,
          ParkingSystemId: operator.ParkingSystemId
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['Id', 'Username', 'Role']
          }
        ]
      });

      if (!customer) {
        throw new Error('Customer not found for this car');
      }

      // Validate customer is approved
      if (customer.Status !== 'Approved') {
        throw new Error('Customer is not approved. Only approved customers can be assigned to pallets');
      }
    }

    // Step 3.2: Check if parking request exists (not completed or cancelled)
    const existingParkingRequest = await ParkingRequest.findOne({
      where: {
        CarId: car.Id,
        UserId: car.UserId,
        ProjectId: operator.ProjectId,
        ParkingSystemId: operator.ParkingSystemId,
        Status: { [Op.notIn]: ['Completed', 'Cancelled'] }
      }
    });

    if (!existingParkingRequest) {
      // Create new parking request
      const istTime = getISTTime();
      parkingRequest = await ParkingRequest.create({
        UserId: car.UserId,
        ProjectId: operator.ProjectId,
        ParkingSystemId: operator.ParkingSystemId,
        CarId: car.Id,
        Status: 'Pending',
        CreatedAt: istTime,
        UpdatedAt: istTime
      });
    } else {
      parkingRequest = existingParkingRequest;
      
      // Validate parking request status (should be Pending or Accepted)
      if (!['Pending', 'Accepted', 'Queued'].includes(parkingRequest.Status)) {
        throw new Error(`Cannot assign pallet to a parking request with status: ${parkingRequest.Status}`);
      }
    }

  } else {
    throw new Error('Either parkingRequestId or carNumber must be provided');
  }

  // Step 8: Get parking system with time information
  const parkingSystem = await ParkingSystem.findByPk(operator.ParkingSystemId, {
    attributes: ['Id', 'WingName', 'Type', 'Level', 'LevelBelowGround', 'Column', 'TimeForEachLevel', 'TimeForHorizontalMove', 'BufferTime']
  });

  if (!parkingSystem) {
    throw new Error('Parking system not found');
  }

  // Step 9: Find the pallet
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

  // Step 10: Validate pallet belongs to operator's parking system
  if (pallet.ParkingSystemId !== operator.ParkingSystemId) {
    throw new Error('Pallet does not belong to your parking system');
  }

  // Step 11: Validate pallet is released (not already assigned)
  if (pallet.Status === 'Assigned' && pallet.UserId !== 0) {
    throw new Error('Pallet is already assigned to another customer');
  }

  // Step 12: Validate pallet belongs to the same project
  if (operator.ProjectId !== pallet.ProjectId) {
    throw new Error('Operator does not have access to this project');
  }

  // Step 13: Calculate time to move pallet to parking (same logic as callEmptyPallet)
  let timeToParking = 0;
  
  if (parkingSystem.Type === 'Tower') {
    // For Tower: (Level * TimePerLevel) + BufferTime
    timeToParking = (pallet.Level * parkingSystem.TimeForEachLevel) + parkingSystem.BufferTime;
  } else if (parkingSystem.Type === 'Puzzle') {
    // For Puzzle: Calculate based on pallet location
    if (pallet.Level !== null && pallet.Level !== undefined && pallet.LevelBelowGround === null) {
      // Pallet has Level and Column (above ground)
      // Time = (Level * TimePerLevel) + HorizontalMoveTime + BufferTime
      // HorizontalMoveTime is NOT applicable for Level 1
      timeToParking = (pallet.Level * parkingSystem.TimeForEachLevel) + 
                     (pallet.Level > 1 ? parkingSystem.TimeForHorizontalMove : 0) + 
                     parkingSystem.BufferTime;
    } else if (pallet.LevelBelowGround !== null && pallet.LevelBelowGround !== undefined) {
      // Pallet has LevelBelowGround and Column (below ground)
      if (pallet.LevelBelowGround === 1) {
        // LevelBelowGround 1: Only (LevelBelowGround * TimePerLevel) + BufferTime
        timeToParking = (pallet.LevelBelowGround * parkingSystem.TimeForEachLevel) + parkingSystem.BufferTime;
      } else {
        // LevelBelowGround > 1: (LevelBelowGround * TimePerLevel) + ((LevelBelowGround * TimePerLevel) + HorizontalMoveTime + BufferTime)
        timeToParking = (pallet.LevelBelowGround * parkingSystem.TimeForEachLevel) + 
                       ((pallet.LevelBelowGround * parkingSystem.TimeForEachLevel) + 
                        parkingSystem.TimeForHorizontalMove + 
                        parkingSystem.BufferTime);
      }
    } else {
      throw new Error('Pallet location information is invalid');
    }
  }

  // Format time in human-readable format
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0 && remainingSeconds > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ${remainingSeconds} second${remainingSeconds > 1 ? 's' : ''}`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else {
      return `${remainingSeconds} second${remainingSeconds > 1 ? 's' : ''}`;
    }
  };

  // Step 14: Check if car is already assigned to another pallet
  const existingPalletAssignment = await PalletAllotment.findOne({
    where: {
      CarId: car.Id,
      Status: 'Assigned',
      Id: { [Op.ne]: palletId } // Exclude current pallet
    }
  });

  if (existingPalletAssignment) {
    throw new Error('Car is already assigned to another pallet');
  }

  // Step 15: Update pallet with customer and car information
  const istTime = getISTTime();

  await pallet.update({
    UserId: customer.UserId,
    CarId: car.Id,
    Status: 'Assigned',
    UpdatedAt: istTime
  });

  // Step 15.1: Mark the specific parking request as completed
  await parkingRequest.update({
    Status: 'Completed',
    UpdatedAt: istTime
  });

  // Step 15.2: Update parking system status to 'PalletMovingToParking'
  await ParkingSystem.update(
    {
      Status: 'PalletMovingToParking',
      UpdatedAt: istTime
    },
    {
      where: {
        Id: operator.ParkingSystemId
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
        customerId: customer.Id.toString(),
        carId: car ? car.Id.toString() : null,
        parkingRequestId: parkingRequestId !== null ? parkingRequestId.toString() : null
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
      levelBelowGround: pallet.LevelBelowGround,
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
    timeToParking: timeToParking,
    timeToParkingFormatted: formatTime(timeToParking),
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

  // Step 2: Validate operator has project and parking system assigned
  if (!operator.ProjectId || !operator.ParkingSystemId) {
    throw new Error('Operator is not assigned to a project and parking system');
  }

  // Step 3: Find all requests for this operator's project and parking system
  const requests = await Request.findAll({
    where: {
      ProjectId: operator.ProjectId,
      ParkingSystemId: operator.ParkingSystemId
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
        model: Project,
        as: 'project',
        attributes: ['Id', 'ProjectName', 'SocietyName']
      },
      {
        model: ParkingSystem,
        as: 'parkingSystem',
        attributes: ['Id', 'WingName', 'Type', 'Level', 'Column']
      },
      {
        model: Car,
        as: 'car',
        attributes: ['Id', 'CarType', 'CarModel', 'CarCompany', 'CarNumber']
      }
    ],
    order: [
      ['Status', 'ASC'], // Order by status: Pending first, then Accepted, Queued, Completed, Cancelled
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
    projectId: request.ProjectId,
    parkingSystemId: request.ParkingSystemId,
    carId: request.CarId,
    project: request.project ? {
      id: request.project.Id,
      projectName: request.project.ProjectName,
      societyName: request.project.SocietyName
    } : null,
    parkingSystem: request.parkingSystem ? {
      id: request.parkingSystem.Id,
      wingName: request.parkingSystem.WingName,
      type: request.parkingSystem.Type,
      level: request.parkingSystem.Level,
      column: request.parkingSystem.Column
    } : null,
    car: request.car ? {
      id: request.car.Id,
      carType: request.car.CarType,
      carModel: request.car.CarModel,
      carCompany: request.car.CarCompany,
      carNumber: request.car.CarNumber
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

  // Step 2: Validate operator has project and parking system assigned
  if (!operator.ProjectId || !operator.ParkingSystemId) {
    throw new Error('Operator is not assigned to a project and parking system');
  }

  // Step 3: Find the request and validate it belongs to operator's project and parking system
  const request = await Request.findOne({
    where: {
      Id: requestId,
      ProjectId: operator.ProjectId,
      ParkingSystemId: operator.ParkingSystemId
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
    'Pending': ['Accepted', 'Queued', 'Cancelled'],
    'Accepted': ['Queued', 'Completed', 'Cancelled'],
    'Queued': ['Completed', 'Cancelled'],
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
      ProjectId: request.ProjectId,
      ParkingSystemId: request.ParkingSystemId,
      CarId: request.CarId,
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
        model: Project,
        as: 'project',
        attributes: ['Id', 'ProjectName', 'SocietyName']
      },
      {
        model: ParkingSystem,
        as: 'parkingSystem',
        attributes: ['Id', 'WingName', 'Type', 'Level', 'Column']
      },
      {
        model: Car,
        as: 'car',
        attributes: ['Id', 'CarType', 'CarModel', 'CarCompany', 'CarNumber']
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
      }
    ]
  });

  // Send notification to customer when operator changes request status
  if (request.user) {
    const statusMessages = {
      'Accepted': 'Your car release request has been accepted by the operator',
      'Queued': 'Your car release request has been queued for processing',
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
      projectId: request.ProjectId,
      parkingSystemId: request.ParkingSystemId,
      carId: request.CarId,
      project: request.project ? {
        id: request.project.Id,
        projectName: request.project.ProjectName,
        societyName: request.project.SocietyName
      } : null,
      parkingSystem: request.parkingSystem ? {
        id: request.parkingSystem.Id,
        wingName: request.parkingSystem.WingName,
        type: request.parkingSystem.Type,
        level: request.parkingSystem.Level,
        column: request.parkingSystem.Column
      } : null,
      car: request.car ? {
        id: request.car.Id,
        carType: request.car.CarType,
        carModel: request.car.CarModel,
        carCompany: request.car.CarCompany,
        carNumber: request.car.CarNumber
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

// Update Customer Status (Operator) - Approve or Reject
const updateCustomerStatus = async (operatorUserId, customerId, status) => {
  // Validate status
  if (status !== 'Approved' && status !== 'Rejected') {
    throw new Error('Status must be either "Approved" or "Rejected"');
  }

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
    Status: status,
    ApprovedBy: operatorUserId,
    ApprovedAt: istTime,
    UpdatedAt: istTime
  });

  // Reload customer to get updated values
  await customer.reload();

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

// Call Empty Pallet Service
const callEmptyPallet = async (operatorUserId, customerId = null) => {
  // Step 1: Find operator by userId
  const operator = await Operator.findOne({
    where: { UserId: operatorUserId },
    include: [
      {
        model: ParkingSystem,
        as: 'parkingSystem',
        attributes: ['Id', 'Type', 'Level', 'LevelBelowGround', 'Column', 'TimeForEachLevel', 'TimeForHorizontalMove', 'BufferTime']
      }
    ]
  });

  if (!operator) {
    throw new Error('Operator profile not found');
  }

  // Step 2: Validate operator has parking system assigned
  if (!operator.ParkingSystemId || !operator.parkingSystem) {
    throw new Error('Operator is not assigned to a parking system');
  }

  const parkingSystem = operator.parkingSystem;
  let pallet = null;
  let timeToCall = 0;

  // Step 3: Handle based on parking system type
  if (parkingSystem.Type === 'Tower') {
    // For Tower: Find lowest empty pallet (UserId = 0 and CarId IS NULL)
    pallet = await PalletAllotment.findOne({
      where: {
        ParkingSystemId: parkingSystem.Id,
        UserId: 0,
        CarId: null,
        Status: 'Released'
      },
      order: [
        ['Level', 'ASC'],
        ['Column', 'ASC']
      ]
    });

    if (!pallet) {
      throw new Error('No empty pallet available in Tower parking system');
    }

    // Calculate time: (Level * TimePerLevel) + BufferTime
    timeToCall = (pallet.Level * parkingSystem.TimeForEachLevel) + parkingSystem.BufferTime;

  } else if (parkingSystem.Type === 'Puzzle') {
    // For Puzzle: Get customer's assigned pallet
    if (!customerId) {
      throw new Error('Customer ID is required for Puzzle parking system');
    }

    // Find customer
    const customer = await Customer.findOne({
      where: {
        Id: customerId,
        ProjectId: operator.ProjectId,
        ParkingSystemId: parkingSystem.Id
      }
    });

    if (!customer) {
      throw new Error('Customer not found or does not belong to this parking system');
    }

    // Find customer's assigned pallet
    pallet = await PalletAllotment.findOne({
      where: {
        ParkingSystemId: parkingSystem.Id,
        UserId: customer.UserId,
        Status: 'Assigned'
      }
    });

    if (!pallet) {
      throw new Error('Customer does not have an assigned pallet');
    }

    // Calculate time based on pallet location
    if (pallet.Level !== null && pallet.Level !== undefined && pallet.LevelBelowGround === null) {
      // Pallet has Level and Column (above ground)
      // Time = (Level * TimePerLevel) + HorizontalMoveTime + BufferTime
      // HorizontalMoveTime is NOT applicable for Level 1
      timeToCall = (pallet.Level * parkingSystem.TimeForEachLevel) + 
                   (pallet.Level > 1 ? parkingSystem.TimeForHorizontalMove : 0) + 
                   parkingSystem.BufferTime;
    } else if (pallet.LevelBelowGround !== null && pallet.LevelBelowGround !== undefined) {
      // Pallet has LevelBelowGround and Column (below ground)
      // Time = (LevelBelowGround * TimePerLevel) + ((LevelBelowGround * TimePerLevel) + HorizontalMoveTime + BufferTime)
      // HorizontalMoveTime is NOT applicable for LevelBelowGround 1
      // Second (LevelBelowGround * TimePerLevel) is NOT applicable for LevelBelowGround 1
      if (pallet.LevelBelowGround === 1) {
        // LevelBelowGround 1: Only (LevelBelowGround * TimePerLevel) + BufferTime
        timeToCall = (pallet.LevelBelowGround * parkingSystem.TimeForEachLevel) + parkingSystem.BufferTime;
      } else {
        // LevelBelowGround > 1: (LevelBelowGround * TimePerLevel) + ((LevelBelowGround * TimePerLevel) + HorizontalMoveTime + BufferTime)
        timeToCall = (pallet.LevelBelowGround * parkingSystem.TimeForEachLevel) + 
                     ((pallet.LevelBelowGround * parkingSystem.TimeForEachLevel) + 
                      parkingSystem.TimeForHorizontalMove + 
                      parkingSystem.BufferTime);
      }
    } else {
      throw new Error('Pallet location information is invalid');
    }
  } else {
    throw new Error('Invalid parking system type');
  }

  // Step 4: Update parking system status to 'PalletMovingToGround'
  const istTime = getISTTime();
  await ParkingSystem.update(
    {
      Status: 'PalletMovingToGround',
      UpdatedAt: istTime
    },
    {
      where: {
        Id: parkingSystem.Id
      }
    }
  );

  // Step 5: Format time in human-readable format
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0 && remainingSeconds > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ${remainingSeconds} second${remainingSeconds > 1 ? 's' : ''}`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else {
      return `${remainingSeconds} second${remainingSeconds > 1 ? 's' : ''}`;
    }
  };

  return {
    palletId: pallet.Id,
    palletNumber: pallet.UserGivenPalletNumber,
    level: pallet.Level,
    levelBelowGround: pallet.LevelBelowGround,
    column: pallet.Column,
    timeToCall: timeToCall,
    timeToCallFormatted: formatTime(timeToCall),
    parkingSystem: {
      id: parkingSystem.Id,
      type: parkingSystem.Type,
      wingName: parkingSystem.WingName || null
    }
  };
};

// Call Specific Pallet Service
const callSpecificPallet = async (operatorUserId, palletId, requestId) => {
  // Step 1: Find operator by userId
  const operator = await Operator.findOne({
    where: { UserId: operatorUserId },
    include: [
      {
        model: ParkingSystem,
        as: 'parkingSystem',
        attributes: ['Id', 'Type', 'Level', 'LevelBelowGround', 'Column', 'TimeForEachLevel', 'TimeForHorizontalMove', 'BufferTime']
      }
    ]
  });

  if (!operator) {
    throw new Error('Operator profile not found');
  }

  // Step 2: Validate operator has parking system assigned
  if (!operator.ParkingSystemId || !operator.parkingSystem) {
    throw new Error('Operator is not assigned to a parking system');
  }

  // Step 3: Validate operator has project assigned
  if (!operator.ProjectId) {
    throw new Error('Operator is not assigned to a project');
  }

  const parkingSystem = operator.parkingSystem;

  // Step 4: Find the request
  const request = await Request.findOne({
    where: {
      Id: requestId,
      ProjectId: operator.ProjectId,
      ParkingSystemId: operator.ParkingSystemId,
      PalletAllotmentId: palletId
    },
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['Id', 'Username', 'Role']
      }
    ]
  });

  if (!request) {
    throw new Error('Request not found or does not match the pallet');
  }

  // Step 5: Validate request status (should be Pending)
  if (request.Status !== 'Pending' && request.Status !== 'Queued') {
    throw new Error(`Cannot accept request with status: ${request.Status}. Only Pending and Queued requests can be accepted.`);
  }

  // Step 6: Find the pallet
  const pallet = await PalletAllotment.findByPk(palletId, {
    include: [
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

  // Step 7: Validate pallet belongs to operator's parking system
  if (pallet.ParkingSystemId !== operator.ParkingSystemId) {
    throw new Error('Pallet does not belong to your parking system');
  }

  // Step 8: Calculate time based on pallet location (same logic as callEmptyPallet)
  let timeToCall = 0;

  if (parkingSystem.Type === 'Tower') {
    // For Tower: (Level * TimePerLevel) + BufferTime
    timeToCall = (pallet.Level * parkingSystem.TimeForEachLevel) + parkingSystem.BufferTime;
  } else if (parkingSystem.Type === 'Puzzle') {
    // For Puzzle: Calculate based on pallet location
    if (pallet.Level !== null && pallet.Level !== undefined && pallet.LevelBelowGround === null) {
      // Pallet has Level and Column (above ground)
      // Time = (Level * TimePerLevel) + HorizontalMoveTime + BufferTime
      // HorizontalMoveTime is NOT applicable for Level 1
      timeToCall = (pallet.Level * parkingSystem.TimeForEachLevel) + 
                   (pallet.Level > 1 ? parkingSystem.TimeForHorizontalMove : 0) + 
                   parkingSystem.BufferTime;
    } else if (pallet.LevelBelowGround !== null && pallet.LevelBelowGround !== undefined) {
      // Pallet has LevelBelowGround and Column (below ground)
      if (pallet.LevelBelowGround === 1) {
        // LevelBelowGround 1: Only (LevelBelowGround * TimePerLevel) + BufferTime
        timeToCall = (pallet.LevelBelowGround * parkingSystem.TimeForEachLevel) + parkingSystem.BufferTime;
      } else {
        // LevelBelowGround > 1: (LevelBelowGround * TimePerLevel) + ((LevelBelowGround * TimePerLevel) + HorizontalMoveTime + BufferTime)
        timeToCall = (pallet.LevelBelowGround * parkingSystem.TimeForEachLevel) + 
                     ((pallet.LevelBelowGround * parkingSystem.TimeForEachLevel) + 
                      parkingSystem.TimeForHorizontalMove + 
                      parkingSystem.BufferTime);
      }
    } else {
      throw new Error('Pallet location information is invalid');
    }
  } else {
    throw new Error('Invalid parking system type');
  }

  // Step 9: Update request status to 'Accepted'
  const istTime = getISTTime();
  await request.update({
    Status: 'Accepted',
    UpdatedAt: istTime
  });

  // Step 10: Update parking system status to 'PalletMovingToGround'
  await ParkingSystem.update(
    {
      Status: 'PalletMovingToGround',
      UpdatedAt: istTime
    },
    {
      where: {
        Id: parkingSystem.Id
      }
    }
  );

  // Step 11: Format time in human-readable format
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0 && remainingSeconds > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ${remainingSeconds} second${remainingSeconds > 1 ? 's' : ''}`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else {
      return `${remainingSeconds} second${remainingSeconds > 1 ? 's' : ''}`;
    }
  };

  const timeToCallFormatted = formatTime(timeToCall);

  // Step 12: Send notification to customer with estimated time
  if (request.user) {
    await notificationService.sendNotificationToUser(
      request.UserId,
      'Request Accepted',
      `Your car release request has been accepted. Pallet is being moved to ground level. Estimated time: ${timeToCallFormatted}.`,
      {
        type: 'request_accepted',
        requestId: requestId.toString(),
        palletId: palletId.toString(),
        estimatedTime: timeToCall,
        estimatedTimeFormatted: timeToCallFormatted
      }
    );
  }

  return {
    palletId: pallet.Id,
    palletNumber: pallet.UserGivenPalletNumber,
    level: pallet.Level,
    levelBelowGround: pallet.LevelBelowGround,
    column: pallet.Column,
    timeToCall: timeToCall,
    timeToCallFormatted: timeToCallFormatted,
    request: {
      id: request.Id,
      status: request.Status,
      updatedAt: request.UpdatedAt
    },
    parkingSystem: {
      id: parkingSystem.Id,
      type: parkingSystem.Type,
      wingName: parkingSystem.WingName || null
    }
  };
};

// Update Parking System Status Service
const updateParkingSystemStatus = async (operatorUserId, status) => {
  // Step 1: Validate status
  const validStatuses = ['AtGround', 'Idle'];
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status. Status must be one of: ${validStatuses.join(', ')}`);
  }

  // Step 2: Find operator by userId
  const operator = await Operator.findOne({
    where: { UserId: operatorUserId },
    include: [
      {
        model: ParkingSystem,
        as: 'parkingSystem',
        attributes: ['Id', 'WingName', 'Type', 'Status']
      }
    ]
  });

  if (!operator) {
    throw new Error('Operator profile not found');
  }

  // Step 3: Validate operator has parking system assigned
  if (!operator.ParkingSystemId || !operator.parkingSystem) {
    throw new Error('Operator is not assigned to a parking system');
  }

  const parkingSystem = operator.parkingSystem;

  // Step 4: Update parking system status
  const istTime = getISTTime();
  await ParkingSystem.update(
    {
      Status: status,
      UpdatedAt: istTime
    },
    {
      where: {
        Id: parkingSystem.Id
      }
    }
  );

  // Step 5: Reload parking system to get updated data
  const updatedParkingSystem = await ParkingSystem.findByPk(parkingSystem.Id, {
    attributes: ['Id', 'WingName', 'Type', 'Level', 'LevelBelowGround', 'Column', 'Status', 'CreatedAt', 'UpdatedAt']
  });

  return {
    parkingSystem: {
      id: updatedParkingSystem.Id,
      wingName: updatedParkingSystem.WingName,
      type: updatedParkingSystem.Type,
      level: updatedParkingSystem.Level,
      levelBelowGround: updatedParkingSystem.LevelBelowGround,
      column: updatedParkingSystem.Column,
      status: updatedParkingSystem.Status,
      createdAt: updatedParkingSystem.CreatedAt,
      updatedAt: updatedParkingSystem.UpdatedAt
    }
  };
};

// Release Parked Car Service
const releaseParkedCar = async (operatorUserId, palletId) => {
  // Step 1: Find operator by userId
  const operator = await Operator.findOne({
    where: { UserId: operatorUserId }
  });

  if (!operator) {
    throw new Error('Operator profile not found');
  }

  // Step 2: Validate operator has project and parking system assigned
  if (!operator.ProjectId || !operator.ParkingSystemId) {
    throw new Error('Operator is not assigned to a project and parking system');
  }

  // Step 3: Get parking system with time information
  const parkingSystem = await ParkingSystem.findByPk(operator.ParkingSystemId, {
    attributes: ['Id', 'WingName', 'Type', 'Level', 'LevelBelowGround', 'Column', 'TimeForEachLevel', 'TimeForHorizontalMove', 'BufferTime']
  });

  if (!parkingSystem) {
    throw new Error('Parking system not found');
  }

  // Step 4: Find the pallet
  const pallet = await PalletAllotment.findByPk(palletId, {
    include: [
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
  });

  if (!pallet) {
    throw new Error('Pallet not found');
  }

  // Step 5: Validate pallet belongs to operator's parking system
  if (pallet.ParkingSystemId !== operator.ParkingSystemId) {
    throw new Error('Pallet does not belong to your parking system');
  }

  // Step 6: Validate pallet is assigned (has a customer)
  if (pallet.Status !== 'Assigned' || pallet.UserId === 0 || !pallet.CarId) {
    throw new Error('Pallet is not assigned to any customer or car');
  }

  // Step 7: Calculate time to move pallet to ground (same logic as callSpecificPallet)
  let timeToCall = 0;

  if (parkingSystem.Type === 'Tower') {
    // For Tower: (Level * TimePerLevel) + BufferTime
    timeToCall = (pallet.Level * parkingSystem.TimeForEachLevel) + parkingSystem.BufferTime;
  } else if (parkingSystem.Type === 'Puzzle') {
    // For Puzzle: Calculate based on pallet location
    if (pallet.Level !== null && pallet.Level !== undefined && pallet.LevelBelowGround === null) {
      // Pallet has Level and Column (above ground)
      // Time = (Level * TimePerLevel) + HorizontalMoveTime + BufferTime
      // HorizontalMoveTime is NOT applicable for Level 1
      timeToCall = (pallet.Level * parkingSystem.TimeForEachLevel) + 
                   (pallet.Level > 1 ? parkingSystem.TimeForHorizontalMove : 0) + 
                   parkingSystem.BufferTime;
    } else if (pallet.LevelBelowGround !== null && pallet.LevelBelowGround !== undefined) {
      // Pallet has LevelBelowGround and Column (below ground)
      if (pallet.LevelBelowGround === 1) {
        // LevelBelowGround 1: Only (LevelBelowGround * TimePerLevel) + BufferTime
        timeToCall = (pallet.LevelBelowGround * parkingSystem.TimeForEachLevel) + parkingSystem.BufferTime;
      } else {
        // LevelBelowGround > 1: (LevelBelowGround * TimePerLevel) + ((LevelBelowGround * TimePerLevel) + HorizontalMoveTime + BufferTime)
        timeToCall = (pallet.LevelBelowGround * parkingSystem.TimeForEachLevel) + 
                     ((pallet.LevelBelowGround * parkingSystem.TimeForEachLevel) + 
                      parkingSystem.TimeForHorizontalMove + 
                      parkingSystem.BufferTime);
      }
    } else {
      throw new Error('Pallet location information is invalid');
    }
  }

  // Format time in human-readable format
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0 && remainingSeconds > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ${remainingSeconds} second${remainingSeconds > 1 ? 's' : ''}`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else {
      return `${remainingSeconds} second${remainingSeconds > 1 ? 's' : ''}`;
    }
  };

  // Step 8: Find the request associated with this pallet
  const request = await Request.findOne({
    where: {
      PalletAllotmentId: palletId,
      ProjectId: operator.ProjectId,
      ParkingSystemId: operator.ParkingSystemId,
      Status: { [Op.notIn]: ['Completed', 'Cancelled'] }
    },
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['Id', 'Username', 'Role']
      },
      {
        model: Car,
        as: 'car',
        attributes: ['Id', 'CarType', 'CarModel', 'CarCompany', 'CarNumber']
      }
    ]
  });

  if (!request) {
    throw new Error('No active request found for this pallet');
  }

  // Step 9: Store request ID before deletion for notification
  const requestId = request.Id;

  // Step 10: Update request status to Completed
  const istTime = getISTTime();
  await request.update({
    Status: 'Completed',
    UpdatedAt: istTime
  });

  // Step 11: Release the pallet: set UserId to 0, CarId to null, Status to 'Released'
  await pallet.update({
    UserId: 0,
    CarId: null,
    Status: 'Released',
    UpdatedAt: istTime
  });

  // Step 11.1: Update parking system status to 'PalletMovingToParking'
  await ParkingSystem.update(
    {
      Status: 'PalletMovingToParking',
      UpdatedAt: istTime
    },
    {
      where: {
        Id: parkingSystem.Id
      }
    }
  );

  // Step 12: Insert into RequestQueue as history
  await RequestQueue.create({
    UserId: request.UserId,
    PalletAllotmentId: request.PalletAllotmentId,
    ProjectId: request.ProjectId,
    ParkingSystemId: request.ParkingSystemId,
    CarId: request.CarId,
    OperatorId: operator.Id,
    Status: 'Completed',
    EstimatedTime: request.EstimatedTime,
    CreatedAt: request.CreatedAt,
    UpdatedAt: istTime
  });

  // Step 13: Delete original request
  await request.destroy();

  // Step 14: Reload pallet to get updated information
  await pallet.reload({
    include: [
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
  });

  // Step 15: Send notification to customer
  if (request.user) {
    const palletInfo = pallet.UserGivenPalletNumber || `Level ${pallet.Level || pallet.LevelBelowGround}, Column ${pallet.Column}`;
    const carInfo = request.car ? `${request.car.CarCompany} ${request.car.CarModel} (${request.car.CarNumber})` : 'your car';
    
    await notificationService.sendNotificationToUser(
      request.UserId,
      'Car Released',
      `Your car ${carInfo} has been released from pallet ${palletInfo}`,
      {
        type: 'car_released',
        palletId: palletId.toString(),
        requestId: requestId.toString()
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
      levelBelowGround: pallet.LevelBelowGround,
      column: pallet.Column,
      userGivenPalletNumber: pallet.UserGivenPalletNumber,
      carId: pallet.CarId,
      status: pallet.Status,
      createdAt: pallet.CreatedAt,
      updatedAt: pallet.UpdatedAt
    },
    parkingSystem: pallet.parkingSystem ? {
      id: pallet.parkingSystem.Id,
      wingName: pallet.parkingSystem.WingName,
      type: pallet.parkingSystem.Type,
      level: pallet.parkingSystem.Level,
      column: pallet.parkingSystem.Column
    } : null,
    project: pallet.project ? {
      id: pallet.project.Id,
      projectName: pallet.project.ProjectName,
      societyName: pallet.project.SocietyName
    } : null,
    timeToCall: timeToCall,
    timeToCallFormatted: formatTime(timeToCall),
    message: 'Car released successfully. Request completed, logged to history, and removed from active requests. Pallet has been released.'
  };
};

// Call Pallet and Create Request Service
const callPalletAndCreateRequest = async (operatorUserId, palletId) => {
  // Step 1: Find operator by userId
  const operator = await Operator.findOne({
    where: { UserId: operatorUserId },
    include: [
      {
        model: ParkingSystem,
        as: 'parkingSystem',
        attributes: ['Id', 'Type', 'Level', 'LevelBelowGround', 'Column', 'TimeForEachLevel', 'TimeForHorizontalMove', 'BufferTime']
      }
    ]
  });

  if (!operator) {
    throw new Error('Operator profile not found');
  }

  // Step 2: Validate operator has parking system assigned
  if (!operator.ParkingSystemId || !operator.parkingSystem) {
    throw new Error('Operator is not assigned to a parking system');
  }

  // Step 3: Validate operator has project assigned
  if (!operator.ProjectId) {
    throw new Error('Operator is not assigned to a project');
  }

  const parkingSystem = operator.parkingSystem;

  // Step 4: Find the pallet
  const pallet = await PalletAllotment.findByPk(palletId, {
    include: [
      {
        model: ParkingSystem,
        as: 'parkingSystem',
        attributes: ['Id', 'WingName', 'Type', 'Level', 'Column']
      },
      {
        model: Car,
        as: 'car',
        attributes: ['Id', 'CarType', 'CarModel', 'CarCompany', 'CarNumber'],
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['Id', 'Username', 'Role']
          }
        ]
      }
    ]
  });

  if (!pallet) {
    throw new Error('Pallet not found');
  }

  // Step 5: Validate pallet belongs to operator's parking system
  if (pallet.ParkingSystemId !== operator.ParkingSystemId) {
    throw new Error('Pallet does not belong to your parking system');
  }

  // Step 6: Validate pallet is assigned (has a customer and car)
  if (pallet.Status !== 'Assigned' || pallet.UserId === 0 || !pallet.CarId) {
    throw new Error('Pallet is not assigned to any customer or car');
  }

  // Step 7: Check if there's already a request for this pallet
  const existingRequest = await Request.findOne({
    where: {
      PalletAllotmentId: palletId,
      ProjectId: operator.ProjectId,
      ParkingSystemId: operator.ParkingSystemId,
      Status: { [Op.notIn]: ['Completed', 'Cancelled'] }
    }
  });

  if (existingRequest) {
    throw new Error('A request already exists for this pallet. Please use the existing request.');
  }

  // Step 8: Get customer information
  const customer = await Customer.findOne({
    where: {
      UserId: pallet.UserId,
      ProjectId: operator.ProjectId,
      ParkingSystemId: operator.ParkingSystemId
    },
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['Id', 'Username', 'Role']
      }
    ]
  });

  if (!customer) {
    throw new Error('Customer not found for this pallet');
  }

  // Step 9: Calculate time based on pallet location (same logic as callSpecificPallet)
  let timeToCall = 0;

  if (parkingSystem.Type === 'Tower') {
    // For Tower: (Level * TimePerLevel) + BufferTime
    timeToCall = (pallet.Level * parkingSystem.TimeForEachLevel) + parkingSystem.BufferTime;
  } else if (parkingSystem.Type === 'Puzzle') {
    // For Puzzle: Calculate based on pallet location
    if (pallet.Level !== null && pallet.Level !== undefined && pallet.LevelBelowGround === null) {
      // Pallet has Level and Column (above ground)
      // Time = (Level * TimePerLevel) + HorizontalMoveTime + BufferTime
      // HorizontalMoveTime is NOT applicable for Level 1
      timeToCall = (pallet.Level * parkingSystem.TimeForEachLevel) + 
                   (pallet.Level > 1 ? parkingSystem.TimeForHorizontalMove : 0) + 
                   parkingSystem.BufferTime;
    } else if (pallet.LevelBelowGround !== null && pallet.LevelBelowGround !== undefined) {
      // Pallet has LevelBelowGround and Column (below ground)
      if (pallet.LevelBelowGround === 1) {
        // LevelBelowGround 1: Only (LevelBelowGround * TimePerLevel) + BufferTime
        timeToCall = (pallet.LevelBelowGround * parkingSystem.TimeForEachLevel) + parkingSystem.BufferTime;
      } else {
        // LevelBelowGround > 1: (LevelBelowGround * TimePerLevel) + ((LevelBelowGround * TimePerLevel) + HorizontalMoveTime + BufferTime)
        timeToCall = (pallet.LevelBelowGround * parkingSystem.TimeForEachLevel) + 
                     ((pallet.LevelBelowGround * parkingSystem.TimeForEachLevel) + 
                      parkingSystem.TimeForHorizontalMove + 
                      parkingSystem.BufferTime);
      }
    } else {
      throw new Error('Pallet location information is invalid');
    }
  } else {
    throw new Error('Invalid parking system type');
  }

  // Step 10: Create new release request
  const istTime = getISTTime();
  const request = await Request.create({
    UserId: pallet.UserId,
    PalletAllotmentId: palletId,
    ProjectId: operator.ProjectId,
    ParkingSystemId: operator.ParkingSystemId,
    CarId: pallet.CarId,
    OperatorId: operator.Id,
    Status: 'Pending',
    EstimatedTime: timeToCall,
    CreatedAt: istTime,
    UpdatedAt: istTime
  });

  // Step 11: Update request status to 'Accepted'
  await request.update({
    Status: 'Accepted',
    UpdatedAt: istTime
  });

  // Step 12: Update parking system status to 'PalletMovingToGround'
  await ParkingSystem.update(
    {
      Status: 'PalletMovingToGround',
      UpdatedAt: istTime
    },
    {
      where: {
        Id: parkingSystem.Id
      }
    }
  );

  // Step 13: Format time in human-readable format
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0 && remainingSeconds > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ${remainingSeconds} second${remainingSeconds > 1 ? 's' : ''}`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else {
      return `${remainingSeconds} second${remainingSeconds > 1 ? 's' : ''}`;
    }
  };

  const timeToCallFormatted = formatTime(timeToCall);

  // Step 14: Send notification to customer with estimated time
  if (customer && customer.user) {
    await notificationService.sendNotificationToUser(
      pallet.UserId,
      'Request Accepted',
      `Your car release request has been accepted. Pallet is being moved to ground level. Estimated time: ${timeToCallFormatted}.`,
      {
        type: 'request_accepted',
        requestId: request.Id.toString(),
        palletId: palletId.toString(),
        estimatedTime: timeToCall,
        estimatedTimeFormatted: timeToCallFormatted
      }
    );
  }

  return {
    palletId: pallet.Id,
    palletNumber: pallet.UserGivenPalletNumber,
    level: pallet.Level,
    levelBelowGround: pallet.LevelBelowGround,
    column: pallet.Column,
    timeToCall: timeToCall,
    timeToCallFormatted: timeToCallFormatted,
    request: {
      id: request.Id,
      status: request.Status,
      estimatedTime: request.EstimatedTime,
      createdAt: request.CreatedAt,
      updatedAt: request.UpdatedAt
    },
    customer: customer ? {
      id: customer.Id,
      userId: customer.UserId,
      firstName: customer.FirstName,
      lastName: customer.LastName
    } : null,
    car: pallet.car ? {
      id: pallet.car.Id,
      carType: pallet.car.CarType,
      carModel: pallet.car.CarModel,
      carCompany: pallet.car.CarCompany,
      carNumber: pallet.car.CarNumber
    } : null,
    parkingSystem: {
      id: parkingSystem.Id,
      type: parkingSystem.Type,
      wingName: parkingSystem.WingName || null
    }
  };
};

// Call Pallet by Car Number Last 6 Digits Service
const callPalletByCarNumber = async (operatorUserId, carNumberLast6) => {
  // Step 1: Find operator by userId
  const operator = await Operator.findOne({
    where: { UserId: operatorUserId },
    include: [
      {
        model: ParkingSystem,
        as: 'parkingSystem',
        attributes: ['Id', 'Type', 'Level', 'LevelBelowGround', 'Column', 'TimeForEachLevel', 'TimeForHorizontalMove', 'BufferTime']
      }
    ]
  });

  if (!operator) {
    throw new Error('Operator profile not found');
  }

  // Step 2: Validate operator has parking system assigned
  if (!operator.ParkingSystemId || !operator.parkingSystem) {
    throw new Error('Operator is not assigned to a parking system');
  }

  // Step 3: Validate operator has project assigned
  if (!operator.ProjectId) {
    throw new Error('Operator is not assigned to a project');
  }

  const parkingSystem = operator.parkingSystem;

  // Step 4: Find car with matching last 6 digits (unique)
  const car = await Car.findOne({
    where: {
      CarNumber: { [Op.like]: `%${carNumberLast6}` }
    },
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['Id', 'Username', 'Role']
      }
    ]
  });

  if (!car) {
    throw new Error(`No car found with last 6 digits: ${carNumberLast6}`);
  }

  // Step 5: Find if this car is parked (assigned to a pallet in operator's parking system)
  const parkedPallet = await PalletAllotment.findOne({
    where: {
      CarId: car.Id,
      UserId: car.UserId,
      ParkingSystemId: operator.ParkingSystemId,
      Status: 'Assigned'
    },
    include: [
      {
        model: ParkingSystem,
        as: 'parkingSystem',
        attributes: ['Id', 'WingName', 'Type', 'Level', 'Column']
      },
      {
        model: Car,
        as: 'car',
        attributes: ['Id', 'CarType', 'CarModel', 'CarCompany', 'CarNumber'],
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['Id', 'Username', 'Role']
          }
        ]
      }
    ]
  });

  if (!parkedPallet) {
    throw new Error(`Car with last 6 digits ${carNumberLast6} is not parked in your parking system`);
  }

  // Step 6: Check if there's already a request for this pallet
  const existingRequest = await Request.findOne({
    where: {
      PalletAllotmentId: parkedPallet.Id,
      ProjectId: operator.ProjectId,
      ParkingSystemId: operator.ParkingSystemId,
      Status: { [Op.notIn]: ['Completed', 'Cancelled'] }
    }
  });

  if (existingRequest) {
    throw new Error('A request already exists for this car. Please use the existing request.');
  }

  // Step 7: Get customer information
  const customer = await Customer.findOne({
    where: {
      UserId: car.UserId,
      ProjectId: operator.ProjectId,
      ParkingSystemId: operator.ParkingSystemId
    },
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['Id', 'Username', 'Role']
      }
    ]
  });

  if (!customer) {
    throw new Error('Customer not found for this car');
  }

  // Step 8: Calculate time based on pallet location (same logic as callSpecificPallet)
  let timeToCall = 0;

  if (parkingSystem.Type === 'Tower') {
    // For Tower: (Level * TimePerLevel) + BufferTime
    timeToCall = (parkedPallet.Level * parkingSystem.TimeForEachLevel) + parkingSystem.BufferTime;
  } else if (parkingSystem.Type === 'Puzzle') {
    // For Puzzle: Calculate based on pallet location
    if (parkedPallet.Level !== null && parkedPallet.Level !== undefined && parkedPallet.LevelBelowGround === null) {
      // Pallet has Level and Column (above ground)
      // Time = (Level * TimePerLevel) + HorizontalMoveTime + BufferTime
      // HorizontalMoveTime is NOT applicable for Level 1
      timeToCall = (parkedPallet.Level * parkingSystem.TimeForEachLevel) + 
                   (parkedPallet.Level > 1 ? parkingSystem.TimeForHorizontalMove : 0) + 
                   parkingSystem.BufferTime;
    } else if (parkedPallet.LevelBelowGround !== null && parkedPallet.LevelBelowGround !== undefined) {
      // Pallet has LevelBelowGround and Column (below ground)
      if (parkedPallet.LevelBelowGround === 1) {
        // LevelBelowGround 1: Only (LevelBelowGround * TimePerLevel) + BufferTime
        timeToCall = (parkedPallet.LevelBelowGround * parkingSystem.TimeForEachLevel) + parkingSystem.BufferTime;
      } else {
        // LevelBelowGround > 1: (LevelBelowGround * TimePerLevel) + ((LevelBelowGround * TimePerLevel) + HorizontalMoveTime + BufferTime)
        timeToCall = (parkedPallet.LevelBelowGround * parkingSystem.TimeForEachLevel) + 
                     ((parkedPallet.LevelBelowGround * parkingSystem.TimeForEachLevel) + 
                      parkingSystem.TimeForHorizontalMove + 
                      parkingSystem.BufferTime);
      }
    } else {
      throw new Error('Pallet location information is invalid');
    }
  } else {
    throw new Error('Invalid parking system type');
  }

  // Step 9: Create new release request
  const istTime = getISTTime();
  const request = await Request.create({
    UserId: car.UserId,
    PalletAllotmentId: parkedPallet.Id,
    ProjectId: operator.ProjectId,
    ParkingSystemId: operator.ParkingSystemId,
    CarId: car.Id,
    OperatorId: operator.Id,
    Status: 'Pending',
    EstimatedTime: timeToCall,
    CreatedAt: istTime,
    UpdatedAt: istTime
  });

  // Step 10: Update parking system status to 'PalletMovingToGround'
  await ParkingSystem.update(
    {
      Status: 'PalletMovingToGround',
      UpdatedAt: istTime
    },
    {
      where: {
        Id: parkingSystem.Id
      }
    }
  );

  // Step 12: Format time in human-readable format
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0 && remainingSeconds > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ${remainingSeconds} second${remainingSeconds > 1 ? 's' : ''}`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else {
      return `${remainingSeconds} second${remainingSeconds > 1 ? 's' : ''}`;
    }
  };

  const timeToCallFormatted = formatTime(timeToCall);

  // Step 13: Send notification to customer
  if (customer && customer.user) {
    await notificationService.sendNotificationToUser(
      car.UserId,
      'Car Release Request Created',
      `Your car release request has been created and is pending. Estimated time: ${timeToCallFormatted}.`,
      {
        type: 'car_release_request',
        requestId: request.Id.toString(),
        palletId: parkedPallet.Id.toString(),
        estimatedTime: timeToCall,
        estimatedTimeFormatted: timeToCallFormatted
      }
    );
  }

  return {
    palletId: parkedPallet.Id,
    palletNumber: parkedPallet.UserGivenPalletNumber,
    level: parkedPallet.Level,
    levelBelowGround: parkedPallet.LevelBelowGround,
    column: parkedPallet.Column,
    timeToCall: timeToCall,
    timeToCallFormatted: timeToCallFormatted,
    request: {
      id: request.Id,
      status: request.Status,
      estimatedTime: request.EstimatedTime,
      createdAt: request.CreatedAt,
      updatedAt: request.UpdatedAt
    },
    customer: customer ? {
      id: customer.Id,
      userId: customer.UserId,
      firstName: customer.FirstName,
      lastName: customer.LastName
    } : null,
    car: car ? {
      id: car.Id,
      carType: car.CarType,
      carModel: car.CarModel,
      carCompany: car.CarCompany,
      carNumber: car.CarNumber
    } : null,
    parkingSystem: {
      id: parkingSystem.Id,
      type: parkingSystem.Type,
      wingName: parkingSystem.WingName || null
    }
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
  updateCustomerStatus,
  callEmptyPallet,
  updateParkingSystemStatus,
  releaseParkedCar,
  callSpecificPallet,
  callPalletAndCreateRequest,
  callPalletByCarNumber
};


