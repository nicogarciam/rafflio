# 🚀 Configuración Gmail para Railway - Guía Simplificada

## 📋 **Configuración Actual**
- **Transportador**: Solo Gmail
- **Configuración**: Optimizada para Railway
- **Fallback**: Sistema de reintentos automáticos
- **Monitoreo**: Health checks y logs detallados

## 🔧 **Configuración del Transportador**

### **1. Variables de Entorno Requeridas**
```bash
# En Railway Dashboard > Variables
SMTP_USER=info.rafflio@gmail.com
SMTP_PASS=yhorofchrfzdkpuk
NODE_ENV=production
PORT=4000
```

### **2. Configuración de Red en Railway**
```toml
[deploy.network]
outboundConnections = [
  "smtp.gmail.com:587", 
  "smtp.gmail.com:465"
]
```

## 📧 **Configuración Gmail**

### **1. Configuración del Transportador**
```typescript
const gmailTransporter = nodemailer.createTransport({
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
  
  // Timeouts optimizados para Railway
  connectionTimeout: 20000, // 20 segundos
  greetingTimeout: 10000,   // 10 segundos
  socketTimeout: 20000,     // 20 segundos
  
  // Configuraciones de seguridad
  secure: true,
  tls: {
    rejectUnauthorized: false,
    minVersion: 'TLSv1'
  },
  
  // Logging solo en desarrollo
  debug: process.env.NODE_ENV === 'development',
  logger: process.env.NODE_ENV === 'development'
});
```

## 🚀 **Funcionalidades Implementadas**

### **1. Verificación de Conexión**
- ✅ Verificación automática al inicio
- ✅ Reintentos automáticos cada 30 segundos
- ✅ Máximo 5 reintentos antes de parar

### **2. Envío de Emails**
- ✅ Función `sendEmailWithGmail()` con reintentos
- ✅ Timeout de 25 segundos por intento
- ✅ Backoff exponencial entre reintentos
- ✅ Verificación de conexión antes de reintentar

### **3. Health Checks**
- **`/health`**: Health check básico para Railway
- **`/api/health`**: Información del servidor
- **`/api/health/smtp`**: Estado de Gmail SMTP

## 🔍 **Monitoreo y Debugging**

### **1. Logs del Servidor**
```bash
# Ver logs en Railway
railway logs

# Buscar logs de Gmail
railway logs | grep -i gmail

# Buscar logs de email
railway logs | grep -i email
```

### **2. Endpoints de Prueba**
```bash
# Test de email
POST /api/test-email
{
  "to": "tu-email@ejemplo.com"
}

# Health check SMTP
GET /api/health/smtp
```

## 📊 **Métricas de Rendimiento**

### **1. Timeouts Configurados**
- **Conexión**: 20 segundos
- **Saludo**: 10 segundos
- **Socket**: 20 segundos
- **Envío**: 25 segundos

### **2. Pool de Conexiones**
- **Máximo de conexiones**: 2
- **Máximo de mensajes por conexión**: 25
- **Rate limit**: 3 emails por segundo

## 🎯 **Próximos Pasos**

### **1. Deploy en Railway**
```bash
git add .
git commit -m "feat: simplificar configuración a solo Gmail SMTP"
git push
```

### **2. Verificar Variables de Entorno**
- ✅ `SMTP_USER` configurado
- ✅ `SMTP_PASS` configurado (App Password)
- ✅ `NODE_ENV` configurado como "production"

### **3. Probar Funcionamiento**
- ✅ Health check: `/api/health/smtp`
- ✅ Test de email: `/api/test-email`
- ✅ Verificar logs en Railway

## 🔒 **Seguridad**

### **1. Variables de Entorno**
- ✅ **Nunca hardcodear** en el código
- ✅ **Usar Railway Variables**
- ✅ **App Password** de Gmail (no contraseña principal)

### **2. Configuración TLS**
- ✅ `rejectUnauthorized: false` solo en producción
- ✅ Puerto 465 (SSL) o 587 (TLS)
- ✅ Versión mínima TLS 1.0

## 📞 **Soporte y Troubleshooting**

### **1. Si Gmail Falla**
1. **Verificar logs**: `railway logs | grep -i gmail`
2. **Verificar variables**: Endpoint `/api/health/smtp`
3. **Verificar App Password**: Usar contraseña de aplicación, no principal
4. **Verificar configuración 2FA**: Gmail requiere 2FA para App Passwords

### **2. Errores Comunes**
- **`EAUTH`**: Credenciales incorrectas o App Password inválido
- **`ETIMEDOUT`**: Problema de red en Railway (esperado)
- **`ECONNECTION`**: Gmail bloquea conexiones desde Railway

### **3. Soluciones**
- ✅ **App Password**: Generar nuevo App Password en Gmail
- ✅ **Verificar 2FA**: Habilitar autenticación de dos factores
- ✅ **Configuración de red**: Verificar `outboundConnections` en Railway

---

## 🎉 **¡Configuración Simplificada Completada!**

Con esta implementación, tu servidor en Railway tendrá:
- ✅ **Configuración simple** con solo Gmail
- ✅ **Sistema robusto** de reintentos automáticos
- ✅ **Monitoreo completo** del estado SMTP
- ✅ **Logs detallados** para debugging
- ✅ **Health checks** para Railway

**¡La configuración está lista para deployment!** 🚀

## 🔗 **Enlaces Útiles**
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [Railway Network Configuration](https://docs.railway.app/deploy/deployments#network-configuration)
- [Nodemailer Gmail Configuration](https://nodemailer.com/smtp/gmail/)
