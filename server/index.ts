import { Payment } from "mercadopago";
// Endpoint de webhook de MercadoPago
import { Request, Response } from 'express';

const fs = require('fs');
const https = require('https');
const express = require('express');
const cors = require('cors');
const { MercadoPagoConfig, Preference } = require('mercadopago');
const { Server } = require('socket.io');
import type { Socket } from 'socket.io';
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const mercadoPagoClient = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || 'TEST-4372544405719279-072718-112f9982981a5c01b708c1f17bc9101e-54486551',
  options: { timeout: 5000 }
});
const preference = new Preference(mercadoPagoClient);

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

const PORT = process.env.PORT || 4000;
const baseUrl = process.env.APP_BASE_URL || `http://localhost:${PORT}`;
// Almacena conexiones por purchaseId
const purchaseSockets = new Map();

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

app.post('/api/payment/payment-info', async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.body;
    if (!paymentId) {
      return res.status(400).json({ error: 'paymentId es requerido' });
    }

    // Usar el SDK de MercadoPago para obtener la info del pago
    const payment = await mercadoPagoClient.get(`/v1/payments/${paymentId}`);

    // Puedes adaptar la respuesta según lo que necesite tu frontend
    res.json({
      id: payment.body.id,
      status: payment.body.status,
      status_detail: payment.body.status_detail,
      external_reference: payment.body.external_reference,
      preference_id: payment.body.preference_id,
      payer: payment.body.payer,
      transaction_amount: payment.body.transaction_amount,
      date_approved: payment.body.date_approved,
      date_created: payment.body.date_created,
    });
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



app.get('/api/test', async (req: Request, res: Response) => { 
  res.json({ message: 'API is working!' });
});

// HTTPS server
const httpsOptions = {
  key: fs.readFileSync('./server.key'),
  cert: fs.readFileSync('./server.cert')
};
const server = https.createServer(httpsOptions, app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: '*', // Ajusta según tu frontend
    methods: ['GET', 'POST']
  }
});



// Cuando un cliente se conecta
io.on('connection', (socket: Socket) => {
  socket.on('subscribePurchase', (purchaseId: string) => {
    purchaseSockets.set(purchaseId, socket.id);
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



app.post('/api/payment/webhook', async (req: Request, res: Response) => {
  const { data, type } = req.body;
  console.log('SERVER: Webhook received:', type, data);

  try {
    // 1. Consultar el estado real del pago en MercadoPago
    const paymentId = data.id;
    const payment = await mercadoPagoClient.get(`/v1/payments/${paymentId}`);
    const paymentStatus = payment.body.status; // 'approved', 'rejected', etc.
    const preferenceId = payment.body.preference_id;
    const purchaseId = payment.body.external_reference;

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
      console.warn('No purchase found for preferenceId:', preferenceId);
      return res.status(404).send('Purchase not found');
    }

    const purchase = purchases[0];

    // 3. Actualizar el estado de la compra en Supabase
    const { error: updateError } = await supabase
      .from('purchases')
      .update({ status: paymentStatus, paymentId: paymentId })
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



server.listen(PORT, () => {
  console.log(`Backend HTTPS + WebSocket listening on ${baseUrl}:${PORT}`);
});