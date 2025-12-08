const { Project, ParkingSystem, PalletAllotment } = require('../models/associations');

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
  let userGivenPalletNumber = 1;
  
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

module.exports = {
  createParkingSystem
};

