const parkingSystemService = require('../services/parkingSystem.service');
const { successResponse, errorResponse } = require('../utils');

// Create Parking System Controller
const createParkingSystem = async (req, res) => {
  try {
    const { projectName, societyName, wingName, type, level, levelBelowGround, column, timeForEachLevel, timeForHorizontalMove, bufferTime } = req.body;
    
    const result = await parkingSystemService.createParkingSystem({
      ProjectName: projectName,
      SocietyName: societyName,
      WingName: wingName,
      Type: type,
      Level: level,
      LevelBelowGround: levelBelowGround,
      Column: column,
      TimeForEachLevel: timeForEachLevel,
      TimeForHorizontalMove: timeForHorizontalMove,
      BufferTime: bufferTime
    });
    
    return successResponse(res, result, 'Parking system created successfully', 201);
  } catch (error) {
    console.error('Create parking system error:', error);
    const statusCode = error.message === 'Project name already exists' || 
                      error.message === 'LevelBelowGround is required for Puzzle parking system' ? 400 : 500;
    return errorResponse(res, error.message || 'Failed to create parking system', statusCode);
  }
};

// Generate Pallets Controller
const generatePallets = async (req, res) => {
  try {
    const { parkingSystemId, startingPalletNumber } = req.body;
    
    if (!parkingSystemId || !startingPalletNumber) {
      return errorResponse(res, 'Parking System ID and Starting Pallet Number are required', 400);
    }
    
    const result = await parkingSystemService.generatePallets(
      parseInt(parkingSystemId),
      parseInt(startingPalletNumber)
    );
    
    return successResponse(res, result, 'Pallets generated successfully', 201);
  } catch (error) {
    console.error('Generate pallets error:', error);
    const statusCode = error.message === 'Parking system not found' ||
                      error.message === 'Pallets already exist for this parking system' ||
                      error.message === 'Starting pallet number must be a positive integer' ? 400 : 500;
    return errorResponse(res, error.message || 'Failed to generate pallets', statusCode);
  }
};

// Get Project List with Parking Systems Controller (Admin only)
const getProjectListWithParkingSystems = async (req, res) => {
  try {
    const result = await parkingSystemService.getProjectListWithParkingSystems();
    
    return successResponse(res, { projects: result, count: result.length }, 'Project list with parking systems retrieved successfully');
  } catch (error) {
    console.error('Get project list error:', error);
    return errorResponse(res, error.message || 'Failed to retrieve project list', 500);
  }
};

// Get Pallet Details Controller (Admin and Operator)
const getPalletDetails = async (req, res) => {
  try {
    const { projectId, parkingSystemId } = req.query;
    
    if (!projectId || !parkingSystemId) {
      return errorResponse(res, 'Project ID and Parking System ID are required', 400);
    }

    const result = await parkingSystemService.getPalletDetails(
      parseInt(projectId),
      parseInt(parkingSystemId)
    );
    
    return successResponse(res, result, 'Pallet details retrieved successfully');
  } catch (error) {
    console.error('Get pallet details error:', error);
    const statusCode = error.message === 'Project not found' || 
                       error.message === 'Parking system not found or does not belong to the specified project' ? 404 : 500;
    return errorResponse(res, error.message || 'Failed to retrieve pallet details', statusCode);
  }
};

// Get Project Details with Parking System and All Pallet Details Controller (Admin only)
const getProjectDetailsWithParkingSystemAndPallets = async (req, res) => {
  try {
    const { projectId } = req.query;
    
    if (!projectId) {
      return errorResponse(res, 'Project ID is required', 400);
    }

    const result = await parkingSystemService.getProjectDetailsWithParkingSystemAndPallets(
      parseInt(projectId)
    );
    
    return successResponse(res, result, 'Project details with parking system and pallets retrieved successfully');
  } catch (error) {
    console.error('Get project details error:', error);
    const statusCode = error.message === 'Project not found' ? 404 : 500;
    return errorResponse(res, error.message || 'Failed to retrieve project details', statusCode);
  }
};

module.exports = {
  createParkingSystem,
  getProjectListWithParkingSystems,
  getPalletDetails,
  generatePallets,
  getProjectDetailsWithParkingSystemAndPallets
};

