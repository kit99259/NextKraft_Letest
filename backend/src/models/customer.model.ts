import { supabase } from '../config/supabase';
import { Customer } from '../types/global';

export class CustomerModel {
  static async findByUserId(userId: string): Promise<Customer | null> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return null;
    }

    return data as Customer;
  }

  static async findById(id: string): Promise<Customer | null> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return data as Customer;
  }

  static async create(customerData: {
    user_id: string;
    project_id?: string;
    name?: string;
    surname?: string;
    email?: string;
    phone?: string;
    society_name?: string;
    wing_name?: string;
    flat_number?: string;
    profession?: string;
    comments?: string;
    status?: string;
  }): Promise<Customer> {
    // Generate ID - use a combination or UUID
    // For now, we'll use a simple approach - in production you might want UUID
    const customerWithId = {
      id: `cust_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...customerData,
    };
    
    const { data, error } = await supabase
      .from('customers')
      .insert([customerWithId])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create customer: ${error.message} (${error.code})`);
    }

    if (!data) {
      throw new Error('Failed to create customer: No data returned');
    }

    return data as Customer;
  }
}

