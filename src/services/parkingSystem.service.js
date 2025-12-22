const { sequelize } = require('../config/database');
const { Project, ParkingSystem, PalletAllotment, Car, User, Operator, Customer } = require('../models/associations');

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

// Create Parking System Service
const createParkingSystem = async (parkingSystemData) => {
  // Step 1: Create or get project
  
    const istTime = getISTTime();
    project = await Project.create({
      ProjectName: parkingSystemData.ProjectName,
      SocietyName: parkingSystemData.SocietyName,
      CreatedAt: istTime,
      UpdatedAt: istTime
    });
  
  const projectId = project.Id;
  
  // Step 2: Calculate TotalNumberOfPallet based on type
  let totalNumberOfPallet = 0;
  if (parkingSystemData.Type === 'Tower') {
    // Tower: Level × Column
    totalNumberOfPallet = parkingSystemData.Level * parkingSystemData.Column;
  } else if (parkingSystemData.Type === 'Puzzle') {
    // Puzzle: ((Column - 1) × LevelAboveGround) + 1 + (Column × LevelBelowGround)
    const levelAboveGround = parkingSystemData.Level; // Level represents LevelAboveGround
    const levelBelowGround = parkingSystemData.LevelBelowGround || 0;
    totalNumberOfPallet = ((parkingSystemData.Column - 1) * levelAboveGround) + 1 + (parkingSystemData.Column * levelBelowGround);
  }
  
  // Step 3: Validate Puzzle parking has LevelBelowGround
  if (parkingSystemData.Type === 'Puzzle' && (!parkingSystemData.LevelBelowGround || parkingSystemData.LevelBelowGround < 0)) {
    throw new Error('LevelBelowGround is required for Puzzle parking system');
  }
  
  // Step 4: Create parking system
  const parkingSystem = await ParkingSystem.create({
    WingName: parkingSystemData.WingName,
    ProjectId: projectId,
    Type: parkingSystemData.Type,
    Level: parkingSystemData.Level,
    LevelBelowGround: parkingSystemData.LevelBelowGround || null,
    Column: parkingSystemData.Column,
    TotalNumberOfPallet: totalNumberOfPallet,
    TimeForEachLevel: parkingSystemData.TimeForEachLevel || 0,
    TimeForHorizontalMove: parkingSystemData.TimeForHorizontalMove || 0,
    BufferTime: parkingSystemData.BufferTime || 0,
    CreatedAt: istTime,
    UpdatedAt: istTime
  });
  
  return {
    parkingSystem: {
      id: parkingSystem.Id,
      wingName: parkingSystem.WingName,
      projectId: parkingSystem.ProjectId,
      type: parkingSystem.Type,
      level: parkingSystem.Level,
      levelBelowGround: parkingSystem.LevelBelowGround,
      column: parkingSystem.Column,
      totalNumberOfPallet: parkingSystem.TotalNumberOfPallet,
      timeForEachLevel: parkingSystem.TimeForEachLevel,
      timeForHorizontalMove: parkingSystem.TimeForHorizontalMove,
      bufferTime: parkingSystem.BufferTime,
      status: parkingSystem.Status,
      createdAt: parkingSystem.CreatedAt,
      updatedAt: parkingSystem.UpdatedAt
    },
    project: {
      id: project.Id,
      projectName: project.ProjectName,
      societyName: project.SocietyName
    }
  };
};

// Get Project List with Parking Systems Service (Admin only)
const getProjectListWithParkingSystems = async () => {
  // Find all projects with their parking systems (without pallet details)
  const projects = await Project.findAll({
    include: [
      {
        model: ParkingSystem,
        as: 'parkingSystems',
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
          'Status',
          'CreatedAt',
          'UpdatedAt'
        ]
      }
    ],
    order: [['CreatedAt', 'DESC']]
  });

  return projects.map(project => ({
    id: project.Id,
    projectName: project.ProjectName,
    societyName: project.SocietyName,
    createdAt: project.CreatedAt,
    updatedAt: project.UpdatedAt,
    parkingSystems: project.parkingSystems ? project.parkingSystems.map(parkingSystem => ({
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
      status: parkingSystem.Status,
      createdAt: parkingSystem.CreatedAt,
      updatedAt: parkingSystem.UpdatedAt
    })) : []
  }));
};

// Get Pallet Details Service (Admin and Operator)
const getPalletDetails = async (projectId, parkingSystemId) => {
  // Validate project exists
  const project = await Project.findByPk(projectId);
  if (!project) {
    throw new Error('Project not found');
  }

  // Validate parking system exists and belongs to the project
  const parkingSystem = await ParkingSystem.findOne({
    where: {
      Id: parkingSystemId,
      ProjectId: projectId
    }
  });

  if (!parkingSystem) {
    throw new Error('Parking system not found or does not belong to the specified project');
  }

  // Find all pallet details for the specified project and parking system
  const palletDetails = await PalletAllotment.findAll({
    where: {
      ProjectId: projectId,
      ParkingSystemId: parkingSystemId
    },
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
    ],
    order: [
      ['Level', 'ASC'],
      ['Column', 'ASC']
    ]
  });

  return {
    project: {
      id: project.Id,
      projectName: project.ProjectName,
      societyName: project.SocietyName
    },
    parkingSystem: {
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
      status: parkingSystem.Status
    },
    palletDetails: palletDetails.map(pallet => ({
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
    })),
    count: palletDetails.length
  };
};

// Generate Pallets for Parking System Service
const generatePallets = async (parkingSystemId, startingPalletNumber) => {
  // Step 1: Validate parking system exists
  const parkingSystem = await ParkingSystem.findByPk(parkingSystemId);
  if (!parkingSystem) {
    throw new Error('Parking system not found');
  }

  // Step 2: Check if pallets already exist for this parking system
  const existingPallets = await PalletAllotment.count({
    where: {
      ParkingSystemId: parkingSystemId
    }
  });

  if (existingPallets > 0) {
    throw new Error('Pallets already exist for this parking system');
  }

  // Step 3: Validate starting pallet number
  if (!startingPalletNumber || startingPalletNumber < 1) {
    throw new Error('Starting pallet number must be a positive integer');
  }

  const istTime = getISTTime();
  const palletDetails = [];
  let currentPalletNumber = startingPalletNumber;

  // Step 4: Generate pallets based on parking system type
  if (parkingSystem.Type === 'Tower') {
    // Tower: Generate pallets for Level × Column
    for (let currentLevel = 1; currentLevel <= parkingSystem.Level; currentLevel++) {
      for (let currentColumn = 1; currentColumn <= parkingSystem.Column; currentColumn++) {
        const palletDetail = await PalletAllotment.create({
          UserId: 0,
          ParkingSystemId: parkingSystemId,
          ProjectId: parkingSystem.ProjectId,
          Level: currentLevel,
          LevelBelowGround: null,
          Column: currentColumn,
          UserGivenPalletNumber: currentPalletNumber.toString(),
          CarId: null,
          Status: 'Released',
          CreatedAt: istTime,
          UpdatedAt: istTime
        });
        
        palletDetails.push({
          id: palletDetail.Id,
          level: palletDetail.Level,
          levelBelowGround: palletDetail.LevelBelowGround,
          column: palletDetail.Column,
          userGivenPalletNumber: palletDetail.UserGivenPalletNumber
        });
        
        currentPalletNumber++;
      }
    }
  } else if (parkingSystem.Type === 'Puzzle') {
    // Puzzle: Generate pallets based on formula
    // Formula: ((Column - 1) × LevelAboveGround) + 1 + (Column × LevelBelowGround)
    const levelAboveGround = parkingSystem.Level;
    const levelBelowGround = parkingSystem.LevelBelowGround || 0;

    // Generate pallets for above ground levels
    // Pattern: (Column - 1) × LevelAboveGround pallets + 1 special pallet
    for (let currentLevel = 1; currentLevel <= levelAboveGround; currentLevel++) {
      for (let currentColumn = 1; currentColumn < parkingSystem.Column; currentColumn++) {
        // Create (Column - 1) pallets for each level
        const palletDetail = await PalletAllotment.create({
          UserId: 0,
          ParkingSystemId: parkingSystemId,
          ProjectId: parkingSystem.ProjectId,
          Level: currentLevel,
          LevelBelowGround: null,
          Column: currentColumn,
          UserGivenPalletNumber: currentPalletNumber.toString(),
          CarId: null,
          Status: 'Released',
          CreatedAt: istTime,
          UpdatedAt: istTime
        });
        
        palletDetails.push({
          id: palletDetail.Id,
          level: palletDetail.Level,
          levelBelowGround: palletDetail.LevelBelowGround,
          column: palletDetail.Column,
          userGivenPalletNumber: palletDetail.UserGivenPalletNumber
        });
        
        currentPalletNumber++;
      }
    }

    // Add the special +1 pallet (last column of first level)
    if (levelAboveGround > 0) {
      const specialPallet = await PalletAllotment.create({
        UserId: 0,
        ParkingSystemId: parkingSystemId,
        ProjectId: parkingSystem.ProjectId,
        Level: 1,
        LevelBelowGround: null,
        Column: parkingSystem.Column,
        UserGivenPalletNumber: currentPalletNumber.toString(),
        CarId: null,
        Status: 'Released',
        CreatedAt: istTime,
        UpdatedAt: istTime
      });
      
      palletDetails.push({
        id: specialPallet.Id,
        level: specialPallet.Level,
        levelBelowGround: specialPallet.LevelBelowGround,
        column: specialPallet.Column,
        userGivenPalletNumber: specialPallet.UserGivenPalletNumber
      });
      
      currentPalletNumber++;
    }

    // Generate pallets for below ground levels
    // Pattern: Column × LevelBelowGround pallets
    for (let currentLevelBelow = 1; currentLevelBelow <= levelBelowGround; currentLevelBelow++) {
      for (let currentColumn = 1; currentColumn <= parkingSystem.Column; currentColumn++) {
        const palletDetail = await PalletAllotment.create({
          UserId: 0,
          ParkingSystemId: parkingSystemId,
          ProjectId: parkingSystem.ProjectId,
          Level: null, // No level above ground for below ground pallets
          LevelBelowGround: currentLevelBelow,
          Column: currentColumn,
          UserGivenPalletNumber: currentPalletNumber.toString(),
          CarId: null,
          Status: 'Released',
          CreatedAt: istTime,
          UpdatedAt: istTime
        });
        
        palletDetails.push({
          id: palletDetail.Id,
          level: palletDetail.Level,
          levelBelowGround: palletDetail.LevelBelowGround,
          column: palletDetail.Column,
          userGivenPalletNumber: palletDetail.UserGivenPalletNumber
        });
        
        currentPalletNumber++;
      }
    }
  }

  return {
    parkingSystem: {
      id: parkingSystem.Id,
      wingName: parkingSystem.WingName,
      projectId: parkingSystem.ProjectId,
      type: parkingSystem.Type,
      level: parkingSystem.Level,
      levelBelowGround: parkingSystem.LevelBelowGround,
      column: parkingSystem.Column,
      totalNumberOfPallet: parkingSystem.TotalNumberOfPallet
    },
    palletDetails: palletDetails,
    totalPalletsCreated: palletDetails.length,
    startingPalletNumber: startingPalletNumber,
    endingPalletNumber: currentPalletNumber - 1
  };
};

// Get Project Details with Parking System and All Pallet Details Service (Admin only)
const getProjectDetailsWithParkingSystemAndPallets = async (projectId) => {
  // Step 1: Validate project exists
  const project = await Project.findByPk(projectId);
  if (!project) {
    throw new Error('Project not found');
  }

  // Step 2: Get parking system for this project (assuming one parking system per project)
  const parkingSystem = await ParkingSystem.findOne({
    where: {
      ProjectId: projectId
    }
  });

  if (!parkingSystem) {
    return {
      project: {
        id: project.Id,
        projectName: project.ProjectName,
        societyName: project.SocietyName,
        createdAt: project.CreatedAt,
        updatedAt: project.UpdatedAt
      },
      parkingSystem: null,
      palletDetails: [],
      count: 0
    };
  }

  // Step 3: Get all pallet details for this parking system
  const palletDetails = await PalletAllotment.findAll({
    where: {
      ProjectId: projectId,
      ParkingSystemId: parkingSystem.Id
    },
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
        ],
        required: false
      },
      {
        model: Project,
        as: 'project',
        attributes: ['Id', 'ProjectName', 'SocietyName']
      },
      {
        model: ParkingSystem,
        as: 'parkingSystem',
        attributes: ['Id', 'WingName', 'Type', 'Level', 'LevelBelowGround', 'Column']
      }
    ],
    order: [
      [sequelize.literal('CASE WHEN Level IS NULL THEN 1 ELSE 0 END'), 'ASC'],
      ['Level', 'ASC'],
      [sequelize.literal('CASE WHEN LevelBelowGround IS NULL THEN 1 ELSE 0 END'), 'ASC'],
      ['LevelBelowGround', 'ASC'],
      ['Column', 'ASC']
    ]
  });

  return {
    project: {
      id: project.Id,
      projectName: project.ProjectName,
      societyName: project.SocietyName,
      createdAt: project.CreatedAt,
      updatedAt: project.UpdatedAt
    },
    parkingSystem: {
      id: parkingSystem.Id,
      wingName: parkingSystem.WingName,
      projectId: parkingSystem.ProjectId,
      type: parkingSystem.Type,
      level: parkingSystem.Level,
      levelBelowGround: parkingSystem.LevelBelowGround,
      column: parkingSystem.Column,
      totalNumberOfPallet: parkingSystem.TotalNumberOfPallet,
      timeForEachLevel: parkingSystem.TimeForEachLevel,
      timeForHorizontalMove: parkingSystem.TimeForHorizontalMove,
      bufferTime: parkingSystem.BufferTime,
      status: parkingSystem.Status,
      createdAt: parkingSystem.CreatedAt,
      updatedAt: parkingSystem.UpdatedAt
    },
    palletDetails: palletDetails.map(pallet => ({
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
    })),
    count: palletDetails.length
  };
};

// Get Parking System Status Service (Operator and Customer)
const getParkingSystemStatus = async (userId, userRole) => {
  let parkingSystemId = null;

  // Step 1: Get ParkingSystemId based on user role
  if (userRole === 'operator') {
    const operator = await Operator.findOne({
      where: { UserId: userId }
    });

    if (!operator) {
      throw new Error('Operator profile not found');
    }

    if (!operator.ParkingSystemId) {
      throw new Error('Operator is not assigned to any parking system');
    }

    parkingSystemId = operator.ParkingSystemId;
  } else if (userRole === 'customer') {
    const customer = await Customer.findOne({
      where: { UserId: userId }
    });

    if (!customer) {
      throw new Error('Customer profile not found');
    }

    if (!customer.ParkingSystemId) {
      throw new Error('Customer is not assigned to any parking system');
    }

    parkingSystemId = customer.ParkingSystemId;
  } else {
    throw new Error('Invalid user role. Only operator and customer roles are allowed');
  }

  // Step 2: Get ParkingSystem by ID
  const parkingSystem = await ParkingSystem.findByPk(parkingSystemId);

  if (!parkingSystem) {
    throw new Error('Parking system not found');
  }

  // Step 3: Return status
  return {
    status: parkingSystem.Status
  };
};

module.exports = {
  createParkingSystem,
  getProjectListWithParkingSystems,
  getPalletDetails,
  generatePallets,
  getProjectDetailsWithParkingSystemAndPallets,
  getParkingSystemStatus
};

