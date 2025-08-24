import { supabase } from '../lib/supabase';
import { Purchase, Ticket, PriceTier } from '../types';

// CreatePurchaseData es igual a Purchase pero omite los campos generados automáticamente o no requeridos al crear
export type CreatePurchaseData = Omit<
    Purchase,
    'id' | 'paymentId' | 'status' | 'tickets' | 'createdAt' | 'priceTier'
> & {
    preferenceId?: string;
    paymentMethod?: Purchase['paymentMethod'];
};

class PurchaseService {
    private mockPurchases: Purchase[] = [];


    async deletePurchase(purchaseId: string): Promise<boolean> {
        if (!supabase) {
            const idx = this.mockPurchases.findIndex(p => p.id === purchaseId);
            if (idx !== -1) {
                this.mockPurchases.splice(idx, 1);
                return true;
            }
            return false;
        }
        try {
            const { error } = await supabase
                .from('purchases')
                .delete()
                .eq('id', purchaseId);
            if (error) {
                console.error('Error deleting purchase:', error);
                return false;
            }
            return true;
        } catch (error) {
            console.error('Error in deletePurchase:', error instanceof Error ? error.message : String(error));
            return false;
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
                amount: purchaseData.amount ?? 0,
                ticketCount: purchaseData.ticketCount ?? 0,
                tickets: [],
                createdAt: new Date().toISOString(),
                paymentMethod: purchaseData.paymentMethod || '',
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
                    preference_id: purchaseData.preferenceId,
                    price_tier_id: purchaseData.priceTierId,
                    amount: purchaseData.amount ?? 0,
                    ticket_count: purchaseData.ticketCount ?? 0,
                    payment_method: purchaseData.paymentMethod || '',
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

    async updatePurchaseStatusAndPaymentMethod(
        purchaseId: string,
        status: Purchase['status'],
        paymentMethod: Purchase['paymentMethod']
    ): Promise<boolean> {
        if (!supabase) {
            const purchase = this.mockPurchases.find(p => p.id === purchaseId);
            if (purchase) {
                purchase.status = status;
                purchase.paymentMethod = paymentMethod;
                return true;
            }
            return false;
        }
        try {
            const { error } = await supabase
                .from('purchases')
                .update({
                    status,
                    payment_method: paymentMethod,
                    updated_at: new Date().toISOString()
                })
                .eq('id', purchaseId);
            if (error) {
                console.error('Error updating purchase status and payment method:', error);
                return false;
            }
            return true;
        } catch (error) {
            console.error('Error in updatePurchaseStatusAndPaymentMethod:', error instanceof Error ? error.message : String(error));
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

    async assignTicketsToPurchase(purchaseId: string | null, ticketIds: string[]): Promise<boolean> {
        if (!supabase) {
            // Simular asignación de tickets en modo desarrollo
            console.log('🔧 Asignando tickets de ejemplo en modo desarrollo');
            return true;
        }

        console.log('🔧 Asignando tickets en modo producción');

        try {
            const updateData: any = purchaseId
                ? { status: 'sold', purchase_id: purchaseId }
                : { status: 'available', purchase_id: null };
            const { error } = await supabase
                .from('tickets')
                .update(updateData)
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

    /**
     * Obtiene compras paginadas y filtradas
     * @param page Página (1-based)
     * @param pageSize Tamaño de página
     * @param filters Filtros: { search, status, raffleId, order }
     * @returns { purchases, total }
     */
    async getPurchases(
        page: number = 1,
        pageSize: number = 15,
        filters?: {
            search?: string;
            status?: string;
            raffleId?: string;
            order?: 'asc' | 'desc';
        }
    ): Promise<{ purchases: Purchase[]; total: number }> {
        if (!supabase) {
            let filtered = this.mockPurchases;
            if (filters) {
                if (filters.status) filtered = filtered.filter(p => p.status === filters.status);
                if (filters.raffleId) filtered = filtered.filter(p => p.raffleId === filters.raffleId);
                if (filters.search) {
                    const s = filters.search.toLowerCase();
                    filtered = filtered.filter(p =>
                        p.fullName.toLowerCase().includes(s) ||
                        p.email.toLowerCase().includes(s) ||
                        (p.preferenceId || '').toLowerCase().includes(s)
                    );
                }
                if (filters.order) {
                    filtered = filtered.sort((a, b) => {
                        const dateA = new Date(a.createdAt).getTime();
                        const dateB = new Date(b.createdAt).getTime();
                        return filters.order === 'asc' ? dateA - dateB : dateB - dateA;
                    });
                }
            }
            const total = filtered.length;
            const start = (page - 1) * pageSize;
            const end = start + pageSize;
            return {
                purchases: filtered.slice(start, end),
                total
            };
        }

        try {
            let query = supabase
                .from('purchases')
                .select(`*, tickets (*)`, { count: 'exact' });

            // Filtros
            if (filters) {
                if (filters.status) query = query.eq('status', filters.status);
                if (filters.raffleId) query = query.eq('raffle_id', filters.raffleId);
                if (filters.search) {
                    // Buscar en full_name, email y preference_id
                    query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,preference_id.ilike.%${filters.search}%`);
                }
            }

            // Orden
            if (filters && filters.order) {
                query = query.order('created_at', { ascending: filters.order === 'asc' });
            } else {
                query = query.order('created_at', { ascending: false });
            }

            // Paginación
            const from = (page - 1) * pageSize;
            const to = from + pageSize - 1;
            query = query.range(from, to);

            const { data, error, count } = await query;
            if (error) {
                console.error('Error fetching purchases:', error);
                return { purchases: [], total: 0 };
            }

            return {
                purchases: this.transformPurchasesData(data || []),
                total: count || 0
            };
        } catch (error) {
            console.error('Error in getPurchases:', error instanceof Error ? error.message : String(error));
            return { purchases: [], total: 0 };
        }
    }

    async getPurchaseById(purchaseId: string): Promise<Purchase | null> {
        if (!supabase) {
            return null;
        }

        try {
            // Primero obtener la compra sin expandir price_tiers
            const { data: purchase, error } = await supabase
                .from('purchases')
                .select(`*, tickets (*)`)
                .eq('id', purchaseId)
                .single();

            if (error) throw error;

            // Si priceTierId es 'custom', no expandir price_tiers
            if (purchase.price_tier_id === 'custom') {
                return this.transformPurchaseData(purchase);
            }

            // Si no es custom, expandir price_tiers manualmente
            let priceTier = undefined;
            if (purchase.price_tier_id) {
                const { data: tier, error: tierError } = await supabase
                    .from('price_tiers')
                    .select('*')
                    .eq('id', purchase.price_tier_id)
                    .single();
                if (!tierError && tier) {
                    priceTier = this.transformPriceTiersData([tier])[0];
                }
            }
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
            paymentMethod: data.payment_method || '',
            status: data.status,
            preferenceId: data.preference_id || '',
            raffleId: data.raffle_id,
            priceTierId: data.price_tier_id,
            amount: Number(data.amount ?? 0),
            ticketCount: Number(data.ticket_count ?? 0),
            priceTier: data.price_tier || undefined,
            tickets: this.transformTicketsData(data.tickets || []),
            createdAt: data.created_at,
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

    private transformPriceTiersData = (data: any[]): PriceTier[] => {
        return data.map(tier => ({
            id: tier.id,
            amount: tier.amount,
            ticketCount: tier.ticket_count,
            raffleId: tier.raffle_id,
        }));
    }
}

export const purchaseService = new PurchaseService();
