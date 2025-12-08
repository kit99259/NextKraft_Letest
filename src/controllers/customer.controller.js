const customerService = require('../services/customer.service');
const { successResponse, errorResponse } = require('../utils');

// Create Customer Controller
const createCustomer = async (req, res) => {
  try {
    const { firstName, lastName, email, mobileNumber, parkingSystemId, flatNumber, profession } = req.body;
    const userId = req.user.id; // Get userId from session
    
    const result = await customerService.createCustomer({
      FirstName: firstName,
      LastName: lastName,
      Email: email,
      MobileNumber: mobileNumber,
      ParkingSystemId: parkingSystemId,
      FlatNumber: flatNumber,
      Profession: profession,
      UserId: userId
    });
    
    return successResponse(res, result, 'Customer created successfully', 201);
  } catch (error) {
    console.error('Create customer error:', error);
    const statusCode = error.message === 'Parking system not found' ? 404 : 
                       error.message === 'Customer already exists for this user' ? 400 : 500;
    return errorResponse(res, error.message || 'Failed to create customer', statusCode);
  }
};

module.exports = {
  createCustomer
};

