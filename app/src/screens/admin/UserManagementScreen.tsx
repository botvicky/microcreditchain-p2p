import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { AdminService } from '../../services/adminService';
import { User } from '../../types';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export const UserManagementScreen: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<'all' | 'borrower' | 'lender' | 'admin'>('all');

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, selectedRole]);

  const loadUsers = async () => {
    try {
      const allUsers = await AdminService.getAllUsers(100);
      setUsers(allUsers);
    } catch (error) {
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filter by role
    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRole);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.includes(searchTerm)
      );
    }

    setFilteredUsers(filtered);
  };

  const handleFreezeUser = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'frozen' : 'active';
    const action = newStatus === 'frozen' ? 'freeze' : 'unfreeze';

    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} Account`,
      `Are you sure you want to ${action} this account?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          style: newStatus === 'frozen' ? 'destructive' : 'default',
          onPress: async () => {
            try {
              await AdminService.updateUserStatus(userId, newStatus);
              setUsers(prev =>
                prev.map(user =>
                  user.id === userId ? { ...user, status: newStatus } : user
                )
              );
              Alert.alert('Success', `Account ${action}d successfully`);
            } catch (error) {
              Alert.alert('Error', `Failed to ${action} account`);
            }
          },
        },
      ]
    );
  };

  const handleBoostRating = async (userId: string, currentRating: number) => {
    Alert.prompt(
      'Boost User Rating',
      'Enter new rating (0-100):',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: async (newRating: string | undefined) => {
            const rating = parseInt(newRating || '0');
            if (isNaN(rating) || rating < 0 || rating > 100) {
              Alert.alert('Error', 'Please enter a valid rating between 0 and 100');
              return;
            }

            try {
              await AdminService.boostUserRating(userId, rating);
              setUsers(prev =>
                prev.map(user =>
                  user.id === userId ? { ...user, rating } : user
                )
              );
              Alert.alert('Success', 'User rating updated successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to update rating');
            }
          },
        },
      ],
      'plain-text',
      currentRating.toString()
    );
  };

  const getStatusColor = (status: string): string => {
    return status === 'active' ? '#00B894' : '#E63946';
  };

  const getRoleColor = (role: string): string => {
    switch (role) {
      case 'admin':
        return '#0052CC';
      case 'lender':
        return '#FFD700';
      case 'borrower':
        return '#00B894';
      default:
        return '#666';
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading users..." />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>User Management</Text>
        <Text style={styles.subtitle}>
          {filteredUsers.length} users found
        </Text>
      </View>

      <View style={styles.filters}>
        <TextInput
          style={styles.searchInput}
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholder="Search users..."
          placeholderTextColor="#999"
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.roleFilters}>
          {['all', 'borrower', 'lender', 'admin'].map((role) => (
            <TouchableOpacity
              key={role}
              style={[
                styles.roleFilter,
                selectedRole === role && styles.roleFilterActive,
              ]}
              onPress={() => setSelectedRole(role as any)}
            >
              <Text
                style={[
                  styles.roleFilterText,
                  selectedRole === role && styles.roleFilterTextActive,
                ]}
              >
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.usersList}>
        {filteredUsers.map((user) => (
          <View key={user.id} style={styles.userCard}>
            <View style={styles.userHeader}>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
                <Text style={styles.userPhone}>{user.phone}</Text>
              </View>
              <View style={styles.userBadges}>
                <View style={[styles.roleBadge, { backgroundColor: getRoleColor(user.role) }]}>
                  <Text style={styles.roleBadgeText}>
                    {user.role.toUpperCase()}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(user.status) }]}>
                  <Text style={styles.statusBadgeText}>
                    {user.status.toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.userDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Rating:</Text>
                <Text style={styles.detailValue}>{user.rating}/100</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>ID Number:</Text>
                <Text style={styles.detailValue}>{user.idNumber || 'Not provided'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Joined:</Text>
                <Text style={styles.detailValue}>
                  {new Date(user.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </View>

            <View style={styles.userActions}>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  user.status === 'active' ? styles.freezeButton : styles.unfreezeButton,
                ]}
                onPress={() => handleFreezeUser(String(user.id), user.status)}
              >
                <Text style={[
                  styles.actionButtonText,
                  user.status === 'active' ? styles.freezeButtonText : styles.unfreezeButtonText,
                ]}>
                  {user.status === 'active' ? 'Freeze' : 'Unfreeze'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.boostButton}
                onPress={() => handleBoostRating(String(user.id), user.rating)}
              >
                <Text style={styles.boostButtonText}>Boost Rating</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
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
  filters: {
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Inter-Regular',
    marginBottom: 16,
  },
  roleFilters: {
    marginBottom: 16,
  },
  roleFilter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    marginRight: 8,
  },
  roleFilterActive: {
    backgroundColor: '#0052CC',
  },
  roleFilterText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Inter-Medium',
  },
  roleFilterTextActive: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  usersList: {
    padding: 24,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C2C2C',
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Inter-Regular',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Inter-Regular',
  },
  userBadges: {
    alignItems: 'flex-end',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 4,
  },
  roleBadgeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusBadgeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  userDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Inter-Regular',
  },
  detailValue: {
    fontSize: 14,
    color: '#2C2C2C',
    fontFamily: 'Inter-Medium',
  },
  userActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  freezeButton: {
    backgroundColor: '#F8D7DA',
    borderWidth: 1,
    borderColor: '#F5C6CB',
  },
  unfreezeButton: {
    backgroundColor: '#D4EDDA',
    borderWidth: 1,
    borderColor: '#C3E6CB',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-Bold',
  },
  freezeButtonText: {
    color: '#721C24',
  },
  unfreezeButtonText: {
    color: '#155724',
  },
  boostButton: {
    flex: 1,
    backgroundColor: '#FFD700',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  boostButtonText: {
    color: '#2C2C2C',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-Bold',
  },
});
