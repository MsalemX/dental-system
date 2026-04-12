import { supabase } from './supabase';

export type UserRole = 'admin' | 'doctor' | 'employee' | 'patient';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  specialty?: string;
  bio?: string;
  status?: 'active' | 'inactive';
  age?: string;
  gender?: string;
}

/**
 * Gets the current active session and profile from Supabase
 */
export const getSession = async (): Promise<User | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (!profile) return null;

  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    role: profile.role,
    phone: profile.phone,
    specialty: profile.specialty,
    bio: profile.bio,
    status: profile.status,
    age: profile.age?.toString(),
    gender: profile.gender
  };
};

/**
 * Gets all users from profiles table
 */
export const getAllUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*');
  
  if (error) return [];
  return data.map(profile => ({
    id: profile.id,
    name: profile.name,
    email: profile.email,
    role: profile.role,
    phone: profile.phone,
    specialty: profile.specialty,
    bio: profile.bio,
    status: profile.status,
    age: profile.age?.toString(),
    gender: profile.gender
  }));
};

/**
 * Get users by role
 */
export const getUsersByRole = async (role: UserRole): Promise<User[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', role);
  
  if (error) return [];
  return data.map(profile => ({
    id: profile.id,
    name: profile.name,
    email: profile.email,
    role: profile.role,
    phone: profile.phone,
    specialty: profile.specialty,
    bio: profile.bio,
    status: profile.status,
    age: profile.age?.toString(),
    gender: profile.gender
  }));
};

/**
 * Log in with email and password
 */
export const login = async (email: string, pass: string): Promise<User | null> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: pass,
  });

  if (error || !data.user) return null;

  // Profiles are synced via SQL Trigger, but we fetch to confirm
  return getSession();
};

/**
 * Register a new user (with profile)
 */
export const register = async (email: string, pass: string, name: string, role: UserRole = 'patient'): Promise<User | null> => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password: pass,
    options: {
      data: {
        full_name: name,
        role: role
      }
    }
  });

  if (error || !data.user) return null;

  // Profile is created by DB trigger, we just return the user session
  return getSession();
};

/**
 * Change current user password
 */
export const changePassword = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { success: false, error: error.message };
  return { success: true };
};

/**
 * Update user profile
 */
export const updateUser = async (id: string, data: Partial<User>) => {
  const { error } = await supabase
    .from('profiles')
    .update(data)
    .eq('id', id);
  
  if (error) throw error;
};

/**
 * Admin: Add a new user (Staff or Patient)
 */
export const adminAddUser = async (data: { 
  name: string; 
  email: string; 
  role: UserRole; 
  phone: string; 
  specialty?: string; 
  password?: string;
}) => {
  // Using signUp or an edge function would be better for admin, 
  // but for simplicity in this clinic setup, we can use signUp if it's allowed
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password || '123456',
    options: {
      data: {
        name: data.name,
        phone: data.phone,
        role: data.role,
        specialty: data.specialty
      }
    }
  });

  if (authError) throw authError;
  return authData.user;
};

/**
 * Log out
 */
export const logout = async () => {
  await supabase.auth.signOut();
};

export const updateUserProfile = updateUser;
export const adminUpdateUser = updateUser;
