import { User } from '../types';

export const MOCK_USER: User = {
  id: 'usr_admin_001',
  name: 'System Administrator',
  email: 'admin@uae-piping.ae',
  role: 'Super Admin',
  avatarUrl: 'https://ui-avatars.com/api/?name=System+Admin&background=1e40af&color=fff'
};

export const login = async (email: string, password: string): Promise<User> => {
  // Simulate API call
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Allow 'admin' username or the full email
      if ((email === 'admin' || email === 'admin@uae-piping.ae') && password === 'password123') {
        resolve(MOCK_USER);
      } else {
        reject(new Error("Invalid credentials"));
      }
    }, 1000);
  });
};

export const logout = async (): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, 500));
};