import React from 'react';
import { CreditCard } from 'lucide-react';
export type PaymentMethod = 'bank_transfer' | 'cash' | 'mercadopago';

import { PriceTier } from '../../../types';

interface PurchasePaymentMethodSelectorProps {
    paymentMethod: PaymentMethod | null;
    onSelect: (method: PaymentMethod) => void;
    onNext: () => void;
    onBack: () => void;
    selectedTier?: PriceTier | null;
}

export const PurchasePaymentMethodSelector: React.FC<PurchasePaymentMethodSelectorProps> = ({ paymentMethod, onSelect, onNext, onBack, selectedTier }) => {
    return (
        <div className="space-y-6">
            <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Selecciona el método de pago
                </h3>
                <p className="text-gray-600">Elige cómo deseas abonar tu compra</p>
                {selectedTier && (
                    <div className="mt-4 inline-flex items-center gap-8 bg-blue-50 border border-blue-200 rounded-lg px-8 py-4 justify-center">
                        <div className="flex flex-col items-center">
                            <span className="font-semibold text-blue-900 text-base mb-1">Paquete seleccionado</span>
                            <span className="text-blue-900 font-bold text-lg">{selectedTier.ticketCount} números</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-green-700 font-extrabold text-4xl leading-none">${selectedTier.amount}</span>
                            <span className="text-xs text-gray-500 mt-1">{(selectedTier.amount / selectedTier.ticketCount).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })} por número</span>
                        </div>
                    </div>
                )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                    className={`border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 ${paymentMethod === 'mercadopago' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-400'}`}
                    onClick={() => onSelect('mercadopago')}
                >
                    <div className="flex flex-col items-center">
                        <CreditCard className="w-8 h-8 text-blue-600 mb-2" />
                        <span className="font-semibold">MercadoPago</span>
                        <span className="text-xs text-gray-500 mt-1">Tarjeta, débito, QR, etc.</span>
                    </div>
                </div>
                <div
                    className={`border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 ${paymentMethod === 'bank_transfer' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200 hover:border-yellow-400'}`}
                    onClick={() => onSelect('bank_transfer')}
                >
                    <div className="flex flex-col items-center">
                        <CreditCard className="w-8 h-8 text-yellow-600 mb-2" />
                        <span className="font-semibold">Transferencia</span>
                        <span className="text-xs text-gray-500 mt-1">CBU, Alias, Banco</span>
                    </div>
                </div>
                <div
                    className={`border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 ${paymentMethod === 'cash' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-400'}`}
                    onClick={() => onSelect('cash')}
                >
                    <div className="flex flex-col items-center">
                        <CreditCard className="w-8 h-8 text-green-600 mb-2" />
                        <span className="font-semibold">Contado</span>
                        <span className="text-xs text-gray-500 mt-1">Pago en mano</span>
                    </div>
                </div>
            </div>
            <div className="flex space-x-4 pt-6">
                <button
                    type="button"
                    onClick={onBack}
                    className="flex-1 border border-gray-300 rounded py-2 hover:bg-gray-50"
                >
                    Volver
                </button>
                <button
                    type="button"
                    className={`flex-1 rounded py-2 text-white ${!paymentMethod ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                    disabled={!paymentMethod}
                    onClick={onNext}
                >
                    Siguiente
                </button>
            </div>
        </div>
    );
};
