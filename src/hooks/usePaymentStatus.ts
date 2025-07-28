import { useEffect } from 'react';
import { subscribeToPaymentUpdates } from '../services/paymentSocket';

export function usePaymentStatus(purchaseId: string, onUpdate: (data: any) => void) {
  useEffect(() => {
    if (!purchaseId) return;
    console.log(`🔔 Subscribing to payment updates for purchase ID: ${purchaseId}`);
    const unsubscribe = subscribeToPaymentUpdates(purchaseId, onUpdate);
    return () => unsubscribe();
  }, [purchaseId, onUpdate]);
}