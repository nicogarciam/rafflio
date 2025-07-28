import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Button } from './Button';
import { AlertTriangle, ExternalLink, Copy, Check } from 'lucide-react';

interface ConfigSetupProps {
  onClose?: () => void;
}

export const ConfigSetup: React.FC<ConfigSetupProps> = ({ onClose }) => {
  const [copied, setCopied] = React.useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const envContent = `# ========================================
# CONFIGURACIÓN DE SUPABASE
# ========================================
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# ========================================
# CONFIGURACIÓN DE MERCADOPAGO
# ========================================
VITE_MERCADOPAGO_ACCESS_TOKEN=your_mercadopago_access_token_here
VITE_MERCADOPAGO_PUBLIC_KEY=your_mercadopago_public_key_here

# ========================================
# CONFIGURACIÓN DE LA APLICACIÓN
# ========================================
VITE_APP_NAME=Rafflio
VITE_APP_BASE_URL=http://localhost:3000
VITE_API_BASE_URL=http://localhost:3000/api

# ========================================
# CONFIGURACIÓN DE DESARROLLO
# ========================================
NODE_ENV=development`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-6 h-6 text-yellow-500" />
            <CardTitle>Configuración Requerida</CardTitle>
          </div>
          <p className="text-gray-600">
            Para usar Rafflio, necesitas configurar las variables de entorno. Sigue estos pasos:
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Paso 1: Supabase */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">1. Configurar Supabase</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Ve a <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center">
                  Supabase <ExternalLink className="w-3 h-3 ml-1" />
                </a> y crea una cuenta</li>
                <li>Crea un nuevo proyecto</li>
                <li>En el dashboard, ve a <strong>Settings &gt; API</strong></li>
                <li>Copia la <strong>URL</strong> y <strong>anon key</strong></li>
              </ol>
            </div>
          </div>

          {/* Paso 2: MercadoPago */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">2. Configurar MercadoPago</h3>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Ve a <a href="https://www.mercadopago.com.ar/developers" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline inline-flex items-center">
                  MercadoPago Developers <ExternalLink className="w-3 h-3 ml-1" />
                </a></li>
                <li>Crea una cuenta de desarrollador</li>
                <li>En el panel, ve a <strong>Credentials</strong></li>
                <li>Copia el <strong>Access Token</strong> y <strong>Public Key</strong></li>
              </ol>
            </div>
          </div>

          {/* Paso 3: Archivo .env */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">3. Crear archivo .env</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Copia este contenido y guárdalo como <code className="bg-gray-200 px-1 rounded">.env</code> en la raíz del proyecto:</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(envContent, 'env')}
                  className="flex items-center space-x-1"
                >
                  {copied === 'env' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied === 'env' ? 'Copiado' : 'Copiar'}</span>
                </Button>
              </div>
              <pre className="bg-gray-900 text-green-400 p-4 rounded text-xs overflow-x-auto">
                <code>{envContent}</code>
              </pre>
            </div>
          </div>

          {/* Paso 4: Migraciones */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">4. Ejecutar migraciones</h3>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>En el dashboard de Supabase, ve a <strong>SQL Editor</strong></li>
                <li>Copia el contenido de <code className="bg-purple-200 px-1 rounded">supabase/migrations/20250727213038_sweet_crystal.sql</code></li>
                <li>Ejecuta el script SQL</li>
              </ol>
            </div>
          </div>

          {/* Comandos útiles */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">Comandos útiles</h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <code className="bg-yellow-200 px-2 py-1 rounded">npm run setup</code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard('npm run setup', 'setup')}
                    className="flex items-center space-x-1"
                  >
                    {copied === 'setup' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copied === 'setup' ? 'Copiado' : 'Copiar'}</span>
                  </Button>
                </div>
                <p className="text-gray-600">Configuración automática interactiva</p>
                
                <div className="flex items-center justify-between">
                  <code className="bg-yellow-200 px-2 py-1 rounded">npm run dev</code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard('npm run dev', 'dev')}
                    className="flex items-center space-x-1"
                  >
                    {copied === 'dev' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copied === 'dev' ? 'Copiado' : 'Copiar'}</span>
                  </Button>
                </div>
                <p className="text-gray-600">Iniciar servidor de desarrollo</p>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
            <Button onClick={() => window.location.reload()}>
              Recargar Aplicación
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 
