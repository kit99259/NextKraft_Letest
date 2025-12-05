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

  static async create(operatorData: {
    user_id: string;
    name?: string;
    email?: string;
    phone?: string;
    project_ids?: any;
    has_pallet_power?: boolean;
    is_active?: boolean;
  }): Promise<Operator> {
    // Generate ID if not provided
    const operatorWithId = {
      id: operatorData.user_id, // Use user_id as operator id, or generate UUID
      ...operatorData,
    };
    
    const { data, error } = await supabase
      .from('operators')
      .insert([operatorWithId])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create operator: ${error.message} (${error.code})`);
    }

    if (!data) {
      throw new Error('Failed to create operator: No data returned');
    }

    return data as Operator;
  }
}

