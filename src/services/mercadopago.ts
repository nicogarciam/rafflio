import { config } from '../lib/config';

export interface PaymentData {
  raffleId: string;
  priceTierId: string;
  userData: {
    fullName: string;
    email: string;
    phone: string;
  };
  amount: number;
  ticketCount: number;
  raffleTitle: string;
  purchaseId ?: string; 
}

export interface MercadoPagoResponse {
  id: string;
  init_point: string;
  sandbox_init_point: string;
  external_reference: string;
}

export class MercadoPagoService {
  async createPaymentPreference(paymentData: PaymentData, purchaseId: string): Promise<MercadoPagoResponse> {
   
    try {
      const baseUrl = config.app.baseUrl;
      
      const preferenceData = {
        items: [
          {
            id: paymentData.priceTierId,
            title: `${paymentData.raffleTitle} - ${paymentData.ticketCount} números`,
            description: `Compra de ${paymentData.ticketCount} números para la rifa: ${paymentData.raffleTitle}`,
            category_id: 'tickets',
            quantity: 1,
            currency_id: 'ARS',
            unit_price: paymentData.amount,
          }
        ],
        payer: {
          name: paymentData.userData.fullName,
          email: paymentData.userData.email,
          phone: {
            number: paymentData.userData.phone
          }
        },
        external_reference: purchaseId,
        notification_url: `${baseUrl}/api/payment/webhook`,
        back_urls: {
          success: `${baseUrl}/payment/success?purchase_id=${purchaseId}`,
          failure: `${baseUrl}/payment/failure?purchase_id=${purchaseId}`,
          pending: `${baseUrl}/payment/pending?purchase_id=${purchaseId}`
        },
        auto_return: 'approved' as const,
        payment_methods: {
          excluded_payment_methods: [],
          excluded_payment_types: [],
          installments: 12
        },
        shipments: {
          mode: 'not_specified'
        },
        statement_descriptor: 'RAFFLIO',
        expires: true,
        expiration_date_from: new Date().toISOString(),
        expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas
        purchaseId: purchaseId,
      };

      const response = await this.createPreference(preferenceData);
      
      return {
        id: response.id!,
        init_point: response.init_point!,
        sandbox_init_point: response.sandbox_init_point!,
        external_reference: response.external_reference!
      };
    } catch (error) {
      console.error('Error creating MercadoPago preference:', error);
      
      // Si hay un error de configuración, proporcionar información útil
      if (error instanceof Error && error.message.includes('substring')) {
        throw new Error('MercadoPago no está configurado correctamente. Verifica VITE_MERCADOPAGO_ACCESS_TOKEN en tu archivo .env');
      }
      
      throw new Error('Error al crear la preferencia de pago');
    }
  }


  async createPreference(paymentData: any) {
  const apiUrl = config.app.apiUrl || 'http://localhost:4000/api';
  const response = await fetch(apiUrl + '/payment/create-preference', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...paymentData }),
  });
  if (!response.ok) throw new Error('Error al crear preferencia');
  return await response.json();
  }

async getPaymentInfo(paymentId: string) {
    // Si MercadoPago no está configurado, simular respuesta para desarrollo
    
    try {
      // En un entorno real, aquí consultarías el estado del pago
      const apiUrl = config.app.apiUrl || 'http://localhost:4000/api';
      const response = await fetch(apiUrl + '/payment/payment-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId: paymentId }),
      });
      if (!response.ok) throw new Error('Error al getPaymentInfo');
      return await response.json();
      
      
    } catch (error) {
      console.error('Error getting payment info:', error);
      throw new Error('Error al obtener información del pago');
    }
  }

  
}

export const mercadoPagoService = new MercadoPagoService();