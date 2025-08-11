import React from 'react';
import { RaffleCard } from '../components/raffles/RaffleCard';
import { Ticket } from 'lucide-react';
import { Raffle } from '../types';

interface Props {
  raffles: Raffle[];
  onBuyTickets: (raffle: Raffle, tier?: any) => void;
}

export const RafflesView: React.FC<Props> = ({ raffles, onBuyTickets }) => (
  <div className="space-y-8">
    <div className="text-center">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Rifas Disponibles
      </h1>
      <p className="text-gray-600 max-w-2xl mx-auto">
        Participa en nuestros sorteos y gana increíbles premios. 
        Selecciona tu rifa favorita y elige tus números de la suerte.
      </p>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
      {raffles.filter(r => r.isActive).map(raffle => (
        <RaffleCard
          key={raffle.id}
          raffle={raffle}
          onBuyTickets={onBuyTickets}
        />
      ))}
    </div>
    {raffles.filter(r => r.isActive).length === 0 && (
      <div className="text-center py-16">
        <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No hay rifas disponibles
        </h3>
        <p className="text-gray-600">
          Actualmente no tenemos rifas activas. ¡Vuelve pronto para nuevas oportunidades!
        </p>
      </div>
    )}
  </div>
);

export default RafflesView;