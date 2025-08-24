// Este helper busca los priceTiers usados por compras y los bloquea para edición/eliminación
import { supabase } from '../lib/supabase';

export async function getUsedPriceTierIds(raffleId: string): Promise<string[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('purchases')
    .select('price_tier_id')
    .eq('raffle_id', raffleId);
  if (error) {
    console.error('Error fetching used priceTiers:', error);
    return [];
  }
  // Filtrar nulos y devolver solo los ids únicos
  return Array.from(new Set((data || []).map((row: any) => row.price_tier_id).filter(Boolean)));
}
