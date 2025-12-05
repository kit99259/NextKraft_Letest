import { Request, Response, NextFunction } from 'express';
import { OperatorService } from '../services/operator.service';
import { sendSuccess } from '../utils/response.util';

export class OperatorController {
  static async getDashboard(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const data = await OperatorService.getDashboardData();
      sendSuccess(res, { message: 'Operator dashboard OK', ...data });
    } catch (error) {
      next(error);
    }
  }
}

