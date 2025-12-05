import { UserModel } from '../models/user.model';
import { AdminModel } from '../models/admin.model';
import { OperatorModel } from '../models/operator.model';
import { CustomerModel } from '../models/customer.model';
import { comparePassword } from '../utils/password.util';
import { generateToken } from '../utils/jwt.util';
import { UserRole } from '../constants/roles';
import { LoginInput } from '../validators/auth.validator';

export interface LoginResult {
  token: string;
  role: UserRole;
  user: {
    id: string;
    username: string;
    role: UserRole;
    profile?: any;
  };
}

export class AuthService {
  static async login(credentials: LoginInput): Promise<LoginResult> {
    // Find user by username
    const user = await UserModel.findByUsername(credentials.username);

    if (!user) {
      throw new Error('Invalid username or password');
    }

    // Compare password
    const isPasswordValid = await comparePassword(
      credentials.password,
      user.password_hash
    );

    if (!isPasswordValid) {
      throw new Error('Invalid username or password');
    }

    // Fetch role-specific profile
    let profile = null;
    switch (user.role) {
      case UserRole.ADMIN:
        profile = await AdminModel.findByUserId(user.id);
        break;
      case UserRole.OPERATOR:
        profile = await OperatorModel.findByUserId(user.id);
        break;
      case UserRole.CUSTOMER:
        profile = await CustomerModel.findByUserId(user.id);
        break;
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      role: user.role,
      username: user.username,
    });

    return {
      token,
      role: user.role,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        profile,
      },
    };
  }
}

