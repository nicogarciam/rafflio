import { comparePassword } from '../lib/hash';
import { userService } from './user.service';
import { User } from '../types';
import { supabase } from '../lib/supabase';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User | null;
  error?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: string;
  isActive?: boolean;
}

class AuthService {
  
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    if (!supabase) {
      return { success: false, error: 'Supabase no está configurado' };
    }
    try {
      // Buscar usuario por email en la tabla users
      const { data, error } = await supabase.from('users').select('*').eq('email', credentials.email).single();
      if (error) {
        console.error('Error consultando usuario:', error);
        return { success: false, error: 'Error consultando usuario. Intente más tarde.' };
      }
      if (!data) {
        return { success: false, error: 'Usuario o contraseña incorrectos' };
      }
      // Forzar tipos correctos
      const userData = data as {
        id: string;
        email: string;
        name: string;
        role: string;
        is_active: boolean;
        password_hash: string;
      };
      // Comparar password
      const match = await comparePassword(credentials.password, userData.password_hash);
      if (!match) {
        return { success: false, error: 'Usuario o contraseña incorrectos' };
      }
      // Verificar si está activo
      if (userData.is_active === false) {
        return { success: false, error: 'El usuario está inactivo. Contacte al administrador.' };
      }
      // Construir objeto User
      const user: User = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        isActive: userData.is_active
      };
      return { success: true, user };
    } catch (error: any) {
      console.error('Error de autenticación:', error);
      return { success: false, error: error?.message || 'Error de autenticación. Intente más tarde.' };
    }
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const user = await userService.createUser({
        email: userData.email,
        name: userData.name,
        password: userData.password,
        role: userData.role as 'ADMIN' | 'USER',
        isActive: userData.isActive ?? true,
      });
      return { success: true, user };
    } catch (error: any) {
      return { success: false, error: error.message || 'Error de registro' };
    }
  }

  async logout(): Promise<void> {
    if (!supabase) {
      console.warn('Supabase no está configurado');
      return;
    }

    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error durante logout:', error);
    }
  }

  async getCurrentUser(): Promise<User | null> {
    if (!supabase) {
      return null;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        return {
          id: user.id,
          email: user.email!,
          name: user.user_metadata?.name || 'Usuario',
          role: user.user_metadata?.role || 'USER',
          isActive: user.user_metadata?.isActive ?? true,
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error obteniendo usuario actual:', error);
      return null;
    }
  }

  async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    if (!supabase) {
      return { success: false, error: 'Supabase no está configurado' };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Error al enviar email de reset' };
    }
  }

  // Fallback para desarrollo con credenciales hardcodeadas
  async loginWithHardcodedCredentials(credentials: LoginCredentials): Promise<AuthResponse> {
    // Simular autenticación - admin@admin.com / admin123
    if (credentials.email === 'admin@admin.com' && credentials.password === 'admin123') {
      const adminUser: User = {
        id: '1',
        email: 'admin@admin.com',
        role: 'ADMIN',
        name: 'Administrator',
        isActive: true
      };
      return { success: true, user: adminUser };
    }
    
    return { success: false, error: 'Credenciales inválidas' };
  }

  onAuthStateChange(callback: (user: User | null) => void) {
    if (!supabase) {
      // En modo desarrollo sin Supabase, no hay cambios de estado
      return { data: { subscription: { unsubscribe: () => {} } } };
    }

    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const user: User = {
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.name || 'Usuario',
          role: session.user.user_metadata?.role || 'USER',
          isActive: session.user.user_metadata?.isActive ?? true,
        };
        callback(user);
      } else {
        callback(null);
      }
    });
  }
}

export const authService = new AuthService(); 