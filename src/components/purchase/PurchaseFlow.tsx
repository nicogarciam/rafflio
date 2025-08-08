
import React, { useEffect, useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { useRaffle } from '../../contexts/RaffleContext';
import { Raffle, PriceTier } from '../../types';
import { CreditCard, User, Mail, Phone, Ticket } from 'lucide-react';
import { usePaymentStatus } from '../../hooks/usePaymentStatus';
import { mercadoPagoService } from '../../services/mercadopago';
import { CardPayment, initMercadoPago, Payment, Wallet } from '@mercadopago/sdk-react';
import { config } from '../../lib/config';
import { useNavigate } from 'react-router-dom';

interface PurchaseFlowProps {
  raffle: Raffle;
  isOpen: boolean;
  onClose: () => void;
  onPurchaseComplete: (purchaseId: string) => void;
}

export const PurchaseFlow: React.FC<PurchaseFlowProps> = ({
  raffle,
  isOpen,
  onClose,
  onPurchaseComplete
}) => {
  const [step, setStep] = useState(1);
  const [selectedTier, setSelectedTier] = useState<PriceTier | null>(null);
  const [userData, setUserData] = useState({
    fullName: '',
    email: '',
    phone: ''
  });
  const [preferenceId, setPreferenceId] = useState('');
  const [purchaseId, setPurchaseId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'approved' | 'failed' | 'rejected' | 'cancelled' | null>(null);

  const { createPurchase, updatePurchaseStatus, updatePurchasePreferenceId } = useRaffle();
  const navigate = useNavigate();

  const handleTierSelect = (tier: PriceTier) => {
    setSelectedTier(tier);
    setStep(2);
  };

  useEffect(() => {
    const mpPublicKey = config.mercadopago.publicKey;

    if (!window.MercadoPago) {
      initMercadoPago(mpPublicKey, {
        locale: 'es-AR',
      });
    } else {
      console.log('MercadoPago ya está inicializado');
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
      // No bloquear el flujo si falla el email
      console.error('No se pudo enviar el email con el enlace de compra', e);
    }
  }

  const handleUserDataSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTier) return;

    setLoading(true);
    setError(null); // Limpiar errores anteriores

    try {
      // Crear compra pendiente
      const purchase = await createPurchase({
        fullName: userData.fullName,
        email: userData.email,
        phone: userData.phone,
        tickets: [],
        status: 'pending',
        raffleId: raffle.id,
        priceTierId: selectedTier.id,
        preferenceId: ''
      });
      setPurchaseId(purchase.id);

      // Crear preferencia de MercadoPago
      try {
        const paymentData = {
          raffleId: raffle.id,
          priceTierId: selectedTier.id,
          userData: userData,
          amount: selectedTier.amount,
          ticketCount: selectedTier.ticketCount,
          raffleTitle: raffle.title
        };

        const preference = await mercadoPagoService.createPaymentPreference(paymentData, purchase.id);
        setPreferenceId(preference.id);

        await updatePurchasePreferenceId(purchase.id, preference.id);

        await sendPurchaseLinkEmail(purchase.email, purchase.id);

        // Modo producción - redirigir a MercadoPago
        console.log('🚀 Redirigiendo a MercadoPago:', preference.init_point);
        console.log('preference ID:', preferenceId);

        // openCheckout();
        // Abre la ventana de pago de MercadoPago
        window.open(preference.init_point, '_blank', 'noopener,noreferrer');
        setStep(3);

      } catch (paymentError) {
        console.error('Error creating payment preference:', paymentError);

        // Manejar errores específicos de configuración
        if (paymentError instanceof Error) {
          if (paymentError.message.includes('MercadoPago no está configurado')) {
            setError('MercadoPago no está configurado. Contacta al administrador.');
          } else if (paymentError.message.includes('substring')) {
            setError('Error de configuración de MercadoPago. Verifica las credenciales.');
          } else {
            setError('Error al procesar el pago. Intenta nuevamente.');
          }
        } else {
          setError('Error inesperado al procesar el pago.');
        }

        updatePurchaseStatus(purchase.id, 'failed');
        setLoading(false);
      }

    } catch (error) {
      console.error('Error processing purchase:', error);
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setSelectedTier(null);
    setUserData({ fullName: '', email: '', phone: '' });
    setError(null);
    setLoading(false);
    onClose();
  };

  // Suscribirse a actualizaciones de estado de pago
  usePaymentStatus(purchaseId, (data: any) => {
    setPaymentStatus(data.status);
    if (data.status === 'approved') {
      updatePurchaseStatus(data.purchaseId, 'paid');
      // Enviar email con el enlace de éxito
      if (userData.email && data.purchaseId) {
        sendPurchaseLinkEmail(userData.email, data.purchaseId);
      }
      onPurchaseComplete(data.purchaseId);
      setLoading(false);
    } else if (data.status === 'rejected' || data.status === 'cancelled' || data.status === 'failed') {
      updatePurchaseStatus(data.purchaseId, 'failed');
      setError('El pago fue rechazado o cancelado. Intenta nuevamente.');
      setLoading(false);
    }
  });

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Comprar Números" size="lg">
      <div className="cho-container" style={{ marginTop: 16 }}></div>
      {step === 1 && (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Selecciona tu paquete
            </h3>
            <p className="text-gray-600">
              Elige la cantidad de números que deseas comprar para {raffle.title}
            </p>
          </div>

          <div className="grid gap-4">
            {raffle.priceTiers.map((tier) => (
              <div
                key={tier.id}
                onClick={() => handleTierSelect(tier)}
                className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Ticket className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {tier.ticketCount} números
                      </h4>
                      <p className="text-sm text-gray-600">
                        ${(tier.amount / tier.ticketCount).toFixed(2)} por número
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">
                      ${tier.amount}
                    </p>
                    <p className="text-sm text-gray-500">Precio total</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Tus datos
            </h3>
            <p className="text-gray-600">
              Completa tus datos para proceder con el pago
            </p>
          </div>

          {selectedTier && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-blue-900">
                    {selectedTier.ticketCount} números seleccionados
                  </p>
                  <p className="text-sm text-blue-700">
                    para {raffle.title}
                  </p>
                </div>
                <p className="text-xl font-bold text-blue-900">
                  ${selectedTier.amount}
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleUserDataSubmit} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform w-4 h-4 text-gray-400" />
              <Input
                label="Nombre completo"
                value={userData.fullName}
                onChange={(e) => setUserData({ ...userData, fullName: e.target.value })}
                className="pl-10"
                required
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform  w-4 h-4 text-gray-400" />
              <Input
                label="Correo electrónico"
                type="email"
                value={userData.email}
                onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                className="pl-10"
                required
              />
            </div>

            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform w-4 h-4 text-gray-400" />
              <Input
                label="Teléfono"
                value={userData.phone}
                onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                className="pl-10"
                placeholder="+54 11 1234-5678"
                required
              />
            </div>

            <div className="flex space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1"
              >
                Volver
              </Button>
              <Button
                type="submit"
                loading={loading}
                className="flex-1"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                {loading ? 'Procesando...' : 'Proceder al Pago'}
              </Button>
            </div>
          </form>

        </div>
      )}

      {step === 3 && (
        <div className="text-center space-y-6">
          {paymentStatus !== 'approved' ? (
            <>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto animate-spin">
                <CreditCard className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-blue-900 mb-2">
                  Procesando tu pago...
                </h3>
                <p className="text-gray-600">
                  Estado actual: <span className="font-mono">{paymentStatus || 'pending'}</span>
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  No cierres esta ventana hasta que el pago sea confirmado.
                </p>
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                  <p>{error}</p>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CreditCard className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-green-900 mb-2">
                  ¡Pago Exitoso!
                </h3>
                <p className="text-gray-600">
                  Tu pago ha sido procesado correctamente. Ahora puedes seleccionar tus números.
                </p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                <p className="text-sm text-green-800">
                  <strong>Siguiente paso:</strong> Selecciona tus {selectedTier?.ticketCount} números de la suerte
                </p>
                <div className="flex flex-col md:flex-row md:items-center gap-2 mt-2">
                  <span className="text-xs text-green-900 break-all">
                    URL para elegir tus números:
                    <br />
                    <span className="font-mono select-all">{`${window.location.origin}/payment/${purchaseId}/success`}</span>
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/payment/${purchaseId}/success`);
                    }}
                  >
                    Copiar enlace
                  </Button>
                </div>
                <span className="text-xs text-gray-600">También recibirás este enlace por email.</span>
              </div>
              <Button onClick={handleClose} className="w-full mt-4">
                Continuar a Selección de Números
              </Button>
            </>
          )}
        </div>
      )}
    </Modal>
  );
};