
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { User } from '../types';
import { API_ENDPOINTS } from '../utils/constants';

const API_URL = API_ENDPOINTS.BACKEND;
const TOKEN_KEY = 'mc_token';
const USER_KEY = 'mc_user';

export class AuthService {
  static async signUp(email: string, password: string, userData: Partial<User>) {
    try {
      const res = await axios.post(`${API_URL}/auth/signup`, {
        ...userData,
        email,
        password,
      });
      const { access_token, user } = res.data;
      if (access_token) {
        await SecureStore.setItemAsync(TOKEN_KEY, access_token);
      }
      if (user) {
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
      }
      return { user, token: access_token };
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  static async signIn(email: string, password: string) {
    try {
      let res;
      try {
        res = await axios.post(`${API_URL}/auth/signin`, { email, password });
      } catch (primaryErr: any) {
        // Fallback to /auth/login if backend uses older route
        res = await axios.post(`${API_URL}/auth/login`, { email, password });
      }
      const { access_token, user } = res.data;
      if (access_token) {
        await SecureStore.setItemAsync(TOKEN_KEY, access_token);
      }
      if (user) {
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
      }
      return { user, token: access_token };
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  static async signInWithGoogle(googleToken: string) {
    try {
      const res = await axios.post(`${API_URL}/auth/google`, { token: googleToken });
      const { access_token, user } = res.data;
      if (access_token) await SecureStore.setItemAsync(TOKEN_KEY, access_token);
      if (user) await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
      return { user, token: access_token };
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  static async signOut() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
  }

  static async getCurrentUser(): Promise<User | null> {
    const raw = await SecureStore.getItemAsync(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch (e) {
      return null;
    }
  }

  static async getToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  }

  // placeholder update methods — implement server endpoints as needed
  static async updateUserProfile(userId: number | string, updates: Partial<User>) {
    // Implement PUT/PATCH to backend when endpoint exists
    return null;
  }

  // Phone verification stubs (replace with backend implementations if available)
  static async sendPhoneVerification(phoneNumber: string) {
    throw new Error('Phone verification is not implemented. Migrate to backend SMS provider.');
  }

  static async verifyPhoneCode(confirmationResult: any, code: string) {
    throw new Error('Phone verification is not implemented. Migrate to backend SMS provider.');
  }
}
