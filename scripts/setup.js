#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

console.log('🎯 Configuración de Rafflio con Supabase');
console.log('=====================================\n');

async function setup() {
  try {
    // Verificar si existe .env
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const overwrite = await question('El archivo .env ya existe. ¿Deseas sobrescribirlo? (y/N): ');
      if (overwrite.toLowerCase() !== 'y' && overwrite.toLowerCase() !== 'yes') {
        console.log('Configuración cancelada.');
        rl.close();
        return;
      }
    }

    console.log('\n📋 Configuración de Supabase:');
    console.log('1. Ve a https://supabase.com y crea un nuevo proyecto');
    console.log('2. En el dashboard, ve a Settings > API');
    console.log('3. Copia la URL y la anon key\n');

    const supabaseUrl = await question('VITE_SUPABASE_URL: ');
    const supabaseAnonKey = await question('VITE_SUPABASE_ANON_KEY: ');

    console.log('\n💳 Configuración de MercadoPago:');
    console.log('1. Ve a https://www.mercadopago.com.ar/developers/panel/credentials');
    console.log('2. Copia el Access Token y Public Key\n');

    const mercadopagoAccessToken = await question('VITE_MERCADOPAGO_ACCESS_TOKEN: ');
    const mercadopagoPublicKey = await question('VITE_MERCADOPAGO_PUBLIC_KEY: ');

    console.log('\n🌐 Configuración de la aplicación:');
    const appName = await question('VITE_APP_NAME (Rafflio): ') || 'Rafflio';
    const appBaseUrl = await question('VITE_APP_BASE_URL (http://localhost:3000): ') || 'http://localhost:3000';
    const apiBaseUrl = await question('VITE_API_BASE_URL (http://localhost:3000/api): ') || 'http://localhost:3000/api';

    // Crear contenido del archivo .env
    const envContent = `# ========================================
# CONFIGURACIÓN DE SUPABASE
# ========================================
VITE_SUPABASE_URL=${supabaseUrl}
VITE_SUPABASE_ANON_KEY=${supabaseAnonKey}

# ========================================
# CONFIGURACIÓN DE MERCADOPAGO
# ========================================
VITE_MERCADOPAGO_ACCESS_TOKEN=${mercadopagoAccessToken}
VITE_MERCADOPAGO_PUBLIC_KEY=${mercadopagoPublicKey}

# ========================================
# CONFIGURACIÓN DE LA APLICACIÓN
# ========================================
VITE_APP_NAME=${appName}
VITE_APP_BASE_URL=${appBaseUrl}
VITE_API_BASE_URL=${apiBaseUrl}

# ========================================
# CONFIGURACIÓN DE DESARROLLO
# ========================================
NODE_ENV=development
`;

    // Escribir archivo .env
    fs.writeFileSync(envPath, envContent);

    console.log('\n✅ Configuración completada exitosamente!');
    console.log('📁 Archivo .env creado en:', envPath);
    console.log('\n🚀 Próximos pasos:');
    console.log('1. Ejecuta las migraciones de Supabase:');
    console.log('   - Copia el contenido de supabase/migrations/20250727213038_sweet_crystal.sql');
    console.log('   - Ejecútalo en el SQL Editor de Supabase');
    console.log('2. Instala las dependencias: npm install');
    console.log('3. Inicia el servidor de desarrollo: npm run dev');
    console.log('\n📚 Para más información, consulta el README.md');

  } catch (error) {
    console.error('❌ Error durante la configuración:', error.message);
  } finally {
    rl.close();
  }
}

setup(); 