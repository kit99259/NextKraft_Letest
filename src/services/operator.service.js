const { User, Operator, Project, ParkingSystem, PalletAllotment, Customer, Car } = require('../models/associations');

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

module.exports = {
  createOperator,
  getOperatorProfile,
  getOperatorList,
  getOperatorProjectWithParkingSystems,
  assignPalletToCustomer
};

