import { Payment, MerchantOrder, Preference } from "mercadopago";
// Endpoint de webhook de MercadoPago
import { Request, Response } from 'express';

const fs = require('fs');
const { createServer } = require('http');
const express = require('express');
const cors = require('cors');
const { MercadoPagoConfig } = require('mercadopago');
const { Server } = require('socket.io');
import type { Socket } from 'socket.io';
import { PaymentSearchOptions } from "mercadopago/dist/clients/payment/search/types";
import { MerchantOrderSearchOptions } from "mercadopago/dist/clients/merchantOrder/search/types";
const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');

require('dotenv').config();

const PORT = process.env.PORT || 4000 ;
const baseUrl = process.env.APP_BASE_URL || `http://localhost:${PORT}`;
const apiUrl = process.env.API_URL || `http://localhost:${PORT}`;

const app = express();
app.use(cors());
app.use(express.json());
const httpServer = createServer(app); // Servidor HTTP para WebSocket

const mercadoPagoClient = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || 'TEST-4372544405719279-072718-112f9982981a5c01b708c1f17bc9101e-54486551',
  options: { timeout: 5000 }
});
const preference = new Preference(mercadoPagoClient);

const supabaseUrl = process.env.SUPABASE_URL || 'https://lekpcbbrmbiltrrgqgmh.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxla3BjYmJybWJpbHRycmdxZ21oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2NTA4NzYsImV4cCI6MjA2OTIyNjg3Nn0.A7Bpmv3PiZG_eh8AQdNGrHSZhO6MDYdLkcKRp03MVtY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);


// Almacena conexiones por purchaseId
const purchaseSockets = new Map();

app.post('/api/payment/payment-info', async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.body;
    if (!paymentId) {
      return res.status(400).json({ error: 'paymentId es requerido' });
    }

    const paymentMP = new Payment(mercadoPagoClient);
    const payment = await paymentMP.get({ id: paymentId });
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Puedes adaptar la respuesta según lo que necesite tu frontend
    res.json(payment);
  } catch (error: any) {
    console.error('Error getting MercadoPago payment info:', error);
    res.status(500).json({ error: error.message || 'Error al obtener información del pago' });
  }
});

app.post('/api/payment/create', async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.body;
    if (!paymentId) {
      return res.status(400).json({ error: 'paymentId es requerido' });
    }

    const payment = new Payment(mercadoPagoClient);
    payment.create({ body: req.body })
      .then(console.log)
      .catch(console.log);
  } catch (error: any) {
    console.error('Error getting MercadoPago payment info:', error);
    res.status(500).json({ error: error.message || 'Error al obtener información del pago' });
  }
});


app.post('/api/payment/merchant-order-info', async (req: Request, res: Response) => {
  try {
    const { merchantOrderId } = req.body;
    if (!merchantOrderId) {
      return res.status(400).json({ error: 'merchantOrderId es requerido' });
    }
    const merchanOrderMP = new MerchantOrder(mercadoPagoClient);
    const moResponse = await merchanOrderMP.get(merchantOrderId);
    const merchantOrder = moResponse;

    // Devuelve la info completa del merchant order
    res.json(merchantOrder);
  } catch (error: any) {
    console.error('Error getting merchant order info:', error);
    res.status(500).json({ error: error.message || 'Error al obtener merchant order' });
  }
});

app.post('/api/payment/status-by-merchant-order', async (req: Request, res: Response) => {
  try {
    const { preference_id } = req.body;
    if (!preference_id) {
      return res.status(400).json({ error: 'preference_id  es requerido' });
    }

    const merchanOrderMP = new MerchantOrder(mercadoPagoClient);
    // Consulta el merchant order en MercadoPago
    // export declare interface MerchantOrderSearchOptions extends SearchOptions {
    //     status?: string;
    //     preference_id?: string;
    //     payer_id?: string;
    //     external_reference?: string;
    // }

    const merchantOrderSearchOptions: MerchantOrderSearchOptions = {
      preference_id: preference_id
    };
    const moResponse = await merchanOrderMP.search({ options: merchantOrderSearchOptions });
    if (!moResponse || !moResponse.elements || moResponse.elements.length === 0) {
      return res.status(404).json({ error: 'Merchant order not found' });
    }

    const merchantOrder = moResponse.elements[0];
    const paymentApproved = merchantOrder.payments?.find((pay: any) => pay.status === 'approved');
    // Devuelve la info completa del merchant order
    res.json(paymentApproved || { status: 'not_found' });
  } catch (error: any) {
    console.error('Error getting merchant order info:', error);
    res.status(500).json({ error: error.message || 'Error al obtener merchant order' });
  }
});

// Endpoint para consultar pago por preference_id
app.post('/api/payment/payment-by-preference', async (req: Request, res: Response) => {
  try {
    const { preference_id } = req.body;
    if (!preference_id) {
      return res.status(400).json({ error: 'preference_id es requerido' });
    }

    const payment = new Payment(mercadoPagoClient);
    //  PaymentSearchOptions
    // sort?: 'date_approved' | 'date_created' | 'date_last_updated' | 'money_release_date';
    // criteria?: 'asc' | 'desc';
    // external_reference?: string;
    // range?: 'date_created' | 'date_last_updated' | 'date_approved' | 'money_release_date' | 'date_created';
    // begin_date?: string;
    // end_date?: string;
    const paymentSearchOptions: PaymentSearchOptions = {
      sort: 'date_created',
      criteria: 'desc',
      range: 'date_created',
      begin_date: 'NOW-30DAYS',
      end_date: 'NOW',
      store_id: '47792478',
      pos_id: '58930090',
      offset: 0,
      limit: 30,
    };

    const response = await payment.search({ options: paymentSearchOptions });
    const results = (response as any).results;
    if (!results || results.length === 0) {
      return res.json({ status: 'not_found' });
    }
    const pay = results[0];
    res.json(pay);
  } catch (error: any) {
    console.error('Error getting payment by preferenceId:', error);
    res.status(500).json({ error: error.message || 'Error al obtener pago por preferenceId' });
  }
});


app.post('/api/payment/create-preference', async (req: Request, res: Response) => {
  try {
    const paymentData = req.body;
    const preferenceData = paymentData;

    const response = await preference.create({ body: preferenceData });

    res.json({
      id: response.id,
      init_point: response.init_point,
      sandbox_init_point: response.sandbox_init_point,
      external_reference: response.external_reference
    });
  } catch (error: any) {
    console.error('Error creating MercadoPago preference:', error);
    res.status(500).json({ error: error.message || 'Error al crear preferencia' });
  }
});

app.post('/api/payment/preference-info', async (req: Request, res: Response) => {
  try {
    const { preference_id } = req.body;
    if (!preference_id) {
      return res.status(400).json({ error: 'preference_id es requerido' });
    }
    const preferenceMP = new Preference(mercadoPagoClient);

    const preference = await preferenceMP.get({ preferenceId: preference_id });
    if (!preference) {
      return res.json({ status: 'not_found' });
    }
    res.json(preference);
  } catch (error: any) {
    console.error('Error getting Preference by preferenceId:', error);
    res.status(500).json({ error: error.message || 'Error al obtener Preference por preferenceId' });
  }
});

app.post('/api/payment/preference-by-ref', async (req: Request, res: Response) => {
  try {
    const { reference_id } = req.body;
    if (!reference_id) {
      return res.status(400).json({ error: 'reference_id es requerido' });
    }
    const preferenceMP = new Preference(mercadoPagoClient);

    const response = await preferenceMP.search({ options: { external_reference: reference_id } });
    if (!response || !response.elements || response.elements.length === 0) {
      return res.json({ status: 'not_found' });
    }
    const preference = response.elements[0];
    res.json(preference);
  } catch (error: any) {
    console.error('Error getting Preference by preferenceId:', error);
    res.status(500).json({ error: error.message || 'Error al obtener Preference por preferenceId' });
  }
});


const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.SMTP_USER, // tu correo de Gmail
    pass: process.env.SMTP_PASS, // tu contraseña o app password de Gmail
  },
});

app.post('/api/send-purchase-link', async (req: any, res: any) => {
  const { to, purchaseId } = req.body;
  if (!to || !purchaseId) {
    return res.status(400).json({ error: 'Faltan datos' });
  }
  const url = `${baseUrl}/payment/${purchaseId}/success`;

  try {
    await transporter.sendMail({
      from: 'no-reply@rafflio.com <' + process.env.SMTP_USER + '>',
      to,
      subject: '¡Gracias por tu compra! Selecciona tus números',
      html: `
        <h2>¡Gracias por tu compra!</h2>
        <p>Puedes seleccionar tus números de la rifa en el siguiente enlace:</p>
        <a href="${url}">${url}</a>
        <p>¡Mucha suerte!</p>
      `,
    });
    res.json({ success: true });
  } catch (err) {
    console.error('Error sending purchase email:', err);
    res.status(500).json({ error: 'No se pudo enviar el email' });
  }
});

// Endpoint para enviar email de confirmación con premios y números seleccionados
app.post('/api/send-confirmation-email', async (req: any, res: any) => {
  const { to, purchaseId, numbers, prizes } = req.body;
  if (!to || !purchaseId || !numbers || !prizes) {
    return res.status(400).json({ error: 'Faltan datos' });
  }
  try {
    const numbersList = Array.isArray(numbers) ? numbers.join(', ') : numbers;
    const prizesHtml = Array.isArray(prizes)
      ? prizes.map((p: any, i: number) => `<li><strong>${i + 1}°:</strong> ${p.name} - ${p.description}</li>`).join('')
      : '';
    const url = `${process.env.APP_BASE_URL}/payment/${purchaseId}/success`;
    await transporter.sendMail({
      from: 'no-reply@rafflio.com <' + process.env.SMTP_USER + '>',
      to,
      subject: 'Confirmación de Números y Premios - Rafflio',
      html: `
        <h2>¡Números confirmados!</h2>
        <p>Gracias por participar. Estos son tus números seleccionados:</p>
        <p><strong>${numbersList}</strong></p>
        <h3>Premios de la rifa:</h3>
        <ul>${prizesHtml}</ul>
        <p>Puedes ver tu compra y seleccionar tus números en: <a href="${url}">${url}</a></p>
        <p>¡Mucha suerte!</p>
      `,
    });
    res.json({ success: true });
  } catch (err) {
    console.error('Error sending confirmation email:', err);
    res.status(500).json({ error: 'No se pudo enviar el email de confirmación' });
  }
});

app.get('/api/test', async (req: Request, res: Response) => {
  res.json({ message: 'API is working!' });
});

app.get('/', (req: Request, res: Response) => {
  res.json({ message: "¡Hola desde Express + Socket.io! 🚀" });
});



// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: '*', // Ajusta según tu frontend
    methods: ['GET', 'POST']
  }
});



// Cuando un cliente se conecta
io.on('connection', (socket: Socket) => {
  console.log(`Cliente conectado: ${socket.id}`);

  socket.on('subscribePurchase', (purchaseId: string) => {
    purchaseSockets.set(purchaseId, socket.id);
  });

  socket.on('mensaje_chat', (data) => {
    console.log(`Mensaje recibido: ${data.texto}`);

    // Reenviar a todos los clientes (broadcast)
    io.emit('nuevo_mensaje', {
      usuario: data.usuario,
      texto: data.texto,
      fecha: new Date().toLocaleTimeString()
    });
  });

  socket.on('disconnect', () => {
    // Limpia purchaseSockets si lo deseas
    for (const [purchaseId, id] of purchaseSockets.entries()) {
      if (id === socket.id) {
        purchaseSockets.delete(purchaseId);
        break;
      }
    }
  });
});




/* {
 "id": 12345,
 "live_mode": true,
 "type": "payment",
 "date_created": "2015-03-25T10:04:58.396-04:00",
 "user_id": 44444,
 "api_version": "v1",
 "action": "payment.created",
 "data": {
     "id": "999999999" //payment id
 }
} */
app.post('/api/payment/webhook', async (req: Request, res: Response) => {
  const { data, type, resource, topic } = req.body;
  console.log('SERVER: Webhook received:', req.body);
  console.log('data: type:', data, type);
  console.log('resource: topic:', resource, topic);
  try {
    if (!data && !resource) {
      console.error('Webhook data or type is missing');
      return res.status(400).send('Webhook data or type is missing');
    }
    // 1. Consultar el estado real del pago en MercadoPago
    var paymentId: any;
    if (data && data.id && type === 'payment') {
      paymentId = data.id;
    } else if (resource && topic === 'payment') {
      paymentId = resource.id;
    }
    const paymentMP = new Payment(mercadoPagoClient);
    const payment = await paymentMP.get({ id: paymentId });
    const paymentStatus = payment.status; // 'approved', 'rejected', etc.
    const purchaseId = payment.external_reference;
    console.log(`Payment ID: ${paymentId}, Status: ${paymentStatus}, Purchase ID: ${purchaseId}`);

    // 2. Buscar la compra en Supabase por preferenceId o external_reference
    const { data: purchases, error } = await supabase
      .from('purchases')
      .select('*')
      .eq('id', purchaseId)
      .limit(1);

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).send('Supabase error');
    }
    if (!purchases || purchases.length === 0) {
      console.warn('No purchase found for purchaseId:', purchaseId);
      return res.status(404).send('Purchase not found');
    }

    const purchase = purchases[0];

    // 3. Actualizar el estado de la compra en Supabase
    const { error: updateError } = await supabase
      .from('purchases')
      .update({ status: paymentStatus, payment_id: paymentId })
      .eq('id', purchase.id);

    if (updateError) {
      console.error('Error updating purchase:', updateError);
      return res.status(500).send('Error updating purchase');
    }

    // 4. Emitir el update por websocket si corresponde
    if (purchaseSockets.has(purchase.id)) {
      io.to(purchaseSockets.get(purchase.id)).emit('paymentUpdate', {
        purchaseId: purchase.id,
        status: paymentStatus
      });
    }

    res.sendStatus(200);
  } catch (err) {
    console.error('Error in webhook processing:', err);
    res.status(500).send('Internal error');
  }
});



httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend HTTPS + WebSocket listening on ${apiUrl}`);
});