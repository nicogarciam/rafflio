// Configuración de la aplicación
export const config = {
  // Supabase
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  },

  // MercadoPago
  mercadopago: {
    accessToken: import.meta.env.VITE_MERCADOPAGO_ACCESS_TOKEN,
    publicKey: import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY,
  },

  // Aplicación
  app: {
    name: import.meta.env.VITE_APP_NAME || 'Rafflio',
    baseUrl: import.meta.env.VITE_APP_BASE_URL || 'https://localhost:3000',
    apiUrl: import.meta.env.VITE_API_BASE_URL || 'https://localhost:4000/api',
  },

  // Validaciones
  validate() {
    const errors: string[] = [];

    if (!this.supabase.url) {
      errors.push('VITE_SUPABASE_URL is required - Please configure your Supabase URL');
    }

    if (!this.supabase.anonKey) {
      errors.push('VITE_SUPABASE_ANON_KEY is required - Please configure your Supabase anon key');
    }

    if (!this.mercadopago.accessToken) {
      errors.push('VITE_MERCADOPAGO_ACCESS_TOKEN is required - Please configure your MercadoPago access token');
    }

    if (errors.length > 0) {
      console.error('Configuration errors:', errors);
      console.error('\n📋 Para configurar las variables de entorno:');
      console.error('1. Copia env.example a .env: cp env.example .env');
      console.error('2. Edita .env con tus credenciales reales');
      console.error('3. O ejecuta: npm run setup');
      throw new Error(`Missing required environment variables: ${errors.join(', ')}`);
    }
  },

  // Verificar si estamos en desarrollo: permite override con VITE_FORCE_DEV
  isDevelopment: (import.meta.env.VITE_FORCE_DEV === 'true') || import.meta.env.DEV,

  // Verificar si estamos en producción
  isProduction: import.meta.env.PROD,

  // Verificar si las variables están configuradas
  isConfigured() {
    return this.supabase.url &&
      this.supabase.anonKey;
  }
};

// Solo validar si estamos en producción O si las variables están configuradas
if (config.isProduction || config.isConfigured()) {
  config.validate();
} 