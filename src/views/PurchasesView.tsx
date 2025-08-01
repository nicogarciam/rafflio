import React, { useState } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { ShoppingCart } from 'lucide-react';
import { Raffle } from '../types';
import { config } from '../lib/config';

interface Props {
  purchases: any[];
  raffles: Raffle[];
}

export const PurchasesView: React.FC<Props> = ({ purchases, raffles }) => {
  const [loadingInfo, setLoadingInfo] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchPaymentInfo = async (paymentId: string) => {
    try {
      setLoadingInfo(paymentId);
      const res = await fetch(`${config.app.apiUrl}/payment/payment-info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId }),
      });
      if (!res.ok) throw new Error('Error fetching payment info');
      const data = await res.json();
      alert(JSON.stringify(data, null, 2));
    } catch (err) {
      console.error('Error fetching payment info:', err);
      alert('Error al obtener información de pago');
    } finally {
      setLoadingInfo(null);
    }
  };

  // Filtrar compras por rifa, nombre o preferenceId
  const filteredPurchases = purchases.filter(purchase => {
    const raffle = raffles.find(r => r.id === purchase.raffleId);
    const searchLower = search.toLowerCase();
    return (
      (raffle?.title?.toLowerCase().includes(searchLower) || '') ||
      (purchase.fullName?.toLowerCase().includes(searchLower) || '') ||
      (purchase.preferenceId?.toLowerCase().includes(searchLower) || '')
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Gestión de Compras
        </h1>
        <p className="text-gray-600">
          Monitorea todas las compras y selecciones de números
        </p>
      </div>
      <div className="mb-4">
        <input
          type="text"
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
          placeholder="Buscar por rifa, nombre o Preference ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <div className="grid gap-6">
        {filteredPurchases.map(purchase => {
          const raffle = raffles.find(r => r.id === purchase.raffleId);
          const tier = raffle?.priceTiers.find(t => t.id === purchase.priceTierId);
          return (
            <Card key={purchase.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-gray-900">
                      {purchase.fullName}
                    </h3>
                    <p className="text-sm text-gray-600">{purchase.email}</p>
                    <p className="text-sm text-gray-600">{raffle?.title}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(purchase.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      purchase.status === 'paid' 
                        ? 'bg-green-100 text-green-800'
                        : purchase.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {purchase.status === 'paid' ? 'Pagado' : 
                        purchase.status === 'pending' ? 'Pendiente' : 'Fallido'}
                    </div>
                    <p className="font-semibold text-gray-900">
                      ${tier?.amount?.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {tier?.ticketCount} números
                    </p>
                    {purchase.tickets.length > 0 && (
                      <p className="text-xs text-blue-600">
                        Números seleccionados: {purchase.tickets.map((t: { number: any; }) => t.number).join(', ')}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">Payment ID: {purchase.paymentId || 'N/A'}</p>
                    <p className="text-xs text-gray-500">Preference ID: {purchase.preferenceId || 'N/A'}</p>
                    <button
                      className="text-blue-600 text-xs underline"
                      disabled={!purchase.paymentId || loadingInfo === purchase.paymentId}
                      onClick={() => purchase.paymentId && fetchPaymentInfo(purchase.paymentId)}
                    >
                      {loadingInfo === purchase.paymentId ? 'Cargando...' : 'Ver info de pago'}
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filteredPurchases.length === 0 && (
          <div className="text-center py-16">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No hay compras registradas
            </h3>
            <p className="text-gray-600">
              Las compras aparecerán aquí cuando los usuarios participen en las rifas.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchasesView;