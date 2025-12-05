// Customer business logic services
// This service layer contains business logic that doesn't interact with req/res

export class CustomerService {
  static async getDashboardData() {
    // Placeholder for customer dashboard business logic
    return {
      stats: {
        myCars: 0,
        myRequests: 0,
      },
    };
  }
}

