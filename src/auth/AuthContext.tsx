// src/auth/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  username: string;
}

interface AuthContextType {
  token: string | null;
  currentUser: User | null;
  login: (token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const API_URL = '/api';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('access_token'));
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // для первого монтирования

  const fetchMe = async (jwtToken: string) => {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${jwtToken}` },
    });

    if (res.status === 401 || res.status === 403) {
      throw new Error('unauthorized');
    }

    if (!res.ok) {
      throw new Error('temporary_error');
    }

    const user: User = await res.json();
    setCurrentUser(user);
  };


  // Логин с токеном
  const login = async (newToken: string) => {
    localStorage.setItem('access_token', newToken);
    setToken(newToken);
    await fetchMe(newToken);
  };

  // Логаут
  const logout = () => {
    localStorage.removeItem('access_token');
    setToken(null);
    setCurrentUser(null);
  };

  useEffect(() => {
    if (!token) { setLoading(false); return; }

    fetchMe(token)
      .catch((err) => {
        if (err.message === 'unauthorized') logout();
        // иначе НЕ удаляем токен, просто показываем “сервер недоступен” и т.п.
        console.error('fetchMe error:', err);
      })
      .finally(() => setLoading(false));
  }, [token]);


  return (
    <AuthContext.Provider value={{ token, currentUser, login, logout }}>
      {!loading ? children : <div className="min-h-screen center-vertical"><p>Загрузка...</p></div>}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
