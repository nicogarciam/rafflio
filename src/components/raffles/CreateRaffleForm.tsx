import React, { useState } from 'react';
import { Plus, Trash2, Calendar, DollarSign, Gift } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useRaffle } from '../../contexts/RaffleContext';
import { Prize, PriceTier } from '../../types';

export const CreateRaffleForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [drawDate, setDrawDate] = useState('');
  const [maxTickets, setMaxTickets] = useState(10000);
  const [prizes, setPrizes] = useState<Omit<Prize, 'id' | 'raffleId'>[]>([
    { name: '', description: '' }
  ]);
  const [priceTiers, setPriceTiers] = useState<Omit<PriceTier, 'id' | 'raffleId'>[]>([
    { amount: 0, ticketCount: 0 }
  ]);
  const [loading, setLoading] = useState(false);

  const { addRaffle } = useRaffle();

  const addPrize = () => {
    setPrizes([...prizes, { name: '', description: '' }]);
  };

  const removePrize = (index: number) => {
    setPrizes(prizes.filter((_, i) => i !== index));
  };

  const updatePrize = (index: number, field: 'name' | 'description', value: string) => {
    const updated = prizes.map((prize, i) => 
      i === index ? { ...prize, [field]: value } : prize
    );
    setPrizes(updated);
  };

  const addPriceTier = () => {
    setPriceTiers([...priceTiers, { amount: 0, ticketCount: 0 }]);
  };

  const removePriceTier = (index: number) => {
    setPriceTiers(priceTiers.filter((_, i) => i !== index));
  };

  const updatePriceTier = (index: number, field: 'amount' | 'ticketCount', value: number) => {
    const updated = priceTiers.map((tier, i) => 
      i === index ? { ...tier, [field]: value } : tier
    );
    setPriceTiers(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validPrizes = prizes.filter(p => p.name.trim() && p.description.trim())
        .map((prize, index) => ({
          ...prize,
          id: `prize-temp-${index}`,
          raffleId: 'temp'
        }));

      const validPriceTiers = priceTiers.filter(t => t.amount > 0 && t.ticketCount > 0)
        .map((tier, index) => ({
          ...tier,
          id: `tier-temp-${index}`,
          raffleId: 'temp'
        }));

      addRaffle({
        title,
        description,
        drawDate,
        maxTickets,
        isActive: true,
        prizes: validPrizes,
        priceTiers: validPriceTiers,
      });

      onClose();
    } catch (error) {
      console.error('Error creating raffle:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Gift className="w-6 h-6 text-blue-600" />
            <span>Crear Nueva Rifa</span>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Información básica */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Información Básica
              </h3>
              
              <Input
                label="Título de la Rifa"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Sorteo Aniversario 2025"
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe los detalles del sorteo..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  label="Fecha del Sorteo"
                  type="datetime-local"
                  value={drawDate}
                  onChange={(e) => setDrawDate(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>

              <Input
                label="Cantidad Máxima de Números"
                type="number"
                min="100"
                max="100000"
                step="100"
                value={maxTickets}
                onChange={(e) => setMaxTickets(parseInt(e.target.value) || 10000)}
                helperText="Cantidad total de números disponibles para la venta (mínimo 100, máximo 100,000)"
                required
              />
            </div>

            {/* Premios */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Premios</h3>
                <Button type="button" onClick={addPrize} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Añadir Premio
                </Button>
              </div>

              <div className="space-y-4">
                {prizes.map((prize, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">Premio #{index + 1}</h4>
                      {prizes.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removePrize(index)}
                          variant="danger"
                          size="sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        placeholder="Nombre del premio"
                        value={prize.name}
                        onChange={(e) => updatePrize(index, 'name', e.target.value)}
                        required
                      />
                      <Input
                        placeholder="Descripción del premio"
                        value={prize.description}
                        onChange={(e) => updatePrize(index, 'description', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Niveles de Precio */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Niveles de Precio</h3>
                <Button type="button" onClick={addPriceTier} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Añadir Nivel
                </Button>
              </div>

              <div className="space-y-4">
                {priceTiers.map((tier, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">Nivel #{index + 1}</h4>
                      {priceTiers.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removePriceTier(index)}
                          variant="danger"
                          size="sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Precio"
                          value={tier.amount || ''}
                          onChange={(e) => updatePriceTier(index, 'amount', parseFloat(e.target.value) || 0)}
                          className="pl-10"
                          required
                        />
                      </div>
                      <Input
                        type="number"
                        placeholder="Cantidad de números"
                        value={tier.ticketCount || ''}
                        onChange={(e) => updatePriceTier(index, 'ticketCount', parseInt(e.target.value) || 0)}
                        required
                      />
                    </div>
                    <div className="text-sm text-gray-600">
                      Precio por número: ${tier.amount && tier.ticketCount ? (tier.amount / tier.ticketCount).toFixed(2) : '0.00'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex space-x-4 pt-4 border-t">
              <Button type="submit" loading={loading} className="flex-1">
                Crear Rifa
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};