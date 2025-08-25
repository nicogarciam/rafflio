import React from 'react';
import { Account, PriceTier } from '../../../types';
import { Button } from '../../ui/Button';
import { CreditCard, Phone, Copy, Send, Mail } from 'lucide-react';

interface BankTransferInfoProps {
  account: Account;
  selectedTier: PriceTier | null;
  raffleTitle: string;
  onBack: () => void;
  onComplete: () => void;
}

export const BankTransferInfo: React.FC<BankTransferInfoProps> = ({
  account,
  selectedTier,
  raffleTitle,
  onBack,
  onComplete,
}) => {
  const [copied, setCopied] = React.useState<string | null>(null);
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 1200);
  };

  return (
    <div className="text-center space-y-8">
      <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto shadow-lg">
        <CreditCard className="w-10 h-10 text-yellow-600" />
      </div>
      <div>
        <h3 className="text-2xl font-bold text-yellow-900 mb-3">
          ¡Compra registrada!
        </h3>
        <div className="mb-4">
          <div className="bg-yellow-50 border border-yellow-300 text-yellow-900 rounded px-4 py-3 text-base font-semibold mb-3 shadow-sm">
            <span className="font-bold">No cierres esta ventana hasta no realizar la transferencia.</span>
          </div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-left mb-4 shadow-sm">
          <div className="font-bold mb-3 text-lg text-gray-800 flex items-center gap-2">
            <Send className="w-5 h-5 text-blue-500" /> Pasos a seguir:
          </div>
          <ol className="space-y-5">
            <li className="flex items-start gap-3">
              <span className="mt-1"><Phone className="w-6 h-6 text-green-600" /></span>
              <div>
                <span className="font-semibold text-base">1° Hace click en el número de tel (teléfono) para informarnos la compra.</span>
                <div className="text-sm text-gray-700">Esto hará que ya te quede el contacto en el listado de WhatsApp.</div>
                {account.whatsapp && (
                  <a
                    href={`https://wa.me/${account.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      `Acabo de realizar una compra de ${selectedTier?.ticketCount} números por un monto de $${selectedTier?.amount?.toLocaleString('es-AR', { minimumFractionDigits: 2 })} para la rifa ${raffleTitle}. A la brevedad enviaré el comprobante de transferencia.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-700 underline hover:text-green-900 font-semibold block mt-1 text-lg"
                  >
                    {account.whatsapp}
                  </a>
                )}
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1"><Copy className="w-6 h-6 text-blue-700" /></span>
              <div>
                <span className="font-semibold text-base">2° Copia el alias o el CBU para realizar la transferencia.</span>
                <div className="ml-4 mt-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">CBU:</span>
                    <span className="font-mono text-base">{account.cbu}</span>
                    <button onClick={() => handleCopy(account.cbu, 'cbu')} className="ml-1 px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300">Copiar</button>
                    {copied === 'cbu' && <span className="text-green-600 text-xs ml-2 animate-pulse">¡Copiado!</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Alias:</span>
                    <span className="font-mono text-base">{account.alias}</span>
                    <button onClick={() => handleCopy(account.alias, 'alias')} className="ml-1 px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300">Copiar</button>
                    {copied === 'alias' && <span className="text-green-600 text-xs ml-2 animate-pulse">¡Copiado!</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Banco:</span>
                    <span className="text-base">{account.banco}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Titular:</span>
                    <span className="text-base">{account.titular}</span>
                  </div>
                </div>
                <div className="mt-2 text-base text-blue-900 font-semibold">Monto a transferir: <span className="font-mono">${selectedTier?.amount?.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span></div>
                <div className="text-base text-blue-900 font-semibold">Cantidad de números: <span className="font-mono">{selectedTier?.ticketCount}</span></div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1"><Send className="w-6 h-6 text-yellow-600" /></span>
              <div>
                <span className="font-semibold text-base">3° Envíanos tu transferencia.</span>
                <div className="text-sm text-gray-700">Si preferís compartirnos el comprobante por mail, hacelo a:</div>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="w-5 h-5 text-blue-700" />
                  <span className="font-semibold text-base">{account.email}</span>
                  <button onClick={() => handleCopy(account.email, 'email')} className="ml-1 px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300">Copiar</button>
                  {copied === 'email' && <span className="text-green-600 text-xs ml-2 animate-pulse">¡Copiado!</span>}
                </div>
              </div>
            </li>
          </ol>
        </div>
        <p className="text-gray-700 text-base mt-2">
          {selectedTier
            ? 'Una vez verificado el pago, recibirás un email con el enlace para seleccionar tus números.'
            : 'Una vez verificado el pago, recibirás un email confirmando la compra.'}
        </p>
      </div>
      <div className="flex space-x-4 pt-4">
        <Button onClick={onBack} variant="outline" className="flex-1 text-lg py-3">
          Volver
        </Button>
        <Button onClick={onComplete} className="flex-1 text-lg py-3">
          Finalizar
        </Button>
      </div>
    </div>
  );
};
