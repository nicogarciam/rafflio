import { config } from '../lib/config';

export interface MercadoPagoConfigPayload {
    accessToken: string;
    publicKey?: string | null;
    sandbox?: boolean;
    retentionPercent?: number;
}

export const configService = {
    async getMercadoPagoConfig(): Promise<MercadoPagoConfigPayload | null> {
        const res = await fetch(`${config.app.apiUrl}/config/mercadopago`);
        if (!res.ok) return null;
        const data = await res.json();
        if (!data) return null;
        return {
            accessToken: data.accessToken || '',
            publicKey: data.publicKey || null,
            sandbox: !!data.sandbox,
            retentionPercent: Number(data.retentionPercent || 0)
        };
    },

    async saveMercadoPagoConfig(payload: MercadoPagoConfigPayload) {
        const res = await fetch(`${config.app.apiUrl}/config/mercadopago`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!res.ok) {
            const text = await res.text().catch(() => '');
            throw new Error(`Error saving config: ${res.status} ${text}`);
        }
        return res.json();
    }
};
