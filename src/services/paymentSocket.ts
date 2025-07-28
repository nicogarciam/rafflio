import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function connectPaymentSocket() {
  if (!socket) {
    socket = io('https://localhost:4000', {
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