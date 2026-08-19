import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import { authService } from '../services';
import { User, AuthState } from '../types';

// Actions
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'SKIP_AUTH' }
  | { type: 'RESTORE_SESSION'; payload: User | null };

// Context value
interface AuthContextValue extends AuthState {
  login: (phone: string, mpin: string) => Promise<void>;
  register: (name: string, phone: string) => Promise<void>;
  verifyOtp: (phone: string, otp: string, mpin?: string) => Promise<void>;
  logout: () => Promise<void>;
  skipAuth: () => void;
  checkSession: () => Promise<void>;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isSkipped: false,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        isSkipped: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isSkipped: false,
      };
    case 'SKIP_AUTH':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isSkipped: true,
      };
    case 'RESTORE_SESSION':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
      };
    default:
      return state;
  }
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check existing session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const sessionData = await authService.getSession();
      if (sessionData.valid && sessionData.user) {
        dispatch({ type: 'RESTORE_SESSION', payload: sessionData.user });
      } else {
        dispatch({ type: 'RESTORE_SESSION', payload: null });
      }
    } catch {
      // No valid session — that's fine
      dispatch({ type: 'RESTORE_SESSION', payload: null });
    }
  }, []);

  const login = useCallback(async (phone: string, mpin: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await authService.login({ phone, mpin });
      if (response.user) {
        dispatch({ type: 'LOGIN_SUCCESS', payload: response.user });
      } else {
        // Fetch user data after login
        const user = await authService.getMe();
        dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      }
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  }, []);

  const register = useCallback(async (name: string, phone: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await authService.register({ name, phone });
      dispatch({ type: 'SET_LOADING', payload: false });
      // OTP sent — user will verify on OTP screen
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  }, []);

  const verifyOtp = useCallback(async (phone: string, otp: string, mpin?: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await authService.verifyOtp({ phone, otp, mpin });
      if (response.user) {
        dispatch({ type: 'LOGIN_SUCCESS', payload: response.user });
      } else {
        const user = await authService.getMe();
        dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      }
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore errors during logout
    }
    dispatch({ type: 'LOGOUT' });
  }, []);

  const skipAuth = useCallback(() => {
    dispatch({ type: 'SKIP_AUTH' });
  }, []);

  const value: AuthContextValue = {
    ...state,
    login,
    register,
    verifyOtp,
    logout,
    skipAuth,
    checkSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
