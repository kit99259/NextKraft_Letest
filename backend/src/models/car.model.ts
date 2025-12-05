import { supabase } from '../config/supabase';
import { Car } from '../types/global';

export class CarModel {
  static async findById(id: string): Promise<Car | null> {
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return data as Car;
  }

  static async findByCustomerId(customerId: string): Promise<Car[]> {
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data as Car[];
  }
}

