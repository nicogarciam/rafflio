import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Account } from '../../types';

// Puedes reemplazar esto por un fetch real a la API o Supabase
const getActualAccount = async (): Promise<Account> => {
  // Simulación: deberías traer esto de la base de datos
  return {
    id: '',
    cbu: '',
    alias: '',
    titular: '',
    banco: '',
    email: '',
    whatsapp: '',
  };
};

const saveAccount = async (account: Account) => {
  // Simulación: deberías guardar esto en la base de datos
  return true;
};

export const AdminCuentaConfig: React.FC = () => {
  const [cuenta, setCuenta] = useState<Account | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    getActualAccount().then(setCuenta);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!cuenta) return;
    setCuenta({ ...cuenta, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cuenta) return;
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await saveAccount(cuenta);
      setSuccess(true);
    } catch (err) {
      setError('Error al guardar los datos de la cuenta');
    } finally {
      setLoading(false);
    }
  };

  if (!cuenta) return <div>Cargando datos de la cuenta...</div>;

  return (
    <Card className="max-w-lg mx-auto mt-8">
      <CardHeader>
        <CardTitle>Configuración de Cuenta Bancaria</CardTitle>
        <p className="text-gray-600 text-sm">Estos datos se mostrarán a los compradores para transferencias.</p>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input label="CBU" name="cbu" value={cuenta.cbu} onChange={handleChange} required />
          <Input label="Alias" name="alias" value={cuenta.alias} onChange={handleChange} required />
          <Input label="Titular" name="titular" value={cuenta.titular} onChange={handleChange} required />
          <Input label="Banco" name="banco" value={cuenta.banco} onChange={handleChange} required />
          <Input label="Email" name="email" value={cuenta.email} onChange={handleChange} required />
          <Input label="WhatsApp" name="whatsapp" value={cuenta.whatsapp} onChange={handleChange} required />
          {error && <div className="text-red-600 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">¡Datos guardados correctamente!</div>}
          <Button type="submit" loading={loading} className="w-full">Guardar</Button>
        </form>
      </CardContent>
    </Card>
  );
};
