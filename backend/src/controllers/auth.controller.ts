import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { loginSchema } from '../validators/auth.validator';
import { sendSuccess, sendError } from '../utils/response.util';

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate input
      const validatedData = loginSchema.parse(req.body);

      // Call service
      const result = await AuthService.login(validatedData);

      // Send response
      sendSuccess(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  }
}

