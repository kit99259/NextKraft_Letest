import { UserModel } from '../models/user.model';
import { AdminModel } from '../models/admin.model';
import { OperatorModel } from '../models/operator.model';
import { CustomerModel } from '../models/customer.model';
import { comparePassword, hashPassword } from '../utils/password.util';
import { generateToken } from '../utils/jwt.util';
import { UserRole } from '../constants/roles';
import { LoginInput, SignupInput } from '../validators/auth.validator';
import { supabase } from '../config/supabase';

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

  static async signup(userData: SignupInput): Promise<LoginResult> {
    // Check if username already exists
    const existingUser = await UserModel.findByUsername(userData.username);
    if (existingUser) {
      throw new Error('Username already exists');
    }

    // Hash password
    const password_hash = await hashPassword(userData.password);

    // Create user
    const user = await UserModel.create({
      username: userData.username,
      password_hash,
      role: userData.role,
    });

    // Create role-specific profile
    let profile = null;
    let roleRefId: string | undefined;

    switch (user.role) {
      case UserRole.ADMIN:
        const adminData: any = { user_id: user.id };
        if (userData.full_name) adminData.name = userData.full_name;
        profile = await AdminModel.create(adminData);
        roleRefId = profile.id;
        break;
      case UserRole.OPERATOR:
        const operatorData: any = { user_id: user.id };
        if (userData.full_name) operatorData.name = userData.full_name;
        if (userData.email) operatorData.email = userData.email;
        if (userData.phone) operatorData.phone = userData.phone;
        operatorData.is_active = true;
        profile = await OperatorModel.create(operatorData);
        roleRefId = profile.id;
        break;
      case UserRole.CUSTOMER:
        const customerData: any = { user_id: user.id };
        // Split full_name into name and surname if provided
        if (userData.full_name) {
          const nameParts = userData.full_name.split(' ');
          customerData.name = nameParts[0] || userData.full_name;
          customerData.surname = nameParts.slice(1).join(' ') || undefined;
        }
        if (userData.email) customerData.email = userData.email;
        if (userData.phone) customerData.phone = userData.phone;
        profile = await CustomerModel.create(customerData);
        roleRefId = profile.id;
        break;
    }

    // Update user with role_ref_id
    if (roleRefId) {
      const { error: updateError } = await supabase
        .from('users')
        .update({ role_ref_id: roleRefId })
        .eq('id', user.id);
      
      if (updateError) {
        // Log but don't fail - role_ref_id is optional
        console.warn('Failed to update role_ref_id:', updateError.message);
      }
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

