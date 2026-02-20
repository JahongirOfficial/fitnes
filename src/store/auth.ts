import { create } from "zustand";
import { api } from "@/lib/api";

interface User {
  id: string;
  username: string;
  fullName: string;
  role: string;
  avatar?: string;
  email?: string;
  phone?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, fullName: string, email?: string, phone?: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: typeof window !== "undefined" ? localStorage.getItem("token") : null,
  isLoading: false,
  isAuthenticated: false,

  login: async (username, password) => {
    set({ isLoading: true });
    try {
      const data = await api.login(username, password);
      localStorage.setItem("token", data.token);
      set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  register: async (username, password, fullName, email?, phone?) => {
    set({ isLoading: true });
    try {
      const data = await api.register(username, password, fullName, email, phone);
      localStorage.setItem("token", data.token);
      set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null, isAuthenticated: false });
  },

  loadUser: async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      set({ isAuthenticated: false });
      return;
    }
    try {
      const user = await api.getMe();
      set({ user, token, isAuthenticated: true });
    } catch {
      localStorage.removeItem("token");
      set({ user: null, token: null, isAuthenticated: false });
    }
  },

  setUser: (user) => set({ user }),
}));
