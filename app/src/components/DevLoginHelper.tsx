import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { TEST_ACCOUNTS } from '../utils/seedData';

interface DevLoginHelperProps {
  onSelectAccount: (email: string, password: string) => void;
}

export const DevLoginHelper: React.FC<DevLoginHelperProps> = ({ onSelectAccount }) => {
  const [showModal, setShowModal] = useState(false);

  // Only show in development mode
  if (!__DEV__) {
    return null;
  }

  return (
    <>
      <TouchableOpacity 
        style={styles.devButton}
        onPress={() => setShowModal(true)}
      >
        <Text style={styles.devButtonText}>🔧 Dev Login</Text>
      </TouchableOpacity>

      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Development Test Accounts</Text>
            <Text style={styles.modalSubtitle}>Select an account to auto-fill login</Text>
            
            <ScrollView style={styles.accountsList}>
              {/* Admin Account */}
              <TouchableOpacity
                style={[styles.accountCard, styles.adminCard]}
                onPress={() => {
                  onSelectAccount(TEST_ACCOUNTS.admin.email, TEST_ACCOUNTS.admin.password);
                  setShowModal(false);
                }}
              >
                <View style={styles.accountHeader}>
                  <Text style={styles.accountRole}>👨‍💼 ADMIN</Text>
                  <Text style={styles.accountName}>{TEST_ACCOUNTS.admin.name}</Text>
                </View>
                <Text style={styles.accountEmail}>{TEST_ACCOUNTS.admin.email}</Text>
                <Text style={styles.accountPassword}>Password: {TEST_ACCOUNTS.admin.password}</Text>
                <Text style={styles.accountFeatures}>
                  • User Management{'\n'}
                  • System Analytics{'\n'}
                  • Freeze/Unfreeze Accounts
                </Text>
              </TouchableOpacity>

              {/* Lender Account */}
              <TouchableOpacity
                style={[styles.accountCard, styles.lenderCard]}
                onPress={() => {
                  onSelectAccount(TEST_ACCOUNTS.lender.email, TEST_ACCOUNTS.lender.password);
                  setShowModal(false);
                }}
              >
                <View style={styles.accountHeader}>
                  <Text style={styles.accountRole}>💰 LENDER</Text>
                  <Text style={styles.accountName}>{TEST_ACCOUNTS.lender.name}</Text>
                </View>
                <Text style={styles.accountEmail}>{TEST_ACCOUNTS.lender.email}</Text>
                <Text style={styles.accountPassword}>Password: {TEST_ACCOUNTS.lender.password}</Text>
                <Text style={styles.accountFeatures}>
                  • Create Loan Offers{'\n'}
                  • Review Applications{'\n'}
                  • View Earnings
                </Text>
              </TouchableOpacity>

              {/* Borrower Account */}
              <TouchableOpacity
                style={[styles.accountCard, styles.borrowerCard]}
                onPress={() => {
                  onSelectAccount(TEST_ACCOUNTS.borrower.email, TEST_ACCOUNTS.borrower.password);
                  setShowModal(false);
                }}
              >
                <View style={styles.accountHeader}>
                  <Text style={styles.accountRole}>👤 BORROWER</Text>
                  <Text style={styles.accountName}>{TEST_ACCOUNTS.borrower.name}</Text>
                </View>
                <Text style={styles.accountEmail}>{TEST_ACCOUNTS.borrower.email}</Text>
                <Text style={styles.accountPassword}>Password: {TEST_ACCOUNTS.borrower.password}</Text>
                <Text style={styles.accountFeatures}>
                  • Browse Loan Offers{'\n'}
                  • Apply for Loans{'\n'}
                  • Upload Statements
                </Text>
              </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  devButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 1000,
  },
  devButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#00224d',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  accountsList: {
    marginBottom: 20,
  },
  accountCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
  },
  adminCard: {
    backgroundColor: '#FFF5F5',
    borderColor: '#00224d',
  },
  lenderCard: {
    backgroundColor: '#F0FFF4',
    borderColor: '#00bf80',
  },
  borrowerCard: {
    backgroundColor: '#F0F4FF',
    borderColor: '#4299E1',
  },
  accountHeader: {
    marginBottom: 8,
  },
  accountRole: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
    marginBottom: 4,
  },
  accountName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C2C2C',
  },
  accountEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  accountPassword: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00224d',
    marginBottom: 8,
  },
  accountFeatures: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  closeButton: {
    backgroundColor: '#E0E0E0',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2C',
  },
});
