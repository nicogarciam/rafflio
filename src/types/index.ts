export interface Raffle {
  id: string;
  title: string;
  description: string;
  drawDate: string;
  createdAt: string;
  prizes: Prize[];
  priceTiers: PriceTier[];
  tickets: Ticket[];
  isActive: boolean;
  totalTickets: number;
  maxTickets: number;
  soldTickets: number;
}

export interface Prize {
  id: string;
  name: string;
  description: string;
  raffleId: string;
}

export interface PriceTier {
  id: string;
  amount: number;
  ticketCount: number;
  raffleId: string;
}

export interface Ticket {
  id: string;
  number: number;
  status: 'available' | 'reserved' | 'sold';
  raffleId: string;
  purchaseId?: string;
}

export interface Purchase {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  tickets: Ticket[];
  paymentId: string;
  preferenceId: string; // <-- Agregado para MercadoPago
  status: 'pending' | 'paid' | 'failed' | 'cancelled' | 'confirmed';
  createdAt: string;
  raffleId: string;
  priceTierId: string;
  priceTier?: PriceTier; // Opcional, para incluir detalles del tier de precio
}

export interface User {
  id?: string;
  email: string;
  role: string;
  name: string;
  password?: string; // Optional, only for new user creation
  isActive: boolean;
}