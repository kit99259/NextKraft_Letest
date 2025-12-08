const { User, Operator, Project, ParkingSystem } = require('../models/associations');

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

module.exports = {
  createOperator,
  getOperatorProfile,
  getOperatorList
};

