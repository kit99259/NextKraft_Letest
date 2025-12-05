import { UserRole } from '../constants/roles';

export interface User {
  id: string;
  username: string;
  password_hash: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Admin {
  id: string;
  user_id: string;
  full_name?: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

export interface Operator {
  id: string;
  user_id: string;
  full_name?: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  user_id: string;
  full_name?: string;
  email?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  location?: string;
  created_at: string;
  updated_at: string;
}

export interface Pallet {
  id: string;
  project_id: string;
  name: string;
  status?: string;
  created_at: string;
  updated_at: string;
}

export interface Car {
  id: string;
  customer_id: string;
  license_plate: string;
  make?: string;
  model?: string;
  color?: string;
  created_at: string;
  updated_at: string;
}

export interface Request {
  id: string;
  customer_id: string;
  project_id?: string;
  pallet_id?: string;
  car_id?: string;
  status: string;
  request_type?: string;
  created_at: string;
  updated_at: string;
}

