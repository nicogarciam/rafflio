import { AdminRafflesView } from './views/AdminRafflesView';
import { EditRaffleView } from './views/EditRaffleView';
// import { EditRaffleForm } se creará luego
import { Users } from 'lucide-react';
import React, { useState } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { LoginForm } from './components/auth/LoginForm';
import { RequireAuth } from './components/auth/RequireAuth';
import { Navbar } from './components/layout/Navbar';
import { PurchaseFlow } from './components/purchase/PurchaseFlow';
import { CreateRaffleForm } from './components/raffles/CreateRaffleForm';
import { TicketSelector } from './components/tickets/TicketSelector';
import { ConfigSetup } from './components/ui/ConfigSetup';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { RaffleProvider, useRaffle } from './contexts/RaffleContext';
import { config } from './lib/config';
import { Raffle } from './types';
import AdminUserManagementView from './views/AdminUserManagementView';
import CartPage from './views/CartPage';
import { PaymentSuccessPage } from './views/PaymentSuccessPage';
import PurchasesView from './views/PurchasesView';
import RaffleDetailView from './views/RaffleDetailView';
import RafflesView from './views/RafflesView';
import AdminRaffleDetailView from './views/AdminRaffleDetailView';

const AppContent: React.FC = () => {
  useAuth();
  const { raffles, purchases } = useRaffle();
  const [selectedRaffle, setSelectedRaffle] = useState<Raffle | null>(null);
  const [selectedTier, setSelectedTier] = useState<any>(null);
  const [showPurchaseFlow, setShowPurchaseFlow] = useState(false);
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<string | null>(null);
  const [showConfigSetup, setShowConfigSetup] = useState(false);

  React.useEffect(() => {
    if (!config.isConfigured() && config.isDevelopment) {
      setShowConfigSetup(true);
    }
  }, []);

  const handleBuyTickets = (raffle: Raffle, tier?: any) => {
    setSelectedRaffle(raffle);
    setSelectedTier(tier || null);
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

          {/* Rutas protegidas para admin */}
          <Route path="/admin" element={
            <RequireAuth>
              <AdminDashboard />
            </RequireAuth>
          } />
          <Route path="/admin/raffles" element={
            <RequireAuth>
              <AdminRafflesView />
            </RequireAuth>
          } />
          <Route path="/admin/raffles/new" element={
            <RequireAuth>
              <CreateRaffleForm />
            </RequireAuth>
          } />
          <Route path="/admin/raffles/edit/:id" element={
            <RequireAuth>
              <EditRaffleView />
            </RequireAuth>
          } />
          <Route path="/admin/raffles/detail/:id" element={
            <RequireAuth>
              <AdminRaffleDetailView />
            </RequireAuth>
          } />
          <Route path="/admin/users" element={
            <RequireAuth>
              <AdminUserManagementView />
            </RequireAuth>
          } />

          {/* Rutas públicas */}
          <Route path="/purchases" element={<PurchasesView />} />
          <Route path="/raffle/view/:raffleId" element={<RaffleDetailView onBuyTickets={handleBuyTickets} />} />
          <Route path="/cart" element={<CartPage />} />
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
          initialTier={selectedTier}
          isOpen={showPurchaseFlow}
          onClose={() => {
            setShowPurchaseFlow(false);
            setSelectedRaffle(null);
            setSelectedTier(null);
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