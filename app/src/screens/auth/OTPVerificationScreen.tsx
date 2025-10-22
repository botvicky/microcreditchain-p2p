import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthService } from '../../services/auth';
import { LoadingSpinner } from '../../components/LoadingSpinner';

type Props = {
  navigation: StackNavigationProp<any>;
  route: {
    params: {
      phoneNumber: string;
      confirmationResult: any;
    };
  };
};

export const OTPVerificationScreen: React.FC<Props> = ({ navigation, route }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { phoneNumber, confirmationResult } = route.params;

  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    try {
      await AuthService.verifyPhoneCode(confirmationResult, code);
      Alert.alert('Success', 'Phone number verified successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack()
        }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to verify code');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    try {
      const newConfirmationResult = await AuthService.sendPhoneVerification(phoneNumber);
      route.params.confirmationResult = newConfirmationResult;
      Alert.alert('Success', 'New code sent successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send new code');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Verification Code</Text>
      <Text style={styles.subtitle}>
        We sent a verification code to {phoneNumber}
      </Text>
      
      <TextInput
        style={styles.input}
        value={code}
        onChangeText={setCode}
        placeholder="Enter 6-digit code"
        keyboardType="number-pad"
        maxLength={6}
      />

      <TouchableOpacity style={styles.verifyButton} onPress={handleVerifyCode}>
        <Text style={styles.buttonText}>Verify Code</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.resendButton} onPress={handleResendCode}>
        <Text style={styles.resendText}>Resend Code</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 18,
  },
  verifyButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resendButton: {
    padding: 10,
  },
  resendText: {
    color: '#2196F3',
    fontSize: 16,
  },
});