
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

export const DEMO_ACCOUNTS = [
  { email: 'admin@juman.com', password: 'admin123', name: 'مدير النظام', role: 'admin' },
  { email: 'doctor@juman.com', password: 'doctor123', name: 'د. سارة محمود', role: 'doctor' },
  { email: 'emp@juman.com', password: 'emp123', name: 'موظف استقبال', role: 'employee' },
  { email: 'user@juman.com', password: 'user123', name: 'مريض', role: 'patient' }
];

/**
 * Local-only Auth Helper
 */
const getStoredUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('juman_user');
  return user ? JSON.parse(user) : null;
};

const setStoredUser = (user: User | null) => {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem('juman_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('juman_user');
  }
};

/**
 * Gets the current session (Local)
 */
export const getSession = async (): Promise<User | null> => {
  return getStoredUser();
};

/**
 * Gets all users (Local - mostly demo accounts + any added later)
 */
export const getAllUsers = async (): Promise<User[]> => {
  if (typeof window === 'undefined') return [];
  const extra = localStorage.getItem('juman_extra_users');
  const extraUsers = extra ? JSON.parse(extra) : [];
  
  return [
    ...DEMO_ACCOUNTS.map((d, i) => ({
      id: `demo_${d.role}`,
      name: d.name,
      email: d.email,
      role: d.role as UserRole,
      status: 'active' as const
    })),
    ...extraUsers
  ];
};

/**
 * Get users by role
 */
export const getUsersByRole = async (role: UserRole): Promise<User[]> => {
  const all = await getAllUsers();
  return all.filter(u => u.role === role);
};

/**
 * Log in with email and password (Local)
 */
export const login = async (email: string, pass: string): Promise<User | null> => {
  const demo = DEMO_ACCOUNTS.find(d => d.email === email && d.password === pass);
  if (demo) {
    const user: User = {
      id: `demo_${demo.role}`,
      name: demo.name,
      email: demo.email,
      role: demo.role as UserRole,
      status: 'active'
    };
    setStoredUser(user);
    return user;
  }
  return null;
};

/**
 * Register a new user (Local)
 */
export const register = async (email: string, pass: string, name: string, phone: string, role: UserRole = 'patient'): Promise<User | null> => {
  const user: User = {
    id: `u_${Date.now()}`,
    name,
    email,
    role,
    phone,
    status: 'active'
  };
  
  // Store in extra users
  const all = await getAllUsers();
  const extra = all.filter(u => !u.id.startsWith('demo_'));
  localStorage.setItem('juman_extra_users', JSON.stringify([...extra, user]));
  
  setStoredUser(user);
  return user;
};

/**
 * Change current user password (Mock)
 */
export const changePassword = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
  return { success: true };
};

/**
 * Update user profile (Local)
 */
export const updateUser = async (id: string, data: Partial<User>) => {
  const currentUser = getStoredUser();
  if (currentUser && currentUser.id === id) {
    const updated = { ...currentUser, ...data };
    setStoredUser(updated);
  }
  
  // Update in extra users if exists
  const extra = localStorage.getItem('juman_extra_users');
  if (extra) {
    const users = JSON.parse(extra);
    const updated = users.map((u: any) => u.id === id ? { ...u, ...data } : u);
    localStorage.setItem('juman_extra_users', JSON.stringify(updated));
  }
};

/**
 * Admin: Add a new user (Local)
 */
export const adminAddUser = async (data: { 
  name: string; 
  email: string; 
  role: UserRole; 
  phone: string; 
  specialty?: string; 
  password?: string;
}) => {
  const newUser: User = {
    id: `u_${Date.now()}`,
    name: data.name,
    email: data.email,
    role: data.role,
    phone: data.phone,
    specialty: data.specialty,
    status: 'active'
  };
  
  const extraStr = localStorage.getItem('juman_extra_users');
  const extra = extraStr ? JSON.parse(extraStr) : [];
  localStorage.setItem('juman_extra_users', JSON.stringify([...extra, newUser]));
  
  return newUser;
};

/**
 * Log out (Local)
 */
export const logout = async () => {
  setStoredUser(null);
};

/**
 * Admin: Delete a user (Local)
 */
export const deleteUser = async (id: string) => {
  const extraStr = localStorage.getItem('juman_extra_users');
  if (extraStr) {
    const extra = JSON.parse(extraStr);
    const filtered = extra.filter((u: any) => u.id !== id);
    localStorage.setItem('juman_extra_users', JSON.stringify(filtered));
  }
};

/**
 * Admin: Toggle user status (Local)
 */
export const toggleUserStatus = async (id: string) => {
  const extraStr = localStorage.getItem('juman_extra_users');
  if (extraStr) {
    const extra = JSON.parse(extraStr);
    const updated = extra.map((u: any) => u.id === id ? { ...u, status: u.status === 'inactive' ? 'active' : 'inactive' } : u);
    localStorage.setItem('juman_extra_users', JSON.stringify(updated));
  }
};

export const updateUserProfile = updateUser;
export const adminUpdateUser = updateUser;
