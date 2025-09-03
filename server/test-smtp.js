#!/usr/bin/env node

/**
 * Script de prueba para verificar la configuración SMTP
 * Uso: node test-smtp.js
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

// Configuración del transporter (igual que en index.ts)
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  // Configuraciones para entornos de producción
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  rateLimit: 14,
  // Timeouts más generosos para entornos de producción
  connectionTimeout: 60000,
  greetingTimeout: 30000,
  socketTimeout: 60000,
  // Configuraciones de seguridad
  secure: true,
  tls: {
    rejectUnauthorized: false,
    ciphers: 'SSLv3'
  },
  // Logging para debugging
  debug: true,
  logger: true
});

async function testSMTPConnection() {
  console.log('🔍 Probando conexión SMTP...');
  console.log('📧 Usuario:', process.env.SMTP_USER);
  console.log('🔑 Contraseña:', process.env.SMTP_PASS ? 'Configurada' : 'No configurada');
  
  try {
    // Verificar conexión
    console.log('\n1️⃣ Verificando conexión SMTP...');
    await transporter.verify();
    console.log('✅ Conexión SMTP verificada correctamente');
    
    // Probar envío de email
    console.log('\n2️⃣ Probando envío de email...');
    const testEmail = {
      from: 'no-reply@rafflio.com <' + process.env.SMTP_USER + '>',
      to: process.env.SMTP_USER, // Enviar a sí mismo para prueba
      subject: 'Test SMTP - Rafflio',
      html: `
        <h2>Test de Configuración SMTP</h2>
        <p>Este es un email de prueba para verificar la configuración SMTP.</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
        <p>✅ Si recibes este email, la configuración SMTP está funcionando correctamente.</p>
        <hr>
        <p><strong>Configuración aplicada:</strong></p>
        <ul>
          <li>Pool de conexiones: Habilitado</li>
          <li>Timeouts: 60s conexión, 30s saludo, 60s socket</li>
          <li>TLS: Habilitado con configuración robusta</li>
          <li>Rate limiting: 14 emails/segundo</li>
        </ul>
      `
    };
    
    const result = await transporter.sendMail(testEmail);
    console.log('✅ Email de prueba enviado exitosamente');
    console.log('📧 Message ID:', result.messageId);
    
    // Mostrar información del transporter
    console.log('\n3️⃣ Información del transporter:');
    console.log('🔧 Configuración:', transporter.options);
    
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
    } else if (error.code === 'ECONNECTION') {
      console.log('   • Verificar que Gmail permita conexiones SMTP');
      console.log('   • Revisar configuración de seguridad de la cuenta');
    }
    
    process.exit(1);
  } finally {
    // Cerrar el transporter
    transporter.close();
    console.log('\n🔒 Transporter cerrado.');
  }
}

// Ejecutar pruebas
if (require.main === module) {
  testSMTPConnection().catch(console.error);
}

module.exports = { testSMTPConnection, transporter };
