import React, { useEffect, useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { configService, MercadoPagoConfigPayload } from '../../services/config.service';
import { Info } from 'lucide-react';

export const MercadoPagoConfigForm: React.FC<{ onSaved?: () => void; }> = ({ onSaved }) => {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [payload, setPayload] = useState<MercadoPagoConfigPayload>({ accessToken: '', publicKey: '', sandbox: false });

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const cfg = await configService.getMercadoPagoConfig();
                if (cfg) setPayload(cfg);
            } catch (err: any) {
                setError('No se pudo cargar la configuración');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const handleChange = (field: keyof MercadoPagoConfigPayload, value: any) => {
        setPayload(p => ({ ...p, [field]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        setSuccess(null);
        try {
            await configService.saveMercadoPagoConfig(payload);
            setSuccess('Configuración guardada');
            if (onSaved) onSaved();
        } catch (err: any) {
            console.error(err);
            setError('Error guardando configuración');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="border rounded p-4 bg-white">
            <h3 className="text-lg font-semibold mb-3">Configuración de MercadoPago</h3>
            <div className="space-y-3">
                <div>
                    <label className="text-sm text-gray-700 mb-1 block">Access Token (secret)</label>
                    <Input value={payload.accessToken} onChange={e => handleChange('accessToken', e.target.value)} type="password" disabled={loading || saving} />
                </div>
                <div>
                    <label className="text-sm text-gray-700 mb-1 block">Public Key</label>
                    <Input value={payload.publicKey || ''} onChange={e => handleChange('publicKey', e.target.value)} disabled={loading || saving} />
                </div>
                <div className="flex items-center gap-2">
                    <input type="checkbox" id="mp-sandbox" checked={!!payload.sandbox} onChange={e => handleChange('sandbox', e.target.checked)} disabled={loading || saving} />
                    <label htmlFor="mp-sandbox" className="text-sm text-gray-700">Usar Sandbox</label>
                </div>

                {error && <div className="text-red-500 text-sm">{error}</div>}
                {success && <div className="text-green-600 text-sm">{success}</div>}

                <div className="flex gap-2">
                    <Button onClick={handleSave} loading={saving} disabled={loading || saving}>
                        Guardar
                    </Button>
                    <Button variant="outline" onClick={() => { setPayload({ accessToken: '', publicKey: '', sandbox: false }); setError(null); setSuccess(null); }} disabled={loading || saving}>
                        Limpiar
                    </Button>
                </div>

                <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <Info className="w-4 h-4" />
                    Los cambios se aplican en el servidor inmediatamente (se recarga la configuración).
                </div>
            </div>
        </div>
    );
};

export default MercadoPagoConfigForm;
