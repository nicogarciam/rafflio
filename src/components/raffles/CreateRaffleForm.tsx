import React, { useState } from 'react';
import { useRaffle } from '../../contexts/RaffleContext';
import { RaffleForm } from './RaffleForm';
import { Modal } from '../ui/Modal';
import { useNavigate } from 'react-router-dom';

export const CreateRaffleForm: React.FC = () => {
  const { addRaffle } = useRaffle();
  const [successModal, setSuccessModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (data: any) => {
    setErrorMsg(null);
    try {
      await addRaffle({ ...data, isActive: true });
      setSuccessModal(true);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Ocurrió un error al crear el bono contribución.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h2 className="text-3xl font-bold mb-8 flex items-center gap-2">Crear Nuevo Bono de Contribución</h2>
      {errorMsg && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{errorMsg}</div>
      )}
      <RaffleForm onSubmit={handleSubmit} />
      <Modal isOpen={successModal} onClose={() => { setSuccessModal(false); navigate('/admin/raffles'); }} title="¡Bono Contribución creado!" size="sm">
        <div className="py-4 text-center">
          <div className="mb-4 text-3xl text-green-600">🎉</div>
          <div className="text-lg font-medium mb-2">El bono contribución se creó correctamente.</div>
          <button
            className="mt-2 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            onClick={() => { setSuccessModal(false); navigate('/admin/raffles'); }}
          >
            Ir a la lista de bonos contribución
          </button>
        </div>
      </Modal>
    </div>
  );
};