import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/auth';
import { authApi, getToken, setToken, removeToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  acceptInvitation: (email: string, token: string, password: string, passwordConfirmation: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await authApi.getCurrentUser();
        if (response.success && response.user) {
          setUser(response.user);
        } else {
          removeToken();
        }
      } catch (error) {
        removeToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const response = await authApi.login({ email, password });
    if (response.token && response.user) {
      setToken(response.token);
      setUser(response.user);
    }
  };

  const acceptInvitation = async (
    email: string,
    token: string,
    password: string,
    passwordConfirmation: string
  ): Promise<void> => {
    const response = await authApi.acceptInvitation({
      email,
      token,
      password,
      password_confirmation: passwordConfirmation,
    });
    if (response.token && response.user) {
      setToken(response.token);
      setUser(response.user);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch {
      removeToken();
    } finally {
      setUser(null);
    }
  };

  const deleteAccount = async (): Promise<void> => {
    try {
      await authApi.deleteAccount();
    } catch {
      removeToken();
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
        deleteAccount,
        acceptInvitation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
