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

// Bulk update UserGivenPalletNumber by parking system + floor + column (Admin and Operator)
const bulkUpdateUserGivenPalletNumbers = async (req, res) => {
  try {
    const rows = Array.isArray(req.body) ? req.body : req.body?.items;
    const result = await parkingSystemService.bulkUpdateUserGivenPalletNumbers(rows, {
      userRole: req.user.role,
      operatorUserId: req.user.id
    });

    const message =
      result.errorCount === 0
        ? 'Pallet numbers updated successfully'
        : `Updated ${result.updatedCount} pallet(s); ${result.errorCount} row(s) could not be matched`;

    return successResponse(res, result, message);
  } catch (error) {
    console.error('Bulk update pallet numbers error:', error);
    const statusCode = error.message === 'Request body must be a non-empty array' ||
      error.message.startsWith('Invalid entry at index') ||
      error.message.startsWith('Duplicate slot in request') ||
      error.message === 'Operator is not assigned to a parking system'
      ? 400
      : error.message === 'Operator profile not found'
        ? 404
        : 500;
    return errorResponse(res, error.message || 'Failed to update pallet numbers', statusCode);
  }
};

// Get Parking System Status Controller (Operator and Customer)
const getParkingSystemStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    
    const result = await parkingSystemService.getParkingSystemStatus(userId, userRole);
    
    return successResponse(res, result, 'Parking system status retrieved successfully');
  } catch (error) {
    console.error('Get parking system status error:', error);
    const statusCode = error.message === 'Operator profile not found' ||
                      error.message === 'Customer profile not found' ||
                      error.message === 'Operator is not assigned to any parking system' ||
                      error.message === 'Customer is not assigned to any parking system' ||
                      error.message === 'Parking system not found' ||
                      error.message === 'Invalid user role. Only operator and customer roles are allowed' ? 404 : 500;
    return errorResponse(res, error.message || 'Failed to retrieve parking system status', statusCode);
  }
};

module.exports = {
  createParkingSystem,
  getProjectListWithParkingSystems,
  getPalletDetails,
  generatePallets,
  getProjectDetailsWithParkingSystemAndPallets,
  getParkingSystemStatus,
  bulkUpdateUserGivenPalletNumbers
};

