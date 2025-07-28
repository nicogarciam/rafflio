import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { useRaffle } from '../../contexts/RaffleContext';
import { CheckCircle, Circle, Lock, Sparkles, Mail } from 'lucide-react';

interface TicketSelectorProps {
  purchaseId: string;
  onClose: () => void;
}

export const TicketSelector: React.FC<TicketSelectorProps> = ({ purchaseId, onClose }) => {
  const { purchases, getRaffleById, updateTickets } = useRaffle();
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const purchase = purchases.find(p => p.id === purchaseId);
  const raffle = purchase ? getRaffleById(purchase.raffleId) : null;
  const priceTier = raffle?.priceTiers.find(t => t.id === purchase?.priceTierId);

  const maxSelections = priceTier?.ticketCount || 0;

  const handleNumberClick = (number: number) => {
    if (selectedNumbers.includes(number)) {
      setSelectedNumbers(selectedNumbers.filter(n => n !== number));
    } else if (selectedNumbers.length < maxSelections) {
      setSelectedNumbers([...selectedNumbers, number]);
    }
  };

  const handleConfirmSelection = async () => {
    if (selectedNumbers.length !== maxSelections || !raffle) return;

    setLoading(true);
    
    try {
      // Simular actualización de tickets
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      updateTickets(purchaseId, selectedNumbers);
      
      // Simular envío de email
      setTimeout(() => {
        setEmailSent(true);
        setLoading(false);
      }, 1000);

    } catch (error) {
      console.error('Error confirming selection:', error);
      setLoading(false);
    }
  };

  const getTicketStatus = (ticketNumber: number): 'available' | 'selected' | 'sold' => {
    if (selectedNumbers.includes(ticketNumber)) return 'selected';
    const ticket = raffle?.tickets.find(t => t.number === ticketNumber);
    return ticket?.status === 'sold' ? 'sold' : 'available';
  };

  const renderTicketGrid = () => {
    if (!raffle) return null;
    
    const tickets = [];
    const ticketsPerRow = 20;
    const totalRows = Math.ceil(raffle.maxTickets / ticketsPerRow);

    for (let row = 0; row < totalRows; row++) {
      const rowTickets = [];
      for (let col = 0; col < ticketsPerRow; col++) {
        const ticketNumber = row * ticketsPerRow + col + 1;
        
        // Skip if ticket number exceeds max tickets
        if (ticketNumber > raffle.maxTickets) break;
        
        const status = getTicketStatus(ticketNumber);
        
        rowTickets.push(
          <button
            key={ticketNumber}
            onClick={() => handleNumberClick(ticketNumber)}
            disabled={status === 'sold' || (status === 'available' && selectedNumbers.length >= maxSelections)}
            className={`
              w-8 h-8 text-xs font-medium rounded border transition-all duration-150
              ${status === 'available' 
                ? 'bg-green-100 border-green-300 text-green-800 hover:bg-green-200 hover:scale-105' 
                : status === 'selected'
                ? 'bg-blue-500 border-blue-600 text-white shadow-lg scale-105'
                : 'bg-red-100 border-red-300 text-red-600 cursor-not-allowed'
              }
              ${status === 'available' && selectedNumbers.length >= maxSelections ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {ticketNumber}
          </button>
        );
      }
      
      tickets.push(
        <div key={row} className="flex gap-1">
          {rowTickets}
        </div>
      );
    }
    
    return tickets;
  };

  if (!purchase || !raffle || !priceTier) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error: No se pudo cargar la información de la compra</p>
      </div>
    );
  }

  if (purchase.status !== 'paid') {
    return (
      <div className="text-center py-8 space-y-4">
        <Lock className="w-16 h-16 text-gray-400 mx-auto" />
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Pago Pendiente</h3>
          <p className="text-gray-600">
            Debes completar el pago antes de seleccionar tus números
          </p>
        </div>
      </div>
    );
  }

  if (emailSent) {
    return (
      <div className="text-center py-8 space-y-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <Mail className="w-10 h-10 text-green-600" />
        </div>
        
        <div>
          <h3 className="text-2xl font-semibold text-green-900 mb-2">
            ¡Números Confirmados!
          </h3>
          <p className="text-gray-600 mb-4">
            Tus números han sido seleccionados exitosamente
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-sm text-green-800 mb-2">
              <strong>Números seleccionados:</strong>
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {selectedNumbers.sort((a, b) => a - b).map(number => (
                <span
                  key={number}
                  className="bg-green-500 text-white px-2 py-1 rounded font-medium text-sm"
                >
                  {number}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Confirmación enviada:</strong> Revisa tu email ({purchase.email}) para ver todos los detalles de tu compra.
          </p>
        </div>

        <Button onClick={onClose} className="w-full max-w-md">
          Finalizar
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-yellow-500" />
            <span>Selecciona tus Números de la Suerte</span>
          </CardTitle>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{raffle.title}</p>
                <p className="text-sm text-gray-600">Comprador: {purchase.fullName}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Selecciona exactamente:</p>
                <p className="text-2xl font-bold text-blue-600">
                  {maxSelections} números
                </p>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-6">
            {/* Progress and Legend */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="font-medium text-gray-900">
                  Progreso: {selectedNumbers.length} / {maxSelections}
                </p>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <Circle className="w-4 h-4 text-green-600" />
                    <span>Disponible</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    <span>Seleccionado</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Lock className="w-4 h-4 text-red-600" />
                    <span>Vendido</span>
                  </div>
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(selectedNumbers.length / maxSelections) * 100}%` }}
                />
              </div>
            </div>

            {/* Selected Numbers Display */}
            {selectedNumbers.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 mb-2">
                  Números seleccionados:
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedNumbers.sort((a, b) => a - b).map(number => (
                    <span
                      key={number}
                      className="bg-blue-500 text-white px-3 py-1 rounded-full font-medium text-sm"
                    >
                      {number}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Ticket Grid */}
            <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
              <div className="space-y-1">
                {renderTicketGrid()}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <Button
                onClick={handleConfirmSelection}
                disabled={selectedNumbers.length !== maxSelections || loading}
                loading={loading}
                className="flex-1"
              >
                {loading ? 'Confirmando...' : `Confirmar ${maxSelections} Números`}
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedNumbers([])}
                disabled={loading}
              >
                Limpiar Selección
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};