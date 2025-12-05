import { z } from 'zod';
import { UserRole } from '../constants/roles';

export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.nativeEnum(UserRole, {
    errorMap: () => ({ message: 'Role must be ADMIN, OPERATOR, or CUSTOMER' }),
  }),
  // Optional profile fields
  full_name: z.string().optional(),
  email: z.string().email('Invalid email format').optional(),
  phone: z.string().optional(),
});

export type SignupInput = z.infer<typeof signupSchema>;

