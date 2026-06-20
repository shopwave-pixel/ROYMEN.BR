import api from './api';
import { User } from '../types';

export interface OtpResponse {
  success: boolean;
  message: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: {
    id: string; // Map id to _id in our frontend context
    name: string;
    email: string;
    phone?: string;
    role: 'customer' | 'admin';
    shippingAddress?: string;
  };
}

export interface ProfileResponse {
  success: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    role: 'customer' | 'admin';
    phone?: string;
    shippingAddress?: string;
  };
}

export const authService = {
  /**
   * Request a single session 6-Digit Verification OTP to be sent via Email
   */
  requestOtp: async (email: string, purpose: 'login' | 'registration'): Promise<OtpResponse> => {
    const response = await api.post<OtpResponse>('/auth/otp/send', { email, purpose });
    return response.data;
  },

  /**
   * Verify the OTP and receive a signed login sessions token
   */
  verifyOtp: async (
    email: string,
    otpCode: string,
    purpose: 'login' | 'registration',
    name?: string,
    phone?: string
  ): Promise<AuthResponse> => {
    const payload = { email, otpCode, purpose, name, phone };
    const response = await api.post<AuthResponse>('/auth/otp/verify', payload);
    return response.data;
  },

  /**
   * Retrieve active session user profile data
   */
  getUserProfile: async (): Promise<ProfileResponse> => {
    const response = await api.get<ProfileResponse>('/auth/profile');
    return response.data;
  },
};

export default authService;
