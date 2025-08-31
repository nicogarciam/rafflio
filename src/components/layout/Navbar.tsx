import React, { useState } from 'react';
import { Users, LogOut, Ticket, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Link, useNavigate } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
              <Ticket className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">Rafflio</h1>
            </div>
            {/* Desktop menu */}
            <div className="hidden md:flex space-x-4">
              <Link to="/" className="px-3 py-2 rounded-lg text-sm font-medium transition-colors text-gray-600 hover:text-gray-900">Bonos Activos</Link>
              {user?.role === 'ADMIN' && <>
                <Link to="/admin" className="px-3 py-2 rounded-lg text-sm font-medium transition-colors text-gray-600 hover:text-gray-900"><Settings className="w-4 h-4 inline mr-1" />Administración</Link>
                <Link to="/admin/raffles" className="px-3 py-2 rounded-lg text-sm font-medium transition-colors text-blue-600 hover:text-blue-900"><Ticket className="w-4 h-4 inline mr-1" />Bonos Contribución</Link>
                <Link to="/admin/users" className="px-3 py-2 rounded-lg text-sm font-medium transition-colors text-gray-600 hover:text-gray-900"><Users className="w-4 h-4 inline mr-1" />Gestión de Usuarios</Link>
                <Link to="/purchases" className="px-3 py-2 rounded-lg text-sm font-medium transition-colors text-gray-600 hover:text-gray-900"><Users className="w-4 h-4 inline mr-1" />Contribuciones</Link>
              </>}
            </div>
          </div>
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setMenuOpen(!menuOpen)} className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 focus:outline-none">
              <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">Hola, <span className="font-medium">{user.name}</span></span>
                <Button variant="outline" size="sm" onClick={logout}><LogOut className="w-4 h-4 mr-1" />Salir</Button>
              </div>
            ) : (
              <Link to="/login"><Button size="sm">Iniciar Sesión</Button></Link>
            )}
          </div>
        </div>
        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden mt-2 space-y-2">
            <Link to="/" className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900" onClick={() => setMenuOpen(false)}>Bonos Activos</Link>
            {user?.role === 'ADMIN' && <>
              <Link to="/admin" className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900" onClick={() => setMenuOpen(false)}><Settings className="w-4 h-4 inline mr-1" />Administración</Link>
              <Link to="/admin/raffles" className="block px-3 py-2 rounded-lg text-sm font-medium text-blue-600 hover:text-blue-900" onClick={() => setMenuOpen(false)}><Ticket className="w-4 h-4 inline mr-1" />Bonos Contribución</Link>
              <Link to="/admin/users" className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900" onClick={() => setMenuOpen(false)}><Users className="w-4 h-4 inline mr-1" />Gestión de Usuarios</Link>
              <Link to="/purchases" className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900" onClick={() => setMenuOpen(false)}><Users className="w-4 h-4 inline mr-1" />Contribuciones</Link>
            </>}
            <div className="border-t border-gray-200 my-2" />
            {user ? (
              <div className="flex items-center space-x-3 px-3">
                <span className="text-sm text-gray-600">Hola, <span className="font-medium">{user.name}</span></span>
                <Button variant="outline" size="sm" onClick={() => { setMenuOpen(false); logout(); }}><LogOut className="w-4 h-4 mr-1" />Salir</Button>
              </div>
            ) : (
              <Link to="/login" onClick={() => setMenuOpen(false)}><Button size="sm">Iniciar Sesión</Button></Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};