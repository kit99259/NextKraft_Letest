const { sequelize } = require('../config/database');
const { Project, ParkingSystem, PalletAllotment, Car, User } = require('../models/associations');

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
  
  // Step 2: Calculate TotalNumberOfPallet
  let totalNumberOfPallet = 0;
  if (parkingSystemData.Type === 'Tower') {
    totalNumberOfPallet = parkingSystemData.Level * parkingSystemData.Column;
  }
  
  
  // Step 4: Create parking system
  const parkingSystem = await ParkingSystem.create({
    WingName: parkingSystemData.WingName,
    ProjectId: projectId,
    Type: parkingSystemData.Type,
    Level: parkingSystemData.Level,
    Column: parkingSystemData.Column,
    TotalNumberOfPallet: totalNumberOfPallet,
    TimeForEachLevel: parkingSystemData.TimeForEachLevel || 0,
    TimeForHorizontalMove: parkingSystemData.TimeForHorizontalMove || 0,
    CreatedAt: istTime,
    UpdatedAt: istTime
  });
  
  const parkingSystemId = parkingSystem.Id;
  
  // Step 5: Create multiple pallet details entries
  const palletDetails = [];

  // Determine starting pallet number for this project (increment per project)
  const lastPallet = await PalletAllotment.findOne({
    where: { ProjectId: projectId },
    order: [[sequelize.literal('CAST("UserGivenPalletNumber" AS INTEGER)'), 'DESC']]
  });
  let userGivenPalletNumber = lastPallet ? (parseInt(lastPallet.UserGivenPalletNumber, 10) + 1) : 1;
  
  for (let currentLevel = 1; currentLevel <= parkingSystemData.Level; currentLevel++) {
    for (let currentColumn = 1; currentColumn <= parkingSystemData.Column; currentColumn++) {
      const palletDetail = await PalletAllotment.create({
        UserId: 0,
        ParkingSystemId: parkingSystemId,
        ProjectId: projectId,
        Level: currentLevel,
        Column: currentColumn,
        UserGivenPalletNumber: userGivenPalletNumber.toString(),
        CarId: null, // CarId will be set when a car is assigned
        Status: 'Released',
        CreatedAt: istTime,
        UpdatedAt: istTime
      });
      
      palletDetails.push({
        id: palletDetail.Id,
        level: palletDetail.Level,
        column: palletDetail.Column,
        userGivenPalletNumber: palletDetail.UserGivenPalletNumber
      });
      
      userGivenPalletNumber++;
    }
  }
  
  return {
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
      createdAt: parkingSystem.CreatedAt,
      updatedAt: parkingSystem.UpdatedAt
    },
    project: {
      id: project.Id,
      projectName: project.ProjectName,
      societyName: project.SocietyName
    },
    palletDetails: palletDetails,
    totalPalletsCreated: palletDetails.length
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
      timeForHorizontalMove: parkingSystem.TimeForHorizontalMove
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

module.exports = {
  createParkingSystem,
  getProjectListWithParkingSystems,
  getPalletDetails
};

