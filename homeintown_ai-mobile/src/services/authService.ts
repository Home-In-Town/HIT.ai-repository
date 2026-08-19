/**
 * Auth Service — mirrors backend auth.routes.js endpoints.
 */

import { apiRequest } from './api';
import { User } from '../types';

interface RegisterPayload {
  name: string;
  phone: string;
  role?: string;
}

interface VerifyOtpPayload {
  phone: string;
  otp: string;
  mpin?: string;
}

interface LoginPayload {
  phone: string;
  mpin: string;
}

interface ForgotMpinPayload {
  phone: string;
}

interface ResetMpinPayload {
  phone: string;
  otp: string;
  newMpin: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}

export const authService = {
  /**
   * Register a new user — sends OTP to phone.
   */
  register: (data: RegisterPayload) =>
    apiRequest<AuthResponse>('auth/register', {
      method: 'POST',
      body: data as unknown as Record<string, unknown>,
    }),

  /**
   * Verify OTP after register/forgot-mpin.
   */
  verifyOtp: (data: VerifyOtpPayload) =>
    apiRequest<AuthResponse>('auth/verify-otp', {
      method: 'POST',
      body: data as unknown as Record<string, unknown>,
    }),

  /**
   * Login with phone + MPIN.
   */
  login: (data: LoginPayload) =>
    apiRequest<AuthResponse>('auth/login', {
      method: 'POST',
      body: data as unknown as Record<string, unknown>,
    }),

  /**
   * Get current user session.
   */
  getMe: () => apiRequest<User>('auth/me'),

  /**
   * Check session validity.
   */
  getSession: () => apiRequest<{ valid: boolean; user?: User }>('auth/session'),

  /**
   * Forgot MPIN — sends OTP.
   */
  forgotMpin: (data: ForgotMpinPayload) =>
    apiRequest<AuthResponse>('auth/forgot-mpin', {
      method: 'POST',
      body: data as unknown as Record<string, unknown>,
    }),

  /**
   * Reset MPIN with OTP verification.
   */
  resetMpin: (data: ResetMpinPayload) =>
    apiRequest<AuthResponse>('auth/reset-mpin', {
      method: 'POST',
      body: data as unknown as Record<string, unknown>,
    }),

  /**
   * Logout — clears session cookie.
   */
  logout: () =>
    apiRequest<{ success: boolean }>('auth/logout', { method: 'POST' }),
};
