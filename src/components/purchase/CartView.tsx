import React from 'react';
import { useCart } from '../../contexts/CartContext';
import { useRaffle } from '../../contexts/RaffleContext';
import { Button } from '../ui/Button';
import { TicketSelectorCart } from '../tickets/TicketSelectorCart';
import { PurchaseFlow } from './PurchaseFlow';
import { useLocation } from 'react-router-dom';
import { Ticket } from '../../types';

export const CartView: React.FC = () => {
  const { selectedNumbers, clearCart, raffle, setRaffle } = useCart();
  const { getAvailableTickets, raffles } = useRaffle();
  const [showModal, setShowModal] = React.useState(false);
  const [availableTickets, setAvailableTickets] = React.useState<Ticket[]>([]);
  const location = useLocation();

  // Detectar raffleId en query param y setear la rifa automáticamente
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const raffleId = params.get('raffleId');
    if (raffleId && (!raffle || raffle.id !== raffleId)) {
      const found = raffles.find(r => r.id === raffleId);
      if (found) setRaffle(found);
    }
  }, [location.search, raffles]);

  React.useEffect(() => {
    if (raffle) {
      getAvailableTickets(raffle.id).then(setAvailableTickets);
    }
  }, [raffle && raffle.id, raffle && JSON.stringify(raffle?.priceTiers)]);

  // Calcular monto total usando la lógica de calcularPrecio del selector
  function calcularPrecio(priceTiers: any, cantidad: any) {
    if (!priceTiers.length || cantidad === 0) return { monto: 0, tier: null };
    const sorted = [...priceTiers].sort((a, b) => b.ticketCount - a.ticketCount);
    let monto = 0;
    let tierUsado = null;
    let restante = cantidad;
    for (const tier of sorted) {
      const packs = Math.floor(restante / tier.ticketCount);
      if (packs > 0) {
        monto += packs * tier.amount;
        restante -= packs * tier.ticketCount;
        if (!tierUsado) tierUsado = tier;
      }
    }
    if (restante > 0) {
      const minTier = priceTiers.reduce((min: any, t: any) => t.ticketCount < min.ticketCount ? t : min, priceTiers[0]);
      monto += (minTier.amount / minTier.ticketCount) * restante;
      if (!tierUsado) tierUsado = minTier;
    }
    return { monto, tier: tierUsado };
  }
  
  const montoTotal = raffle ? calcularPrecio(raffle.priceTiers, selectedNumbers.length).monto : 0;
  // Buscar el tier real de menor cantidad de números para usar su id
  const minTier = raffle && raffle.priceTiers.length > 0
    ? raffle.priceTiers.reduce((min, t) => t.ticketCount < min.ticketCount ? t : min, raffle.priceTiers[0])
    : null;
  // Si la cantidad de seleccionados no coincide con ningún tier, es custom
  const isCustom = raffle && !raffle.priceTiers.some(t => t.ticketCount === selectedNumbers.length);
  const customTier = raffle && minTier ? {
    id: isCustom ? 'custom' : minTier.id, // 'custom' si es custom, id real si coincide
    amount: montoTotal,
    ticketCount: selectedNumbers.length,
    raffleId: raffle.id
  } : null;

  if (!raffle) return <div>Selecciona una rifa para comenzar.</div>;

  return (
    <div className="relative min-h-[80vh]">
      <div className="max-w-5xl mx-auto py-2">
        <TicketSelectorCart tickets={availableTickets} />
      </div>
      {/* Panel flotante abajo a la derecha */}
      <div className="fixed bottom-6 right-6 z-50 w-full max-w-xs bg-white border border-blue-200 rounded-xl shadow-xl p-4 flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-semibold text-blue-900">Seleccionados: <span className="text-lg">{selectedNumbers.length}</span></span>
          <span className="font-semibold text-green-700">Monto: ${montoTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
        </div>
        {selectedNumbers.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-1">
            {[...selectedNumbers]
              .sort((a, b) => a.number - b.number)
              .map(ticket => (
                <span key={ticket.id} className="bg-blue-500 text-white px-2 py-1 rounded font-mono text-xs">{ticket.number}</span>
              ))}
          </div>
        )}
        <div className="flex gap-2">
          <Button variant="outline" onClick={clearCart} disabled={selectedNumbers.length === 0} className="flex-1">Vaciar</Button>
          <Button disabled={selectedNumbers.length === 0} onClick={() => setShowModal(true)} className="flex-1">Ir al pago</Button>
        </div>
      </div>
      {/* Modal de pago reutilizando PurchaseFlow */}
      {showModal && raffle && customTier && (
        <PurchaseFlow
          raffle={raffle}
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            // Refrescar los tickets disponibles y la vista del carrito al cerrar
            if (raffle) getAvailableTickets(raffle.id).then(setAvailableTickets);
          }}
          onPurchaseComplete={() => {
            clearCart();
            setShowModal(false);
            if (raffle) getAvailableTickets(raffle.id).then(setAvailableTickets);
          }}
          initialTier={customTier}
        />
      )}
    </div>
  );
};