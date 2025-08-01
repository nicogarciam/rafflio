import { io, Socket } from 'socket.io-client';
import { config } from '../lib/config';

let socket: Socket | null = null;

export function connectPaymentSocket() {
  const apiUrl = config.app.apiUrl;
  if (!socket) {
    socket = io(apiUrl, {
      secure: true,
      transports: ['websocket'],
      // Si usas certificados autofirmados en desarrollo:
      rejectUnauthorized: false,
    });
  }
  return socket;
}

/**
 * Suscribe a los updates de pago por purchaseId.
 * @param purchaseId string
 * @param onUpdate (data) => void
 * @returns unsubscribe function
 */
export function subscribeToPaymentUpdates(purchaseId: string, onUpdate: (data: any) => void) {
  const socket = connectPaymentSocket();
  socket.emit('subscribePurchase', purchaseId);
  socket.on('paymentUpdate', onUpdate);

  // Devuelve función para desuscribirse
  return () => {
    socket.off('paymentUpdate', onUpdate);
  };
}