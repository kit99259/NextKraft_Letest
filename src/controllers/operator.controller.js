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
    const { palletId, parkingRequestId } = req.body;
    const operatorUserId = req.user.id; // Get operator userId from authenticated session
    
    const result = await operatorService.assignPalletToCustomer(
      operatorUserId,
      parseInt(palletId),
      parseInt(parkingRequestId)
    );
    
    return successResponse(res, result, 'Pallet assigned to customer successfully');
  } catch (error) {
    console.error('Assign pallet error:', error);
    const statusCode = error.message === 'Operator profile not found' ||
                       error.message === 'Pallet not found' ||
                       error.message === 'Parking request not found or does not belong to your parking system' ||
                       error.message === 'Customer not found for this parking request' ||
                       error.message === 'Car not found in parking request' ? 404 :
                       error.message === 'Operator is not assigned to a project and parking system' ||
                       error.message === 'Pallet is already assigned to another customer' ||
                       error.message === 'Car is already assigned to another pallet' ||
                       error.message === 'Customer is not approved. Only approved customers can be assigned to pallets' ||
                       error.message === 'Pallet does not belong to your parking system' ||
                       error.message === 'Operator does not have access to this project' ||
                       error.message.includes('Cannot assign pallet to a parking request with status') ? 400 : 500;
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

// Approve Customer (Operator)
const approveCustomer = async (req, res) => {
  try {
    const operatorUserId = req.user.id; // authenticated operator userId
    const { customerId } = req.body;

    const result = await operatorService.approveCustomer(
      operatorUserId,
      parseInt(customerId)
    );

    return successResponse(res, result, 'Customer approved successfully');
  } catch (error) {
    console.error('Approve customer error:', error);
    const statusCode = error.message === 'Operator profile not found' ||
                       error.message === 'Customer not found' ? 404 :
                       error.message === 'Customer does not belong to the same project as the operator' ? 400 : 500;
    return errorResponse(res, error.message || 'Failed to approve customer', statusCode);
  }
};

// Call Empty Pallet Controller
const callEmptyPallet = async (req, res) => {
  try {
    const operatorUserId = req.user.id; // Get operator userId from authenticated session
    const { customerId } = req.body; // Optional for Puzzle, required for Tower
    
    const result = await operatorService.callEmptyPallet(operatorUserId, customerId || null);
    
    return successResponse(res, result, 'Empty pallet called successfully');
  } catch (error) {
    console.error('Call empty pallet error:', error);
    const statusCode = error.message === 'Operator profile not found' ? 404 :
                       error.message === 'Operator is not assigned to a parking system' ? 400 :
                       error.message === 'Customer ID is required for Puzzle parking system' ? 400 :
                       error.message === 'Customer not found or does not belong to this parking system' ? 404 :
                       error.message === 'Customer does not have an assigned pallet' ? 404 :
                       error.message === 'No empty pallet available in Tower parking system' ? 404 :
                       error.message === 'Pallet location information is invalid' ? 400 :
                       error.message === 'Invalid parking system type' ? 400 : 500;
    return errorResponse(res, error.message || 'Failed to call empty pallet', statusCode);
  }
};

// Update Parking System Status Controller
const updateParkingSystemStatus = async (req, res) => {
  try {
    const operatorUserId = req.user.id; // Get operator userId from authenticated session
    const { status } = req.body;
    
    const result = await operatorService.updateParkingSystemStatus(operatorUserId, status);
    
    return successResponse(res, result, 'Parking system status updated successfully');
  } catch (error) {
    console.error('Update parking system status error:', error);
    const statusCode = error.message === 'Operator profile not found' ? 404 :
                       error.message === 'Operator is not assigned to a parking system' ? 400 :
                       error.message.includes('Invalid status') ? 400 : 500;
    return errorResponse(res, error.message || 'Failed to update parking system status', statusCode);
  }
};

// Release Parked Car Controller
const releaseParkedCar = async (req, res) => {
  try {
    const operatorUserId = req.user.id; // Get operator userId from authenticated session
    const { palletId } = req.body;
    
    const result = await operatorService.releaseParkedCar(operatorUserId, parseInt(palletId));
    
    return successResponse(res, result, 'Car released successfully');
  } catch (error) {
    console.error('Release parked car error:', error);
    const statusCode = error.message === 'Operator profile not found' ? 404 :
                       error.message === 'Operator is not assigned to a project and parking system' ? 400 :
                       error.message === 'Pallet not found' ? 404 :
                       error.message === 'Pallet does not belong to your parking system' ? 400 :
                       error.message === 'Pallet is not assigned to any customer or car' ? 400 :
                       error.message === 'No active request found for this pallet' ? 404 : 500;
    return errorResponse(res, error.message || 'Failed to release parked car', statusCode);
  }
};

// Call Specific Pallet Controller
const callSpecificPallet = async (req, res) => {
  try {
    const operatorUserId = req.user.id; // Get operator userId from authenticated session
    const { palletId, requestId } = req.body;
    
    const result = await operatorService.callSpecificPallet(
      operatorUserId,
      parseInt(palletId),
      parseInt(requestId)
    );
    
    return successResponse(res, result, 'Specific pallet called and request accepted successfully');
  } catch (error) {
    console.error('Call specific pallet error:', error);
    const statusCode = error.message === 'Operator profile not found' ? 404 :
                       error.message === 'Operator is not assigned to a parking system' ? 400 :
                       error.message === 'Operator is not assigned to a project' ? 400 :
                       error.message === 'Request not found or does not match the pallet' ? 404 :
                       error.message === 'Pallet not found' ? 404 :
                       error.message === 'Pallet does not belong to your parking system' ? 400 :
                       error.message === 'Pallet location information is invalid' ? 400 :
                       error.message === 'Invalid parking system type' ? 400 :
                       error.message.includes('Cannot accept request with status') ? 400 : 500;
    return errorResponse(res, error.message || 'Failed to call specific pallet', statusCode);
  }
};

// Call Pallet and Create Request Controller
const callPalletAndCreateRequest = async (req, res) => {
  try {
    const operatorUserId = req.user.id; // Get operator userId from authenticated session
    const { palletId } = req.body;
    
    const result = await operatorService.callPalletAndCreateRequest(operatorUserId, parseInt(palletId));
    
    return successResponse(res, result, 'Pallet called and request created successfully');
  } catch (error) {
    console.error('Call pallet and create request error:', error);
    const statusCode = error.message === 'Operator profile not found' ? 404 :
                       error.message === 'Operator is not assigned to a parking system' ? 400 :
                       error.message === 'Operator is not assigned to a project' ? 400 :
                       error.message === 'Pallet not found' ? 404 :
                       error.message === 'Pallet does not belong to your parking system' ? 400 :
                       error.message === 'Pallet is not assigned to any customer or car' ? 400 :
                       error.message === 'Customer not found for this pallet' ? 404 :
                       error.message === 'Pallet location information is invalid' ? 400 :
                       error.message === 'Invalid parking system type' ? 400 :
                       error.message.includes('A request already exists for this pallet') ? 400 : 500;
    return errorResponse(res, error.message || 'Failed to call pallet and create request', statusCode);
  }
};

// Call Pallet by Car Number Controller
const callPalletByCarNumber = async (req, res) => {
  try {
    const operatorUserId = req.user.id; // Get operator userId from authenticated session
    const { carNumberLast6 } = req.body;
    
    const result = await operatorService.callPalletByCarNumber(operatorUserId, carNumberLast6);
    
    return successResponse(res, result, 'Pallet called and request created successfully by car number');
  } catch (error) {
    console.error('Call pallet by car number error:', error);
    const statusCode = error.message === 'Operator profile not found' ? 404 :
                       error.message === 'Operator is not assigned to a parking system' ? 400 :
                       error.message === 'Operator is not assigned to a project' ? 400 :
                       error.message.includes('No car found with last 6 digits') ? 404 :
                       error.message.includes('is not parked in your parking system') ? 404 :
                       error.message === 'Customer not found for this car' ? 404 :
                       error.message === 'Pallet location information is invalid' ? 400 :
                       error.message === 'Invalid parking system type' ? 400 :
                       error.message.includes('A request already exists for this car') ? 400 : 500;
    return errorResponse(res, error.message || 'Failed to call pallet by car number', statusCode);
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
  getOperatorCustomersWithCars,
  approveCustomer,
  callEmptyPallet,
  updateParkingSystemStatus,
  releaseParkedCar,
  callSpecificPallet,
  callPalletAndCreateRequest,
  callPalletByCarNumber
};

