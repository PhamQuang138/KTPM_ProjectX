import {create} from 'zustand';
import {apiRequest} from '../lib/api';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
}

interface LoginResponse {
  token: string;
  user: AuthUser;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  signup: (input: {email: string; password: string; name: string; avatar?: string}) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const storedToken = localStorage.getItem('auth_token');
const storedUser = localStorage.getItem('auth_user');

export const useAuthStore = create<AuthState>((set, get) => ({
  token: storedToken,
  user: storedUser ? (JSON.parse(storedUser) as AuthUser) : null,
  isAuthenticated: Boolean(storedToken),

  async signup(input) {
    const result = await apiRequest<LoginResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(input),
    });

    localStorage.setItem('auth_token', result.token);
    localStorage.setItem('auth_user', JSON.stringify(result.user));

    set({
      token: result.token,
      user: result.user,
      isAuthenticated: true,
    });
  },

  async login(email: string, password: string) {
    const result = await apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({email, password}),
    });

    localStorage.setItem('auth_token', result.token);
    localStorage.setItem('auth_user', JSON.stringify(result.user));

    set({
      token: result.token,
      user: result.user,
      isAuthenticated: true,
    });
  },

  async logout() {
    if (get().token) {
      await apiRequest('/auth/logout', {
        method: 'POST',
      }).catch(() => undefined);
    }

    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');

    set({
      token: null,
      user: null,
      isAuthenticated: false,
    });
  },
}));
