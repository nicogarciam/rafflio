-- Migration: Add retention percent to mercadopago_configs

ALTER TABLE IF EXISTS mercadopago_configs
  ADD COLUMN IF NOT EXISTS retention_percent numeric DEFAULT 0;

-- Ensure updated_at is set on update (optional trigger can be added later)
