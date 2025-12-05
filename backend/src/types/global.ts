import { UserRole } from '../constants/roles';

export interface User {
  id: string;
  username: string;
  password_hash: string;
  role: UserRole;
  role_ref_id?: string;
  created_at: string;
  last_login?: string;
}

export interface Admin {
  id: string;
  user_id: string;
  name?: string;
  created_at: string;
}

export interface Operator {
  id: string;
  user_id: string;
  name?: string;
  email?: string;
  phone?: string;
  project_ids?: any;
  has_pallet_power?: boolean;
  is_active?: boolean;
  created_at: string;
}

export interface Customer {
  id: string;
  user_id: string;
  project_id?: string;
  name?: string;
  surname?: string;
  phone?: string;
  email?: string;
  society_name?: string;
  wing_name?: string;
  flat_number?: string;
  profession?: string;
  comments?: string;
  status?: string;
  submitted_at?: string;
  approved_at?: string;
  approved_by?: string;
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

