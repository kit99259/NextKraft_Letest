const operatorService = require('../services/operator.service');
const { successResponse, errorResponse } = require('../utils');

// Create Operator Controller
const createOperator = async (req, res) => {
  try {
    const { username, password, firstName, lastName, email, mobileNumber, projectId, parkingSystemId } = req.body;
    const adminUserId = req.user.id; // Get admin userId from session
    const adminRole = req.user.role; // Get role from session
    
    const result = await operatorService.createOperator({
      Username: username,
      Password: password,
      FirstName: firstName,
      LastName: lastName,
      Email: email,
      MobileNumber: mobileNumber,
      ProjectId: projectId,
      ParkingSystemId: parkingSystemId,
      AdminUserId: adminUserId,
      AdminRole: adminRole
    });
    
    return successResponse(res, result, 'Operator created successfully', 201);
  } catch (error) {
    console.error('Create operator error:', error);
    const statusCode = error.message === 'Username already exists' ? 400 : 
                       error.message === 'Project not found' ? 404 :
                       error.message === 'Parking system not found' ? 404 : 500;
    return errorResponse(res, error.message || 'Failed to create operator', statusCode);
  }
};

// Get Operator Profile Controller
const getOperatorProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Get userId from authenticated session
    
    const result = await operatorService.getOperatorProfile(userId);
    
    return successResponse(res, result, 'Operator profile retrieved successfully');
  } catch (error) {
    console.error('Get operator profile error:', error);
    const statusCode = error.message === 'Operator profile not found' ? 404 : 500;
    return errorResponse(res, error.message || 'Failed to retrieve operator profile', statusCode);
  }
};

// Get Operator List Controller (Admin only)
const getOperatorList = async (req, res) => {
  try {
    const result = await operatorService.getOperatorList();
    
    return successResponse(res, { operators: result, count: result.length }, 'Operator list retrieved successfully');
  } catch (error) {
    console.error('Get operator list error:', error);
    return errorResponse(res, error.message || 'Failed to retrieve operator list', 500);
  }
};

module.exports = {
  createOperator,
  getOperatorProfile,
  getOperatorList
};

