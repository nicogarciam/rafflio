import React from 'react';
import MercadoPagoConfigForm from '../components/admin/MercadoPagoConfigForm';

const AdminMercadoPagoSettingsView: React.FC = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Configuración - MercadoPago</h1>
                <p className="text-gray-600">Administra las credenciales y la clave pública de MercadoPago.</p>
            </div>

            <div className="max-w-3xl">
                <MercadoPagoConfigForm />
            </div>
        </div>
    );
};

export default AdminMercadoPagoSettingsView;
