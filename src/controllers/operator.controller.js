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

// Get Operator Project with Parking Systems Controller
const getOperatorProjectWithParkingSystems = async (req, res) => {
  try {
    const userId = req.user.id; // Get userId from authenticated session
    
    const result = await operatorService.getOperatorProjectWithParkingSystems(userId);
    
    return successResponse(res, result, 'Project and parking systems retrieved successfully');
  } catch (error) {
    console.error('Get operator project error:', error);
    const statusCode = error.message === 'Operator profile not found' || 
                       error.message === 'Operator is not assigned to any project' ? 404 : 500;
    return errorResponse(res, error.message || 'Failed to retrieve project and parking systems', statusCode);
  }
};

// Assign Pallet to Customer Controller
const assignPalletToCustomer = async (req, res) => {
  try {
    const { palletId, customerId, carId } = req.body;
    const operatorUserId = req.user.id; // Get operator userId from authenticated session
    
    const result = await operatorService.assignPalletToCustomer(
      operatorUserId,
      parseInt(palletId),
      parseInt(customerId),
      carId ? parseInt(carId) : null
    );
    
    return successResponse(res, result, 'Pallet assigned to customer successfully');
  } catch (error) {
    console.error('Assign pallet error:', error);
    const statusCode = error.message === 'Operator profile not found' ||
                       error.message === 'Pallet not found' ||
                       error.message === 'Customer not found' ||
                       error.message === 'Car not found or does not belong to the customer' ? 404 :
                       error.message === 'Pallet is already assigned to another customer' ||
                       error.message === 'Car is already assigned to another pallet' ||
                       error.message === 'Customer is not approved. Only approved customers can be assigned to pallets' ||
                       error.message === 'Customer does not belong to the same project as the pallet' ||
                       error.message === 'Operator does not have access to this project' ||
                       error.message === 'Customer has no cars. Please provide a car ID or add a car first' ? 400 : 500;
    return errorResponse(res, error.message || 'Failed to assign pallet to customer', statusCode);
  }
};

// Get Operator Requests Controller
const getOperatorRequests = async (req, res) => {
  try {
    const operatorUserId = req.user.id; // Get operator userId from authenticated session
    
    const result = await operatorService.getOperatorRequests(operatorUserId);
    
    return successResponse(res, { requests: result, count: result.length }, 'Operator requests retrieved successfully');
  } catch (error) {
    console.error('Get operator requests error:', error);
    const statusCode = error.message === 'Operator profile not found' ? 404 : 500;
    return errorResponse(res, error.message || 'Failed to retrieve operator requests', statusCode);
  }
};

// Update Request Status Controller
const updateRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;
    const operatorUserId = req.user.id; // Get operator userId from authenticated session
    
    const result = await operatorService.updateRequestStatus(
      operatorUserId,
      parseInt(requestId),
      status
    );
    
    return successResponse(res, result, result.message);
  } catch (error) {
    console.error('Update request status error:', error);
    const statusCode = error.message === 'Operator profile not found' ||
                       error.message === 'Request not found or not assigned to you' ? 404 :
                       error.message.includes('Invalid status transition') ? 400 : 500;
    return errorResponse(res, error.message || 'Failed to update request status', statusCode);
  }
};

// Update Operator Pallet Power Controller (Admin only)
const updateOperatorPalletPower = async (req, res) => {
  try {
    const { operatorId, hasPalletPower } = req.body;
    
    const result = await operatorService.updateOperatorPalletPower(
      parseInt(operatorId),
      hasPalletPower
    );
    
    return successResponse(res, result, 'Operator pallet power updated successfully');
  } catch (error) {
    console.error('Update operator pallet power error:', error);
    const statusCode = error.message === 'Operator not found' ? 404 : 500;
    return errorResponse(res, error.message || 'Failed to update operator pallet power', statusCode);
  }
};

// Get Operator Customers with Cars (Project + Parking System)
const getOperatorCustomersWithCars = async (req, res) => {
  try {
    const operatorUserId = req.user.id; // authenticated operator userId

    const result = await operatorService.getOperatorCustomersWithCars(operatorUserId);

    return successResponse(res, result, 'Customers with cars retrieved successfully');
  } catch (error) {
    console.error('Get operator customers with cars error:', error);
    const statusCode = error.message === 'Operator profile not found' ||
                       error.message === 'Operator is not assigned to any project' ||
                       error.message === 'Operator is not assigned to any parking system' ? 404 : 500;
    return errorResponse(res, error.message || 'Failed to retrieve customers with cars', statusCode);
  }
};

module.exports = {
  createOperator,
  getOperatorProfile,
  getOperatorList,
  getOperatorProjectWithParkingSystems,
  assignPalletToCustomer,
  getOperatorRequests,
  updateRequestStatus,
  updateOperatorPalletPower,
  getOperatorCustomersWithCars
};

