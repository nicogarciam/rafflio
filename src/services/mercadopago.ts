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
  purchaseId?: string;
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
      const apiUrl = config.app.apiUrl;

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
        notification_url: `${apiUrl}/payment/webhook`,
        back_urls: {
          success: `${baseUrl}/payment/${purchaseId}/success`,
          failure: `${baseUrl}/payment/${purchaseId}/failure`,
          pending: `${baseUrl}/payment/${purchaseId}/pending`
        },

        // payment_id	ID (identificador) del pago de Mercado Pago.
        // status	Status del pago. Por ejemplo: approved para un pago aprobado o pending para un pago pendiente.
        // external_reference	Referencia que puedes sincronizar con tu sistema de pagos.
        // merchant_order_id	ID (identificador) de la orden de pago generada en Mercado Pago.

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
    const apiUrl = config.app.apiUrl;
    console.log('Creating payment preference with data:', paymentData, apiUrl);
    const response = await fetch(apiUrl + '/payment/create-preference', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...paymentData }),
    });
    if (!response.ok) throw new Error('Error al crear preferencia');
    return await response.json();
  }

  async getPaymentInfo(paymentId: string) {
    try {
      const response = await fetch(`${config.app.apiUrl}/payment/payment-info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ paymentId })
      });

      if (!response.ok) throw new Error('Error al obtener información del pago');
      return await response.json();
    } catch (error) {
      console.error('Error getting payment info:', error);
      throw error;
    }
  }

  /** Consulta un merchant order completo */
  async getMerchantOrderInfo(merchantOrderId: string) {
    const res = await fetch(`${config.app.apiUrl}/payment/merchant-order-info`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ merchantOrderId })
    });
    if (!res.ok) throw new Error('Error al obtener merchant order');
    return res.json();
  }


  /** Consulta un merchant order completo */
  async getPaymentStatusByMerchantOrder(merchantOrderId: string) {
    const res = await fetch(`${config.app.apiUrl}/payment/status-by-merchant-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ merchantOrderId })
    });
    if (!res.ok) throw new Error('Error al obtener merchant order');
    return res.json();
  }

  /** Consulta pago por preference_id */
  async getPaymentByPreferenceId(preferenceId: string) {
    try {
      const response = await fetch(`${config.app.apiUrl}/payment/payment-by-preference`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preference_id: preferenceId })
      });
      if (!response.ok) throw new Error('Error al obtener pago por preferenceId');
      return await response.json();
    } catch (error) {
      console.error('Error getting payment by preferenceId:', error);
      throw error;
    }
  }

  async getPreference(preferenceId: string) {
    try {
      const response = await fetch(`${config.app.apiUrl}/payment/preference-info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preference_id: preferenceId })
      });
      if (!response.ok) throw new Error('Error al obtener pago por preferenceId');
      return await response.json();
    } catch (error) {
      console.error('Error getting payment by preferenceId:', error);
      throw error;
    }
  }

}

export const mercadoPagoService = new MercadoPagoService();