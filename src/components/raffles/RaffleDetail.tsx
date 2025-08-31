import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, Gift, Users, DollarSign, Ticket, Share2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Raffle } from '../../types';
import { raffleService } from '../../services/raffle.service';
import { getWhatsappShareMessageSafe } from '../../services/share.service';

interface RaffleDetailProps {
  onBuyTickets?: (raffle: Raffle, tier?: any) => void;
}

export const RaffleDetail: React.FC<RaffleDetailProps> = ({ onBuyTickets }) => {
  const { raffleId } = useParams<{ raffleId: string }>();
  const [raffle, setRaffle] = useState<Raffle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (raffleId) {
      raffleService.getRaffleById(raffleId).then((data) => {
        setRaffle(data);
        setLoading(false);
      });
    }
  }, [raffleId]);

  const handleBuyTickets = () => {
    if (onBuyTickets && raffle) {
      onBuyTickets(raffle);
    }
  };
  const handleShare = () => {
    if (!raffle) return;
    const message = getWhatsappShareMessageSafe(raffle);
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    if (isMobile) {
      window.location.href = url;
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <div>Cargando...</div>;
  if (!raffle) return <div>Bono contribución no encontrada</div>;

  const soldPercentage = (raffle.soldTickets / raffle.totalTickets) * 100;

  return (
    <Card className="max-w-2xl mx-auto mt-8">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-3xl text-blue-900">{raffle.title}</CardTitle>
          <div className="flex items-center gap-2">
            <button
              title="Compartir por WhatsApp"
              className="p-2 rounded-full hover:bg-green-100 transition"
              onClick={handleShare}
            >
              <Share2 className="w-5 h-5 text-green-600" />
            </button>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${raffle.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
              {raffle.isActive ? 'Activo' : 'Inactivo'}
            </div>
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
                <p className="text-xs text-gray-600">Números Seleccionados</p>
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
            <span className="text-sm text-gray-600">Progreso de Contribuciones</span>
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
            {raffle.prizes.map((prize, index) => (
              <div key={prize.id} className="flex items-center justify-start p-2 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-4">
                  {index + 1}°
                </div>
                <div>
                  <p className="font-medium text-gray-900">{prize.name}</p>
                  <p className="text-sm text-gray-600">{prize.description}</p>
                </div>

              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
            <DollarSign className="w-4 h-4" />
            <span>Opciones de Contribución</span>
          </h4>
          <div className="grid gap-2">
            {raffle.priceTiers.map((tier) => (
              <button
                key={tier.id}
                type="button"
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-400 focus:outline-none transition min-w-[120px]"
                onClick={() => onBuyTickets && onBuyTickets(raffle, tier)}
                disabled={!raffle.isActive}
              >
                <div>
                  <p className="font-medium text-gray-900">{tier.ticketCount} números</p>
                  <p className="text-sm text-gray-600">¡Mejor oferta!</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">${tier.amount}</p>
                  <p className="text-xs text-gray-500">${(tier.amount / tier.ticketCount).toFixed(2)} c/u</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button
            onClick={() => raffle && window.location.assign(`/cart?raffleId=${raffle.id}`)}
            className="w-full"
            size="lg"
            variant="outline"
            disabled={!raffle.isActive}
          >
            {raffle.isActive ? 'Contribuir con números 🛒' : 'Bono No Disponible'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
