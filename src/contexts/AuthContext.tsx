import { createContext, useContext, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

interface AuthUser {
  id: number;
  userid: string;
  userName: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  login: (userid: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const SESSION_KEY = 'auth_user';

function loadUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(loadUser);
  const navigate = useNavigate();

  async function login(userid: string, password: string) {
    const data = await api.login(userid, password);
    const authUser: AuthUser = { id: data.id, userid: data.userid, userName: data.userName };
    localStorage.setItem(SESSION_KEY, JSON.stringify(authUser));
    setUser(authUser);
    navigate('/stores');
  }

  async function logout() {
    try {
      await api.logout();
    } catch {
      // 서버 로그아웃 실패해도 로컬 세션은 반드시 정리
    }
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
    navigate('/login');
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
