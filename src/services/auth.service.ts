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
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    if (!supabase) {
      return { success: false, error: 'Supabase no está configurado' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        const user: User = {
          id: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata?.name || 'Usuario',
          role: data.user.user_metadata?.role || 'USER',
        };
        return { success: true, user };
      }

      return { success: false, error: 'Usuario no encontrado' };
    } catch (error) {
      return { success: false, error: 'Error de autenticación' };
    }
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    if (!supabase) {
      return { success: false, error: 'Supabase no está configurado' };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            role: 'USER',
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        const user: User = {
          id: data.user.id,
          email: data.user.email!,
          name: userData.name,
          role: 'USER',
        };
        return { success: true, user };
      }

      return { success: false, error: 'Error al crear usuario' };
    } catch (error) {
      return { success: false, error: 'Error de registro' };
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
        name: 'Administrator'
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
        };
        callback(user);
      } else {
        callback(null);
      }
    });
  }
}

export const authService = new AuthService(); 