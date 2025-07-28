import { createClient } from '@supabase/supabase-js';
import { config } from './config';

// Solo crear el cliente si las variables están configuradas
let supabase: ReturnType<typeof createClient> | null = null;

if (config.isConfigured()) {
  supabase = createClient(config.supabase.url!, config.supabase.anonKey!);
} else if (config.isDevelopment) {
  console.log('🔧 Supabase no configurado - Usando modo desarrollo');
}

export { supabase };

// Tipos de base de datos basados en el esquema SQL
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          password_hash: string;
          name: string;
          role: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          password_hash: string;
          name: string;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          password_hash?: string;
          name?: string;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      raffles: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          draw_date: string;
          max_tickets: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          draw_date: string;
          max_tickets?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          draw_date?: string;
          max_tickets?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      prizes: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          raffle_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          raffle_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          raffle_id?: string;
          created_at?: string;
        };
      };
      price_tiers: {
        Row: {
          id: string;
          amount: number;
          ticket_count: number;
          raffle_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          amount: number;
          ticket_count: number;
          raffle_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          amount?: number;
          ticket_count?: number;
          raffle_id?: string;
          created_at?: string;
        };
      };
      tickets: {
        Row: {
          id: string;
          number: number;
          status: string;
          raffle_id: string;
          purchase_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          number: number;
          status?: string;
          raffle_id: string;
          purchase_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          number?: number;
          status?: string;
          raffle_id?: string;
          purchase_id?: string | null;
          created_at?: string;
        };
      };
      purchases: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          phone: string;
          payment_id: string | null;
          status: string;
          raffle_id: string;
          price_tier_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          email: string;
          phone: string;
          payment_id?: string | null;
          status?: string;
          raffle_id: string;
          price_tier_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          phone?: string;
          payment_id?: string | null;
          status?: string;
          raffle_id?: string;
          price_tier_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
} 