const customerService = require('../services/customer.service');
const { successResponse, errorResponse } = require('../utils');

// Create Customer Controller (No authentication required)
const createCustomer = async (req, res) => {
  try {
    const { username, password, firstName, lastName, email, mobileNumber, projectId, parkingSystemId, flatNumber, profession } = req.body;
    
    // No admin authentication - customer creates their own account
    // Status will be set to 'Pending' and requires admin approval
    const result = await customerService.createCustomer({
      Username: username,
      Password: password,
      FirstName: firstName,
      LastName: lastName,
      Email: email,
      MobileNumber: mobileNumber,
      ProjectId: projectId,
      ParkingSystemId: parkingSystemId,
      FlatNumber: flatNumber,
      Profession: profession
    });
    
    return successResponse(res, result, 'Customer created successfully. Account is pending admin approval.', 201);
  } catch (error) {
    console.error('Create customer error:', error);
    const statusCode = error.message === 'Username already exists' ? 400 : 
                       error.message === 'Project not found' ? 404 :
                       error.message === 'Parking system not found' ? 404 :
                       error.message.includes('required') ? 400 : 500;
    return errorResponse(res, error.message || 'Failed to create customer', statusCode);
  }
};

// Get Customer Profile Controller
const getCustomerProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Get userId from authenticated session
    
    const result = await customerService.getCustomerProfile(userId);
    
    return successResponse(res, result, 'Customer profile retrieved successfully');
  } catch (error) {
    console.error('Get customer profile error:', error);
    const statusCode = error.message === 'Customer profile not found' ? 404 : 500;
    return errorResponse(res, error.message || 'Failed to retrieve customer profile', statusCode);
  }
};

// Create Car Controller
const createCar = async (req, res) => {
  try {
    const { carType, carModel, carCompany, carNumber } = req.body;
    const userId = req.user.id; // Get userId from authenticated session
    
    const result = await customerService.createCar({
      UserId: userId,
      CarType: carType,
      CarModel: carModel,
      CarCompany: carCompany,
      CarNumber: carNumber
    });
    
    return successResponse(res, result, 'Car added successfully', 201);
  } catch (error) {
    console.error('Create car error:', error);
    return errorResponse(res, error.message || 'Failed to add car', 500);
  }
};

// Get Car List Controller
const getCarList = async (req, res) => {
  try {
    const userId = req.user.id; // Get userId from authenticated session
    
    const result = await customerService.getCarList(userId);
    
    return successResponse(res, { cars: result, count: result.length }, 'Car list retrieved successfully');
  } catch (error) {
    console.error('Get car list error:', error);
    return errorResponse(res, error.message || 'Failed to retrieve car list', 500);
  }
};

module.exports = {
  createCustomer,
  getCustomerProfile,
  createCar,
  getCarList
};

