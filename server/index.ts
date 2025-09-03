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


// Configuración SMTP más robusta para Railway
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  host: 'smtp.gmail.com',
  port: 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  // Configuraciones optimizadas para Railway
  pool: true,
  maxConnections: 3, // Reducido para Railway
  maxMessages: 50, // Reducido para Railway
  rateLimit: 5, // Reducido para Railway
  
  // Timeouts más agresivos para Railway
  connectionTimeout: 30000, // 30 segundos
  greetingTimeout: 15000, // 15 segundos
  socketTimeout: 30000, // 30 segundos
  
  // Configuraciones de seguridad más permisivas
  secure: true,
  tls: {
    rejectUnauthorized: false,
    ciphers: 'SSLv3',
    minVersion: 'TLSv1'
  },
  
  // Configuraciones específicas para Railway
  ignoreTLS: false,
  requireTLS: false,
  
  // Logging solo en desarrollo
  debug: process.env.NODE_ENV === 'development',
  logger: process.env.NODE_ENV === 'development'
});

// Función para verificar la conexión SMTP con timeout y reintentos
const verifySMTPConnection = async (maxRetries = 2) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔍 Verificando conexión SMTP (intento ${attempt}/${maxRetries})...`);
      const user = process.env.SMTP_USER;
      const pass = process.env.SMTP_PASS;
      console.log('🔍USER AND PASS', user, pass);
      // Usar Promise.race para timeout más agresivo
      const verifyPromise = transporter.verify();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('SMTP verification timeout')), 15000)
      );
      
      await Promise.race([verifyPromise, timeoutPromise]);
      console.log('✅ Conexión SMTP verificada correctamente');
      return true;
    } catch (error: any) {
      console.warn(`⚠️ Intento ${attempt} falló:`, error.message);
      
      if (attempt === maxRetries) {
        console.error('❌ Todos los intentos de verificación SMTP fallaron');
        return false;
      }
      
      // Esperar antes del siguiente intento
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  return false;
};

// Función mejorada para enviar emails con reintentos y timeout
const sendEmailWithRetry = async (mailOptions: any, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📧 Intento ${attempt} de envío de email a: ${mailOptions.to}`);
      
      // Intentar enviar directamente primero
      try {
        const sendPromise = transporter.sendMail(mailOptions);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Email send timeout')), 25000)
        );
        
        const result = await Promise.race([sendPromise, timeoutPromise]);
        console.log(`✅ Email enviado exitosamente en intento ${attempt}`);
        return result;
      } catch (sendError: any) {
        console.log(`📡 Error en envío directo: ${sendError.message}`);
        
        // Si falla el envío, verificar conexión y reintentar
        console.log(`📡 Verificando conexión SMTP antes del reintento...`);
        const isConnected = await verifySMTPConnection(1); // Solo 1 intento de verificación
        
        if (!isConnected) {
          throw new Error('Conexión SMTP no disponible');
        }
        
        // Reintentar envío después de verificar conexión
        const retryPromise = transporter.sendMail(mailOptions);
        const retryTimeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Email retry timeout')), 25000)
        );
        
        const result = await Promise.race([retryPromise, retryTimeoutPromise]);
        console.log(`✅ Email enviado exitosamente en intento ${attempt} después de verificar conexión`);
        return result;
      }
    } catch (error: any) {
      console.error(`❌ Error en intento ${attempt}:`, error.message);
      
      if (attempt === maxRetries) {
        throw new Error(`Falló después de ${maxRetries} intentos: ${error.message}`);
      }
      
      // Esperar antes del siguiente intento (backoff exponencial)
      const delay = Math.min(2000 * Math.pow(2, attempt - 1), 8000);
      console.log(`⏳ Esperando ${delay}ms antes del siguiente intento...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Verificar conexión SMTP de manera asíncrona sin bloquear el inicio
setTimeout(async () => {
  try {
    const isConnected = await verifySMTPConnection();
    if (isConnected) {
      console.log('🚀 Conexión SMTP verificada correctamente');
    } else {
      console.warn('⚠️ Conexión SMTP no disponible - se reintentará automáticamente');
    }
  } catch (error: any) {
    console.warn('⚠️ Error inicial verificando SMTP:', error.message);
    console.log('🔄 El servidor continuará funcionando y reintentará la conexión SMTP automáticamente');
  }
}, 5000); // Esperar 5 segundos después del inicio

// Sistema de reintentos automáticos para SMTP
let smtpRetryCount = 0;
const maxSmtpRetries = 5;

const retrySMTPConnection = async () => {
  if (smtpRetryCount >= maxSmtpRetries) {
    console.log('🔄 Máximo de reintentos SMTP alcanzado. El servidor continuará funcionando.');
    return;
  }
  
  setTimeout(async () => {
    try {
      const isConnected = await verifySMTPConnection(1);
      if (isConnected) {
        console.log('✅ Conexión SMTP restaurada automáticamente');
        smtpRetryCount = 0; // Reset contador
      } else {
        smtpRetryCount++;
        console.log(`🔄 Reintento SMTP ${smtpRetryCount}/${maxSmtpRetries} falló. Reintentando en 30 segundos...`);
        retrySMTPConnection(); // Reintentar
      }
    } catch (error: any) {
      smtpRetryCount++;
      console.log(`🔄 Reintento SMTP ${smtpRetryCount}/${maxSmtpRetries} falló: ${error.message}`);
      retrySMTPConnection(); // Reintentar
    }
  }, 30000); // Esperar 30 segundos entre reintentos
};

// Iniciar reintentos automáticos después de 10 segundos
setTimeout(() => {
  retrySMTPConnection();
}, 10000);

app.post('/api/send-purchase-link', async (req: any, res: any) => {
  const { to, purchaseId } = req.body;
  if (!to || !purchaseId) {
    return res.status(400).json({ error: 'Faltan datos' });
  }
  const url = `${baseUrl}/payment/${purchaseId}/success`;

  console.log('Compra obtenida:', purchaseId);
  try {
    // Obtener datos de la compra, rifa y premios desde Supabase
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .select('*, tickets(*)')
      .eq('id', purchaseId)
      .single();
    if (purchaseError || !purchase) {
      throw new Error('No se pudo obtener la compra');
    }
    console.log('Compra obtenida:', purchase);
    // Determinar el campo correcto para la rifa
    const raffleId = purchase.raffle_id || purchase.raffleId;
    if (!raffleId) {
      console.error('No se encontró raffle_id ni raffleId en la compra:', purchase);
      throw new Error('No se pudo determinar el bono asociado a la compra');
    }
    const { data: raffle, error: raffleError } = await supabase
      .from('raffles')
      .select('*, prizes(*), price_tiers(*)')
      .eq('id', raffleId)
      .single();
    if (raffleError || !raffle) {
      console.error('Error al obtener el bono:', raffleError, 'ID:', raffleId);
      throw new Error('No se pudo obtener el bono');
    }

    // Buscar el tier de precio seleccionado
    const tier = Array.isArray(raffle.price_tiers)
      ? raffle.price_tiers.find((t: any) => t.id === purchase.price_tier_id)
      : null;

    // Premios
    const premiosHtml = Array.isArray(raffle.prizes)
      ? raffle.prizes.map((p: any, i: number) => `<li><strong>${i + 1}°:</strong> ${p.name} - ${p.description}</li>`).join('')
      : '';

    // Validar si ya tiene los números seleccionados
    let numerosSeleccionadosHtml = '';
    if (purchase.tickets && Array.isArray(purchase.tickets) && purchase.tickets.length === purchase.ticket_count) {
      const numeros = purchase.tickets.map((t: any) => t.number).sort((a: number, b: number) => a - b);
      numerosSeleccionadosHtml = `<p><strong>Números seleccionados:</strong> ${numeros.join(', ')}</p>`;
    }

    const seleccionHtml = numerosSeleccionadosHtml
      ? `<h3>¡Ya tienes tus números asignados!</h3>${numerosSeleccionadosHtml}
      <p>Puedes ver tu contribución haciendo click en el siguiente enlace:</p><a href="${url}">VER BONO</a>`
      : `<p>Puedes seleccionar tus números en el siguiente enlace:</p><a href="${url}">SELECCIONAR NÚMEROS</a>`;

    await sendEmailWithRetry({
      from: 'no-reply@rafflio.com <' + process.env.SMTP_USER + '>',
      to,
      subject: `¡Gracias por tu Contribución en "${raffle.title}"!`,
      html: `
        <h2>¡Gracias por tu Contribución en "${raffle.title}"!</h2>
        <p><strong>Descripción:</strong> ${raffle.description}</p>
        <p><strong>Premios:</strong></p>
        <ul>${premiosHtml}</ul>
        <p><strong>Cantidad de números a seleccionar:</strong> ${purchase?.ticket_count}</p>
        ${seleccionHtml}
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
    await sendEmailWithRetry({
      from: 'no-reply@rafflio.com <' + process.env.SMTP_USER + '>',
      to,
      subject: 'Confirmación de Números y Premios',
      html: `
        <h2>¡Números confirmados!</h2>
        <p>Gracias por participar. Estos son tus números seleccionados:</p>
        <p><strong>${numbersList}</strong></p>
        <h3>Premios:</h3>
        <ul>${prizesHtml}</ul>
        <p>Puedes ver tu contribución en: <a href="${url}">VER BONO</a></p>
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

// Health check básico para Railway (responde inmediatamente)
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'healthy',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    nodeVersion: process.version
  });
});

// Health check simple para Railway (solo verifica que el servidor responda)
app.get('/health', (req: Request, res: Response) => {
  res.status(200).send('OK');
});

// Endpoint de health check para monitorear SMTP
app.get('/api/health/smtp', async (req: Request, res: Response) => {
  try {
    // Health check rápido - solo verificar configuración básica
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    
    // Verificar que las variables de entorno estén configuradas
    if (!smtpUser || !smtpPass) {
      return res.status(200).json({ 
        status: 'unhealthy',
        smtp: {
          connected: false,
          user: smtpUser ? 'configured' : 'not configured',
          pass: smtpPass ? 'configured' : 'not configured',
          timestamp: new Date().toISOString()
        },
        message: 'SMTP credentials not configured'
      });
    }

    // Verificación rápida de conexión con timeout
    const connectionPromise = verifySMTPConnection();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('SMTP verification timeout')), 10000)
    );

    const isConnected = await Promise.race([connectionPromise, timeoutPromise]);
    
    res.json({ 
      status: isConnected ? 'healthy' : 'unhealthy',
      smtp: {
        connected: isConnected,
        user: 'configured',
        pass: 'configured',
        timestamp: new Date().toISOString()
      },
      message: isConnected ? 'SMTP connection verified' : 'SMTP connection failed'
    });
  } catch (error: any) {
    // En caso de error, devolver unhealthy pero no error 500
    res.status(200).json({ 
      status: 'unhealthy',
      smtp: {
        connected: false,
        user: process.env.SMTP_USER ? 'configured' : 'not configured',
        pass: process.env.SMTP_USER ? 'configured' : 'not configured',
        timestamp: new Date().toISOString()
      },
      error: error.message,
      message: 'SMTP health check failed'
    });
  }
});

// Endpoint para probar envío de email
app.post('/api/test-email', async (req: Request, res: Response) => {
  const { to } = req.body;
  if (!to) {
    return res.status(400).json({ error: 'Email de destino requerido' });
  }
  
  try {
    await sendEmailWithRetry({
      from: 'no-reply@rafflio.com <' + process.env.SMTP_USER + '>',
      to,
      subject: 'Test de Email - Rafflio',
      html: `
        <h2>Test de Email</h2>
        <p>Este es un email de prueba para verificar la configuración SMTP.</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
        <p>✅ Si recibes este email, la configuración SMTP está funcionando correctamente.</p>
      `
    });
    
    res.json({ 
      success: true, 
      message: 'Email de prueba enviado exitosamente',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error enviando email de prueba:', error);
    res.status(500).json({ 
      error: 'Error enviando email de prueba',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
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
    for (const [purchaseId, id] of Array.from(purchaseSockets.entries())) {
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

    const status = paymentStatus === 'approved' ? 'paid' : 'failed';
    // 3. Actualizar el estado de la compra en Supabase
    const { error: updateError } = await supabase
      .from('purchases')
      .update({ status: status, payment_id: paymentId })
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