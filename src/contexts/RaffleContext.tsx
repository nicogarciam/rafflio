import React, { createContext, useContext, useState, useEffect } from 'react';
import { Raffle, Purchase, Ticket } from '../types';
import { raffleService } from '../services/raffle.service';
import { purchaseService } from '../services/purchase.service';

interface RaffleContextType {
  raffles: Raffle[];
  purchases: Purchase[];
  totalPurchases: number;
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  filters: {
    search?: string;
    status?: string;
    raffleId?: string;
    order?: 'asc' | 'desc';
  };
  setFilters: (filters: {
    search?: string;
    status?: string;
    raffleId?: string;
    order?: 'asc' | 'desc';
  }) => void;
  isLoading: boolean;
  error: string | null;
  addRaffle: (raffle: Omit<Raffle, 'id' | 'createdAt' | 'tickets' | 'totalTickets' | 'soldTickets'>) => Promise<void>;
  updateRaffle: (id: string, updates: Partial<Omit<Raffle, 'id' | 'createdAt' | 'tickets' | 'soldTickets' | 'totalTickets'>>) => Promise<void>;
  getRaffleById: (id: string) => Raffle | undefined;
  createPurchase: (purchase: Omit<Purchase, 'id' | 'createdAt' | 'paymentId'>) => Promise<Purchase>;
  updatePurchaseStatus: (purchaseId: string, status: Purchase['status']) => Promise<void>;
  updatePurchasePreferenceId: (purchaseId: string, preferenceId: string) => Promise<void>;
  updateTickets: (purchaseId: string, ticketNumbers: string[]) => Promise<void>;
  getAvailableTickets: (raffleId: string) => Promise<Ticket[]>;
  refreshRaffles: () => Promise<void>;
  deleteRaffle: (raffleId: string) => Promise<boolean>;
  refreshPurchases: (page?: number, pageSize?: number, filters?: any) => Promise<void>;
  getPurchaseById: (purchaseId: string) => Promise<Purchase | null>;
  getPurchasesByRaffleId: (raffleId: string) => Promise<Purchase[]>;
}

const RaffleContext = createContext<RaffleContextType | undefined>(undefined);

export const useRaffle = () => {
  const context = useContext(RaffleContext);
  if (context === undefined) {
    throw new Error('useRaffle must be used within a RaffleProvider');
  }
  return context;
};

export const RaffleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [totalPurchases, setTotalPurchases] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);
  const [filters, setFilters] = useState<{ search?: string; status?: string; raffleId?: string; order?: 'asc' | 'desc'; }>({ order: 'desc' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRaffles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const rafflesData = await raffleService.getRaffles();
      setRaffles(rafflesData);
    } catch (err) {
      console.error('Error loading raffles:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar las rifas');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPurchases = async (pageArg = page, pageSizeArg = pageSize, filtersArg = filters) => {
    try {
      setIsLoading(true);
      setError(null);
      const { purchases: purchasesData, total } = await purchaseService.getPurchases(pageArg, pageSizeArg, filtersArg);
      setPurchases(purchasesData);
      setTotalPurchases(total);
    } catch (err) {
      console.error('Error loading purchases:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar las compras');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRaffles();
    loadPurchases(1, pageSize, filters); // Cargar la primera página al iniciar
  }, []);

  useEffect(() => {
    loadPurchases(page, pageSize, filters);
  }, [page, pageSize, filters]);

  const updateRaffle = async (id: string, updates: Partial<Omit<Raffle, 'id' | 'createdAt' | 'tickets' | 'soldTickets' | 'totalTickets'>>) => {
    try {
      setError(null);
      const updated = await raffleService.updateRaffle(id, updates);
      if (updated) {
        setRaffles((prev: Raffle[]) => prev.map((r: Raffle) => r.id === id ? { ...r, ...updated } : r));
      }
    } catch (err) {
      console.error('Error updating raffle:', err);
      setError(err instanceof Error ? err.message : 'Error al actualizar la rifa');
      throw err;
    }
  };

  const addRaffle = async (raffleData: Omit<Raffle, 'id' | 'createdAt' | 'tickets' | 'totalTickets' | 'soldTickets'>) => {
    try {
      setError(null);
      const newRaffle = await raffleService.createRaffle({
        title: raffleData.title,
        description: raffleData.description,
        drawDate: raffleData.drawDate,
        maxTickets: raffleData.maxTickets,
        prizes: raffleData.prizes,
        priceTiers: raffleData.priceTiers,
        isActive: true,
        accountId: raffleData.accountId || null
      });

      if (newRaffle) {
        setRaffles((prev: Raffle[]) => [newRaffle, ...prev]);
      }
    } catch (err) {
      console.error('Error adding raffle:', err);
      setError(err instanceof Error ? err.message : 'Error al crear la rifa');
      throw err;
    }
  };

  const getRaffleById = (id: string) => {
    return raffles.find(raffle => raffle.id === id);
  };

  const createPurchase = async (purchaseData: Omit<Purchase, 'id' | 'createdAt' | 'paymentId'>) => {
    try {
      setError(null);
      const newPurchase = await purchaseService.createPurchase({
        fullName: purchaseData.fullName,
        email: purchaseData.email,
        phone: purchaseData.phone,
        raffleId: purchaseData.raffleId,
        priceTierId: purchaseData.priceTierId,
        preferenceId: purchaseData.preferenceId || '', // Asegúrate de que preferenceId esté definido
        amount: purchaseData.amount,
        ticketCount: purchaseData.ticketCount,
        paymentMethod: purchaseData.paymentMethod,
      });

      if (newPurchase) {
        setPurchases(prev => [newPurchase, ...prev]);
        return newPurchase;
      }
      throw new Error('Error al crear la compra');
    } catch (err) {
      console.error('Error creating purchase:', err);
      setError(err instanceof Error ? err.message : 'Error al crear la compra');
      throw err;
    }
  };

  const updatePurchaseStatus = async (purchaseId: string, status: Purchase['status']) => {
    try {
      setError(null);
      await purchaseService.updatePurchaseStatus(purchaseId, status);

      setPurchases(prev =>
        prev.map(purchase =>
          purchase.id === purchaseId ? { ...purchase, status } : purchase
        )
      );
    } catch (err) {
      console.error('Error updating purchase status:', err);
      setError(err instanceof Error ? err.message : 'Error al actualizar el estado de la compra');
      throw err;
    }
  };

  const updatePurchasePreferenceId = async (purchaseId: string, preferenceId: string) => {
    try {
      setError(null);
      await purchaseService.updatePurchasePreferenceId(purchaseId, preferenceId);

      setPurchases(prev =>
        prev.map(purchase =>
          purchase.id === purchaseId ? { ...purchase, preferenceId } : purchase
        )
      );
    } catch (err) {
      console.error('Error updating purchase PreferenceId:', err);
      setError(err instanceof Error ? err.message : 'Error al actualizar el PreferenceId de la compra');
      throw err;
    }
  };


  const updateTickets = async (purchaseId: string, ticketIds: string[]) => {
    try {
      setError(null);
      await purchaseService.assignTicketsToPurchase(purchaseId, ticketIds);

      // Actualizar el estado local
      // await loadRaffles(); // Recargar rifas para actualizar tickets

      // Actualizar la compra con los tickets seleccionados
      const updatedPurchase = await purchaseService.getPurchaseById(purchaseId);
      if (updatedPurchase) {
        setPurchases(prev =>
          prev.map(p => p.id === purchaseId ? updatedPurchase : p)
        );
      }
    } catch (err) {
      console.error('Error updating tickets:', err);
      setError(err instanceof Error ? err.message : 'Error al actualizar los tickets');
      throw err;
    }
  };

  const getAvailableTickets = async (raffleId: string) => {
    try {
      return await raffleService.getAvailableTickets(raffleId);
    } catch (err) {
      console.error('Error getting available tickets:', err);
      setError(err instanceof Error ? err.message : 'Error al obtener tickets disponibles');
      throw err;
    }
  };

  const refreshRaffles = async () => {
    await loadRaffles();
  };

  const refreshPurchases = async (pageArg = page, pageSizeArg = pageSize, filtersArg = filters) => {
    await loadPurchases(pageArg, pageSizeArg, filtersArg);
  };

  const getPurchaseById = async (purchaseId: string) => {
    try {
      const purchase = purchaseService.getPurchaseById(purchaseId);
      if (purchase) {
        return purchase;
      }
      return null;
    } catch (err) {
      console.error('Error getting purchase by ID:', err);
      setError(err instanceof Error ? err.message : 'Error al obtener la compra');
      throw err;
    }
  };

  const deleteRaffle = async (raffleId: string) => {
    try {
      setError(null);
      const ok = await raffleService.deleteRaffle(raffleId);
      if (ok) {
        setRaffles(prev => prev.filter(r => r.id !== raffleId));
      }
      return ok;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar la rifa');
      return false;
    }
  };

  const getPurchasesByRaffleId = async (raffleId: string) => {
    try {
      const { purchases, total } = await purchaseService.getPurchases(1, 1000, { raffleId });
      return purchases;
    } catch (err) {
      console.error('Error getting purchases by raffle ID:', err);
      setError(err instanceof Error ? err.message : 'Error al obtener las compras por ID de rifa');
      throw err;
    }
  };

  return (
    <RaffleContext.Provider value={{
      raffles,
      purchases,
      totalPurchases,
      page,
      pageSize,
      setPage,
      setPageSize,
      filters,
      setFilters,
      isLoading,
      error,
      addRaffle,
      updateRaffle,
      getRaffleById,
      createPurchase,
      updatePurchaseStatus,
      updatePurchasePreferenceId,
      updateTickets,
      getAvailableTickets,
      refreshRaffles,
      refreshPurchases,
      getPurchaseById,
      deleteRaffle,
      getPurchasesByRaffleId,
    }}>
      {children}
    </RaffleContext.Provider>
  );
};