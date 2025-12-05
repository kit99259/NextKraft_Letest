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
}

