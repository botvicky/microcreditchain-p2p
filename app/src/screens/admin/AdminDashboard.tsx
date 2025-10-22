import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { AdminService } from '../../services/adminService';
import { LoadingSpinner } from '../../components/LoadingSpinner';

interface Analytics {
  totalUsers: number;
  activeBorrowers: number;
  activeLenders: number;
  totalLoans: number;
  activeLoans: number;
  totalRevenue: number;
}

export const AdminDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [analytics, setAnalytics] = useState<Analytics>({
    totalUsers: 0,
    activeBorrowers: 0,
    activeLenders: 0,
    totalLoans: 0,
    activeLoans: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const analyticsData = await AdminService.getAnalytics();
      setAnalytics(analyticsData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load analytics');
      // Fallback to mock data
      setAnalytics({
        totalUsers: 1250,
        activeBorrowers: 800,
        activeLenders: 450,
        totalLoans: 3200,
        activeLoans: 450,
        totalRevenue: 125000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFreezeAccount = async (userId: string) => {
    Alert.alert(
      'Freeze Account',
      'Are you sure you want to freeze this account?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Freeze', 
          onPress: async () => {
            try {
              await AdminService.updateUserStatus(userId, 'frozen');
              Alert.alert('Success', 'Account frozen successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to freeze account');
            }
          }
        },
      ]
    );
  };

  const handleSendNotification = async () => {
    Alert.alert(
      'Send Notification',
      'This will open the notification composer.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Continue', 
          onPress: async () => {
            try {
              await AdminService.sendSystemNotification(
                'System Update',
                'Platform maintenance scheduled for tonight at 2 AM.'
              );
              Alert.alert('Success', 'Notification sent to all users');
            } catch (error) {
              Alert.alert('Error', 'Failed to send notification');
            }
          }
        },
      ]
    );
  };

  if (loading) {
    return <LoadingSpinner message="Loading admin data..." />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Admin Dashboard</Text>
        <Text style={styles.roleText}>System Management</Text>
      </View>

      {/* Analytics Overview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>System Analytics</Text>
        <View style={styles.analyticsGrid}>
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsNumber}>{analytics.totalUsers.toLocaleString()}</Text>
            <Text style={styles.analyticsLabel}>Total Users</Text>
          </View>
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsNumber}>{analytics.activeBorrowers}</Text>
            <Text style={styles.analyticsLabel}>Active Borrowers</Text>
          </View>
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsNumber}>{analytics.activeLenders}</Text>
            <Text style={styles.analyticsLabel}>Active Lenders</Text>
          </View>
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsNumber}>{analytics.totalLoans}</Text>
            <Text style={styles.analyticsLabel}>Total Loans</Text>
          </View>
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsNumber}>{analytics.activeLoans}</Text>
            <Text style={styles.analyticsLabel}>Active Loans</Text>
          </View>
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsNumber}>${analytics.totalRevenue.toLocaleString()}</Text>
            <Text style={styles.analyticsLabel}>Total Revenue</Text>
          </View>
        </View>
      </View>

      {/* User Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>User Management</Text>
        <View style={styles.managementCard}>
          <View style={styles.managementItem}>
            <Text style={styles.managementLabel}>Recent Users</Text>
            <TouchableOpacity style={styles.managementButton}>
              <Text style={styles.managementButtonText}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.managementItem}>
            <Text style={styles.managementLabel}>Frozen Accounts</Text>
            <TouchableOpacity style={styles.managementButton}>
              <Text style={styles.managementButtonText}>Manage</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.managementItem}>
            <Text style={styles.managementLabel}>User Ratings</Text>
            <TouchableOpacity style={styles.managementButton}>
              <Text style={styles.managementButtonText}>Boost Ratings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Loan Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Loan Management</Text>
        <View style={styles.managementCard}>
          <View style={styles.managementItem}>
            <Text style={styles.managementLabel}>Active Loans</Text>
            <TouchableOpacity style={styles.managementButton}>
              <Text style={styles.managementButtonText}>Monitor</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.managementItem}>
            <Text style={styles.managementLabel}>Default Rates</Text>
            <TouchableOpacity style={styles.managementButton}>
              <Text style={styles.managementButtonText}>View Report</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.managementItem}>
            <Text style={styles.managementLabel}>Disputes</Text>
            <TouchableOpacity style={styles.managementButton}>
              <Text style={styles.managementButtonText}>Resolve</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* System Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>System Actions</Text>
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleSendNotification}
          >
            <Text style={styles.actionButtonText}>Send Notification</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>System Logs</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Backup Data</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Revenue Report</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityCard}>
          <View style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Text style={styles.activityIconText}>👤</Text>
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>New User Registration</Text>
              <Text style={styles.activityDescription}>John Doe registered as a borrower</Text>
              <Text style={styles.activityTime}>2 hours ago</Text>
            </View>
          </View>
          
          <View style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Text style={styles.activityIconText}>💰</Text>
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Loan Approved</Text>
              <Text style={styles.activityDescription}>$2,000 loan approved for Jane Smith</Text>
              <Text style={styles.activityTime}>4 hours ago</Text>
            </View>
          </View>
          
          <View style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Text style={styles.activityIconText}>⚠️</Text>
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Account Frozen</Text>
              <Text style={styles.activityDescription}>Account frozen for policy violation</Text>
              <Text style={styles.activityTime}>6 hours ago</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#0052CC',
    padding: 24,
    paddingTop: 60,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Poppins-SemiBold',
  },
  roleText: {
    fontSize: 16,
    color: '#B3D9FF',
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C2C2C',
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 16,
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  analyticsCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    minWidth: '30%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  analyticsNumber: {
    fontSize: 24,
    fontWeight: '600',
    color: '#0052CC',
    fontFamily: 'Poppins-SemiBold',
  },
  analyticsLabel: {
    fontSize: 12,
    color: '#2C2C2C',
    fontFamily: 'Inter-Regular',
    marginTop: 4,
    textAlign: 'center',
  },
  managementCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  managementItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  managementLabel: {
    fontSize: 16,
    color: '#2C2C2C',
    fontFamily: 'Inter-Regular',
  },
  managementButton: {
    backgroundColor: '#0052CC',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  managementButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-Bold',
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    color: '#0052CC',
    fontFamily: 'Inter-Bold',
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  activityIconText: {
    fontSize: 20,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2C2C2C',
    fontFamily: 'Inter-Medium',
  },
  activityDescription: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
});
