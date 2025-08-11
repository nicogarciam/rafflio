import React from 'react';
import { PriceTier } from '../../../types';

interface PurchaseSummaryCardProps {
  selectedTier: PriceTier | null;
}

export const PurchaseSummaryCard: React.FC<PurchaseSummaryCardProps> = ({ selectedTier }) => {
  // ...UI para mostrar resumen del tier seleccionado...
  return <div>TODO: Summary card</div>;
};
