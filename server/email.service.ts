import { CreateContact, ContactsApi } from "@getbrevo/brevo";
import * as brevo from "@getbrevo/brevo";
import * as dotenv from 'dotenv';
import nodemailer from 'nodemailer';



// Configuración SMTP solo para Gmail
export const createGmailTransporter = () => {
    console.log('createGmailTransporter Usuario:', process.env.SMTP_USER);
    console.log('createGmailTransporter Password:', process.env.SMTP_PASS);
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.error('❌ Variables SMTP_USER y SMTP_PASS no configuradas');
        return null;
    }

    return nodemailer.createTransport({
        service: 'gmail',
        host: 'smtps.gmail.com',
        port: 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },

        // Configuraciones de seguridad
        secure: true,
        /*  tls: {
           rejectUnauthorized: false,
           minVersion: 'TLSv1'
         },
         // Configuraciones optimizadas para Railway
         pool: true,
         maxConnections: 2,
         maxMessages: 25,
         rateLimit: 3,
         
         // Timeouts optimizados para Railway
         connectionTimeout: 20000, // 20 segundos
         greetingTimeout: 10000, // 10 segundos
         socketTimeout: 20000, // 20 segundos
         
         
         // Logging solo en desarrollo
         debug: process.env.NODE_ENV === 'development',
         logger: process.env.NODE_ENV === 'development' */
    });
};


export const sendEmailWithGmail = async (mailOptions: any, maxRetries = 3) => {
    const gmailTransporter = createGmailTransporter();
    if (!gmailTransporter) {
        throw new Error('No hay transportador Gmail configurado');
    }

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`📧 Intento ${attempt} de envío de email a: ${mailOptions.to} con Gmail`);

            // Intentar enviar directamente primero
            try {
                const result = await gmailTransporter.sendMail(mailOptions);
                console.log(`✅ Email enviado exitosamente con Gmail en intento ${attempt}`);
                return result;
            } catch (sendError: any) {
                console.log('sendError', sendError);
                console.log(`📡 Error en envío directo con Gmail: ${sendError.message}`);
            }

            if (attempt === maxRetries) {
                throw new Error(`Falló después de ${maxRetries} intentos: Gmail no pudo enviar el email`);
            }

            // Esperar antes del siguiente intento (backoff exponencial)
            const delay = Math.min(2000 * Math.pow(2, attempt - 1), 8000);
            console.log(`⏳ Esperando ${delay}ms antes del siguiente intento...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        } catch (error: any) {
            console.error(`❌ Error general en intento ${attempt}:`, error.message);

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

/* {
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
  } */
export const sendEmailWithBrevo = async (mailOptions: any) => {
    // Configura la API key desde la variable de entocdrno
    
    let emailAPI:brevo.TransactionalEmailsApi = new brevo.TransactionalEmailsApi();
    let message:brevo.SendSmtpEmail = new brevo.SendSmtpEmail();
    (emailAPI as any).authentications.apiKey.apiKey = process.env.BREVO_API_KEY || '';
    emailAPI.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY || '');
    console.log('process.env.BREVO_API_KEY', process.env.BREVO_API_KEY);

    // Define los parámetros del correo
    message.subject = mailOptions.subject;
    message.sender = {
        name: "rafflio",
        email: process.env.EMAIL_FROM // Usa un correo del dominio verificado
    };
    message.to = [{
        email: mailOptions.to,
    }];
    message.htmlContent = mailOptions.html;


    try {
        const data: any = await emailAPI.sendTransacEmail(message as any);
        console.log('Correo enviado correctamente. ID: ' + data.messageId);
        return data;
    } catch (error: any) {
        console.error('Error al enviar el correo:', error);
        const status = error?.response?.status || error?.status || error?.code;
        const details = error?.response?.text || error?.response?.data || error?.response?.body || error?.message || error;
        throw new Error(`Error al enviar correo con Brevo (${status}): ${typeof details === 'string' ? details : JSON.stringify(details)}`);
    }

};

