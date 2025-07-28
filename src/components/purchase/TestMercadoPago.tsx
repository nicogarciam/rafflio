import React, { useEffect, useState } from 'react';
import { mercadoPagoService } from '../../services/mercadopago';
import { Brand, CardPayment, initMercadoPago } from '@mercadopago/sdk-react';
import { Wallet } from '@mercadopago/sdk-react';

export const TestMercadoPago: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState('');
  const [preferenceId, setPreferenceId] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    amount: 560,
    ticketCount: 1,
    raffleTitle: 'Rifa de prueba',
    priceTierId: 'tier_1',
    raffleId: 'raffle_1',
  });
  const [customization, setCustomization] = useState({
              theme: 'default',
              valueProp: 'security_safety',
              customStyle: {
                hideValueProp: true,
                valuePropColor: 'blue', // blue, white, black
                buttonHeight: '48px', // min 48px - max free
                borderRadius: '6px',
                verticalPadding: '8px', // min 8px - max free
                horizontalPadding: '0px', // min 0px - max free
              }
            });




  // useEffect(() => { 
  //   if (!window.MercadoPago) {
  //     initMercadoPago('TEST-1714c3d3-f527-4a9e-84c2-035fab31596e', {
  //       locale: 'es-AR',
  //     });
  //   } else {
  //     console.log('MercadoPago ya está inicializado');
  //   }
  
  // }, [] );

  useEffect(() => { 
    if (!window.MercadoPago) {
      const script = document.createElement('script');
      script.src = 'https://sdk.mercadopago.com/js/v2';
      script.async = true;
      script.onload = () => {
        console.log('MercadoPago SDK loaded');
      };
      document.body.appendChild(script);
      return () => {
        document.body.removeChild(script);
      }
    } else {
      console.log('MercadoPago ya está inicializado');
    }
  
  }, [] );

  const openCheckout = () => {
    if (window.MercadoPago) {
      const mp = new window.MercadoPago('TEST-1714c3d3-f527-4a9e-84c2-035fab31596e', {
        locale: 'es-AR',
      });

      mp.checkout({
        preference: {
          id: preferenceId,
        },
        autoOpen: true, // Abrir automáticamente el checkout
        iframe: true, // Usar iframe para el checkout

        render: {
          container: '.cho-container', // Indica dónde se mostrará el botón de pago
          label: 'Pagar', // Etiqueta del botón
        },
      });
    } else {
      console.error('MercadoPago SDK no está cargado');
      setError('MercadoPago SDK no está cargado. Intenta recargar la página.');
    }
  
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  
  const initialization = {
    preferenceId: preferenceId,
  }

  // Remove unsupported customization properties for Wallet Brick

  const onSubmit = async (formData: any) => {
    console.log('Form submitted:', formData);
  };

  const onError = async (error: any) => {
  // callback llamado para todos los casos de error de Brick
  console.log(error);
  };

  const onReady = async () => {
    setLoading(false);
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setPaymentUrl('');
    try {
      const paymentData = {
        raffleId: form.raffleId,
        priceTierId: form.priceTierId,
        userData: {
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
        },
        amount: Number(form.amount),
        ticketCount: Number(form.ticketCount),
        raffleTitle: form.raffleTitle,
        purchaseId: `test_${Date.now()}`,
      };
      const purchaseId = `test_${Date.now()}`;
      const pref = await mercadoPagoService.createPaymentPreference(paymentData, purchaseId);
      setPaymentUrl(pref.init_point);
      setPreferenceId(pref.id);
      openCheckout();
    } catch (err: any) {
      setError(err.message || 'Error al crear preferencia');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div style={{ maxWidth: 400, margin: '2rem auto', padding: 20, border: '1px solid #ccc', borderRadius: 8 }}>
      <h2>Test MercadoPago</h2>
      <form onSubmit={handleSubmit}>
        <input name="fullName" placeholder="Nombre completo" value={form.fullName} onChange={handleChange} required style={{ width: '100%', marginBottom: 8 }} />
        <input name="email" placeholder="Email" type="email" value={form.email} onChange={handleChange} required style={{ width: '100%', marginBottom: 8 }} />
        <input name="phone" placeholder="Teléfono" value={form.phone} onChange={handleChange} required style={{ width: '100%', marginBottom: 8 }} />
        <input name="amount" placeholder="Monto" type="number" value={form.amount} onChange={handleChange} required style={{ width: '100%', marginBottom: 8 }} />
        <input name="ticketCount" placeholder="Cantidad de números" type="number" value={form.ticketCount} onChange={handleChange} required style={{ width: '100%', marginBottom: 8 }} />
        <button type="submit" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Procesando...' : 'Confirmar Pago'}
        </button>
      </form>
      {paymentUrl && (
        <div style={{ marginTop: 16 }}>
          {/* <a href={paymentUrl} target="_blank" rel="noopener noreferrer">
            Ir al pago
          </a> */}
          <CardPayment
            initialization={{ amount: 10 }}
            onSubmit={async (param) => {
              console.log(param);
            }}
          />
          {/* <Wallet 
            initialization={initialization} 
            onSubmit={onSubmit}
            onReady={onReady}
            onError={onError}
          
          /> */}
          <Brand />
          {/* <Wallet
            initialization={initialization}
            customization={customization}
            onSubmit={onSubmit}
            onReady={onReady}
          /> */}
        </div>
        
      )}
      {error && <div style={{ color: 'red', marginTop: 16 }}>{error}</div>}
      <div className="cho-container" style={{ marginTop: 16 }}></div>
    </div>
  );
};

export default TestMercadoPago;