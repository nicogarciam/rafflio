import React from 'react';
import { Calendar, Gift, Users, DollarSign, Ticket } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Raffle } from '../../types';

interface RaffleCardProps {
  raffle: Raffle;
  onBuyTickets: (raffle: Raffle) => void;
}

export const RaffleCard: React.FC<RaffleCardProps> = ({ raffle, onBuyTickets }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const soldPercentage = (raffle.soldTickets / raffle.totalTickets) * 100;

  return (
    <Card className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-2xl text-blue-900">{raffle.title}</CardTitle>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            raffle.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {raffle.isActive ? 'Activa' : 'Inactiva'}
          </div>
        </div>
        <p className="text-gray-600 mt-2">{raffle.description}</p>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>Sorteo: {formatDate(raffle.drawDate)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-xs text-gray-600">Números Vendidos</p>
                <p className="font-semibold text-blue-900">{raffle.soldTickets.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Ticket className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-xs text-gray-600">Total Números</p>
                <p className="font-semibold text-green-900">{raffle.maxTickets.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Progreso de ventas</span>
            <span className="text-sm font-medium text-gray-900">{soldPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${soldPercentage}%` }}
            />
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
            <Gift className="w-4 h-4" />
            <span>Premios</span>
          </h4>
          <div className="space-y-2">
            {raffle.prizes.slice(0, 3).map((prize, index) => (
              <div key={prize.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{prize.name}</p>
                  <p className="text-sm text-gray-600">{prize.description}</p>
                </div>
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}°
                </div>
              </div>
            ))}
            {raffle.prizes.length > 3 && (
              <p className="text-sm text-gray-500 text-center">
                +{raffle.prizes.length - 3} premios más
              </p>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
            <DollarSign className="w-4 h-4" />
            <span>Opciones de Compra</span>
          </h4>
          <div className="grid gap-2">
            {raffle.priceTiers.map((tier) => (
              <div key={tier.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <p className="font-medium text-gray-900">{tier.ticketCount} números</p>
                  <p className="text-sm text-gray-600">¡Mejor oferta!</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">${tier.amount}</p>
                  <p className="text-xs text-gray-500">${(tier.amount / tier.ticketCount).toFixed(2)} c/u</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button
          onClick={() => onBuyTickets(raffle)}
          className="w-full"
          size="lg"
          disabled={!raffle.isActive}
        >
          {raffle.isActive ? 'Comprar Números' : 'Rifa No Disponible'}
        </Button>
      </CardContent>
    </Card>
  );
};