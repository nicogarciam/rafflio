import { supabase } from '../lib/supabase';
import { Account } from '../types';

export const accountService = {
  mockAccounts: [] as Account[],

  async getAccounts(): Promise<Account[]> {
    if (!supabase) {
      return this.mockAccounts;
    }
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching accounts:', error);
      return [];
    }
    return (data || []).map(this.transformAccountData);
  },

  async createAccount(account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>): Promise<Account | null> {
    if (!supabase) {
      return null;
    }
    const { data, error } = await supabase
      .from('accounts')
      .insert(account)
      .select()
      .single();
    if (error) {
      console.error('Error creating account:', error);
      return null;
    }
    return data ? this.transformAccountData(data) : null;
  },

  transformAccountData(raw: any): Account {
    return {
      id: raw.id,
      cbu: raw.cbu,
      alias: raw.alias,
      titular: raw.titular,
      banco: raw.banco,
      email: raw.email,
      whatsapp: raw.whatsapp,
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
    };
  },
};
