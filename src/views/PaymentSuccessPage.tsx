import React from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { TicketSelector } from '../components/tickets/TicketSelector';
import { mercadoPagoService } from '../services/mercadopago';
import { raffleService } from '../services/raffle.service';
import { purchaseService } from '../services/purchase.service';
import { useRaffle } from '../contexts/RaffleContext';

interface PaymentParams {
  payment_id?: string;
  status?: string;
  external_reference?: string;
  merchant_order_id?: string;
  preference_id?: string;
}

export const PaymentSuccessPage: React.FC = () => {
  const { purchaseId: urlPurchaseId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const { getPurchaseById, getRaffleById, updateTickets, updatePurchaseStatus } = useRaffle();

  // Get purchaseId from either URL path or external_reference query param
  const purchaseId = urlPurchaseId || searchParams.get('external_reference');
  // Get all payment params
  const paymentParams: PaymentParams = {
    payment_id: searchParams.get('payment_id') || undefined,
    status: searchParams.get('status') || undefined,
    external_reference: searchParams.get('external_reference') || undefined,
    merchant_order_id: searchParams.get('merchant_order_id') || undefined,
    preference_id: searchParams.get('preference_id') || undefined,
  };


  // Loguear todos los parámetros de la URL
  React.useEffect(() => {

    const verifyAndUpdatePurchase = async () => {
      if (!purchaseId || !paymentParams.payment_id) {
        setLoading(false);
        return;
      }
      try {
        const p = await getPurchaseById(purchaseId);
        if (p?.status === 'confirmed') {
          setLoading(false);
          return;
        } 
        

        if (p?.paymentMethod !== 'mercadopago') {
          setLoading(false);
          return;
        }

        const paymentMP = await mercadoPagoService.getPaymentInfo(paymentParams.payment_id);
        

        if (paymentMP && paymentMP.status === 'approved') {
          // Actualizar el purchase en la base de datos
          await purchaseService.updatePurchaseStatusAndPayment(purchaseId, 'paid', paymentParams.payment_id);
          if (paymentParams.preference_id) {
            await purchaseService.updatePurchasePreferenceId(purchaseId, paymentParams.preference_id);
          }
        } else {
          setError('El pago no fue aprobado o no se pudo verificar.');
        }
      } catch (err) {
        setError('Error al verificar el pago.');
      } finally {
        setLoading(false);
      }
    };
    verifyAndUpdatePurchase();
  }, [purchaseId, paymentParams.payment_id, paymentParams.preference_id]);


  // Get all payment params
  /*   {
      "collection_id": "121153036802",
      "collection_status": "approved",
      "payment_id": "121153036802",
      "status": "approved",
      "external_reference": "14018284-779f-42b5-80e0-b5f17d552a33",
      "payment_type": "account_money",
      "merchant_order_id": "32942451631",
      "preference_id": "54486551-5c1212f5-d6fd-4240-8616-028a935642ce",
      "site_id": "MLA",
      "processing_mode": "aggregator",
      "merchant_account_id": "null",
      "purchaseId": "14018284-779f-42b5-80e0-b5f17d552a33"
  } */

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