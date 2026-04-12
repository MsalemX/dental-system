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
  roomId?: string;
  age?: string;
  gender?: string;
}

const INITIAL_USERS: Record<string, { email: string; password: string; role: UserRole; name: string; specialty?: string; phone?: string; status?: 'active' | 'inactive' }> = {
  admin: { email: 'admin@juman.com', password: 'admin123', role: 'admin', name: 'أحمد المدير', status: 'active' },
  doctor: { email: 'doctor@juman.com', password: 'doctor123', role: 'doctor', name: 'د. سارة محمود', specialty: 'تقويم أسنان', status: 'active' },
  employee: { email: 'emp@juman.com', password: 'emp123', role: 'employee', name: 'لجين الموظفة', status: 'active' },
  patient: { email: 'user@juman.com', password: 'user123', role: 'patient', name: 'فهد المريض', status: 'active' },
};

export const getAllUsers = (): Record<string, any> => {
  if (typeof window === 'undefined') return INITIAL_USERS;
  const stored = localStorage.getItem('juman_users');
  if (!stored) return INITIAL_USERS;
  // Merge: stored users + INITIAL_USERS (initial always win for the 4 system keys)
  const storedParsed = JSON.parse(stored);
  return { ...storedParsed, ...INITIAL_USERS };
};

export const getSession = (): User | null => {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('juman_user');
  return user ? JSON.parse(user) : null;
};

export const login = (email: string, pass: string): User | null => {
  const users = getAllUsers();
  const userKey = Object.keys(users).find(
    (key) => users[key].email === email && users[key].password === pass
  );

  if (userKey) {
    const userData = users[userKey];
    
    // Check if account is inactive
    if (userData.status === 'inactive') return null;

    const user = { 
        id: userKey, 
        name: userData.name, 
        email: userData.email, 
        role: userData.role, 
        phone: userData.phone,
        specialty: userData.specialty,
        bio: userData.bio,
        status: userData.status || 'active'
    };
    localStorage.setItem('juman_user', JSON.stringify(user));
    return user;
  }
  return null;
};

export const register = (name: string, email: string, pass: string, phone: string): User | null => {
  const users = getAllUsers();
  if (Object.values(users).some((u: any) => u.email === email)) return null;

  const id = `user_${Date.now()}`;
  users[id] = { name, email, password: pass, role: 'patient', phone, status: 'active' };
  localStorage.setItem('juman_users', JSON.stringify(users));
  
  // Auto login
  return login(email, pass);
};

export const adminAddUser = (data: { name: string; email: string; role: UserRole; phone: string; specialty?: string; password?: string; age?: string; gender?: string }) => {
  const users = getAllUsers();
  if (Object.values(users).some((u: any) => u.email === data.email)) throw new Error('البريد الإلكتروني موجود مسبقاً');

  const id = `user_${Date.now()}`;
  users[id] = { 
    ...data, 
    password: data.password || '123456', // Default password if not provided
    status: 'active' 
  };
  localStorage.setItem('juman_users', JSON.stringify(users));
  return { id, ...users[id] };
};

export const adminUpdateUser = (id: string, data: Partial<User> & { password?: string }) => {
  const users = getAllUsers();
  if (users[id]) {
    users[id] = { ...users[id], ...data };
    localStorage.setItem('juman_users', JSON.stringify(users));
    
    // Update session if it's the same user
    const session = getSession();
    if (session && session.id === id) {
      localStorage.setItem('juman_user', JSON.stringify({ ...session, ...data }));
    }
  }
};

export const deleteUser = (id: string) => {
  const users = getAllUsers();
  if (users[id]) {
    delete users[id];
    localStorage.setItem('juman_users', JSON.stringify(users));
  }
};

export const toggleUserStatus = (id: string) => {
  const users = getAllUsers();
  if (users[id]) {
    users[id].status = users[id].status === 'inactive' ? 'active' : 'inactive';
    localStorage.setItem('juman_users', JSON.stringify(users));
  }
};

export const updateUser = adminUpdateUser;
export const updateUserProfile = adminUpdateUser;

export const logout = () => {
  localStorage.removeItem('juman_user');
};


