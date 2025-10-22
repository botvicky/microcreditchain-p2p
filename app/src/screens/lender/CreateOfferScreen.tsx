import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { LoanService } from '../../services/loanService';
import { useAuthStore } from '../../store/authStore';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export const CreateOfferScreen: React.FC<{ onOfferCreated: () => void }> = ({
  onOfferCreated,
}) => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    interestRate: '',
    duration: '',
    conditions: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateOffer = async () => {
    if (!formData.amount || !formData.interestRate || !formData.duration) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const amount = parseFloat(formData.amount);
    const interestRate = parseFloat(formData.interestRate);

    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (isNaN(interestRate) || interestRate < 0 || interestRate > 50) {
      Alert.alert('Error', 'Interest rate must be between 0% and 50%');
      return;
    }

    setLoading(true);
    try {
      await LoanService.createLoanOffer({
        lenderId: user?.id || '',
        amount,
        interestRate,
        duration: formData.duration,
        conditions: formData.conditions || 'Standard terms apply',
        status: 'active',
      });

      Alert.alert(
        'Offer Created',
        'Your loan offer has been created and is now visible to borrowers.',
        [{ text: 'OK', onPress: onOfferCreated }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create offer');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Creating offer..." />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Loan Offer</Text>
        <Text style={styles.subtitle}>Set your lending terms and conditions</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Loan Amount ($) *</Text>
          <TextInput
            style={styles.input}
            value={formData.amount}
            onChangeText={(value) => handleInputChange('amount', value)}
            placeholder="Enter loan amount"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Interest Rate (%) *</Text>
          <TextInput
            style={styles.input}
            value={formData.interestRate}
            onChangeText={(value) => handleInputChange('interestRate', value)}
            placeholder="Enter interest rate"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Duration *</Text>
          <View style={styles.durationOptions}>
            {['1 month', '3 months', '6 months', '12 months'].map((duration) => (
              <TouchableOpacity
                key={duration}
                style={[
                  styles.durationButton,
                  formData.duration === duration && styles.durationButtonActive,
                ]}
                onPress={() => handleInputChange('duration', duration)}
              >
                <Text
                  style={[
                    styles.durationButtonText,
                    formData.duration === duration && styles.durationButtonTextActive,
                  ]}
                >
                  {duration}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Special Conditions</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.conditions}
            onChangeText={(value) => handleInputChange('conditions', value)}
            placeholder="e.g., Weekly repayment, collateral required, etc."
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Commission Information</Text>
          <Text style={styles.infoText}>
            • Platform takes 15% commission on your profit{'\n'}
            • Commission is calculated when loan is fully repaid{'\n'}
            • You must pay commission before creating new offers{'\n'}
            • Commission ensures platform sustainability
          </Text>
        </View>

        <TouchableOpacity style={styles.createButton} onPress={handleCreateOffer}>
          <Text style={styles.createButtonText}>Create Offer</Text>
        </TouchableOpacity>
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
    marginTop: 8,
  },
  form: {
    padding: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2C2C2C',
    marginBottom: 8,
    fontFamily: 'Inter-Medium',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Inter-Regular',
  },
  textArea: {
    textAlignVertical: 'top',
    minHeight: 80,
  },
  durationOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  durationButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  durationButtonActive: {
    borderColor: '#0052CC',
    backgroundColor: '#F0F4FF',
  },
  durationButtonText: {
    fontSize: 14,
    color: '#2C2C2C',
    fontFamily: 'Inter-Regular',
  },
  durationButtonTextActive: {
    color: '#0052CC',
    fontFamily: 'Inter-Bold',
  },
  infoBox: {
    backgroundColor: '#F0F4FF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0052CC',
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#2C2C2C',
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  createButton: {
    backgroundColor: '#00B894',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter-Bold',
  },
});
