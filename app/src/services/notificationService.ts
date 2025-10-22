import axios from 'axios';
import { Notification } from '../types';
import { AuthService } from './auth';
import { API_ENDPOINTS } from '../utils/constants';

const API_URL = API_ENDPOINTS.BACKEND;

export class NotificationService {
  static async sendNotification(notification: Omit<Notification, 'id' | 'createdAt'>) {
    const token = await AuthService.getToken();
    const res = await axios.post(`${API_URL}/notifications`, notification, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  }

  static async getUserNotifications() {
    const token = await AuthService.getToken();
    try {
      const res = await axios.get(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data as Notification[];
    } catch (err) {
      // Fallback to legacy route requiring userId
      const user = await AuthService.getCurrentUser();
      if (!user) return [];
      const res = await axios.get(`${API_URL}/notifications/user/${user.id}`);
      return res.data as Notification[];
    }
  }

  static async markAsRead(notificationId: string) {
    const token = await AuthService.getToken();
    try {
      await axios.put(`${API_URL}/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      await axios.post(`${API_URL}/notifications/${notificationId}/read`, {});
    }
  }

  static async getUnreadCount() {
    const token = await AuthService.getToken();
    try {
      const res = await axios.get(`${API_URL}/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data.count as number;
    } catch (err) {
      const user = await AuthService.getCurrentUser();
      if (!user) return 0;
      const res = await axios.get(`${API_URL}/notifications/${user.id}/unread-count`);
      return res.data.count as number;
    }
  }

  static async sendSystemNotification(title: string, message: string) {
    const token = await AuthService.getToken();
    try {
      await axios.post(`${API_URL}/admin/notifications/system`, { title, message }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      await axios.post(`${API_URL}/notifications`, { user_id: 0, title, message });
    }
  }
}
