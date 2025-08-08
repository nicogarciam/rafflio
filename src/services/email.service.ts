import { config } from "../lib/config";

// Servicio para enviar emails desde el frontend al backend
export async function sendPurchaseLinkEmail(to: string, purchaseId: string) {
  const res = await fetch(`${config.app.apiUrl}/send-purchase-link`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, purchaseId })
  });
  if (!res.ok) {
    throw new Error('No se pudo enviar el email de confirmación');
  }
  return res.json();
}

// Servicio para enviar email de confirmación con premios y números seleccionados
export async function sendConfirmationEmail(to: string, purchaseId: string, numbers: number[], prizes: any[]) {
  const res = await fetch(`${config.app.apiUrl}/send-confirmation-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, purchaseId, numbers, prizes })
  });
  if (!res.ok) {
    throw new Error('No se pudo enviar el email de confirmación de números');
  }
  return res.json();
}

