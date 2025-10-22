import axios from 'axios';
import { AuthService } from './auth';
import { User, Notification } from '../types';
import { API_ENDPOINTS } from '../utils/constants';

export interface Analytics {
  totalUsers: number;
  activeBorrowers: number;
  activeLenders: number;
  totalLoans: number;
  activeLoans: number;
  totalRevenue: number;
}

const API_URL = API_ENDPOINTS.BACKEND;

export class AdminService {
  static async getAllUsers(limitCount: number = 50): Promise<User[]> {
    const token = await AuthService.getToken();
    const res = await axios.get(`${API_URL}/admin/users`, { headers: { Authorization: `Bearer ${token}` }, params: { limit: limitCount } });
    return res.data as User[];
  }

  static async getUsersByRole(role: 'borrower' | 'lender' | 'admin'): Promise<User[]> {
    const token = await AuthService.getToken();
    const res = await axios.get(`${API_URL}/admin/users`, { headers: { Authorization: `Bearer ${token}` }, params: { role } });
    return res.data as User[];
  }

  static async getFrozenUsers(): Promise<User[]> {
    const token = await AuthService.getToken();
    const res = await axios.get(`${API_URL}/admin/users/frozen`, { headers: { Authorization: `Bearer ${token}` } });
    return res.data as User[];
  }

  static async updateUserStatus(userId: string, status: 'active' | 'frozen'): Promise<void> {
    const token = await AuthService.getToken();
    await axios.put(`${API_URL}/admin/users/${userId}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } });
  }

  static async boostUserRating(userId: string, rating: number): Promise<void> {
    const token = await AuthService.getToken();
    await axios.put(`${API_URL}/admin/users/${userId}/rating`, { rating }, { headers: { Authorization: `Bearer ${token}` } });
  }

  static async getAnalytics(): Promise<Analytics> {
    const token = await AuthService.getToken();
    const res = await axios.get(`${API_URL}/admin/analytics`, { headers: { Authorization: `Bearer ${token}` } });
    return res.data as Analytics;
  }

  static async sendSystemNotification(title: string, message: string): Promise<void> {
    const token = await AuthService.getToken();
    await axios.post(`${API_URL}/admin/notifications/system`, { title, message }, { headers: { Authorization: `Bearer ${token}` } });
  }

  static async createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<string> {
    const token = await AuthService.getToken();
    const res = await axios.post(`${API_URL}/notifications`, notification, { headers: { Authorization: `Bearer ${token}` } });
    return res.data.id;
  }

  static async getAllNotifications(): Promise<Notification[]> {
    const token = await AuthService.getToken();
    const res = await axios.get(`${API_URL}/notifications`, { headers: { Authorization: `Bearer ${token}` } });
    return res.data as Notification[];
  }

  static async getUserById(userId: string): Promise<User | null> {
    const token = await AuthService.getToken();
    const res = await axios.get(`${API_URL}/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
    return res.data as User;
  }

  static async searchUsers(searchTerm: string): Promise<User[]> {
    const token = await AuthService.getToken();
    const res = await axios.get(`${API_URL}/admin/users/search`, { headers: { Authorization: `Bearer ${token}` }, params: { q: searchTerm } });
    return res.data as User[];
  }
}
