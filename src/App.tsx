import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { RaffleProvider, useRaffle } from './contexts/RaffleContext';
import { Navbar } from './components/layout/Navbar';
import { LoginForm } from './components/auth/LoginForm';
import { RaffleCard } from './components/raffles/RaffleCard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { PurchaseFlow } from './components/purchase/PurchaseFlow';
import { TicketSelector } from './components/tickets/TicketSelector';
import { Card, CardContent } from './components/ui/Card';
import { ConfigSetup } from './components/ui/ConfigSetup';
import { Loader2, Users, ShoppingCart, Ticket } from 'lucide-react';
import { Raffle } from './types';
import { config } from './lib/config';
import TestMercadoPago from './components/purchase/TestMercadoPago';
import RafflesView from './views/RafflesView';
import PurchasesView from './views/PurchasesView';
import { PaymentSuccessPage } from './views/PaymentSuccessPage';
import RaffleDetailView from './views/RaffleDetailView';
import AdminUserManagementView from './views/AdminUserManagementView';
import { RequireAuth } from './components/auth/RequireAuth';

const AppContent: React.FC = () => {
  useAuth();
  const { raffles, purchases } = useRaffle();
  const [selectedRaffle, setSelectedRaffle] = useState<Raffle | null>(null);
  const [showPurchaseFlow, setShowPurchaseFlow] = useState(false);
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<string | null>(null);
  const [showConfigSetup, setShowConfigSetup] = useState(false);

  React.useEffect(() => {
    if (!config.isConfigured() && config.isDevelopment) {
      setShowConfigSetup(true);
    }
  }, []);

  const handleBuyTickets = (raffle: Raffle) => {
    setSelectedRaffle(raffle);
    setShowPurchaseFlow(true);
  };

  const handlePurchaseComplete = (purchaseId: string) => {
    setShowPurchaseFlow(false);
    setSelectedRaffle(null);
    setSelectedPurchaseId(purchaseId);
  };

  const handleTicketSelectorClose = () => {
    setSelectedPurchaseId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<RafflesView raffles={raffles} onBuyTickets={handleBuyTickets} />} />
          
          <Route path="/admin" element={<AdminDashboard />} />
          
          <Route path="/purchases" element={<PurchasesView purchases={purchases} raffles={raffles} />} />
          
          <Route path="/raffle/view/:raffleId" element={<RaffleDetailView onBuyTickets={handleBuyTickets} />} />
          
          <Route path="/admin/users" element={
            <RequireAuth>
              <AdminUserManagementView />
            </RequireAuth>
          } />

          <Route path="/payment/:purchaseId?/success" element={<PaymentSuccessPage />} />
          
          <Route path="/ticket-selector/:purchaseId" element={<TicketSelector purchaseId={selectedPurchaseId || ''} onClose={handleTicketSelectorClose} />} />
          
          <Route path="/login" element={<LoginForm />} />
          
          <Route path="*" element={
            <div className="text-center py-16">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Bienvenido a Rafflio
              </h3>
              <p className="text-gray-600 mb-6">
                La plataforma más completa para gestionar rifas y sorteos online
              </p>
            </div>
          } />
        </Routes>
      </main>
      {/* Purchase Flow Modal */}
      {selectedRaffle && (
        <PurchaseFlow
          raffle={selectedRaffle}
          isOpen={showPurchaseFlow}
          onClose={() => {
            setShowPurchaseFlow(false);
            setSelectedRaffle(null);
          }}
          onPurchaseComplete={handlePurchaseComplete}
        />
      )}
      {/* Config Setup Modal */}
      {showConfigSetup && (
        <ConfigSetup onClose={() => setShowConfigSetup(false)} />
      )}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <RaffleProvider>
        <Router>
          <AppContent />
        </Router>
      </RaffleProvider>
    </AuthProvider>
  );
}

export default App;