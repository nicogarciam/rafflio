import React, { useEffect, useState } from 'react';
import { useCart } from '../../contexts/CartContext';
import { useRaffle } from '../../contexts/RaffleContext';
import { usePaymentStatus } from '../../hooks/usePaymentStatus';
import { config } from '../../lib/config';
import { mercadoPagoService } from '../../services/mercadopago';
import { PriceTier, Raffle } from '../../types';
import { Modal } from '../ui/Modal';
import { PaymentMethod, PurchasePaymentMethodSelector } from './PurchaseFlow/PurchasePaymentMethodSelector';
import { PurchasePaymentStep } from './PurchaseFlow/PurchasePaymentStep';
import { PurchaseTierSelector } from './PurchaseFlow/PurchaseTierSelector';
import { PurchaseUserForm } from './PurchaseFlow/PurchaseUserForm';


interface PurchaseFlowProps {
  raffle: Raffle;
  isOpen: boolean;
  onClose: () => void;
  onPurchaseComplete: (purchaseId: string) => void;
  initialTier?: PriceTier | null;
}

export const PurchaseFlow: React.FC<PurchaseFlowProps> = ({
  raffle,
  isOpen,
  onClose,
  onPurchaseComplete,
  initialTier = null
}) => {
  const [step, setStep] = useState(1);
  const [selectedTier, setSelectedTier] = useState<PriceTier | null>(initialTier);
  const [userData, setUserData] = useState({ fullName: '', email: '', phone: '' });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [purchaseId, setPurchaseId] = useState('');
  const [preferenceId, setPreferenceId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'approved' | 'failed' | 'rejected' | 'cancelled' | null>(null);

  const { updateTickets } = useRaffle();
  const { selectedNumbers, clearCart } = useCart();

  const { createPurchase, updatePurchaseStatus, updatePurchasePreferenceId } = useRaffle();


  useEffect(() => {
    /* console.log('PurchaseFlow isOpen changed:', isOpen, 'initialTier:', initialTier); */

    if (initialTier) {
      setSelectedTier(initialTier);
      setStep(2); // SIEMPRE empezar en el paso de datos del comprador
    } else {
      setSelectedTier(null);
      setStep(1);
    }

  }, [isOpen]);

  useEffect(() => {
    const mpPublicKey = config.mercadopago.publicKey;
    if (!window.MercadoPago) {
      // @ts-ignore
      if (typeof window !== 'undefined') {
        import('@mercadopago/sdk-react').then(({ initMercadoPago }) => {
          initMercadoPago(mpPublicKey, { locale: 'es-AR' });
        });
      }
    }
  }, []);

  async function sendPurchaseLinkEmail(to: string, purchaseId: string) {
    try {
      await fetch('/api/send-purchase-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, purchaseId }),
      });
    } catch (e) {
      console.error('No se pudo enviar el email con el enlace de compra', e);
    }
  }

  // Paso 1: Selección de paquete
  const handleTierSelect = (tier: PriceTier) => {
    setSelectedTier(tier);
    setStep(2);
  };

  // Paso 2: Datos del usuario
  const handleUserFormNext = () => {
    setStep(3);
  };
  const handleUserFormBack = () => {
    setStep(1);
  };

  const handlePaymentMethodBack = () => {
    setStep(2);
  };

  const handlePaymentStepBack = () => {
    setStep(3);
  };
  // Crear compra y manejar pago
  const handleCreatePurchase = async () => {
    if (!selectedTier || !paymentMethod) return;
    setLoading(true);
    setError(null);
    /* console.log('selected Tier:', selectedTier); */
    try {
      const purchaseData: Omit<import('../../types').Purchase, "id" | "paymentId" | "createdAt"> = {
        fullName: userData.fullName,
        email: userData.email,
        phone: userData.phone,
        raffleId: raffle.id,
        priceTierId: selectedTier.id === 'custom' ? 'custom' : selectedTier.id,
        amount: selectedTier.amount,
        ticketCount: selectedTier.ticketCount,
        preferenceId: '',
        status: 'pending',
        tickets: [],
        paymentMethod: paymentMethod
      };
      /* console.log('Creating purchase with data:', purchaseData); */
      const purchase = await createPurchase(purchaseData);
      setPurchaseId(purchase.id);
      // Asignar tickets como vendidos y dejar compra pendiente
      if (selectedNumbers && selectedNumbers.length > 0) {
        await updateTickets(purchase.id, selectedNumbers.map(t => t.id));
        clearCart();
      }
      if (paymentMethod === 'mercadopago') {
        // Crear preferencia de MercadoPago
        const paymentData = {
          raffleId: raffle.id,
          priceTierId: selectedTier?.id ?? null,
          userData: userData,
          amount: selectedTier.amount,
          ticketCount: selectedTier.ticketCount,
          raffleTitle: raffle.title
        };
        const preference = await mercadoPagoService.createPaymentPreference(paymentData, purchase.id);
        setPreferenceId(preference.id);
        await updatePurchasePreferenceId(purchase.id, preference.id);
        await sendPurchaseLinkEmail(purchase.email, purchase.id);
        window.open(preference.init_point, '_blank', 'noopener,noreferrer');
      }
      setLoading(false);
      setStep(4);
    } catch (err: any) {
      setError('Error al procesar la compra. Intenta nuevamente.');
      setLoading(false);
    }
  };

  const handlePaymentStepComplete = () => {
    /* console.log('Purchase completed or modal closed'); */
    setStep(1);
    setSelectedTier(null);
    setUserData({ fullName: '', email: '', phone: '' });
    setPaymentMethod(null);
    setPurchaseId('');
    setPreferenceId('');
    setError(null);
    setLoading(false);
    onClose();
  };

  // Suscribirse a actualizaciones de estado de pago
  usePaymentStatus(purchaseId, (data: any) => {
    /* console.log('Payment status update received:', data); */
    setPaymentStatus(data.status);
    if (data.status === 'approved') {
      updatePurchaseStatus(data.purchaseId, 'paid');
      if (userData.email && data.purchaseId) {
        sendPurchaseLinkEmail(userData.email, data.purchaseId);
      }
      /* onPurchaseComplete(data.purchaseId); */
      setLoading(false);
    } else if (data.status === 'rejected' || data.status === 'cancelled' || data.status === 'failed') {
      updatePurchaseStatus(data.purchaseId, 'failed');
      setError('El pago fue rechazado o cancelado. Intenta nuevamente.');
      setLoading(false);
    }
  });

  return (
    <Modal isOpen={isOpen} onClose={handlePaymentStepComplete} title="Comprar Números" size="lg">
      <div className="cho-container" style={{ marginTop: 16 }}></div>
      {step === 1 && (
        <PurchaseTierSelector
          raffle={raffle}
          selectedTier={selectedTier}
          onSelect={handleTierSelect}
        />
      )}
      {step === 2 && (
        <PurchaseUserForm
          userData={userData}
          onChange={setUserData}
          onNext={handleUserFormNext}
          onBack={handleUserFormBack}
          error={error}
        />
      )}
      {step === 3 && (
        <PurchasePaymentMethodSelector
          paymentMethod={paymentMethod}
          onSelect={setPaymentMethod}
          onNext={handleCreatePurchase}
          onBack={handlePaymentMethodBack}
          selectedTier={selectedTier}
        />
      )}
      {step === 4 && paymentMethod && (
        <PurchasePaymentStep
          paymentMethod={paymentMethod}
          selectedTier={selectedTier}
          userData={userData}
          onBack={handlePaymentStepBack}
          onComplete={handlePaymentStepComplete}
          account={raffle.account}
          paymentStatus={paymentStatus}
          error={error}
          purchaseId={purchaseId}
          loading={loading}
          raffleTitle={raffle.title}
        />
      )}
    </Modal>
  );
};
