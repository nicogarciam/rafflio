-- ========================================
-- Tabla para datos de cuenta bancaria (única, para configuración global)
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cbu VARCHAR(30) NOT NULL,
    alias VARCHAR(30) NOT NULL,
    titular VARCHAR(100) NOT NULL,
    banco VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    whatsapp VARCHAR(30) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Script de inicialización para PostgreSQL
-- Este archivo se ejecuta automáticamente cuando se crea el contenedor

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Crear esquema principal
CREATE SCHEMA IF NOT EXISTS public;

-- Crear tabla de usuarios administradores
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'ADMIN',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- Crear tabla de rifas
CREATE TABLE IF NOT EXISTS raffles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    draw_date TIMESTAMP WITH TIME ZONE NOT NULL,
    max_tickets INTEGER NOT NULL DEFAULT 10000,
    is_active BOOLEAN DEFAULT true,
    account_id UUID NULL REFERENCES accounts(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de premios
CREATE TABLE IF NOT EXISTS prizes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    raffle_id UUID NOT NULL REFERENCES raffles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de niveles de precio
CREATE TABLE IF NOT EXISTS price_tiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    amount DECIMAL(10,2) NOT NULL,
    ticket_count INTEGER NOT NULL,
    raffle_id UUID NOT NULL REFERENCES raffles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de tickets/números
CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    number INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'available', -- available, reserved, sold
    raffle_id UUID NOT NULL REFERENCES raffles(id) ON DELETE CASCADE,
    purchase_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(raffle_id, number)
);

-- Crear tabla de compras
CREATE TABLE IF NOT EXISTS purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    preference_id VARCHAR(100) NULL,
    payment_id VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending', -- pending, paid, failed
    raffle_id UUID NOT NULL REFERENCES raffles(id),
    price_tier_id UUID NOT NULL REFERENCES price_tiers(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agregar foreign key para purchase_id en tickets
ALTER TABLE tickets ADD CONSTRAINT fk_tickets_purchase 
    FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE SET NULL;

-- Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_raffles_active ON raffles(is_active);
CREATE INDEX IF NOT EXISTS idx_raffles_draw_date ON raffles(draw_date);
CREATE INDEX IF NOT EXISTS idx_tickets_raffle_status ON tickets(raffle_id, status);
CREATE INDEX IF NOT EXISTS idx_tickets_number ON tickets(raffle_id, number);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON purchases(status);
CREATE INDEX IF NOT EXISTS idx_purchases_raffle ON purchases(raffle_id);

-- Insertar usuario administrador por defecto
INSERT INTO users (email, password_hash, name, role) 
VALUES (
    'admin@rafflio.com', 
    crypt('admin123', gen_salt('bf')), 
    'Administrador Rafflio', 
    'ADMIN'
) ON CONFLICT (email) DO NOTHING;

-- Función para generar tickets automáticamente
CREATE OR REPLACE FUNCTION generate_tickets_for_raffle(raffle_uuid UUID, max_tickets_count INTEGER)
RETURNS VOID AS $$
DECLARE
    i INTEGER;
BEGIN
    FOR i IN 1..max_tickets_count LOOP
        INSERT INTO tickets (number, raffle_id, status)
        VALUES (i, raffle_uuid, 'available');
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Trigger para generar tickets automáticamente cuando se crea una rifa
CREATE OR REPLACE FUNCTION trigger_generate_tickets()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM generate_tickets_for_raffle(NEW.id, NEW.max_tickets);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_raffle_insert
    AFTER INSERT ON raffles
    FOR EACH ROW
    EXECUTE FUNCTION trigger_generate_tickets();

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger de updated_at a las tablas necesarias
CREATE TRIGGER update_raffles_updated_at BEFORE UPDATE ON raffles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchases_updated_at BEFORE UPDATE ON purchases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insertar datos de ejemplo
INSERT INTO raffles (title, description, draw_date, max_tickets, is_active) 
VALUES (
    'Gran Sorteo Rafflio 2025',
    'Participa en nuestro gran sorteo de fin de año con increíbles premios',
    '2025-12-31 23:59:00+00',
    10000,
    true
) ON CONFLICT DO NOTHING;

-- Obtener el ID de la rifa de ejemplo
DO $$
DECLARE
    raffle_uuid UUID;
BEGIN
    SELECT id INTO raffle_uuid FROM raffles WHERE title = 'Gran Sorteo Rafflio 2025' LIMIT 1;
    
    IF raffle_uuid IS NOT NULL THEN
        -- Insertar premios de ejemplo
        INSERT INTO prizes (name, description, raffle_id) VALUES
            ('Premio Mayor', 'Viaje a París para 2 personas con todos los gastos pagos', raffle_uuid),
            ('Segundo Premio', 'PlayStation 5 + 3 juegos AAA', raffle_uuid),
            ('Tercer Premio', 'iPhone 15 Pro Max 256GB', raffle_uuid)
        ON CONFLICT DO NOTHING;
        
        -- Insertar niveles de precio de ejemplo
        INSERT INTO price_tiers (amount, ticket_count, raffle_id) VALUES
            (10.00, 5, raffle_uuid),
            (20.00, 12, raffle_uuid),
            (50.00, 35, raffle_uuid)
        ON CONFLICT DO NOTHING;
    END IF;
END $$;