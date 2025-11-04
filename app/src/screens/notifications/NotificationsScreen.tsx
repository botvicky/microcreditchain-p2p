import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { NotificationService } from '../../services/notificationService';
import { useAuthStore } from '../../store/authStore';
import { Notification } from '../../types';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export const NotificationsScreen: React.FC = () => {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    if (!user) return;

    try {
      const userNotifications = await NotificationService.getUserNotifications();
      setNotifications(userNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await NotificationService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getNotificationIcon = (type: string): string => {
    switch (type) {
      case 'loan_approval':
        return '✅';
      case 'loan_rejection':
        return '❌';
      case 'repayment_reminder':
        return '💰';
      case 'account_frozen':
        return '⚠️';
      case 'system':
        return '📢';
      default:
        return '📱';
    }
  };

  const getNotificationColor = (type: string): string => {
    switch (type) {
      case 'loan_approval':
        return '#00bf80';
      case 'loan_rejection':
        return '#E63946';
      case 'repayment_reminder':
        return '#FFD700';
      case 'account_frozen':
        return '#E63946';
      case 'system':
        return '#00224d';
      default:
        return '#666';
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading notifications..." />;
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        <Text style={styles.subtitle}>
          {notifications.filter(n => !n.read).length} unread
        </Text>
      </View>

      {notifications.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📱</Text>
          <Text style={styles.emptyTitle}>No Notifications</Text>
          <Text style={styles.emptyDescription}>
            You don't have any notifications yet. We'll notify you about important updates.
          </Text>
        </View>
      ) : (
        <View style={styles.notificationsList}>
          {notifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationCard,
                !notification.read && styles.unreadCard,
              ]}
              onPress={() => handleMarkAsRead(notification.id)}
            >
              <View style={styles.notificationHeader}>
                <View style={styles.notificationIcon}>
                  <Text style={styles.iconText}>
                    {getNotificationIcon(notification.type)}
                  </Text>
                </View>
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationTitle}>
                    {notification.title}
                  </Text>
                  <Text style={styles.notificationMessage}>
                    {notification.message}
                  </Text>
                  <Text style={styles.notificationTime}>
                    {new Date(notification.createdAt).toLocaleDateString()} at{' '}
                    {new Date(notification.createdAt).toLocaleTimeString()}
                  </Text>
                </View>
                {!notification.read && (
                  <View style={styles.unreadIndicator} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#00224d',
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Poppins-SemiBold',
  },
  subtitle: {
    fontSize: 16,
    color: '#B3D9FF',
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C2C2C',
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
  notificationsList: {
    padding: 24,
  },
  notificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#00224d',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 20,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2C',
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Regular',
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00224d',
    marginLeft: 8,
    marginTop: 4,
  },
});
