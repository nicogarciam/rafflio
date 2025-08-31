import React from 'react';
import { PriceTier, Raffle } from '../../../types';
import { Ticket } from 'lucide-react';

interface PurchaseTierSelectorProps {
  raffle: Raffle;
  selectedTier: PriceTier | null;
  onSelect: (tier: PriceTier) => void;
}

export const PurchaseTierSelector: React.FC<PurchaseTierSelectorProps> = ({ raffle, selectedTier, onSelect }) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Selecciona tu paquete
        </h3>
        <p className="text-gray-600">
          Elige con cuantos números que deseas contribuir a {raffle.title}
        </p>
      </div>

      <div className="grid gap-4">
        {raffle.priceTiers.map((tier) => (
          <div
            key={tier.id}
            onClick={() => onSelect(tier)}
            className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 ${selectedTier?.id === tier.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50'}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Ticket className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {tier.ticketCount} números
                  </h4>
                  <p className="text-sm text-gray-600">
                    ${(tier.amount / tier.ticketCount).toFixed(2)} por número
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">
                  ${tier.amount}
                </p>
                <p className="text-sm text-gray-500">Contribución total</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
