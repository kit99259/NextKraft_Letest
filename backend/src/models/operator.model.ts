import { supabase } from '../config/supabase';
import { Operator } from '../types/global';

export class OperatorModel {
  static async findByUserId(userId: string): Promise<Operator | null> {
    const { data, error } = await supabase
      .from('operators')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return null;
    }

    return data as Operator;
  }

  static async findById(id: string): Promise<Operator | null> {
    const { data, error } = await supabase
      .from('operators')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return data as Operator;
  }
}

