import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { loginSchema, signupSchema } from '../validators/auth.validator';
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

  static async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate input
      const validatedData = signupSchema.parse(req.body);

      // Call service
      const result = await AuthService.signup(validatedData);

      // Send response
      sendSuccess(res, result, 'Signup successful', 201);
    } catch (error) {
      next(error);
    }
  }
}

