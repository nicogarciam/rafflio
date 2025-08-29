import React, { useState } from 'react';

// Este componente debe recibir la rifa, sus compras y premios como props o cargarlos por id
const AdminRaffleDetail: React.FC<{
    raffle: any;
    purchases: any[];
    prizes: any[];
    onDrawWinners?: (drawnNumbers: number[]) => void;
}> = ({ raffle, purchases, prizes, onDrawWinners }) => {
    const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);

    // Permite ingresar los números sorteados en orden
    const handleDrawNumber = (index: number, value: string) => {
        const nums = [...drawnNumbers];
        nums[index] = Number(value);
        setDrawnNumbers(nums);
    };

    // Calcular ganadores en tiempo real
    const currentWinners = drawnNumbers.map((num, idx) => {
        if (!num) return null;
        const purchase = purchases.find(p => p.tickets?.some((t: any) => t.number === num));
        return purchase ? {
            prize: prizes[idx],
            number: num,
            user: purchase.full_name || purchase.fullName,
            email: purchase.email,
            purchaseId: purchase.id
        } : null;
    });

    return (
        <div className="space-y-6">
            <div className="bg-gray-50 border rounded p-4">
                <p><strong>Descripción:</strong> {raffle?.description}</p>
            </div>

            <div className="bg-yellow-50 border rounded p-4">
                <h3 className="font-semibold mb-2">Ingresar Números Sorteados</h3>
                <div className="flex flex-col gap-2">
                    {prizes.map((prize, idx) => {
                        const winner = currentWinners[idx];
                        return (
                            <div key={prize.id} className="flex items-center gap-2">
                                <span>{idx + 1}° Premio:</span>
                                <input
                                    type="number"
                                    className="border rounded px-2 py-1 w-24"
                                    value={drawnNumbers[idx] || ''}
                                    onChange={e => handleDrawNumber(idx, e.target.value)}
                                    placeholder="Número ganador"
                                />
                                <span className="text-gray-900">{prize.name}</span>
                                {drawnNumbers[idx] && (
                                    winner ? (
                                        <span className="ml-2 text-green-700 font-semibold">{winner.user} - {winner.email} (N° {winner.number})</span>
                                    ) : (
                                        <span className="ml-2 text-red-600 font-semibold">Sin ganador</span>
                                    )
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="bg-white border rounded p-4">
                <h3 className="font-semibold mb-2">Compras</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-xs">
                        <thead>
                            <tr>
                                <th>Comprador</th>
                                <th>Email</th>
                                <th>Monto</th>
                                <th>Fecha y Hora</th>
                                <th>Números</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {purchases.map(p => {
                                const fecha = p.createdAt ? new Date(p.createdAt) : null;
                                return (
                                    <tr key={p.id} className="border-b">
                                        <td>{p.full_name || p.fullName || '-'}</td>
                                        <td>{p.email}</td>
                                        <td >{p.amount?.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</td>
                                        <td>{fecha ? `${fecha.toLocaleDateString('es-AR')} ${fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}` : '-'}</td>
                                        <td>{p.tickets?.map((t: any) => t.number).join(', ')}</td>
                                        <td>{p.status}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminRaffleDetail;
