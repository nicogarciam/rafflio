import React from 'react';
import { useRaffle } from '../../contexts/RaffleContext';
import { RaffleForm } from './RaffleForm';

export const CreateRaffleForm: React.FC = () => {
  const { addRaffle } = useRaffle();
  const handleSubmit = async (data: any) => {
    await addRaffle({ ...data, isActive: true });
    // Redirigir o mostrar mensaje de éxito aquí si se desea
  };
  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">Create New Raffle</h1>
      <RaffleForm onSubmit={handleSubmit} />
    </div>
  );
};