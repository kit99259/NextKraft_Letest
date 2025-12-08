const { User, Customer, ParkingSystem, Project } = require('../models/associations');

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
  // Step 1: Create user first
  // Check if user already exists
  const existingUser = await User.findOne({ where: { Username: customerData.Username } });
  
  if (existingUser) {
    throw new Error('Username already exists');
  }

  // Create new user with customer role
  const user = await User.create({
    Username: customerData.Username,
    Password: customerData.Password,
    Role: 'customer'
  });

  const userId = user.Id;

  // Step 2: Validate parking system exists (if provided)
  let projectId = null;
  if (customerData.ParkingSystemId) {
    const parkingSystem = await ParkingSystem.findByPk(customerData.ParkingSystemId);
    if (!parkingSystem) {
      // Rollback: delete the created user
      await user.destroy();
      throw new Error('Parking system not found');
    }
    projectId = parkingSystem.ProjectId;
  } else if (customerData.ProjectId) {
    // Validate project exists if provided directly
    const project = await Project.findByPk(customerData.ProjectId);
    if (!project) {
      // Rollback: delete the created user
      await user.destroy();
      throw new Error('Project not found');
    }
    projectId = customerData.ProjectId;
  } else {
    // Rollback: delete the created user if no project/parking system provided
    await user.destroy();
    throw new Error('Either parkingSystemId or projectId is required');
  }

  // Step 3: Determine status and approval details based on admin role
  let status = 'Pending';
  let approvedBy = null;
  let approvedAt = null;

  // Step 4: Get IST time for CreatedAt and UpdatedAt
  const istTime = getISTTime();

  // Step 5: Create customer record
  const customer = await Customer.create({
    UserId: userId,
    FirstName: customerData.FirstName,
    LastName: customerData.LastName,
    Email: customerData.Email,
    MobileNumber: customerData.MobileNumber,
    ParkingSystemId: customerData.ParkingSystemId,
    ProjectId: projectId,
    FlatNumber: customerData.FlatNumber,
    Profession: customerData.Profession,
    Status: status,
    ApprovedBy: approvedBy,
    ApprovedAt: approvedAt,
    CreatedAt: istTime,
    UpdatedAt: istTime
  });

  return {
    user: {
      id: user.Id,
      username: user.Username,
      role: user.Role,
      createdAt: user.CreatedAt,
      updatedAt: user.UpdatedAt
    },
    customer: {
      id: customer.Id,
      userId: customer.UserId,
      firstName: customer.FirstName,
      lastName: customer.LastName,
      email: customer.Email,
      mobileNumber: customer.MobileNumber,
      projectId: customer.ProjectId,
      parkingSystemId: customer.ParkingSystemId,
      flatNumber: customer.FlatNumber,
      profession: customer.Profession,
      status: customer.Status,
      approvedBy: customer.ApprovedBy,
      approvedAt: customer.ApprovedAt,
      createdAt: customer.CreatedAt,
      updatedAt: customer.UpdatedAt
    }
  };
};

module.exports = {
  createCustomer
};

