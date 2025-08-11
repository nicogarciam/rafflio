import React from 'react';
import { useRaffle } from '../contexts/RaffleContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export const AdminRafflesView: React.FC = () => {
  const { raffles, isLoading, error, updateRaffle } = useRaffle();
  const navigate = useNavigate();

  const handleEdit = (id: string) => {
    navigate(`/admin/raffles/edit/${id}`);
  };

  const handleToggle = async (raffle: any) => {
    await updateRaffle(raffle.id, { isActive: !raffle.isActive });
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Raffles Admin</h1>
      {isLoading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      <Button onClick={() => navigate('/admin/raffles/new')}>New Raffle</Button>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {raffles.map(raffle => (
          <Card key={raffle.id} className="p-4 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <div className="font-semibold text-lg">{raffle.title}</div>
              <Button size="sm" variant="outline" onClick={() => handleEdit(raffle.id)}>Edit</Button>
            </div>
            <div className="text-gray-600">{raffle.description}</div>
            <div className="flex items-center gap-2 mt-2">
              <span className={raffle.isActive ? 'text-green-600' : 'text-gray-400'}>
                {raffle.isActive ? 'Active' : 'Inactive'}
              </span>
              <label className="inline-flex items-center cursor-pointer ml-2">
                <input type="checkbox" checked={raffle.isActive} onChange={() => handleToggle(raffle)} className="form-checkbox h-5 w-5 text-blue-600" />
                <span className="ml-2">Toggle</span>
              </label>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
