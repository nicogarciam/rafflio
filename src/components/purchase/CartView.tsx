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
  const theTier = raffle && raffle.priceTiers.find(t => t.ticketCount === selectedNumbers.length);
  // Si la cantidad de seleccionados no coincide con ningún tier, es custom
  const isCustom = raffle && !theTier;
  const customTier = raffle ? {
    id: isCustom ? 'custom' : (theTier ? theTier.id : 'custom'),
    amount: montoTotal,
    ticketCount: selectedNumbers.length,
    raffleId: raffle.id
  } : null;
  if (!raffle) return <div>Selecciona un Bono Contribución para comenzar.</div>;

  return (
    // Agrego padding-bottom en mobile para que el panel fijo no tape la selección
    <div className="relative min-h-[80vh] pb-36 md:pb-0">
      <div className="max-w-5xl mx-auto py-2">
        <TicketSelectorCart tickets={availableTickets} />
      </div>
      {/* Panel flotante abajo a la derecha */}
      <div className={`fixed z-50 bg-white border border-blue-200 p-4 flex flex-col gap-3 w-full left-0 right-0 bottom-0 rounded-none shadow-none
        md:bottom-6 md:right-6 md:left-auto md:max-w-xs md:rounded-xl md:shadow-xl`}>
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
        {selectedNumbers.length == 0 && (
          <div className="flex flex-wrap gap-1 mb-1">
           <span className="bg-red-500 text-white px-2 py-1 rounded font-mono text-xs">NO HAY NÚMEROS SELECCIONADOS</span>
          </div>
        )}
        <div className="flex gap-2">
          <Button variant="outline" onClick={clearCart} disabled={selectedNumbers.length === 0} className="flex-1">Vaciar</Button>
          <Button disabled={selectedNumbers.length === 0} onClick={() => setShowModal(true)} className="flex-1">Ir al pago (contribución)</Button>
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