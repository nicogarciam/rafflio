import React from 'react';
import { Account, PriceTier } from '../../../types';
import { PaymentMethod } from './PurchasePaymentMethodSelector';
import { Button } from '../../ui/Button';
import { CreditCard } from 'lucide-react';

interface PurchasePaymentStepProps {
    paymentMethod: PaymentMethod;
    selectedTier: PriceTier | null;
    userData: { fullName: string; email: string; phone: string };
    onBack: () => void;
    onComplete: () => void;
    account?: Account | null;
    paymentStatus?: string | null;
    error?: string | null;
    purchaseId?: string;
    loading?: boolean;
}

export const PurchasePaymentStep: React.FC<PurchasePaymentStepProps> = ({
    paymentMethod,
    selectedTier,
    userData,
    onBack,
    onComplete,
    account,
    paymentStatus,
    error,
    purchaseId,
    loading
}) => {
    // Render según método de pago
    if (paymentMethod === 'mercadopago') {
        return (
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
                        <Button onClick={onBack} variant="outline" className="w-full mt-4">
                            Volver
                        </Button>
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
                        <Button onClick={onComplete} className="w-full mt-4">
                            Continuar a Selección de Números
                        </Button>
                    </>
                )}
            </div>
        );
    }

    if (paymentMethod === 'bank_transfer') {
        return (
            <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                    <CreditCard className="w-8 h-8 text-yellow-600" />
                </div>
                <div>
                    <h3 className="text-xl font-semibold text-yellow-900 mb-2">
                        ¡Compra registrada!
                    </h3>
                    <p className="text-gray-600">
                        Por favor, realiza la transferencia y envía el comprobante a <strong>{account?.email}</strong> o WhatsApp <strong>{account?.whatsapp}</strong>.<br />
                        Una vez verificado el pago, recibirás un email con el enlace para seleccionar tus números.
                    </p>
                </div>
                <div className="flex space-x-4 pt-4">
                    <Button onClick={onBack} variant="outline" className="flex-1">
                        Volver
                    </Button>
                    <Button onClick={onComplete} className="flex-1">
                        Finalizar
                    </Button>
                </div>
            </div>
        );
    }

    // cash
    return (
        <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CreditCard className="w-8 h-8 text-green-600" />
            </div>
            <div>
                <h3 className="text-xl font-semibold text-green-900 mb-2">
                    ¡Compra registrada!
                </h3>
                <p className="text-gray-600">
                    Indique al vendedor que actualice su compra tras el pago. Recibirá un email con el enlace para seleccionar sus números.
                </p>
            </div>
            <div className="flex space-x-4 pt-4">
                <Button onClick={onBack} variant="outline" className="flex-1">
                    Volver
                </Button>
                <Button onClick={onComplete} className="flex-1">
                    Finalizar
                </Button>
            </div>
        </div>
    );
};
