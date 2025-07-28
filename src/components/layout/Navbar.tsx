import React from 'react';
import { Users, LogOut, Ticket, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Link } from 'react-router-dom';

interface NavbarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onViewChange }) => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <Ticket className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">Rafflio</h1>
            </div>
            
            <div className="hidden md:flex space-x-4">
              <button
                onClick={() => onViewChange('raffles')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentView === 'raffles' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Rifas Activas
              </button>
              <Link to="/test-mercadopago">Test MercadoPago</Link>
              {user?.role === 'ADMIN' && (
                <>
                  <button
                    onClick={() => onViewChange('admin')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentView === 'admin' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Settings className="w-4 h-4 inline mr-1" />
                    Administración
                  </button>
                  <button
                    onClick={() => onViewChange('purchases')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentView === 'purchases' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Users className="w-4 h-4 inline mr-1" />
                    Compras
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">
                  Hola, <span className="font-medium">{user.name}</span>
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Salir
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => onViewChange('login')}
                size="sm"
              >
                Iniciar Sesión
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};