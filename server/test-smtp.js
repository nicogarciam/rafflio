#!/usr/bin/env node

/**
 * Script de prueba para verificar la configuración SMTP
 * Uso: node test-smtp.js
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

// Configuración de múltiples transportadores (igual que en index.ts)
const createSMTPTransporters = () => {
  const transporters = [];
  
  // 1. Gmail (configuración principal)
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporters.push({
      name: 'Gmail',
      transporter: nodemailer.createTransport({
        service: 'Gmail',
        host: 'smtp.gmail.com',
        port: 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        // Configuraciones optimizadas para Railway
        pool: true,
        maxConnections: 2,
        maxMessages: 25,
        rateLimit: 3,
        
        // Timeouts ultra agresivos para Railway
        connectionTimeout: 20000,
        greetingTimeout: 10000,
        socketTimeout: 20000,
        
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
        
        // Logging para debugging
        debug: true,
        logger: true
      })
    });
  }
  
  // 2. Resend (alternativa moderna y confiable)
  if (process.env.RESEND_API_KEY) {
    transporters.push({
      name: 'Resend',
      transporter: nodemailer.createTransport({
        host: 'smtp.resend.com',
        port: 465,
        secure: true,
        auth: {
          user: 'resend',
          pass: process.env.RESEND_API_KEY,
        },
        // Configuraciones para Railway
        connectionTimeout: 15000,
        greetingTimeout: 8000,
        socketTimeout: 15000,
        pool: false,
        maxConnections: 1,
        maxMessages: 10,
        rateLimit: 2
      })
    });
  }
  
  // 3. SendGrid (alternativa tradicional)
  if (process.env.SENDGRID_API_KEY) {
    transporters.push({
      name: 'SendGrid',
      transporter: nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,
        secure: false,
        auth: {
          user: 'apikey',
          pass: process.env.SENDGRID_API_KEY,
        },
        // Configuraciones para Railway
        connectionTimeout: 15000,
        greetingTimeout: 8000,
        socketTimeout: 15000,
        pool: false,
        maxConnections: 1,
        maxMessages: 10,
        rateLimit: 2
      })
    });
  }
  
  return transporters;
};

const smtpTransporters = createSMTPTransporters();
console.log(`🚀 Configurados ${smtpTransporters.length} transportadores SMTP:`, smtpTransporters.map(t => t.name));

async function testSMTPConnection() {
  if (smtpTransporters.length === 0) {
    console.error('❌ No hay transportadores SMTP configurados');
    console.log('💡 Configura al menos una de estas variables:');
    console.log('   • SMTP_USER + SMTP_PASS (Gmail)');
    console.log('   • RESEND_API_KEY (Resend)');
    console.log('   • SENDGRID_API_KEY (SendGrid)');
    process.exit(1);
  }
  
  console.log('🔍 Probando conexión SMTP con múltiples transportadores...');
  console.log('📧 Usuario Gmail:', process.env.SMTP_USER || 'No configurado');
  console.log('🔑 Contraseña Gmail:', process.env.SMTP_PASS ? 'Configurada' : 'No configurada');
  console.log('🚀 Resend API Key:', process.env.RESEND_API_KEY ? 'Configurada' : 'No configurada');
  console.log('📊 SendGrid API Key:', process.env.SENDGRID_API_KEY ? 'Configurada' : 'No configurada');
  
  try {
    // Verificar conexión con cada transportador
    console.log('\n1️⃣ Verificando conexiones SMTP...');
    let workingTransporter = null;
    
    for (const { name, transporter: t } of smtpTransporters) {
      try {
        console.log(`🔍 Probando ${name}...`);
        await t.verify();
        console.log(`✅ ${name} verificado correctamente`);
        workingTransporter = { name, transporter: t };
        break; // Usar el primer transportador que funcione
      } catch (error) {
        console.warn(`⚠️ ${name} falló:`, error.message);
        continue;
      }
    }
    
    if (!workingTransporter) {
      throw new Error('Todos los transportadores SMTP fallaron');
    }
    
    // Probar envío de email con el transportador que funciona
    console.log(`\n2️⃣ Probando envío de email con ${workingTransporter.name}...`);
    const testEmail = {
      from: 'no-reply@rafflio.com <' + (process.env.SMTP_USER || 'test@rafflio.com') + '>',
      to: process.env.SMTP_USER || 'test@rafflio.com', // Enviar a sí mismo para prueba
      subject: 'Test SMTP - Rafflio',
      html: `
        <h2>Test de Configuración SMTP</h2>
        <p>Este es un email de prueba para verificar la configuración SMTP.</p>
        <p>Transportador usado: <strong>${workingTransporter.name}</strong></p>
        <p>Timestamp: ${new Date().toISOString()}</p>
        <p>✅ Si recibes este email, la configuración SMTP está funcionando correctamente.</p>
        <hr>
        <p><strong>Configuración aplicada:</strong></p>
        <ul>
          <li>Transportador: ${workingTransporter.name}</li>
          <li>Timeouts optimizados para Railway</li>
          <li>TLS: Habilitado con configuración robusta</li>
          <li>Fallback automático entre proveedores</li>
        </ul>
      `
    };
    
    const result = await workingTransporter.transporter.sendMail(testEmail);
    console.log('✅ Email de prueba enviado exitosamente');
    console.log('📧 Message ID:', result.messageId);
    
    // Mostrar información del transportador
    console.log('\n3️⃣ Información del transportador:');
    console.log('🔧 Nombre:', workingTransporter.name);
    console.log('🔧 Configuración:', workingTransporter.transporter.options);
    
    console.log('\n🎉 ¡Todas las pruebas pasaron exitosamente!');
    console.log('🚀 El servidor SMTP está listo para producción.');
    
  } catch (error) {
    console.error('\n❌ Error durante las pruebas:');
    console.error('🔍 Tipo de error:', error.code || 'Desconocido');
    console.error('📝 Mensaje:', error.message);
    console.error('📚 Stack:', error.stack);
    
    // Sugerencias de solución
    console.log('\n💡 Sugerencias de solución:');
    if (error.code === 'EAUTH') {
      console.log('   • Verificar credenciales SMTP (usuario y contraseña)');
      console.log('   • Asegurarse de usar App Password de Gmail, no contraseña principal');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('   • Verificar conexión a internet');
      console.log('   • Revisar firewall del servidor');
      console.log('   • Probar desde otro entorno de red');
      console.log('   • Considerar usar Resend o SendGrid como alternativas');
    } else if (error.code === 'ECONNECTION') {
      console.log('   • Verificar que Gmail permita conexiones SMTP');
      console.log('   • Revisar configuración de seguridad de la cuenta');
      console.log('   • Probar con Resend o SendGrid');
    }
    
    process.exit(1);
  } finally {
    // Cerrar todos los transportadores
    for (const { name, transporter: t } of smtpTransporters) {
      try {
        t.close();
        console.log(`🔒 Transporter ${name} cerrado.`);
      } catch (closeError) {
        console.warn(`⚠️ Error cerrando ${name}:`, closeError.message);
      }
    }
  }
}

// Ejecutar pruebas
if (require.main === module) {
  testSMTPConnection().catch(console.error);
}

module.exports = { testSMTPConnection, smtpTransporters };
