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

module.exports = {
  createOperator
};

