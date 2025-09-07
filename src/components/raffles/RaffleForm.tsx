import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Sparkles } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Prize, PriceTier, Account, Raffle } from '../../types';
import { accountService } from '../../services/account.service';
import { CreateAccountForm } from '../admin/CreateAccountForm';
import { Modal } from '../ui/Modal';
import { aiService } from '../../services/ai.service';

interface RaffleFormProps {
    initialRaffle?: Partial<Raffle>;
    isEdit?: boolean;
    onSubmit: (data: any) => Promise<void>;
    onCancel?: () => void;
    loading?: boolean;
}

export const RaffleForm: React.FC<RaffleFormProps> = ({ initialRaffle, isEdit, onSubmit, onCancel, loading }) => {
    const [title, setTitle] = useState(initialRaffle?.title || '');
    const [description, setDescription] = useState(initialRaffle?.description || '');
    const [drawDate, setDrawDate] = useState(normalizeDate(initialRaffle?.drawDate));
    const [maxTickets, setMaxTickets] = useState(initialRaffle?.maxTickets || 300);
    const [prizes, setPrizes] = useState<Omit<Prize, 'id' | 'raffleId'>[]>(initialRaffle?.prizes?.map(p => ({ name: p.name, description: p.description })) || [{ name: '', description: '' }]);
    const [priceTiers, setPriceTiers] = useState<Omit<PriceTier, 'id' | 'raffleId'>[]>(initialRaffle?.priceTiers?.map(t => ({ amount: t.amount, ticketCount: t.ticketCount })) || [{ amount: 0, ticketCount: 0 }]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [selectedAccountId, setSelectedAccountId] = useState<string | null>(initialRaffle?.accountId || null);
    const [showNewAccount, setShowNewAccount] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);

    // Normaliza la fecha a formato yyyy-MM-ddTHH:mm para input datetime-local
    function normalizeDate(dateStr?: string) {
        if (!dateStr) return '';
        if (dateStr.length === 16 && dateStr.includes('T')) return dateStr;
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return '';
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }

    useEffect(() => {
        accountService.getAccounts().then(setAccounts);
    }, []);

    const addPrize = () => setPrizes([...prizes, { name: '', description: '' }]);
    const removePrize = (index: number) => setPrizes(prizes.filter((_, i) => i !== index));
    const updatePrize = (index: number, field: 'name' | 'description', value: string) => {
        setPrizes(prizes.map((prize, i) => i === index ? { ...prize, [field]: value } : prize));
    };

    const movePrizeUp = (index: number) => {
        if (index > 0) {
            const newPrizes = [...prizes];
            [newPrizes[index - 1], newPrizes[index]] = [newPrizes[index], newPrizes[index - 1]];
            setPrizes(newPrizes);
        }
    };

    const movePrizeDown = (index: number) => {
        if (index < prizes.length - 1) {
            const newPrizes = [...prizes];
            [newPrizes[index], newPrizes[index + 1]] = [newPrizes[index + 1], newPrizes[index]];
            setPrizes(newPrizes);
        }
    };
    const addPriceTier = () => setPriceTiers([...priceTiers, { amount: 0, ticketCount: 0 }]);
    const removePriceTier = (index: number) => setPriceTiers(priceTiers.filter((_, i) => i !== index));
    const updatePriceTier = (index: number, field: 'amount' | 'ticketCount', value: number) => {
        setPriceTiers(priceTiers.map((tier, i) => i === index ? { ...tier, [field]: value } : tier));
    };
    const handleCreateAccount = (created: Account | null) => {
        if (created && created.id) {
            setAccounts((prev) => [created, ...prev]);
            setSelectedAccountId(created.id);
            setShowNewAccount(false);
        }
    };

    const handleAIAssistance = async () => {
        if (!title.trim()) {
            alert('Por favor ingresa un título antes de usar la asistencia con IA');
            return;
        }

        setAiLoading(true);
        try {
            const result = await aiService.generateRaffleDescription({
                title,
                currentDescription: description,
                prizes: prizes.filter(p => p.name.trim() && p.description.trim()),
                priceTiers: priceTiers.filter(t => t.amount > 0 && t.ticketCount > 0)
            });

            if (result.success && result.description) {
                setDescription(result.description);
            } else {
                alert(result.error || 'Error al generar descripción con IA');
            }
        } catch (error: any) {
            console.error('Error generando descripción:', error);
            alert('Error al generar descripción con IA');
        } finally {
            setAiLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        await onSubmit({
            title,
            description,
            drawDate,
            maxTickets,
            prizes,
            priceTiers,
            accountId: selectedAccountId,
        });
        setFormLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 bg-white p-4 sm:p-6 md:p-8 rounded shadow">
            <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Cuenta asociada</h3>
                {!showNewAccount && (
                    <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                        <select
                            className="flex-1 border rounded px-3 py-2"
                            value={selectedAccountId || ''}
                            onChange={e => setSelectedAccountId(e.target.value)}
                        >
                            <option value="">Selecciona una cuenta existente...</option>
                            {accounts.map(acc => (
                                <option key={acc.cbu} value={acc.id}>{acc.titular} - {acc.banco} ({acc.alias})</option>
                            ))}
                        </select>
                        <Button type="button" variant="outline" size="sm" onClick={() => setShowNewAccount(true)}>
                            Nueva cuenta
                        </Button>
                    </div>
                )}
                <Modal isOpen={showNewAccount} onClose={() => setShowNewAccount(false)} size="md">
                    <CreateAccountForm
                        onCreate={handleCreateAccount}
                        onCancel={() => setShowNewAccount(false)}
                    />
                </Modal>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Información básica</h3>
                <Input label="Título del Bono contribución" value={title} onChange={e => setTitle(e.target.value)} required />
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <label className="block text-sm font-medium text-gray-700">Descripción</label>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleAIAssistance}
                            disabled={aiLoading || !title.trim()}
                            className="flex items-center gap-1"
                        >
                            <Sparkles className="w-4 h-4" />
                            {aiLoading ? 'Generando...' : 'Asistencia con IA'}
                        </Button>
                    </div>
                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        rows={4}
                        className="w-full border rounded px-3 py-2"
                        required
                        placeholder="Describe tu bono de contribución... La IA puede ayudarte a crear una descripción más atractiva"
                    />
                    {!title.trim() && (
                        <p className="text-xs text-gray-500 mt-1">
                            💡 Ingresa un título primero para que la IA pueda generar una mejor descripción
                        </p>
                    )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-end">
                    <Input label="Fecha de sorteo" type="datetime-local" value={drawDate} onChange={e => setDrawDate(e.target.value)} required />
                    <Input label="Cantidad máxima de tickets" type="number" value={maxTickets} onChange={e => setMaxTickets(Number(e.target.value))} required min={1} />
                </div>
            </div>

            <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Premios</h3>
                <div className="space-y-2">
                    {prizes.map((prize, index) => (
                        <div key={index} className="border rounded-lg p-4 bg-gray-50">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-medium text-gray-600">Premio #{index + 1}</span>
                                <div className="flex gap-1">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => movePrizeUp(index)}
                                        disabled={index === 0}
                                        className="p-1 h-8 w-8 flex items-center justify-center text-sm font-bold"
                                        title="Mover hacia arriba"
                                    >
                                        ↑
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => movePrizeDown(index)}
                                        disabled={index === prizes.length - 1}
                                        className="p-1 h-8 w-8 flex items-center justify-center text-sm font-bold"
                                        title="Mover hacia abajo"
                                    >
                                        ↓
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-[0.8fr_1.2fr_auto] gap-2 items-end">
                                <Input
                                    label="Nombre del premio"
                                    value={prize.name}
                                    onChange={e => updatePrize(index, 'name', e.target.value)}
                                    required
                                    className="py-3"
                                    placeholder="Ej: TV 55"
                                />
                                <Input
                                    label="Descripción"
                                    value={prize.description}
                                    onChange={e => updatePrize(index, 'description', e.target.value)}
                                    required
                                    className="py-3"
                                    placeholder="Ej: Aportado por SuperTienda. Último modelo, Smart TV LG 55 4k"
                                />
                                <Button
                                    type="button"
                                    variant="danger"
                                    size="sm"
                                    onClick={() => removePrize(index)}
                                    disabled={prizes.length === 1}
                                    title="Eliminar premio"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addPrize} className="w-full">
                    <Plus className="w-4 h-4 mr-2" /> Agregar premio
                </Button>
            </div>

            <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Niveles de precio</h3>
                <div className="space-y-2">
                    {priceTiers.map((tier, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-[0.3fr_1fr_auto] gap-2 items-end">
                            <Input label="Cantidad de tickets" type="number" value={tier.ticketCount} onChange={e => updatePriceTier(index, 'ticketCount', parseInt(e.target.value) || 0)} required min={1} className="text-lg py-3" />
                            <Input
                                label="Monto"
                                type="text"
                                value={tier.amount}
                                onChange={e => updatePriceTier(index, 'amount', parseFloat(e.target.value) || 0)}
                                required
                                min={1}
                                className="text-lg py-3"
                            />
                            <Button type="button" variant="danger" size="sm" onClick={() => removePriceTier(index)} disabled={priceTiers.length === 1}><Trash2 /></Button>
                        </div>
                    ))}
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addPriceTier}><Plus className="w-4 h-4" /> Agregar nivel</Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-4">
                <Button type="submit" disabled={formLoading || loading} className="w-full sm:w-auto">{isEdit ? 'Actualizar rifa' : 'Crear rifa'}</Button>
                {onCancel && <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">Cancelar</Button>}
            </div>
        </form>
    );
};
