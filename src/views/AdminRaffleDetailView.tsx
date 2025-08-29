import React, { useEffect, useState } from 'react';
import AdminRaffleDetail from '../components/admin/AdminRaffleDetail';
import { useParams, Link } from 'react-router-dom';
import { useRaffle } from '../contexts/RaffleContext';

const AdminRaffleDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { raffles, getRaffleById, getPurchasesByRaffleId } = useRaffle();
  const [raffle, setRaffle] = useState<any>(null);
  const [purchases, setPurchases] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      const r = getRaffleById(id);
      setRaffle(r);
      getPurchasesByRaffleId(id).then(setPurchases);
    }
  }, [id, raffles]);

  if (!raffle) return <div className="p-8 text-center">Cargando rifa...</div>;

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 md:px-0">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Detalle de Rifa: {raffle.title}</h1>
        <Link to="/admin/raffles" className="text-blue-600 hover:underline text-sm">← Volver al listado</Link>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <AdminRaffleDetail
          raffle={raffle}
          purchases={purchases}
          prizes={raffle.prizes || []}
        />
      </div>
    </div>
  );
};

export default AdminRaffleDetailView;
