import { supabase } from '../config/supabase';
import { User } from '../types/global';

export class UserModel {
  static async findByUsername(username: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !data) {
      return null;
    }

    return data as User;
  }

  static async findById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return data as User;
  }

  static async create(userData: {
    username: string;
    password_hash: string;
    role: string;
  }): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error || !data) {
      return null;
    }

    return data as User;
  }
}

