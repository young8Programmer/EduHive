import api from './api';
import Cookies from 'js-cookie';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export const authService = {
  login: async (data: LoginData) => {
    const response = await api.post('/auth/login', data);
    if (response.data.access_token) {
      Cookies.set('token', response.data.access_token, { expires: 7 });
    }
    return response.data;
  },

  register: async (data: RegisterData) => {
    const response = await api.post('/auth/register', data);
    if (response.data.access_token) {
      Cookies.set('token', response.data.access_token, { expires: 7 });
    }
    return response.data;
  },

  logout: () => {
    Cookies.remove('token');
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  },

  getCurrentUser: async (): Promise<User | null> => {
    try {
      const token = Cookies.get('token');
      if (!token) return null;
      const response = await api.get('/users/me');
      return response.data;
    } catch {
      return null;
    }
  },
};
