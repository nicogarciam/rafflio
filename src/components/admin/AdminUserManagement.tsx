import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Toggle } from '../ui/Toggle';
import { TrashIcon } from '../ui/TrashIcon';
import { useAuth } from '../../contexts/AuthContext';
import { User } from '../../types';
import { userService } from '../../services/user.service';

interface NewUserForm {
  email: string;
  name: string;
  password: string;
  role: 'ADMIN' | 'USER';
}
  

export const AdminUserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const [newUser, setNewUser] = useState<NewUserForm>({ email: '', name: '', password: '', role: 'USER' });
  const [creating, setCreating] = useState(false);
  const handleNewUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const created = await userService.createUser({ ...newUser, isActive: true });
      setUsers(users => [...users, created]);
      setShowNewUserForm(false);
      setNewUser({ email: '', name: '', password: '', role: 'USER' });
    } catch {
      setError('No se pudo crear el usuario');
    } finally {
      setCreating(false);
    }
  };


  useEffect(() => {
    userService.getAllUsers()
      .then(setUsers)
      .catch(() => setError('Error al cargar usuarios'))
      .finally(() => setLoading(false));
  }, []);

  const handleDeleteUser = async (userId: string, userEmail?: string) => {
    const confirmed = window.confirm(`⚠️\n¿Estás seguro que deseas eliminar el usuario "${userEmail ?? ''}"?\nEsta acción es permanente y no se puede deshacer.`);
    if (!confirmed) return;
    try {
      await userService.deleteUser(userId);
      setUsers(users => users.filter(u => u.id !== userId));
    } catch {
      setError('No se pudo eliminar el usuario');
    }
  };

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    try {
      await userService.setUserActive(userId, !isActive);
      setUsers(users => users.map(u => u.id === userId ? { ...u, isActive: !isActive } : u));
    } catch {
      setError('No se pudo actualizar el usuario');
    }
  };

  if (loading) return <div>Cargando usuarios...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <Card className="max-w-3xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Gestión de Usuarios</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex justify-end">
          <Button size="sm" onClick={() => setShowNewUserForm(f => !f)}>
            {showNewUserForm ? 'Cancelar' : 'Nuevo Usuario'}
          </Button>
        </div>
        {showNewUserForm && (
          <form onSubmit={handleCreateUser} className="mb-6 p-4 border rounded-lg bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  value={newUser.email}
                  onChange={handleNewUserChange}
                  className="border px-2 py-1 rounded w-full"
                />
              </div>
              <div>
                <label htmlFor="name" className="block text-xs font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  value={newUser.name}
                  onChange={handleNewUserChange}
                  className="border px-2 py-1 rounded w-full"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-1">Contraseña</label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  required
                  value={newUser.password}
                  onChange={handleNewUserChange}
                  className="border px-2 py-1 rounded w-full"
                />
              </div>
              <div>
                <label htmlFor="role" className="block text-xs font-medium text-gray-700 mb-1">Rol</label>
                <select
                  name="role"
                  id="role"
                  value={newUser.role}
                  onChange={handleNewUserChange}
                  className="border px-2 py-1 rounded w-full"
                >
                  <option value="USER">Usuario</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
            </div>
            <Button type="submit" size="sm" disabled={creating}>
              {creating ? 'Creando...' : 'Crear Usuario'}
            </Button>
          </form>
        )}
        {/* Tabla en desktop, cards en móvil */}
        <div className="hidden md:block">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2 text-left">Email</th>
                <th className="py-2 text-left">Nombre</th>
                <th className="py-2 text-left">Rol</th>
                <th className="py-2 text-left">Estado</th>
                <th className="py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="py-2">{user.email}</td>
                  <td className="py-2">{user.name}</td>
                  <td className="py-2">{user.role}</td>
                  <td className="py-2">
                    {user.isActive ? (
                      <span className="text-green-600 font-semibold">Activo</span>
                    ) : (
                      <span className="text-gray-500">Inactivo</span>
                    )}
                  </td>
                  <td className="py-2">
                    <div className="flex gap-2 justify-end items-center">
                      <div className="relative group">
                        <Toggle
                          checked={user.isActive}
                          onChange={() => user.id && handleToggleActive(user.id, user.isActive)}
                          disabled={!user.id || user.id === currentUser?.id}
                          aria-label={user.isActive ? 'Desactivar usuario' : 'Activar usuario'}
                        />
                        <span className="absolute z-10 left-1/2 -translate-x-1/2 bottom-full mb-1 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap pointer-events-none">
                          {user.isActive ? 'Desactivar usuario' : 'Activar usuario'}
                        </span>
                      </div>
                      {user.id !== currentUser?.id && (
                        <div className="relative group">
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => user.id && handleDeleteUser(user.id, user.email)}
                            disabled={!user.id}
                            className="p-2 h-8 w-8 flex items-center justify-center"
                            aria-label="Eliminar usuario"
                          >
                            <TrashIcon />
                          </Button>
                          <span className="absolute z-10 left-1/2 -translate-x-1/2 bottom-full mb-1 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap pointer-events-none">
                            Eliminar usuario
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Cards en móvil */}
        <div className="space-y-4 md:hidden">
          {users.map(user => (
            <div key={user.id} className="border rounded-lg p-4 bg-white shadow-sm flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-blue-900">{user.name}</div>
                <span className={`text-xs font-bold px-2 py-1 rounded ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{user.isActive ? 'Activo' : 'Inactivo'}</span>
              </div>
              <div className="text-sm text-gray-700 break-all">{user.email}</div>
              <div className="flex items-center gap-2 text-xs">
                <span className="font-medium">Rol:</span> {user.role}
              </div>
              <div className="flex gap-2 justify-end items-center mt-2">
                <Toggle
                  checked={user.isActive}
                  onChange={() => user.id && handleToggleActive(user.id, user.isActive)}
                  disabled={!user.id || user.id === currentUser?.id}
                  aria-label={user.isActive ? 'Desactivar usuario' : 'Activar usuario'}
                />
                {user.id !== currentUser?.id && (
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => user.id && handleDeleteUser(user.id, user.email)}
                    disabled={!user.id}
                    className="p-2 h-8 w-8 flex items-center justify-center"
                    aria-label="Eliminar usuario"
                  >
                    <TrashIcon />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};


