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

module.exports = {
  createCustomer
};

