import { Request, Response, NextFunction } from 'express';
import { CustomerService } from '../services/customer.service';
import { sendSuccess } from '../utils/response.util';

export class CustomerController {
  static async getDashboard(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const data = await CustomerService.getDashboardData();
      sendSuccess(res, { message: 'Customer dashboard OK', ...data });
    } catch (error) {
      next(error);
    }
  }
}

