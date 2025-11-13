-- Migration: Create table for MercadoPago configuration
-- This table stores a single latest config row used by the server to initialize MercadoPago SDK

CREATE TABLE IF NOT EXISTS mercadopago_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  access_token text NOT NULL,
  public_key text,
  sandbox boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Optional: index on created_at for retrieving latest
CREATE INDEX IF NOT EXISTS idx_mercadopago_configs_created_at ON mercadopago_configs (created_at DESC);
