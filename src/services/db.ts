
import { supabase } from '../lib/supabase';
import { MOCK_CLIENTS, MOCK_POLICIES } from '../constants';
import { Client, Policy } from '../types';

const USE_MOCK = (import.meta as any).env.VITE_USE_MOCK_DATA !== 'false';

export const db = {
  clients: {
    getAll: async (advisorId?: string): Promise<Client[]> => {
      if (USE_MOCK) {
        if (advisorId) return MOCK_CLIENTS.filter(c => c.advisorId === advisorId);
        return MOCK_CLIENTS;
      }
      
      let query = supabase.from('clients').select('*');
      if (advisorId) query = query.eq('advisor_id', advisorId);
      
      const { data, error } = await query;
      if (error) throw error;
      return data as any; // Map DB snake_case to Client interface if needed
    },
    
    getById: async (id: string): Promise<Client | undefined> => {
      if (USE_MOCK) return MOCK_CLIENTS.find(c => c.id === id);
      
      const { data, error } = await supabase.from('clients').select('*').eq('id', id).single();
      if (error) return undefined;
      return data as any;
    }
  },
  
  policies: {
    getAll: async (clientId?: string): Promise<Policy[]> => {
      if (USE_MOCK) {
        if (clientId) return MOCK_POLICIES.filter(p => p.clientId === clientId);
        return MOCK_POLICIES;
      }

      let query = supabase.from('policies').select('*');
      if (clientId) query = query.eq('client_id', clientId);
      
      const { data, error } = await query;
      if (error) throw error;
      return data as any;
    }
  }
};
