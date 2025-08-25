import React, { createContext, useContext, useState } from 'react';
import { Ticket, Raffle } from '../types';

interface CartContextType {
  selectedNumbers: Ticket[];
  raffle: Raffle | null;
  addNumber: (ticket: Ticket) => void;
  removeNumber: (ticketId: string) => void;
  clearCart: () => void;
  setRaffle: (raffle: Raffle) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider');
  return ctx;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedNumbers, setSelectedNumbers] = useState<Ticket[]>([]);
  const [raffle, setRaffle] = useState<Raffle | null>(null);

  const addNumber = (ticket: Ticket) => {
    setSelectedNumbers((prev) => prev.find(t => t.id === ticket.id) ? prev : [...prev, ticket]);
  };

  const removeNumber = (ticketId: string) => {
    setSelectedNumbers((prev) => prev.filter(t => t.id !== ticketId));
  };

  const clearCart = () => {
    setSelectedNumbers([]);
  };

  return (
    <CartContext.Provider value={{ selectedNumbers, raffle, addNumber, removeNumber, clearCart, setRaffle }}>
      {children}
    </CartContext.Provider>
  );
};
