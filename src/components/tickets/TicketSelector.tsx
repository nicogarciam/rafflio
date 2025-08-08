import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { useRaffle } from '../../contexts/RaffleContext';
import { CheckCircle, Circle, Lock, Sparkles, Mail, Wallet } from 'lucide-react';
import { mercadoPagoService } from '../../services/mercadopago';
import { sendConfirmationEmail, sendPurchaseLinkEmail } from '../../services/email.service';
import { Purchase, Ticket } from '../../types';
import { JSX } from 'react/jsx-runtime';

interface TicketSelectorProps {
  purchaseId: string;
  paymentInfo?: {
    payment_id?: string;
    status?: string;
    external_reference?: string;
    merchant_order_id?: string;
    preference_id?: string;
  };
  onClose: () => void;
}

export const TicketSelector: React.FC<TicketSelectorProps> = ({
  purchaseId, paymentInfo, onClose }) => {
  const { getPurchaseById, getRaffleById, updateTickets, updatePurchaseStatus } = useRaffle();
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [countdown, setCountdown] = useState(10);
  const [showSuccess, setShowSuccess] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [failedPaymentValidation, setFailedPaymentValidation] = useState(false);
  const [preferenceInitPoint, setPreferenceInitPoint] = useState<string | null>(null);
  const [showPreference, setShowPreference] = useState(false);
  const [preferenceError, setPreferenceError] = useState<string | null>(null);
  const [validationType, setValidationType] = useState<string>('');
  const [validationStep, setValidationStep] = useState<string>('');

  const raffle = purchase ? getRaffleById(purchase.raffleId) : null;
  const priceTier = raffle?.priceTiers.find(t => t.id === purchase?.priceTierId);
  const [maxSelections, setMaxSelections] = useState(0);

  useEffect(() => {
    let verificationTimer: NodeJS.Timeout;
    let countdownTimer: NodeJS.Timeout;
    let attempts = 0;
    let stopPolling = false;

    const fetchPurchaseAndPayment = async () => {
      setIsVerifying(true);
      setPaymentError(null);
      try {

        // 0. Consultar purchase
        setValidationType('Consultando compra...');
        setValidationStep('Buscando la compra en la base de datos');
        console.log(`🔍 Consultando compra con ID: ${purchaseId}`);
        const p = await getPurchaseById(purchaseId);
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (!p) {
          setPaymentError('No se encontró la compra solicitada');
          stopPolling = true;
          setIsVerifying(false);
          return;
        }
        setPurchase(p);
        console.log('Compra encontrada:', p);
        if (p.priceTier && p.priceTier.ticketCount) {
          setMaxSelections(p.priceTier.ticketCount);
        }
        
        if (p.status === 'paid' && p.tickets && p.tickets.length === p.priceTier?.ticketCount) {
        
          p.status = 'confirmed'; // Simular que ya está confirmada si tiene todos los tickets
          updatePurchaseStatus(p.id, 'confirmed');
        }

        // Si la compra ya está confirmada, mostrar mensaje y no permitir continuar
        if (p.status === 'confirmed') {
          setSelectedNumbers(p.tickets?.map(t => t.number) || []);
          setValidationType('Números ya seleccionados');
          setValidationStep('Ya has confirmado tus números para esta compra.');
          setIsVerifying(false);
          stopPolling = true;
          return;
        }





        setValidationType('Compra encontrada');
        setValidationStep('¡La compra fue encontrada correctamente!');

        // 0. Verificar paymentInfo antes de consultar la compra
        const paymentId = paymentInfo?.payment_id || p.paymentId;
        if (paymentId) {
          setValidationType('Validando pago recibido');
          setValidationStep('Consultando el pago en MercadoPago');
          const info = await mercadoPagoService.getPaymentInfo(paymentId);
          await new Promise(resolve => setTimeout(resolve, 1000));
          if (info.status === 'approved') {
            setIsVerifying(false);
            setPaymentError(null);
            setShowSuccess(true);
            stopPolling = true;
            return;
          }
        }

        // Si no se encontró pago aprobado, incrementar intentos
        setValidationType('No se encontró pago aprobado, reintentando...');
        setValidationStep('Esperando confirmación de pago');
        attempts++;
        console.log(`🔄 Intento ${attempts}: Pago aún no confirmado`);
        setFailedAttempts(attempts);
        setPaymentError('Pago aún no confirmado, reintentando en 10s...');
        setCountdown(10);

        await new Promise(resolve => setTimeout(resolve, 1000));

        if (attempts >= 3) {

          setValidationType('Consultando preferencia de pago');
          setValidationStep('Buscando el link de pago en MercadoPago');
          // Consultar preference con external_reference
          const preferenceId = p.preferenceId || paymentInfo?.preference_id;
          setFailedPaymentValidation(true);
          if (preferenceId) {
            try {
              console.log(`🔍 Consultando preferencia de pago con ID: ${preferenceId}`);
              await new Promise(resolve => setTimeout(resolve, 1000));
              const preference = await mercadoPagoService.getPreference(preferenceId);
              if (preference && preference.init_point) {
                setPreferenceInitPoint(preference.init_point);
                setShowPreference(true);
              } else {
                setPreferenceError('No se encontró la preferencia de pago.');
              }
            } catch (err) {
              setPreferenceError('No se pudo consultar la preferencia.');
            }
          } else {
            setPreferenceError('No se encontró referencia de pago para mostrar el link.');
          }
          setIsVerifying(false);
          stopPolling = true;
          return;
        }
      } catch (error: any) {
        setValidationType('Error en la validación');
        setValidationStep('Ocurrió un error al validar el pago');
        setPaymentError(error.message || 'Error al verificar el pago');
        setIsVerifying(false);
        stopPolling = true;
      }
    };

    // Polling cada 10s hasta éxito o 3 intentos
    const startPolling = () => {
      countdownTimer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            return 10;
          }
          return prev - 1;
        });
      }, 1000);

      verificationTimer = setInterval(() => {
        if (!stopPolling && !showSuccess && !showPreference && !preferenceError) {
          fetchPurchaseAndPayment();
        } else {
          clearInterval(verificationTimer);
          clearInterval(countdownTimer);
        }
      }, 5000);
    };

    startPolling();
    return () => {
      if (verificationTimer) clearInterval(verificationTimer);
      if (countdownTimer) clearInterval(countdownTimer);
    };
  }, [purchaseId, paymentInfo, getPurchaseById]);

  const handleNumberClick = (ticket: Ticket) => {
    if (selectedNumbers.includes(ticket.number)) {
      setSelectedNumbers(selectedNumbers.filter(n => n !== ticket.number));
    } else if (selectedNumbers.length < maxSelections) {
      setSelectedNumbers([...selectedNumbers, ticket.number]);
    }
  };

  const handleConfirmSelection = async () => {
    if (selectedNumbers.length !== maxSelections || !raffle) return;

    setLoading(true);

    try {
      // Obtener los IDs de los tickets seleccionados
      const selectedTicketIds = raffle.tickets
        .filter(t => selectedNumbers.includes(t.number))
        .map(t => t.id);

      // Guardar los IDs de los tickets seleccionados en la base de datos
      await updateTickets(purchaseId, selectedTicketIds);

      console.log('Tickets seleccionados guardados:', selectedTicketIds);
      console.log('MaxSelections:', maxSelections);
      if (maxSelections === selectedTicketIds.length) {
        await updatePurchaseStatus(purchaseId, 'confirmed');
        const updatedPurchase = await getPurchaseById(purchaseId);
        setPurchase(updatedPurchase);
        // Enviar email de selección de números y premios
        if (updatedPurchase?.email && raffle) {
          try {
            console.log('Enviando email de confirmación a:', updatedPurchase.email);
            await sendConfirmationEmail(
              updatedPurchase.email,
              purchaseId,
              selectedNumbers,
              raffle.prizes
            );
            setEmailSent(true);
          } catch (err) {
            console.error('Error enviando email de confirmación:', err);
          }
        }
      }
      setLoading(false);
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

    const tickets: JSX.Element[] = [];

    raffle.tickets.forEach(ticket => {
      const status = getTicketStatus(ticket.number);
      // Render each ticket button

      tickets.push(
        <button
          key={ticket.id}
          onClick={() => handleNumberClick(ticket)}
          disabled={status === 'sold' || (status === 'available' && selectedNumbers.length >= maxSelections)}
          className={`
            w-10 h-10 m-2 text-xs font-medium rounded border transition-all duration-150
            ${status === 'available'
              ? 'bg-green-100 border-green-300 text-green-800 hover:bg-green-200 hover:scale-105'
              : status === 'selected'
                ? 'bg-blue-500 border-blue-600 text-white shadow-lg scale-105'
                : 'bg-red-100 border-red-300 text-red-600 cursor-not-allowed'
            }
            ${status === 'available' && selectedNumbers.length >= maxSelections ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {ticket.number}
        </button>
      );
    });

    return tickets;
  };

  // Mostrar loading mientras verifica
  // Mostrar loading con countdown mientras verifica
  if ((isVerifying && paymentError) || (isVerifying && validationType)) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="mx-auto mb-2 flex items-center justify-center">
          <Wallet className="w-10 h-10 text-blue-500 wallet-spin" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Verificando Pago</h3>
          <p className="text-blue-700 font-semibold">{validationType}</p>
          <p className="text-gray-700">{validationStep}</p>
          <p className="text-gray-600">{paymentError}</p>
          <p className="text-sm text-gray-500 mt-2">
            Próximo intento en: <span className="font-mono text-blue-600">{countdown}s</span>
          </p>
        </div>
        <button
          onClick={onClose}
          className="mt-4 text-gray-600 hover:text-gray-800 underline"
        >
          Cerrar y volver más tarde
        </button>
      </div>
    );
  }

  // Si la compra ya está confirmada, mostrar mensaje y los números seleccionados
  if (purchase && purchase.status === 'confirmed') {
    return (
      <div className="text-center py-8 space-y-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <div>
          <h3 className="text-2xl font-semibold text-green-900 mb-2">
            Números ya seleccionados
          </h3>
          <p className="text-gray-600 mb-4">
            Ya has confirmado tus números para esta compra. Si tienes dudas, revisa tu email ({purchase.email}).
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-sm text-green-800 mb-2">
              <strong>Números seleccionados:</strong>
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {purchase.tickets?.map(t => (
                <span
                  key={t.id}
                  className="bg-green-500 text-white px-2 py-1 rounded font-medium text-sm"
                >
                  {t.number}
                </span>
              ))}
            </div>
          </div>
        </div>
        <Button onClick={onClose} className="w-full max-w-md">
          Finalizar
        </Button>
      </div>
    );
  }

  // Mostrar loading inicial
  if (isVerifying) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="mx-auto mb-2 flex items-center justify-center">
          <Wallet className="w-10 h-10 text-blue-500 wallet-spin" />
        </div>
        <p className="text-blue-700 font-semibold">{validationType || 'Verificando el estado del pago...'}</p>
        <p className="text-gray-700">{validationStep || 'Iniciando validación...'}</p>
        <p className="text-gray-600">Verificando el estado del pago...</p>
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
            <strong>Confirmación enviada:</strong> Revisa tu email ({purchase?.email ?? ''}) para ver todos los detalles de tu compra.
          </p>
        </div>

        <Button onClick={onClose} className="w-full max-w-md">
          Finalizar
        </Button>
      </div>
    );
  }

  // Pantalla de pago exitoso
  if (showSuccess) {
    return (
      <div className="text-center py-12 space-y-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-green-900">¡Pago Exitoso!</h2>
        <p className="text-gray-700 text-lg max-w-md mx-auto">
          Tu pago fue confirmado correctamente. Ahora puedes seleccionar tus números de la suerte para participar en la rifa.
        </p>
        <Button
          className="w-full max-w-xs mx-auto"
          onClick={() => setShowSuccess(false)}
        >
          Seleccionar Números
        </Button>
      </div>
    );
  }

  // Pantalla de error tras 3 intentos
  if (!isVerifying && failedPaymentValidation) {
    const isDev = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'dev';
    return (
      <div className="text-center py-12 space-y-8">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <Lock className="w-12 h-12 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-red-900">No se pudo encontrar tu pago</h2>
        <p className="text-gray-700 text-lg max-w-md mx-auto">
          No se encontró un pago aprobado tras varios intentos. Por favor, verifica tu pago o intenta nuevamente.
        </p>
        <div className="flex flex-col items-center gap-4 mt-4">
          {preferenceInitPoint && (
            <a
              href={preferenceInitPoint}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
            >
              Ir al link de pago
            </a>
          )}
          <Button className="w-full max-w-xs mx-auto" onClick={onClose}>
            Cerrar
          </Button>
          {isDev && (
            <Button className="w-full max-w-xs mx-auto" variant="outline"
              onClick={() => {
                setShowSuccess(true);
                setFailedPaymentValidation(false);
              }}>
              Continuar con la selección de números (DEV)
            </Button>
          )}
        </div>
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
                <p className="font-medium text-gray-900">{raffle?.title}</p>
                <p className="text-sm text-gray-600">Comprador: {purchase?.fullName}</p>
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

/* Agregar animación lenta para Wallet */
/* Mueve estas reglas a tu archivo CSS global o usa una solución CSS-in-JS */