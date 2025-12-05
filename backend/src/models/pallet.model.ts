import { supabase } from '../config/supabase';
import { Pallet } from '../types/global';

export class PalletModel {
  static async findById(id: string): Promise<Pallet | null> {
    const { data, error } = await supabase
      .from('pallets')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return data as Pallet;
  }

  static async findByProjectId(projectId: string): Promise<Pallet[]> {
    const { data, error } = await supabase
      .from('pallets')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data as Pallet[];
  }
}

