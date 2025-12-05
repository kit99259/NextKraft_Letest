import { supabase } from '../config/supabase';
import { Request } from '../types/global';

export class RequestModel {
  static async findById(id: string): Promise<Request | null> {
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return data as Request;
  }

  static async findByCustomerId(customerId: string): Promise<Request[]> {
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data as Request[];
  }
}

