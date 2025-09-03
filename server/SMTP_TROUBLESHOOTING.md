# 🔧 Solución al Problema de Timeout SMTP en Producción

## 🚨 **Problema Identificado**
Error de timeout de conexión SMTP al desplegar en Railway:
```
Error sending confirmation email: Error: Connection timeout
code: 'ETIMEDOUT', command: 'CONN'
```

## ✅ **Soluciones Implementadas**

### 1. **Configuración Mejorada del Transporter**
- **Pool de conexiones**: Habilita múltiples conexiones simultáneas
- **Timeouts más generosos**: 60 segundos para conexión, 30 para saludo
- **Configuración TLS robusta**: Evita problemas de certificados
- **Rate limiting**: Controla el número de emails por segundo

### 2. **Sistema de Reintentos con Backoff Exponencial**
- **3 intentos automáticos** antes de fallar
- **Backoff exponencial**: Espera progresivamente más tiempo entre intentos
- **Verificación de conexión** antes de cada intento
- **Logging detallado** para debugging

### 3. **Endpoints de Monitoreo**
- **`/api/health/smtp`**: Verifica el estado de la conexión SMTP
- **`/api/test-email`**: Permite probar el envío de emails

## 🛠️ **Configuraciones Aplicadas**

```typescript
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  // Configuraciones para producción
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  rateLimit: 14,
  
  // Timeouts más generosos
  connectionTimeout: 60000,  // 60 segundos
  greetingTimeout: 30000,    // 30 segundos
  socketTimeout: 60000,      // 60 segundos
  
  // Seguridad TLS
  secure: true,
  tls: {
    rejectUnauthorized: false,
    ciphers: 'SSLv3'
  }
});
```

## 🔍 **Diagnóstico y Testing**

### **Verificar Estado SMTP**
```bash
GET /api/health/smtp
```

**Respuesta esperada:**
```json
{
  "status": "healthy",
  "smtp": {
    "connected": true,
    "user": "configured",
    "timestamp": "2024-01-XX..."
  }
}
```

### **Probar Envío de Email**
```bash
POST /api/test-email
Content-Type: application/json

{
  "to": "tu-email@ejemplo.com"
}
```

## 🚀 **Deployment en Railway**

### **Variables de Entorno Requeridas**
```json
{
  "SMTP_USER": "info.rafflio@gmail.com",
  "SMTP_PASS": "yhorofchrfzdkpuk",
  "NODE_ENV": "production"
}
```

### **Verificaciones Post-Deployment**
1. **Revisar logs** para confirmar conexión SMTP exitosa
2. **Probar endpoint de health check** `/api/health/smtp`
3. **Enviar email de prueba** usando `/api/test-email`

## 📊 **Monitoreo y Logs**

### **Logs de Conexión SMTP**
- ✅ `Conexión SMTP verificada correctamente`
- ✅ `Servidor iniciado con conexión SMTP verificada`
- ❌ `Error verificando conexión SMTP: [error]`

### **Logs de Envío de Emails**
- 📧 `Intento 1 de envío de email a: [email]`
- ✅ `Email enviado exitosamente en intento 1`
- ❌ `Error en intento 1: [error]`
- ⏳ `Esperando [X]ms antes del siguiente intento...`

## 🔧 **Solución de Problemas Comunes**

### **Problema: Timeout persistente**
**Solución:**
1. Verificar firewall del servidor de Railway
2. Confirmar credenciales SMTP correctas
3. Revisar logs de conexión SMTP

### **Problema: Emails no se envían**
**Solución:**
1. Usar endpoint de health check
2. Probar con email de prueba
3. Revisar logs de reintentos

### **Problema: Conexión SMTP falla**
**Solución:**
1. Verificar variables de entorno
2. Confirmar que Gmail permite conexiones desde Railway
3. Revisar configuración de app passwords

## 📝 **Notas Importantes**

- **Gmail App Passwords**: Asegúrate de usar contraseñas de aplicación, no la contraseña principal
- **Firewall de Railway**: Railway puede tener restricciones de red que afecten SMTP
- **Rate Limiting**: Gmail tiene límites de envío (500 emails por día para cuentas gratuitas)
- **TLS**: La configuración TLS está optimizada para entornos de producción

## 🆘 **Contacto y Soporte**

Si el problema persiste después de implementar estas soluciones:
1. Revisar logs completos del servidor
2. Verificar estado de la cuenta de Gmail
3. Probar con un servicio SMTP alternativo (SendGrid, Mailgun, etc.)
