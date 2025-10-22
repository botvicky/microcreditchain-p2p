import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { LoanOffer, LoanApplication } from '../../types';
import { LoanService } from '../../services/loanService';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useNavigation } from '@react-navigation/native';

export const BorrowerDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const navigation = useNavigation<any>();
  const [loanOffers, setLoanOffers] = useState<LoanOffer[]>([]);
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minAmount: '',
    maxAmount: '',
    minInterestRate: '',
    maxInterestRate: '',
    duration: '',
  });

  useEffect(() => {
    loadLoanOffers();
    loadApplications();
  }, []);

  const loadLoanOffers = async () => {
    setLoading(true);
    try {
      const offers = await LoanService.getActiveLoanOffers();
      setLoanOffers(offers);
    } catch (error) {
      Alert.alert('Error', 'Failed to load loan offers');
    } finally {
      setLoading(false);
    }
  };

  const loadApplications = async () => {
    if (!user?.id) return;
    
    try {
      const userApplications = await LoanService.getUserApplications();
      setApplications(userApplications);
    } catch (error) {
      Alert.alert('Error', 'Failed to load applications');
    }
  };

  const applyFilters = async () => {
    setLoading(true);
    try {
      const filterParams = {
        minAmount: filters.minAmount ? parseFloat(filters.minAmount) : undefined,
        maxAmount: filters.maxAmount ? parseFloat(filters.maxAmount) : undefined,
        minInterestRate: filters.minInterestRate ? parseFloat(filters.minInterestRate) : undefined,
        maxInterestRate: filters.maxInterestRate ? parseFloat(filters.maxInterestRate) : undefined,
        duration: filters.duration || undefined,
      };
      
      const filteredOffers = await LoanService.filterLoanOffers(filterParams);
      setLoanOffers(filteredOffers);
      setShowFilters(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to apply filters');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = async () => {
    setFilters({
      minAmount: '',
      maxAmount: '',
      minInterestRate: '',
      maxInterestRate: '',
      duration: '',
    });
    await loadLoanOffers();
    setShowFilters(false);
  };

  const handleApplyForLoan = (offerId: string) => {
    navigation.navigate('LoanApplication', { offerId });
  };

  if (loading) {
    return <LoadingSpinner message="Loading loan offers..." />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome back, {user?.name}!</Text>
        <Text style={styles.roleText}>Borrower Dashboard</Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{applications.length}</Text>
          <Text style={styles.statLabel}>Active Applications</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{loanOffers.length}</Text>
          <Text style={styles.statLabel}>Available Loans</Text>
        </View>
      </View>

      {/* Available Loan Offers */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Available Loan Offers</Text>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilters(true)}
          >
            <Text style={styles.filterButtonText}>Filter</Text>
          </TouchableOpacity>
        </View>
        {loanOffers.map((offer) => (
          <View key={offer.id} style={styles.offerCard}>
            <View style={styles.offerHeader}>
              <Text style={styles.offerAmount}>${offer.amount.toLocaleString()}</Text>
              <Text style={styles.offerRate}>{offer.interestRate}% interest</Text>
            </View>
            <Text style={styles.offerDuration}>{offer.duration}</Text>
            <Text style={styles.offerConditions}>{offer.conditions}</Text>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => handleApplyForLoan(String(offer.id))}
            >
              <Text style={styles.applyButtonText}>Apply Now</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* My Applications */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Applications</Text>
        {applications.map((application) => (
          <View key={application.id} style={styles.applicationCard}>
            <View style={styles.applicationHeader}>
              <Text style={styles.applicationId}>Application #{application.id}</Text>
              <View style={[
                styles.statusBadge,
                application.status === 'approved' && styles.statusApproved,
                application.status === 'rejected' && styles.statusRejected,
              ]}>
                <Text style={[
                  styles.statusText,
                  application.status === 'approved' && styles.statusTextApproved,
                  application.status === 'rejected' && styles.statusTextRejected,
                ]}>
                  {application.status.toUpperCase()}
                </Text>
              </View>
            </View>
            <Text style={styles.applicationDate}>
              Applied on {application.createdAt.toLocaleDateString()}
            </Text>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Browse Loans</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Upload Statement</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>My Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter Loan Offers</Text>
            
            <View style={styles.filterRow}>
              <View style={styles.filterInput}>
                <Text style={styles.filterLabel}>Min Amount</Text>
                <TextInput
                  style={styles.filterTextInput}
                  value={filters.minAmount}
                  onChangeText={(text) => setFilters(prev => ({ ...prev, minAmount: text }))}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.filterInput}>
                <Text style={styles.filterLabel}>Max Amount</Text>
                <TextInput
                  style={styles.filterTextInput}
                  value={filters.maxAmount}
                  onChangeText={(text) => setFilters(prev => ({ ...prev, maxAmount: text }))}
                  placeholder="10000"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.filterRow}>
              <View style={styles.filterInput}>
                <Text style={styles.filterLabel}>Min Interest Rate</Text>
                <TextInput
                  style={styles.filterTextInput}
                  value={filters.minInterestRate}
                  onChangeText={(text) => setFilters(prev => ({ ...prev, minInterestRate: text }))}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.filterInput}>
                <Text style={styles.filterLabel}>Max Interest Rate</Text>
                <TextInput
                  style={styles.filterTextInput}
                  value={filters.maxInterestRate}
                  onChangeText={(text) => setFilters(prev => ({ ...prev, maxInterestRate: text }))}
                  placeholder="20"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.filterInput}>
              <Text style={styles.filterLabel}>Duration</Text>
              <TextInput
                style={styles.filterTextInput}
                value={filters.duration}
                onChangeText={(text) => setFilters(prev => ({ ...prev, duration: text }))}
                placeholder="e.g., 3 months"
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  statsContainer: {
    flexDirection: 'row',
    padding: 24,
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '600',
    color: '#0052CC',
    fontFamily: 'Poppins-SemiBold',
  },
  statLabel: {
    fontSize: 14,
    color: '#2C2C2C',
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
  offerCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  offerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  offerAmount: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0052CC',
    fontFamily: 'Poppins-SemiBold',
  },
  offerRate: {
    fontSize: 16,
    color: '#00B894',
    fontFamily: 'Inter-Bold',
  },
  offerDuration: {
    fontSize: 16,
    color: '#2C2C2C',
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  offerConditions: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Inter-Regular',
    marginBottom: 16,
  },
  
  applicationCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  applicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  applicationId: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2C2C2C',
    fontFamily: 'Inter-Medium',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FFF3CD',
  },
  statusApproved: {
    backgroundColor: '#D4EDDA',
  },
  statusRejected: {
    backgroundColor: '#F8D7DA',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#856404',
    fontFamily: 'Inter-Bold',
  },
  statusTextApproved: {
    color: '#155724',
  },
  statusTextRejected: {
    color: '#721C24',
  },
  applicationDate: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Inter-Regular',
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
    minWidth: '30%',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    color: '#0052CC',
    fontFamily: 'Inter-Bold',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterButton: {
    backgroundColor: '#0052CC',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  filterButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-Bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C2C2C',
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 20,
    textAlign: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  filterInput: {
    flex: 1,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2C2C2C',
    marginBottom: 8,
    fontFamily: 'Inter-Medium',
  },
  filterTextInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Inter-Regular',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  clearButton: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  clearButtonText: {
    color: '#2C2C2C',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-Bold',
  },
  applyButton: {
    flex: 1,
    backgroundColor: '#0052CC',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-Bold',
  },
});
