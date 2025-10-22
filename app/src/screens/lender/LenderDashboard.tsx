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
import { LoanOffer, LoanApplication } from '../../types';
import { LoanService } from '../../services/loanService';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useNavigation } from '@react-navigation/native';

export const LenderDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const navigation = useNavigation<any>();
  const [myOffers, setMyOffers] = useState<LoanOffer[]>([]);
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLenderData();
  }, []);

  const loadLenderData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
    // Load lender's offers
    const offers = await LoanService.getLenderOffers();
      setMyOffers(offers);
      
    // Load applications for lender's offers
    const lenderApplications = await LoanService.getLenderApplications();
      setApplications(lenderApplications);
      
      // TODO: Calculate total earnings from commission records
      setTotalEarnings(1500); // Mock data for now
    } catch (error) {
      Alert.alert('Error', 'Failed to load lender data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveApplication = async (applicationId: string) => {
    Alert.alert(
      'Approve Application',
      'Are you sure you want to approve this loan application?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Approve', 
          onPress: async () => {
            try {
              await LoanService.updateApplicationStatus(applicationId, 'approved');
              await loadLenderData(); // Refresh data
              Alert.alert('Success', 'Application approved successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to approve application');
            }
          }
        },
      ]
    );
  };

  const handleRejectApplication = async (applicationId: string) => {
    Alert.alert(
      'Reject Application',
      'Are you sure you want to reject this loan application?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reject', 
          onPress: async () => {
            try {
              await LoanService.updateApplicationStatus(applicationId, 'rejected');
              await loadLenderData(); // Refresh data
              Alert.alert('Success', 'Application rejected');
            } catch (error) {
              Alert.alert('Error', 'Failed to reject application');
            }
          }
        },
      ]
    );
  };

  const handleCreateOffer = () => {
    navigation.navigate('CreateOffer');
  };

  if (loading) {
    return <LoadingSpinner message="Loading lender data..." />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome back, {user?.name}!</Text>
        <Text style={styles.roleText}>Lender Dashboard</Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{myOffers.length}</Text>
          <Text style={styles.statLabel}>Active Offers</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{applications.length}</Text>
          <Text style={styles.statLabel}>Pending Applications</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>${totalEarnings.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Total Earnings</Text>
        </View>
      </View>

      {/* Pending Applications */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pending Applications</Text>
        {applications.map((application) => (
          <View key={application.id} style={styles.applicationCard}>
            <View style={styles.applicationHeader}>
              <Text style={styles.applicationId}>Application #{application.id}</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>PENDING</Text>
              </View>
            </View>
            
            {application.aiSummary && (
              <View style={styles.aiSummary}>
                <Text style={styles.aiTitle}>AI Analysis:</Text>
                <View style={styles.aiRow}>
                  <Text style={styles.aiLabel}>Credit Score:</Text>
                  <Text style={[
                    styles.aiValue,
                    application.aiSummary.score >= 70 && styles.aiValueGood,
                    application.aiSummary.score < 50 && styles.aiValueBad,
                  ]}>
                    {application.aiSummary.score}/100
                  </Text>
                </View>
                <View style={styles.aiRow}>
                  <Text style={styles.aiLabel}>Risk Level:</Text>
                  <Text style={[
                    styles.aiValue,
                    application.aiSummary.riskLevel === 'Low' && styles.aiValueGood,
                    application.aiSummary.riskLevel === 'High' && styles.aiValueBad,
                  ]}>
                    {application.aiSummary.riskLevel}
                  </Text>
                </View>
                <View style={styles.aiRow}>
                  <Text style={styles.aiLabel}>Avg Balance:</Text>
                  <Text style={styles.aiValue}>${application.aiSummary.avgBalance}</Text>
                </View>
              </View>
            )}
            
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.rejectButton]}
                onPress={() => handleRejectApplication(application.id)}
              >
                <Text style={styles.rejectButtonText}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.approveButton]}
                onPress={() => handleApproveApplication(application.id)}
              >
                <Text style={styles.approveButtonText}>Approve</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {/* My Loan Offers */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Loan Offers</Text>
          <TouchableOpacity style={styles.createButton} onPress={handleCreateOffer}>
            <Text style={styles.createButtonText}>+ Create Offer</Text>
          </TouchableOpacity>
        </View>
        
        {myOffers.map((offer) => (
          <View key={offer.id} style={styles.offerCard}>
            <View style={styles.offerHeader}>
              <Text style={styles.offerAmount}>${offer.amount.toLocaleString()}</Text>
              <Text style={styles.offerRate}>{offer.interestRate}% interest</Text>
            </View>
            <Text style={styles.offerDuration}>{offer.duration}</Text>
            <Text style={styles.offerConditions}>{offer.conditions}</Text>
            <View style={styles.offerStatus}>
              <Text style={styles.offerStatusText}>
                Status: {offer.status.toUpperCase()}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Create Offer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>View Analytics</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Earnings</Text>
          </TouchableOpacity>
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
  statsContainer: {
    flexDirection: 'row',
    padding: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0052CC',
    fontFamily: 'Poppins-SemiBold',
  },
  statLabel: {
    fontSize: 12,
    color: '#2C2C2C',
    fontFamily: 'Inter-Regular',
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    padding: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C2C2C',
    fontFamily: 'Poppins-SemiBold',
  },
  createButton: {
    backgroundColor: '#00B894',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-Bold',
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
    marginBottom: 16,
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
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#856404',
    fontFamily: 'Inter-Bold',
  },
  aiSummary: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2C',
    fontFamily: 'Inter-Bold',
    marginBottom: 12,
  },
  aiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  aiLabel: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Inter-Regular',
  },
  aiValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2C2C2C',
    fontFamily: 'Inter-Medium',
  },
  aiValueGood: {
    color: '#00B894',
  },
  aiValueBad: {
    color: '#E63946',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    color: '#0052CC',
    fontFamily: 'Inter-Bold',
  },
  rejectButton: {
    backgroundColor: '#F8D7DA',
    borderWidth: 1,
    borderColor: '#F5C6CB',
  },
  approveButton: {
    backgroundColor: '#D4EDDA',
    borderWidth: 1,
    borderColor: '#C3E6CB',
  },
  rejectButtonText: {
    color: '#721C24',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-Bold',
  },
  approveButtonText: {
    color: '#155724',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-Bold',
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
    marginBottom: 12,
  },
  offerStatus: {
    alignSelf: 'flex-start',
  },
  offerStatusText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Inter-Regular',
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
});
