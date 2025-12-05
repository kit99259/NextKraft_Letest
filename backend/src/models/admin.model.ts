import { supabase } from '../config/supabase';
import { Admin } from '../types/global';

export class AdminModel {
  static async findByUserId(userId: string): Promise<Admin | null> {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return null;
    }

    return data as Admin;
  }

  static async findById(id: string): Promise<Admin | null> {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return data as Admin;
  }

  static async create(adminData: {
    user_id: string;
    name?: string;
  }): Promise<Admin> {
    // Generate ID if not provided
    const adminWithId = {
      id: adminData.user_id, // Use user_id as admin id, or generate UUID
      ...adminData,
    };
    
    const { data, error } = await supabase
      .from('admins')
      .insert([adminWithId])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create admin: ${error.message} (${error.code})`);
    }

    if (!data) {
      throw new Error('Failed to create admin: No data returned');
    }

    return data as Admin;
  }
}

