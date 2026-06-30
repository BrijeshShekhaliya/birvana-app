import { supabase } from '@/services/supabase/client';
import type { ProfileRow } from '@/types/supabase';

export const profileRepository = {
  async getById(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      throw error;
    }

    return data as ProfileRow;
  },
};
