import { supabase } from '../lib/supabase';
import { Raffle, Purchase, Ticket, Prize, PriceTier } from '../types';

export interface CreateRaffleData {
  title: string;
  description: string;
  drawDate: string;
  maxTickets: number;
  prizes: Prize[];
  priceTiers: PriceTier[];
}

export interface CreatePurchaseData {
  fullName: string;
  email: string;
  phone: string;
  raffleId: string;
  priceTierId: string;
  preferenceId: string;
}

class RaffleService {
  // Datos de ejemplo para desarrollo
  private mockRaffles: Raffle[] = [
    {
      id: '1',
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
      prizes: [
        {
          id: 'prize-1',
          name: 'Premio Principal',
          description: 'Un premio increíble',
          raffleId: '1',
        }
      ],
      priceTiers: [
        {
          id: 'tier-1',
          amount: 1000,
          ticketCount: 1,
          raffleId: '1',
        }
      ]
    }
  ];

  private mockPurchases: Purchase[] = [];

  async getRaffles(): Promise<Raffle[]> {
    if (!supabase) {
      console.log('🔧 Usando datos de ejemplo para desarrollo');
      return this.mockRaffles;
    }

    try {
      const { data, error } = await supabase
        .from('raffles')
        .select(`
          *,
          prizes (*),
          price_tiers (*),
          tickets (*)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching raffles:', error);
        return [];
      }

      return this.transformRafflesData(data || []);
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
        .select(`
          *,
          prizes (*),
          price_tiers (*),
          tickets (*)
        `)
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

  private async getRaffleWithDetails(raffleId: string): Promise<Raffle | null> {
    if (!supabase) {
      return this.mockRaffles.find(r => r.id === raffleId) || null;
    }

    try {
      const { data, error } = await supabase
        .from('raffles')
        .select(`
          *,
          prizes (*),
          price_tiers (*),
          tickets (*)
        `)
        .eq('id', raffleId)
        .single();

      if (error) {
        console.error('Error fetching raffle with details:', error);
        return null;
      }

      return this.transformRaffleData(data);
    } catch (error) {
      console.error('Error in getRaffleWithDetails:', error instanceof Error ? error.message : String(error));
      return null;
    }
  }

  async createRaffle(raffleData: CreateRaffleData): Promise<Raffle | null> {
    if (!supabase) {
      console.log('🔧 Creando rifa de ejemplo en modo desarrollo');
      const newRaffle: Raffle = {
        id: `raffle-${Date.now()}`,
        title: raffleData.title,
        description: raffleData.description,
        drawDate: raffleData.drawDate,
        maxTickets: raffleData.maxTickets,
        totalTickets: raffleData.maxTickets,
        soldTickets: 0,
        isActive: true,
        createdAt: new Date().toISOString(),
        tickets: Array.from({ length: raffleData.maxTickets }, (_, i) => ({
          id: `ticket-${Date.now()}-${i + 1}`,
          number: i + 1,
          status: 'available' as const,
          raffleId: `raffle-${Date.now()}`,
          purchaseId: undefined,
        })),
        prizes: raffleData.prizes.map(prize => ({
          ...prize,
          id: `prize-${Date.now()}-${Math.random()}`,
          raffleId: `raffle-${Date.now()}`,
        })),
        priceTiers: raffleData.priceTiers.map(tier => ({
          ...tier,
          id: `tier-${Date.now()}-${Math.random()}`,
          raffleId: `raffle-${Date.now()}`,
        }))
      };
      this.mockRaffles.unshift(newRaffle);
      return newRaffle;
    }

    try {
      // Crear la rifa
      const { data: raffle, error: raffleError } = await supabase
        .from('raffles')
        .insert({
          title: raffleData.title,
          description: raffleData.description,
          draw_date: raffleData.drawDate,
          max_tickets: raffleData.maxTickets,
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

      // Crear tickets
      const ticketsData = Array.from({ length: raffleData.maxTickets }, (_, i) => ({
        number: i + 1,
        status: 'available',
        raffle_id: raffle.id,
      }));

      const { error: ticketsError } = await supabase
        .from('tickets')
        .insert(ticketsData);

      if (ticketsError) {
        console.error('Error creating tickets:', ticketsError);
      }

      return await this.getRaffleWithDetails(raffle.id as string);
    } catch (error) {
      console.error('Error in createRaffle:', error instanceof Error ? error.message : String(error));
      return null;
    }
  }

  async updateRaffle(id: string, updates: Partial<Raffle>): Promise<Raffle | null> {
    if (!supabase) {
      const index = this.mockRaffles.findIndex(r => r.id === id);
      if (index !== -1) {
        this.mockRaffles[index] = { ...this.mockRaffles[index], ...updates };
        return this.mockRaffles[index];
      }
      return null;
    }

    try {
      const updateData: Record<string, unknown> = {};
      
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.drawDate !== undefined) updateData.draw_date = updates.drawDate;
      if (updates.maxTickets !== undefined) updateData.max_tickets = updates.maxTickets;
      if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
      
      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('raffles')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating raffle:', error);
        return null;
      }

      return await this.getRaffleWithDetails(id);
    } catch (error) {
      console.error('Error in updateRaffle:', error instanceof Error ? error.message : String(error));
      return null;
    }
  }

  async deleteRaffle(id: string): Promise<boolean> {
    if (!supabase) {
      const index = this.mockRaffles.findIndex(r => r.id === id);
      if (index !== -1) {
        this.mockRaffles.splice(index, 1);
        return true;
      }
      return false;
    }

    try {
      const { error } = await supabase
        .from('raffles')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting raffle:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteRaffle:', error instanceof Error ? error.message : String(error));
      return false;
    }
  }

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

  async createPurchase(purchaseData: CreatePurchaseData): Promise<Purchase | null> {
    if (!supabase) {
      console.log('🔧 Creando compra de ejemplo en modo desarrollo');
      const newPurchase: Purchase = {
        id: `purchase-${Date.now()}`,
        fullName: purchaseData.fullName,
        email: purchaseData.email,
        phone: purchaseData.phone,
        paymentId: '',
        status: 'pending',
        preferenceId: '',
        raffleId: purchaseData.raffleId,
        priceTierId: purchaseData.priceTierId,
        tickets: [],
        createdAt: new Date().toISOString(),
      };
      this.mockPurchases.unshift(newPurchase);
      return newPurchase;
    }

    try {
      const { data, error } = await supabase
        .from('purchases')
        .insert({
          full_name: purchaseData.fullName,
          email: purchaseData.email,
          phone: purchaseData.phone,
          status: 'pending',
          raffle_id: purchaseData.raffleId,
          preference_id: purchaseData.preferenceId, // Inicialmente vacío, se actualizará después
          price_tier_id: purchaseData.priceTierId,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating purchase:', error);
        return null;
      }

      return this.transformPurchaseData(data);
    } catch (error) {
      console.error('Error in createPurchase:', error instanceof Error ? error.message : String(error));
      return null;
    }
  }

  async updatePurchaseStatus(purchaseId: string, status: Purchase['status']): Promise<boolean> {
    if (!supabase) {
      const purchase = this.mockPurchases.find(p => p.id === purchaseId);
      if (purchase) {
        purchase.status = status;
        return true;
      }
      return false;
    }

    try {
      const { error } = await supabase
        .from('purchases')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', purchaseId);

      if (error) {
        console.error('Error updating purchase status:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updatePurchaseStatus:', error instanceof Error ? error.message : String(error));
      return false;
    }
  }

  async updatePurchaseStatusAndPayment(purchaseId: string, status: Purchase['status'], paymentId: string): Promise<boolean> {
    if (!supabase) {
      const purchase = this.mockPurchases.find(p => p.id === purchaseId);
      if (purchase) {
        purchase.status = status;
        purchase.paymentId = paymentId;
        return true;
      }
      return false;
    }

    try {
      const { error } = await supabase
        .from('purchases')
        .update({ 
          status,
          payment_id: paymentId,
          updated_at: new Date().toISOString()
        })
        .eq('id', purchaseId);

      if (error) {
        console.error('Error updating purchase status and payment:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updatePurchaseStatusAndPayment:', error instanceof Error ? error.message : String(error));
      return false;
    }
  }

  async updatePurchasePreferenceId(purchaseId: string, preferenceId: string): Promise<boolean> {
    if (!supabase) {
      const purchase = this.mockPurchases.find(p => p.id === purchaseId);
      if (purchase) {
        purchase.preferenceId = preferenceId;
        return true;
      }
      return false;
    }

    try {
      const { error } = await supabase
        .from('purchases')
        .update({ 
          preference_id: preferenceId,
          updated_at: new Date().toISOString()
        })
        .eq('id', purchaseId);

      if (error) {
        console.error('Error updating purchase preferenceId:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updatePurchasePreferenceId:', error instanceof Error ? error.message : String(error));
      return false;
    }
  }

  async assignTicketsToPurchase(purchaseId: string, ticketIds: string[]): Promise<boolean> {
    if (!supabase) {
      // Simular asignación de tickets en modo desarrollo
      console.log('🔧 Asignando tickets de ejemplo en modo desarrollo');
      return true;
    }

    console.log('🔧 Asignando tickets en modo producción');

    try {
      const { error } = await supabase
        .from('tickets')
        .update({ 
          status: 'sold',
          purchase_id: purchaseId,
        })
        .in('id', ticketIds);

      if (error) {
        console.error('Error assigning tickets:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in assignTicketsToPurchase:', error instanceof Error ? error.message : String(error));
      return false;
    }
  }

  async getPurchases(): Promise<Purchase[]> {
    if (!supabase) {
      return this.mockPurchases;
    }

    try {
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          *,
          tickets (*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching purchases:', error);
        return [];
      }

      return this.transformPurchasesData(data || []);
    } catch (error) {
      console.error('Error in getPurchases:', error instanceof Error ? error.message : String(error));
      return [];
    }
  }

  async getPurchaseById(purchaseId: string): Promise<Purchase | null> {
    if (!supabase) {
      return null;
    }

    try {
      const { data: purchase, error } = await supabase
        .from('purchases')
        .select(`
          *,
          tickets (*),
          price_tiers:price_tier_id (*)
        `)
        .eq('id', purchaseId)
        .single();

      if (error) throw error;
      // price_tiers vendrá como un array con un solo elemento (por ser relación 1:1)
      let priceTierRaw = Array.isArray(purchase.price_tiers) ? purchase.price_tiers[0] : purchase.price_tiers;
      let priceTier = priceTierRaw ? this.transformPriceTiersData([priceTierRaw])[0] : undefined;
      const purchaseWithPriceTier = {
        ...purchase,
        price_tier: priceTier
      };
      return this.transformPurchaseData(purchaseWithPriceTier);
    } catch (error) {
      console.error('Error in getPurchaseById:', error);
      throw error;
    }
  }

  // Métodos de transformación de datos
  private transformRafflesData = (data: any[]): Raffle[] => {
    return data.map(this.transformRaffleData);
  }

  private transformRaffleData = (data: any): Raffle => {
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      drawDate: data.draw_date,
      maxTickets: data.max_tickets,
      totalTickets: data.max_tickets,
      soldTickets: data.tickets?.filter((t: any) => t.status === 'sold').length || 0,
      isActive: data.is_active,
      createdAt: data.created_at,
      tickets: this.transformTicketsData(data.tickets || []),
      prizes: this.transformPrizesData(data.prizes || []),
      priceTiers: this.transformPriceTiersData(data.price_tiers || []),
    };
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

  private transformPrizesData = (data: any[]): Prize[] => {
    return data.map(prize => ({
      id: prize.id,
      name: prize.name,
      description: prize.description,
      raffleId: prize.raffle_id,
    }));
  }

  private transformPriceTiersData = (data: any[]): PriceTier[] => {
    return data.map(tier => ({
      id: tier.id,
      amount: tier.amount,
      ticketCount: tier.ticket_count,
      raffleId: tier.raffle_id,
    }));
  }

  private transformPurchasesData = (data: any[]): Purchase[] => {
    return data.map(this.transformPurchaseData);
  }

  private transformPurchaseData = (data: any): Purchase => {
    return {
      id: data.id,
      fullName: data.full_name,
      email: data.email,
      phone: data.phone,
      paymentId: data.payment_id || '',
      status: data.status,
      preferenceId: data.preference_id || '',
      raffleId: data.raffle_id,
      priceTierId: data.price_tier_id,
      priceTier: data.price_tier || undefined,
      tickets: this.transformTicketsData(data.tickets || []),
      createdAt: data.created_at,
    };
  }
}

export const raffleService = new RaffleService();