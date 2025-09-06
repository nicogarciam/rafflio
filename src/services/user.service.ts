import { supabase } from '../lib/supabase';
import { User } from '../types';
import { hashPassword } from '../lib/hash'; // Asegúrate de que la ruta sea correcta o define la función si no existe

class UserService {
  async deleteUser(userId: string): Promise<void> {
    if (!supabase) throw new Error('Supabase no está configurado');
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);
    if (error) throw error;
  }

  async createUser(newUser: User): Promise<User> {
    if (!supabase) throw new Error('Supabase no está configurado');
    if (!newUser.email || !newUser.name || !newUser.password) {
      throw new Error('Email, name and password are required');
    }
    const hashedPassword = await hashPassword(newUser.password);
    const { data, error } = await supabase
      .from('users')
      .insert([{
        email: newUser.email,
        name: newUser.name,
        password_hash: hashedPassword,
        role: newUser.role,
        is_active: newUser.isActive ?? true
      }])
      .select()
      .single();
    if (error) throw error;
    return this.transformUserData(data);
  }

  async getAllUsers(): Promise<User[]> {
    if (!supabase) throw new Error('Supabase no está configurado');
    const { data, error } = await supabase.from('users').select('*');
    if (error) throw error;
    return this.transformUsersData(data);
  }

  async setUserActive(userId: string, isActive: boolean): Promise<void> {
    if (!supabase) throw new Error('Supabase no está configurado');
    const { error } = await supabase
      .from('users')
      .update({ isActive })
      .eq('id', userId);
    if (error) throw error;
  };

  async changeUserPassword(userId: string, newPassword: string): Promise<void> {
    if (!supabase) throw new Error('Supabase no está configurado');
    if (!newPassword || newPassword.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }
    
    const hashedPassword = await hashPassword(newPassword);
    const { error } = await supabase
      .from('users')
      .update({ password_hash: hashedPassword })
      .eq('id', userId);
    if (error) throw error;
  };

  private transformUserData = (data: any): User => {
    return {
      id: data.id as string,
      email: data.email as string,
      password: '', // Nunca devolver el hash
      name: data.name as string,
      isActive: data.is_active as boolean,
      role: data.role as 'ADMIN' | 'USER',
      // Otros campos si es necesario
    };
  }

  private transformUsersData = (data: any[]): User[] => {
    return data.map(this.transformUserData);
  }
}

export const userService = new UserService();