import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import axios from 'axios';
import { API_ENDPOINTS } from '../../utils/constants';
const API_URL = API_ENDPOINTS.BACKEND;

const ForgotPasswordScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleReset = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      await axios.post(`${API_URL}/auth/reset-password`, { email });
      setMessage('Password reset email request sent! Check your inbox.');
    } catch (error: any) {
      setMessage(error.message || 'Failed to send reset email');
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Forgot Password</Text>
        <Text style={styles.subtitle}>Enter your email to reset your password</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {message ? <Text style={styles.message}>{message}</Text> : null}
        <TouchableOpacity style={styles.resetButton} onPress={handleReset} disabled={loading}>
          <Text style={styles.resetButtonText}>{loading ? 'Sending...' : 'Send Reset Email'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ForgotPasswordScreen;
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', justifyContent: 'center' },
  innerContainer: { padding: 24 },
  title: { fontSize: 28, fontWeight: '600', color: '#00224d', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#2C2C2C', marginBottom: 24, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, padding: 16, fontSize: 16, marginBottom: 16 },
  message: { color: '#00224d', fontSize: 14, marginBottom: 16, textAlign: 'center' },
  resetButton: { backgroundColor: '#00224d', borderRadius: 8, padding: 16, alignItems: 'center', marginBottom: 16 },
  resetButtonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  backButton: { alignItems: 'center' },
  backButtonText: { color: '#00224d', fontSize: 16 },
});
