import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { fetchCurrentUser, type CurrentUserResponse } from '../api/user.api';
import { setLogoutHandler } from '../api/axios';

type AuthContextState = {
  user: CurrentUserResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextState | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

const TOKEN_KEY = 'token';

export const getRoleRedirectPath = (roles: string[] = []) => {
  if (roles.includes('ADMIN') || roles.includes('SUPERADMIN')) {
    return '/admin';
  }
  if (roles.includes('AUTHOR')) {
    return '/author';
  }
  if (roles.includes('USER')) {
    return '/user';
  }
  return '/';
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<CurrentUserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setIsLoading(false);
  }, []);

  const hydrateUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const profile = await fetchCurrentUser();
      setUser(profile);
    } catch (error) {
      logout();
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  const login = useCallback(
    async (newToken: string) => {
      localStorage.setItem(TOKEN_KEY, newToken);
      setToken(newToken);
      await hydrateUser();
    },
    [hydrateUser]
  );

  useEffect(() => {
    setLogoutHandler(logout);
  }, [logout]);

  useEffect(() => {
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    if (user || isLoading) {
      return;
    }
    hydrateUser();
  }, [hydrateUser, isLoading, token, user]);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      isLoading,
      login,
      logout,
    }),
    [isLoading, login, logout, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
