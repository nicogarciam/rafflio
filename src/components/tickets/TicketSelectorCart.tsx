import React from 'react';
import { useCart } from '../../contexts/CartContext';
import { PriceTier, Ticket } from '../../types';

interface TicketSelectorCartProps {
  tickets: Ticket[];
}

function calcularPrecio(priceTiers: PriceTier[], cantidad: number): { monto: number, tier: PriceTier | null } {
  if (!priceTiers.length || cantidad === 0) return { monto: 0, tier: null };
  // Ordenar tiers de mayor a menor cantidad de números
  const sorted = [...priceTiers].sort((a, b) => b.ticketCount - a.ticketCount);
  let monto = 0;
  let tierUsado: PriceTier | null = null;
  let restante = cantidad;
  for (const tier of sorted) {
    const packs = Math.floor(restante / tier.ticketCount);
    if (packs > 0) {
      monto += packs * tier.amount;
      restante -= packs * tier.ticketCount;
      if (!tierUsado) tierUsado = tier;
    }
  }
  // Si quedan números sueltos, usar el tier más chico
  if (restante > 0) {
    const minTier = priceTiers.reduce((min, t) => t.ticketCount < min.ticketCount ? t : min, priceTiers[0]);
    monto += (minTier.amount / minTier.ticketCount) * restante;
    if (!tierUsado) tierUsado = minTier;
  }
  return { monto, tier: tierUsado };
}


export const TicketSelectorCart: React.FC<TicketSelectorCartProps> & { SummaryPrice?: React.FC } = ({ tickets }) => {
  const { selectedNumbers, addNumber, removeNumber, raffle } = useCart();

  // Ordenar tickets por número
  const sortedTickets = [...tickets].sort((a, b) => a.number - b.number);
  const isSelected = (ticket: Ticket) => selectedNumbers.some(t => t.id === ticket.id);
  const isAvailable = (ticket: Ticket) => ticket.status === 'available';
  const vendidos = tickets.filter(t => t.status === 'sold').length;
  const disponibles = tickets.filter(t => t.status === 'available').length;
  const { monto } = raffle ? calcularPrecio(raffle.priceTiers, selectedNumbers.length) : { monto: 0 };

  return (
    <div className="space-y-6">
      {/* Título y opciones de compra */}
      <div className="space-y-2 mb-2">
        <div className="text-xl font-bold text-gray-900">
          Selecciona tus números para {raffle?.title && <span className="text-blue-700">{raffle.title}</span>}
        </div>
        {raffle?.description && (
          <div className="text-gray-600 text-sm mb-2">{raffle.description}</div>
        )}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-semibold text-lg text-gray-900 flex items-center">
            <span className="mr-2">💲</span> Opciones de Compra
          </span>
          {raffle && raffle.priceTiers.map((tier) => (
            <div key={tier.id} className="flex flex-col items-center border rounded-lg px-4 py-2 bg-white shadow-sm mr-2">
              <span className="text-base font-semibold text-gray-900">{tier.ticketCount} números</span>
              <span className="text-green-600 text-lg font-bold">${tier.amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
              <span className="text-xs text-gray-500">${(tier.amount / tier.ticketCount).toLocaleString('es-AR', { minimumFractionDigits: 2 })} c/u</span>
            </div>
          ))}
        </div>
        <div className="flex items-center space-x-4 text-sm mt-2">
          <span className="inline-flex items-center"><span className="w-3 h-3 rounded-full bg-green-400 mr-1"></span>Disponible</span>
          <span className="inline-flex items-center"><span className="w-3 h-3 rounded-full bg-blue-400 mr-1"></span>Seleccionado</span>
          <span className="inline-flex items-center"><span className="w-3 h-3 rounded-full bg-red-400 mr-1"></span>Vendido</span>
        </div>
      </div>
      {/* Grilla de números */}
      <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
        <div className="grid grid-cols-10 gap-2">
          {sortedTickets.map(ticket => {
            const status = isSelected(ticket)
              ? 'selected'
              : isAvailable(ticket)
                ? 'available'
                : 'sold';
            return (
              <button
                key={ticket.id}
                className={`w-10 h-10 text-xs font-mono rounded border transition-all
                  ${status === 'available'
                    ? 'bg-green-100 border-green-300 text-green-800 hover:bg-green-200 hover:scale-105'
                    : status === 'selected'
                      ? 'bg-blue-500 border-blue-600 text-white shadow-lg scale-105'
                      : 'bg-red-100 border-red-300 text-red-600 cursor-not-allowed'}
                  ${status === 'available' && selectedNumbers.length >= (raffle?.maxTickets || 1) ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                onClick={() => isAvailable(ticket) ? (isSelected(ticket) ? removeNumber(ticket.id) : addNumber(ticket)) : undefined}
                disabled={!isAvailable(ticket) || (status === 'available' && selectedNumbers.length >= (raffle?.maxTickets || 1))}
                title={isAvailable(ticket) ? 'Disponible' : 'Vendido'}
              >
                {ticket.number}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Componente auxiliar para mostrar el precio flotante
TicketSelectorCart.SummaryPrice = function SummaryPrice() {
  const { selectedNumbers, raffle } = useCart();
  const { monto } = raffle ? calcularPrecio(raffle.priceTiers, selectedNumbers.length) : { monto: 0 };
  return <span>${monto.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>;
};
