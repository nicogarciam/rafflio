# Rafflio - Plataforma de Rifas Online

Una plataforma completa para gestionar rifas y sorteos online con integración de pagos y base de datos en tiempo real.

## 🚨 **Advertencias de Seguridad**

⚠️ **IMPORTANTE**: Este proyecto contiene credenciales hardcodeadas para desarrollo. **NO USAR EN PRODUCCIÓN** sin configurar adecuadamente las variables de entorno.

## 🛠️ **Configuración del Proyecto**

### 1. **Instalar Dependencias**
```bash
npm install
```

### 2. **Configuración Automática (Recomendado)**
```bash
npm run setup
```

Este comando te guiará a través de la configuración de:
- Supabase (URL y API Key)
- MercadoPago (Access Token y Public Key)
- Configuración de la aplicación

### 3. **Configuración Manual**

Si prefieres configurar manualmente, copia el archivo de ejemplo:

```bash
cp env.example .env
```

Edita `.env` con tus credenciales reales:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here

# MercadoPago Configuration
MERCADOPAGO_ACCESS_TOKEN=your_mercadopago_access_token_here
MERCADOPAGO_PUBLIC_KEY=your_mercadopago_public_key_here

# Application Configuration
APP_NAME=Rafflio
APP_BASE_URL=http://localhost:3000
API_BASE_URL=http://localhost:3000/api
```

## 🗄️ **Configuración de Supabase**

### 1. **Crear Proyecto en Supabase**

1. Ve a [Supabase](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Espera a que se complete la configuración

### 2. **Obtener Credenciales**

1. En el dashboard de Supabase, ve a **Settings > API**
2. Copia la **URL** y **anon key**
3. Configúralas en tu archivo `.env`

### 3. **Ejecutar Migraciones**

1. Ve a **SQL Editor** en el dashboard de Supabase
2. Copia el contenido del archivo `supabase/migrations/20250727213038_sweet_crystal.sql`
3. Ejecuta el script SQL

### 4. **Configurar Autenticación**

1. Ve a **Authentication > Settings**
2. Configura las URLs de redirección:
   - `http://localhost:3000/**` (desarrollo)
   - `https://tu-dominio.com/**` (producción)

## 💳 **Configuración de MercadoPago**

### 1. **Crear Cuenta de MercadoPago**

1. Ve a [MercadoPago Developers](https://www.mercadopago.com.ar/developers)
2. Crea una cuenta de desarrollador
3. Crea una aplicación

### 2. **Obtener Credenciales**

1. En el panel de desarrolladores, ve a **Credentials**
2. Copia el **Access Token** y **Public Key**
3. Configúralos en tu archivo `.env`

### 3. **Configurar Webhooks (Opcional)**

Para producción, configura webhooks en MercadoPago:
- URL: `https://tu-dominio.com/api/payment/webhook`
- Eventos: `payment.created`, `payment.updated`

## 🚀 **Ejecutar el Proyecto**

```bash
# Desarrollo
npm run dev

# Construcción
npm run build

# Preview
npm run preview
```

## 🔧 **Scripts Disponibles**

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Construir para producción
- `npm run preview` - Preview de la construcción
- `npm run lint` - Ejecutar ESLint
- `npm run setup` - Configuración automática
- `npm run docker:build` - Construir imagen Docker
- `npm run docker:run` - Ejecutar contenedor Docker
- `npm run docker:compose` - Ejecutar con Docker Compose

## 🏗️ **Arquitectura del Proyecto**

```
src/
├── components/          # Componentes React
│   ├── admin/          # Componentes de administración
│   ├── auth/           # Componentes de autenticación
│   ├── layout/         # Componentes de layout
│   ├── purchase/       # Componentes de compra
│   ├── raffles/        # Componentes de rifas
│   ├── tickets/        # Componentes de tickets
│   └── ui/             # Componentes UI reutilizables
├── contexts/           # Contextos de React
├── hooks/              # Hooks personalizados
├── lib/                # Configuración y utilidades
├── services/           # Servicios de API
├── types/              # Definiciones de TypeScript
└── main.tsx           # Punto de entrada
```

## 🔐 **Autenticación**

### Credenciales de Desarrollo
- **Email**: `admin@admin.com`
- **Password**: `admin123`

⚠️ **IMPORTANTE**: Estas credenciales son solo para desarrollo. En producción, usa Supabase Auth.

### Autenticación con Supabase

El proyecto usa Supabase Auth para:
- Registro de usuarios
- Inicio de sesión
- Recuperación de contraseña
- Gestión de sesiones

## 💳 **Integración de Pagos**

El proyecto integra MercadoPago para procesar pagos. Características:

- Creación de preferencias de pago
- Procesamiento de pagos en tiempo real
- Webhooks para confirmaciones
- Manejo de estados de pago

## 🗄️ **Base de Datos**

### Esquema de Base de Datos

```sql
-- Usuarios
users (id, email, password_hash, name, role, created_at, updated_at)

-- Rifas
raffles (id, title, description, draw_date, max_tickets, is_active, created_at, updated_at)

-- Premios
prizes (id, name, description, raffle_id, created_at)

-- Niveles de precio
price_tiers (id, amount, ticket_count, raffle_id, created_at)

-- Tickets
tickets (id, number, status, raffle_id, purchase_id, created_at)

-- Compras
purchases (id, full_name, email, phone, payment_id, status, raffle_id, price_tier_id, created_at, updated_at)
```

### Características de la Base de Datos

- **Triggers automáticos**: Generación de tickets al crear rifas
- **Índices optimizados**: Para consultas rápidas
- **Relaciones**: Claves foráneas con integridad referencial
- **Timestamps**: Auditoría automática de cambios

## 🐳 **Docker**

```bash
# Construir imagen
npm run docker:build

# Ejecutar contenedor
npm run docker:run

# Usar Docker Compose
npm run docker:compose
```

## 🧪 **Testing**

```bash
# Ejecutar linting
npm run lint

# Verificar tipos TypeScript
npx tsc --noEmit
```

## 🚀 **Despliegue**

### Producción
1. Configura todas las variables de entorno
2. Ejecuta `npm run build`
3. Sirve los archivos de `dist/`

### Vercel (Recomendado)
1. Conecta tu repositorio con Vercel
2. Configura las variables de entorno
3. Despliega automáticamente

### Docker
```bash
docker build -t rafflio .
docker run -p 3000:3000 rafflio
```

## 📝 **Notas de Desarrollo**

- El proyecto usa TypeScript para type safety
- ESLint está configurado para mantener la calidad del código
- Tailwind CSS para estilos
- Vite como bundler
- React 18 con hooks modernos
- Supabase para base de datos y autenticación
- MercadoPago para procesamiento de pagos

## 🔧 **Servicios Implementados**

### AuthService
- Autenticación con Supabase
- Registro de usuarios
- Gestión de sesiones
- Recuperación de contraseña

### RaffleService
- CRUD completo de rifas
- Gestión de premios y precios
- Manejo de tickets
- Procesamiento de compras

### MercadoPagoService
- Creación de preferencias de pago
- Procesamiento de pagos
- Webhooks de confirmación

## 🤝 **Contribución**

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 **Licencia**

Este proyecto está bajo la Licencia MIT.

## 🆘 **Soporte**

Si tienes problemas:

1. Verifica que todas las variables de entorno estén configuradas
2. Asegúrate de que las migraciones de Supabase se ejecutaron correctamente
3. Revisa los logs de la consola del navegador
4. Consulta la documentación de [Supabase](https://supabase.com/docs) y [MercadoPago](https://www.mercadopago.com.ar/developers)



https://localhost:3000/payment/failure?purchase_id=test_1753706033750&collection_id=null&collection_status=null&payment_id=null&status=null&external_reference=test_1753706033750&payment_type=null&merchant_order_id=null&preference_id=1229051365-387d81af-a748-4e47-ad42-cf2a11b15d7e&site_id=MLA&processing_mode=aggregator&merchant_account_id=null