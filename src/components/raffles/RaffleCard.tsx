import React from 'react';
import { Calendar, Gift, Users, DollarSign, Ticket, Share2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Raffle } from '../../types';
import { Link } from 'react-router-dom';
import { getWhatsappShareMessageSafe } from '../../services/share.service';

interface RaffleCardProps {
  raffle: Raffle;
  onBuyTickets: (raffle: Raffle, tier?: any) => void;
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

  const handleShare = () => {
    const message = getWhatsappShareMessageSafe(raffle);
    // Abrir WhatsApp en el navegador
    // Detectar si es mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    
    if (isMobile) {
        // En mobile, abrir directamente
        window.location.href = url;
    } else {
        // En desktop, intentar abrir WhatsApp Web
       window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
        // O alternativamente, copiar al clipboard
        // navigator.clipboard.writeText(decodeURIComponent(url.split('text=')[1]));
    }

    
  };

  return (
    <Card className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <CardHeader>
        <div className="flex justify-between items-start">
          <Link to={`/raffle/view/${raffle.id}`} className="focus:outline-none">
            <CardTitle className="text-2xl text-blue-900 hover:underline cursor-pointer">{raffle.title}</CardTitle>
          </Link>
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
              {raffle.isActive ? 'Activa' : 'Inactiva'}
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
            <span>Premio principal</span>
          </h4>
          <div className="space-y-2">
            {raffle.prizes[0] && (
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{raffle.prizes[0].name}</p>
                  <p className="text-sm text-gray-600">{raffle.prizes[0].description}</p>
                </div>
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  1°
                </div>
              </div>
            )}
            {raffle.prizes.length > 1 && (
              <p className="text-sm text-gray-500 text-center">
                +{raffle.prizes.length - 1} premio{raffle.prizes.length - 1 > 1 ? 's' : ''} más
              </p>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
            <DollarSign className="w-4 h-4" />
            <span>Opciones de Contribución</span>
          </h4>
          <div className="flex flex-wrap gap-2">
            {raffle.priceTiers.map((tier) => (
              <button
                key={tier.id}
                type="button"
                className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-lg bg-white min-w-[120px] hover:bg-blue-50 hover:border-blue-400 focus:outline-none transition"
                onClick={() => onBuyTickets(raffle, tier)}
                disabled={!raffle.isActive}
              >
                <span className="font-medium text-gray-900">{tier.ticketCount} números</span>
                <span className="font-bold text-green-600">${tier.amount}</span>
                <span className="text-xs text-gray-500">${(tier.amount / tier.ticketCount).toFixed(2)} c/u</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button
            onClick={() => window.location.assign(`/cart?raffleId=${raffle.id}`)}
            className="w-full"
            size="lg"
            variant="outline"
            disabled={!raffle.isActive}
          >
            {raffle.isActive ? 'Contribuir con números 🛒' : 'Bono No Disponible'}
          </Button>
          <Link
            to={`/raffle/view/${raffle.id}`}
            className="w-full text-center text-blue-600 hover:underline text-sm mt-1"
          >
            Ver detalle del Bono Contribución
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};