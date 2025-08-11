import React from 'react';
import { User, Mail, Phone } from 'lucide-react';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';

interface PurchaseUserFormProps {
  userData: { fullName: string; email: string; phone: string };
  onChange: (data: { fullName: string; email: string; phone: string }) => void;
  onNext: () => void;
  onBack: () => void;
  error?: string | null;
}

export const PurchaseUserForm: React.FC<PurchaseUserFormProps> = ({ userData, onChange, onNext, onBack, error }) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Tus datos
        </h3>
        <p className="text-gray-600">
          Completa tus datos para continuar
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          <p>{error}</p>
        </div>
      )}

      <form
        onSubmit={e => {
          e.preventDefault();
          onNext();
        }}
        className="space-y-4"
      >
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform w-4 h-4 text-gray-400" />
          <Input
            label="Nombre completo"
            value={userData.fullName}
            onChange={e => onChange({ ...userData, fullName: e.target.value })}
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
            onChange={e => onChange({ ...userData, email: e.target.value })}
            className="pl-10"
            required
          />
        </div>

        <div className="relative">
          <Phone className="absolute left-3 top-1/2 transform w-4 h-4 text-gray-400" />
          <Input
            label="Teléfono"
            value={userData.phone}
            onChange={e => onChange({ ...userData, phone: e.target.value })}
            className="pl-10"
            placeholder="+54 11 1234-5678"
            required
          />
        </div>

        <div className="flex space-x-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="flex-1"
          >
            Volver
          </Button>
          <Button
            type="submit"
            className="flex-1"
          >
            Siguiente
          </Button>
        </div>
      </form>
    </div>
  );
};
