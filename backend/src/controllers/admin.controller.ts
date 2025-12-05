import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/admin.service';
import { sendSuccess } from '../utils/response.util';

export class AdminController {
  static async getDashboard(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const data = await AdminService.getDashboardData();
      sendSuccess(res, { message: 'Admin dashboard OK', ...data });
    } catch (error) {
      next(error);
    }
  }
}

