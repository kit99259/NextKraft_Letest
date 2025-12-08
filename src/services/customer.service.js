const { Customer, ParkingSystem } = require('../models/associations');

// Helper function to get IST time
const getISTTime = () => {
  const now = new Date();
  // IST is UTC+5:30
  // Get UTC time in milliseconds
  const utcTime = now.getTime();
  // IST offset is +5:30 (5 hours 30 minutes = 19800000 milliseconds)
  const istOffset = 5.5 * 60 * 60 * 1000;
  // Create IST time
  const istTime = new Date(utcTime + istOffset);
  return istTime;
};

// Create Customer Service
const createCustomer = async (customerData) => {
  let projectId = null;
  
  // Get projectId from parkingSystemId if provided
  if (customerData.ParkingSystemId) {
    const parkingSystem = await ParkingSystem.findByPk(customerData.ParkingSystemId);
    
    if (!parkingSystem) {
      throw new Error('Parking system not found');
    }
    
    projectId = parkingSystem.ProjectId;
  }
  
  // Check if customer already exists for this user
  const existingCustomer = await Customer.findOne({ 
    where: { UserId: customerData.UserId } 
  });
  
  if (existingCustomer) {
    throw new Error('Customer already exists for this user');
  }
  
  // Get IST time
  const istTime = getISTTime();
  
  // Create new customer
  const customer = await Customer.create({
    FirstName: customerData.FirstName,
    LastName: customerData.LastName,
    Email: customerData.Email,
    MobileNumber: customerData.MobileNumber,
    ParkingSystemId: customerData.ParkingSystemId,
    ProjectId: projectId,
    FlatNumber: customerData.FlatNumber,
    Profession: customerData.Profession,
    UserId: customerData.UserId,
    CreatedAt: istTime,
    UpdatedAt: istTime
  });

  return {
    id: customer.Id,
    firstName: customer.FirstName,
    lastName: customer.LastName,
    email: customer.Email,
    mobileNumber: customer.MobileNumber,
    parkingSystemId: customer.ParkingSystemId,
    projectId: customer.ProjectId,
    flatNumber: customer.FlatNumber,
    profession: customer.Profession,
    status: customer.Status,
    createdAt: customer.CreatedAt,
    updatedAt: customer.UpdatedAt
  };
};

module.exports = {
  createCustomer
};

