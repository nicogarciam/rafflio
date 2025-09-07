// Genera un mensaje de WhatsApp para compartir una rifa
import { supabase } from '../lib/supabase';
import { Raffle, Purchase, Ticket, Prize, PriceTier } from '../types';

export interface CreatePurchaseData {
  fullName: string;
  email: string;
  phone: string;
  raffleId: string;
  priceTierId: string;
  preferenceId: string;
}

class RaffleService {
  async deleteRaffle(raffleId: string): Promise<boolean> {
    if (!supabase) {
      // Eliminar de mock
      this.mockRaffles = this.mockRaffles.filter(r => r.id !== raffleId);
      return true;
    }
    try {
      // Eliminar compras
      const { error: purchasesError } = await supabase
        .from('purchases')
        .delete()
        .eq('raffle_id', raffleId);
      if (purchasesError) {
        console.error('Error deleting purchases:', purchasesError);
        return false;
      }
      // Eliminar premios
      const { error: prizesError } = await supabase
        .from('prizes')
        .delete()
        .eq('raffle_id', raffleId);
      if (prizesError) {
        console.error('Error deleting prizes:', prizesError);
        return false;
      }
      // Eliminar priceTiers
      const { error: priceTiersError } = await supabase
        .from('price_tiers')
        .delete()
        .eq('raffle_id', raffleId);
      if (priceTiersError) {
        console.error('Error deleting price tiers:', priceTiersError);
        return false;
      }
      // Eliminar tickets
      const { error: ticketsError } = await supabase
        .from('tickets')
        .delete()
        .eq('raffle_id', raffleId);
      if (ticketsError) {
        console.error('Error deleting tickets:', ticketsError);
        return false;
      }
      // Finalmente eliminar la rifa
      const { error: raffleError } = await supabase
        .from('raffles')
        .delete()
        .eq('id', raffleId);
      if (raffleError) {
        console.error('Error deleting raffle:', raffleError);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error in deleteRaffle:', error instanceof Error ? error.message : String(error));
      return false;
    }
  }

  async getRaffles(): Promise<Raffle[]> {
    if (!supabase) {
      return this.mockRaffles;
    }
    try {
      const { data, error } = await supabase
        .from('raffles')
        .select(`*, prizes (*), price_tiers (*), tickets (*), account:account_id (*)`)
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching raffles:', error);
        return [];
      }
      return (data || []).map(this.transformRaffleData);
    } catch (error) {
      console.error('Error in getRaffles:', error instanceof Error ? error.message : String(error));
      return [];
    }
  }

  async getRaffleById(id: string): Promise<Raffle | null> {
    if (!supabase) {
      return this.mockRaffles.find(r => r.id === id) || null;
    }
    try {
      const { data, error } = await supabase
        .from('raffles')
        .select(`*, prizes (*), price_tiers (*), tickets (*), account:account_id (*)`)
        .eq('id', id)
        .single();
      if (error) {
        console.error('Error fetching raffle:', error);
        return null;
      }
      return this.transformRaffleData(data);
    } catch (error) {
      console.error('Error in getRaffleById:', error instanceof Error ? error.message : String(error));
      return null;
    }
  }

  async createRaffle(raffleData: Omit<Raffle, 'id' | 'createdAt' | 'tickets' | 'prizes' | 'priceTiers' | 'soldTickets' | 'totalTickets'> & { prizes: Prize[]; priceTiers: PriceTier[] }): Promise<Raffle | null> {
    if (!supabase) {
      const newRaffle: Raffle = {
        id: `raffle-${Date.now()}`,
        accountId: raffleData.accountId, // or use raffleData.accountId if available
        title: raffleData.title,
        description: raffleData.description,
        drawDate: raffleData.drawDate,
        maxTickets: raffleData.maxTickets,
        totalTickets: raffleData.maxTickets,
        soldTickets: 0,
        isActive: true,
        createdAt: new Date().toISOString(),
        tickets: [],
        prizes: raffleData.prizes,
        priceTiers: raffleData.priceTiers,
      };
      this.mockRaffles.unshift(newRaffle);
      return newRaffle;
    }
    try {
      const { data: raffle, error: raffleError } = await supabase
        .from('raffles')
        .insert({
          title: raffleData.title,
          description: raffleData.description,
          draw_date: raffleData.drawDate,
          max_tickets: raffleData.maxTickets,
          account_id: raffleData.accountId,
          is_active: true,
        })
        .select()
        .single();
      if (raffleError) {
        console.error('Error creating raffle:', raffleError);
        return null;
      }
      // Crear premios
      if (raffleData.prizes.length > 0) {
        const prizesData = raffleData.prizes.map(prize => ({
          name: prize.name,
          description: prize.description,
          raffle_id: raffle.id,
        }));
        const { error: prizesError } = await supabase
          .from('prizes')
          .insert(prizesData);
        if (prizesError) {
          console.error('Error creating prizes:', prizesError);
        }
      }
      // Crear niveles de precio
      if (raffleData.priceTiers.length > 0) {
        const priceTiersData = raffleData.priceTiers.map(tier => ({
          amount: tier.amount,
          ticket_count: tier.ticketCount,
          raffle_id: raffle.id,
        }));
        const { error: priceTiersError } = await supabase
          .from('price_tiers')
          .insert(priceTiersData);
        if (priceTiersError) {
          console.error('Error creating price tiers:', priceTiersError);
        }
      }
      // Crear tickets solo si no existen para esta rifa
      const { data: existingTickets, error: ticketsQueryError } = await supabase
        .from('tickets')
        .select('id')
        .eq('raffle_id', raffle.id as string); // Explicitly cast raffle.id to string to resolve potential 'unknown' type issue
      if (ticketsQueryError) {
        console.error('Error checking existing tickets:', ticketsQueryError);
      }
      if (!existingTickets || existingTickets.length === 0) {
        const ticketsData = Array.from({ length: raffleData.maxTickets }, (_, i) => ({
          number: i,
          status: 'available',
          raffle_id: raffle.id,
        }));
        const { error: ticketsError } = await supabase
          .from('tickets')
          .insert(ticketsData);
        if (ticketsError) {
          console.error('Error creating tickets:', ticketsError);
        }
      } else {
        console.warn('Tickets ya existen para esta rifa, no se crearán duplicados.');
      }
      return await this.getRaffleById(raffle.id as string);
    } catch (error) {
      console.error('Error in createRaffle:', error instanceof Error ? error.message : String(error));
      return null;
    }
  }


  async updateRaffle(id: string, updates: Partial<Omit<Raffle, 'id' | 'createdAt' | 'tickets' | 'soldTickets' | 'totalTickets'>>): Promise<Raffle | null> {
    if (!supabase) {
      // Solo para mock/dev
      const idx = this.mockRaffles.findIndex(r => r.id === id);
      if (idx === -1) return null;
      this.mockRaffles[idx] = { ...this.mockRaffles[idx], ...updates };
      return this.mockRaffles[idx];
    }
    try {
      console.log('Updating raffle:', id, updates);
      // 1. Actualizar rifa base
      const { data, error } = await supabase
        .from('raffles')
        .update({
          title: updates.title,
          description: updates.description,
          draw_date: updates.drawDate,
          max_tickets: updates.maxTickets,
          is_active: updates.isActive,
          account_id: updates.accountId,
        })
        .eq('id', id)
        .select()
        .single();
      if (error) {
        console.error('Error updating raffle:', error);
        return null;
      }

      // 2. Actualizar premios (prizes)
      if (updates.prizes) {
        // Eliminar premios existentes
        const { error: delPrizesError } = await supabase
          .from('prizes')
          .delete()
          .eq('raffle_id', id);
        if (delPrizesError) {
          console.error('Error deleting old prizes:', delPrizesError);
        }
        // Insertar nuevos premios
        if (updates.prizes.length > 0) {
          const prizesData = updates.prizes.map(prize => ({
            name: prize.name,
            description: prize.description,
            raffle_id: id,
          }));
          const { error: insPrizesError } = await supabase
            .from('prizes')
            .insert(prizesData);
          if (insPrizesError) {
            console.error('Error inserting new prizes:', insPrizesError);
          }
        }
      }

      // 3. Actualizar priceTiers
      if (updates.priceTiers) {
        // Eliminar todos los priceTiers existentes (aunque estén en uso)
        const { error: delTiersError } = await supabase
          .from('price_tiers')
          .delete()
          .eq('raffle_id', id);
        if (delTiersError) {
          console.error('Error deleting all priceTiers:', delTiersError);
        }
        // Insertar todos los nuevos priceTiers
        if (updates.priceTiers.length > 0) {
          const priceTiersData = updates.priceTiers.map(tier => ({
            amount: tier.amount,
            ticket_count: tier.ticketCount,
            raffle_id: id,
          }));
          const { error: insTiersError } = await supabase
            .from('price_tiers')
            .insert(priceTiersData);
          if (insTiersError) {
            console.error('Error inserting new priceTiers:', insTiersError);
          }
        }
      }

      // 4. Retornar rifa actualizada
      return await this.getRaffleById(id);
    } catch (error) {
      console.error('Error in updateRaffle:', error instanceof Error ? error.message : String(error));
      return null;
    }
  }

  private transformRaffleData = (data: any): Raffle => {
    return {
      id: data.id,
      accountId: data.account_id,
      title: data.title,
      description: data.description,
      drawDate: data.draw_date,
      maxTickets: data.max_tickets,
      totalTickets: data.max_tickets,
      soldTickets: data.tickets?.filter((t: any) => t.status === 'sold').length || 0,
      isActive: data.is_active,
      createdAt: data.created_at,
      tickets: this.transformTicketsData(data.tickets || []),
      prizes: (data.prizes || []).map((prize: any) => ({
        id: prize.id,
        name: prize.name,
        description: prize.description,
        raffleId: prize.raffle_id,
      })),
      priceTiers: (data.price_tiers || []).map((tier: any) => ({
        id: tier.id,
        amount: tier.amount,
        ticketCount: tier.ticket_count,
        raffleId: tier.raffle_id,
      })),
      account: data.account ? {
        id: data.account.id,
        cbu: data.account.cbu,
        alias: data.account.alias,
        titular: data.account.titular,
        banco: data.account.banco,
        email: data.account.email,
        whatsapp: data.account.whatsapp,
        createdAt: data.account.created_at,
        updatedAt: data.account.updated_at,
      } : undefined,
    };
  }
  // Datos de ejemplo para desarrollo
  private mockRaffles: Raffle[] = [
    {
      id: '1',
      accountId: 'mock-account', // Added accountId property
      title: 'Rifa de Prueba',
      description: 'Una rifa de ejemplo para desarrollo',
      drawDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      maxTickets: 100,
      totalTickets: 100,
      soldTickets: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      tickets: Array.from({ length: 100 }, (_, i) => ({
        id: `ticket-${i + 1}`,
        number: i + 1,
        status: 'available' as const,
        raffleId: '1',
        purchaseId: undefined,
      })),
      prizes: [],
      priceTiers: [],
    }
  ];

  async getAvailableTickets(raffleId: string): Promise<Ticket[]> {
    if (!supabase) {
      const raffle = this.mockRaffles.find(r => r.id === raffleId);
      return raffle?.tickets.filter(t => t.status === 'available') || [];
    }

    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('raffle_id', raffleId)
        .eq('status', 'available')
        .order('number');

      if (error) {
        console.error('Error fetching available tickets:', error);
        return [];
      }

      return this.transformTicketsData(data || []);
    } catch (error) {
      console.error('Error in getAvailableTickets:', error instanceof Error ? error.message : String(error));
      return [];
    }
  }

  private transformTicketsData = (data: any[]): Ticket[] => {
    return data.map(ticket => ({
      id: ticket.id,
      number: ticket.number,
      status: ticket.status,
      raffleId: ticket.raffle_id,
      purchaseId: ticket.purchase_id,
    }));
  }

}

export const raffleService = new RaffleService();