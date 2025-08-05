import React from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { TicketSelector } from '../components/tickets/TicketSelector';

interface PaymentParams {
  payment_id?: string;
  status?: string;
  external_reference?: string;
  merchant_order_id?: string;
}

export const PaymentSuccessPage: React.FC = () => {
  const { purchaseId: urlPurchaseId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Loguear todos los parámetros de la URL
  React.useEffect(() => {
    const paramsObj: Record<string, string | null> = {};
    for (const [key, value] of searchParams.entries()) {
      paramsObj[key] = value;
    }
    console.log('Parámetros de la URL:', {
      ...paramsObj,
      purchaseId: urlPurchaseId
    });
  }, [searchParams, urlPurchaseId]);

  // Get purchaseId from either URL path or external_reference query param
  const purchaseId = urlPurchaseId || searchParams.get('external_reference');

  // Get all payment params
  const paymentParams: PaymentParams = {
    payment_id: searchParams.get('payment_id') || undefined,
    status: searchParams.get('status') || undefined,
    external_reference: searchParams.get('external_reference') || undefined,
    merchant_order_id: searchParams.get('merchant_order_id') || undefined,
  };

  if (!purchaseId) {
    return (
      <div className="text-center py-16">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Error: No se encontró ID de compra
        </h3>
        <button 
          onClick={() => navigate('/')}
          className="mt-4 text-blue-600 hover:text-blue-800"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  return (
    <TicketSelector
      purchaseId={purchaseId}
      paymentInfo={paymentParams}
      onClose={() => navigate('/')}
    />
  );
};