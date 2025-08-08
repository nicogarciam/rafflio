import React from 'react';
import { Users, LogOut, Ticket, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Link, useNavigate } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2"
            onClick={() => navigate('/')}>
              <Ticket className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">Rafflio</h1>
            </div>
            <div className="hidden md:flex space-x-4">
              <Link
                to="/"
                className="px-3 py-2 rounded-lg text-sm font-medium transition-colors text-gray-600 hover:text-gray-900"
              >
                Rifas Activas
              </Link>
              {user?.role === 'ADMIN' && (
                <>
                  <Link
                    to="/admin"
                    className="px-3 py-2 rounded-lg text-sm font-medium transition-colors text-gray-600 hover:text-gray-900"
                  >
                    <Settings className="w-4 h-4 inline mr-1" />
                    Administración
                  </Link>
                  <Link
                    to="/admin/users"
                    className="px-3 py-2 rounded-lg text-sm font-medium transition-colors text-gray-600 hover:text-gray-900"
                  >
                    <Users className="w-4 h-4 inline mr-1" />
                    Gestión de Usuarios
                  </Link>
                  <Link
                    to="/purchases"
                    className="px-3 py-2 rounded-lg text-sm font-medium transition-colors text-gray-600 hover:text-gray-900"
                  >
                    <Users className="w-4 h-4 inline mr-1" />
                    Compras
                  </Link>
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
              <Link to="/login">
                <Button size="sm">Iniciar Sesión</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};