import React, { useState } from 'react';
import { accountService } from '../../services/account.service';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Account } from '../../types';

export const CreateAccountForm: React.FC<{ onCreate: (account: Account | null) => void; onCancel: () => void; }> = ({ onCreate, onCancel }) => {
    const [account, setAccount] = useState<Omit<Account, 'id' | 'createdAt' | 'updatedAt'>>({
        cbu: '',
        alias: '',
        titular: '',
        banco: '',
        email: '',
        whatsapp: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);

    const handleChange = (field: keyof typeof account, value: string) => {
        setAccount(a => ({ ...a, [field]: value }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);
        setSuccess(false);
        try {
            const created = await accountService.createAccount(account);
            if (!created) {
                setError('No se pudo crear la cuenta');
                setSuccess(false);
            } else {
                setSuccess(true);
            }
            onCreate(created);
        } catch (e) {
            setError('Error al crear la cuenta');
            setSuccess(false);
            onCreate(null);
        } finally {
            setLoading(false);
        }
    };

    const fields: { key: keyof typeof account; label: string; type?: string }[] = [
        { key: 'cbu', label: 'CBU' },
        { key: 'alias', label: 'Alias' },
        { key: 'titular', label: 'Titular' },
        { key: 'banco', label: 'Banco' },
        { key: 'email', label: 'Email', type: 'email' },
        { key: 'whatsapp', label: 'WhatsApp' },
    ];

    return (
        <div className="space-y-2 border rounded p-3 bg-gray-50">
            {fields.map(f => (
                <div key={f.key} className="flex flex-col w-full">
                    <label className="text-sm text-gray-700 mb-1">{f.label}</label>
                    <Input
                        value={account[f.key]}
                        onChange={e => handleChange(f.key, e.target.value)}
                        required
                        type={f.type || 'text'}
                        className="w-full"
                        disabled={loading}
                    />
                </div>
            ))}
            {error && <div className="text-red-500 text-sm">{error}</div>}
            {success && <div className="text-green-600 text-sm">¡Cuenta creada exitosamente!</div>}
            <div className="flex gap-2 pt-2">
                <Button type="button" onClick={handleSubmit} disabled={loading}>
                    {loading ? 'Creando...' : 'Crear cuenta'}
                </Button>
                <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>Cancelar</Button>
            </div>
        </div>
    );
};
