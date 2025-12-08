const parkingSystemService = require('../services/parkingSystem.service');
const { successResponse, errorResponse } = require('../utils');

// Create Parking System Controller
const createParkingSystem = async (req, res) => {
  try {
    const { projectName, societyName, wingName, type, level, column, timeForEachLevel, timeForHorizontalMove } = req.body;
    
    const result = await parkingSystemService.createParkingSystem({
      ProjectName: projectName,
      SocietyName: societyName,
      WingName: wingName,
      Type: type,
      Level: level,
      Column: column,
      TimeForEachLevel: timeForEachLevel,
      TimeForHorizontalMove: timeForHorizontalMove
    });
    
    return successResponse(res, result, 'Parking system created successfully', 201);
  } catch (error) {
    console.error('Create parking system error:', error);
    const statusCode = error.message === 'Project name already exists' ? 400 : 500;
    return errorResponse(res, error.message || 'Failed to create parking system', statusCode);
  }
};

module.exports = {
  createParkingSystem
};

