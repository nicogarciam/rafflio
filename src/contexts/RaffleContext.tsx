import React, { createContext, useContext, useState, useEffect } from 'react';
import { Raffle, Purchase, Ticket } from '../types';
import { raffleService } from '../services/raffle.service';

interface RaffleContextType {
  raffles: Raffle[];
  purchases: Purchase[];
  isLoading: boolean;
  error: string | null;
  addRaffle: (raffle: Omit<Raffle, 'id' | 'createdAt' | 'tickets' | 'totalTickets' | 'soldTickets'>) => Promise<void>;
  getRaffleById: (id: string) => Raffle | undefined;
  createPurchase: (purchase: Omit<Purchase, 'id' | 'createdAt' | 'paymentId'>) => Promise<Purchase>;
  updatePurchaseStatus: (purchaseId: string, status: Purchase['status']) => Promise<void>;
  updatePurchasePreferenceId: (purchaseId: string, preferenceId: string) => Promise<void>;
  updateTickets: (purchaseId: string, ticketNumbers: string[]) => Promise<void>;
  getAvailableTickets: (raffleId: string) => Promise<Ticket[]>;
  refreshRaffles: () => Promise<void>;
  refreshPurchases: () => Promise<void>;
  getPurchaseById: (purchaseId: string) => Promise<Purchase | null>;
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

  const loadPurchases = async () => {
    try {
      const purchasesData = await raffleService.getPurchases();
      setPurchases(purchasesData);
    } catch (err) {
      console.error('Error loading purchases:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar las compras');
    }
  };

  useEffect(() => {
    loadRaffles();
    loadPurchases();
  }, []);

  const addRaffle = async (raffleData: Omit<Raffle, 'id' | 'createdAt' | 'tickets' | 'totalTickets' | 'soldTickets'>) => {
    try {
      setError(null);
      const newRaffle = await raffleService.createRaffle({
        title: raffleData.title,
        description: raffleData.description,
        drawDate: raffleData.drawDate,
        maxTickets: raffleData.maxTickets,
        prizes: raffleData.prizes,
        priceTiers: raffleData.priceTiers
      });

      if (newRaffle) {
        setRaffles(prev => [newRaffle, ...prev]);
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
      const newPurchase = await raffleService.createPurchase({
        fullName: purchaseData.fullName,
        email: purchaseData.email,
        phone: purchaseData.phone,
        raffleId: purchaseData.raffleId,
        priceTierId: purchaseData.priceTierId,
        preferenceId: purchaseData.preferenceId || '', // Asegúrate de que preferenceId esté definido
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
      await raffleService.updatePurchaseStatus(purchaseId, status);

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
      await raffleService.updatePurchasePreferenceId(purchaseId, preferenceId);

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
      await raffleService.assignTicketsToPurchase(purchaseId, ticketIds);

      // Actualizar el estado local
      // await loadRaffles(); // Recargar rifas para actualizar tickets

      // Actualizar la compra con los tickets seleccionados
      const updatedPurchase = await raffleService.getPurchaseById(purchaseId);
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

  const refreshPurchases = async () => {
    await loadPurchases();
  };

  const getPurchaseById = async (purchaseId: string) => {
    try {
      const purchase = raffleService.getPurchaseById(purchaseId);
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

  return (
    <RaffleContext.Provider value={{
      raffles,
      purchases,
      isLoading,
      error,
      addRaffle,
      getRaffleById,
      createPurchase,
      updatePurchaseStatus,
      updatePurchasePreferenceId,
      updateTickets,
      getAvailableTickets,
      refreshRaffles,
      refreshPurchases,
      getPurchaseById
    }}>
      {children}
    </RaffleContext.Provider>
  );
};