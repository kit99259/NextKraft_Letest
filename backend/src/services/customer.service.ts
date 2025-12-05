// Customer business logic services
// This service layer contains business logic that doesn't interact with req/res

export class CustomerService {
  static async getDashboardData() {
    // Placeholder for customer dashboard business logic
    return {
      message: 'Customer dashboard data',
      stats: {
        myCars: 0,
        myRequests: 0,
      },
    };
  }
}

