import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRaffle } from '../contexts/RaffleContext';
import { RaffleForm } from '../components/raffles/RaffleForm';

export const EditRaffleView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getRaffleById, raffles, updateRaffle } = useRaffle();
  const [raffle, setRaffle] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      const found = getRaffleById(id);
      if (found) setRaffle(found);
    }
  }, [id, raffles]);

  if (!raffle) return <div>Loading...</div>;

  const handleSubmit = async (data: any) => {
    await updateRaffle(raffle.id, data);
    navigate('/admin/raffles');
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Edit Raffle</h1>
      <RaffleForm initialRaffle={raffle} isEdit onSubmit={handleSubmit} onCancel={() => navigate('/admin/raffles')} />
    </div>
  );
};
