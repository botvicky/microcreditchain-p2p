import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import { ResponseType } from 'expo-auth-session';
import { AuthService } from '../../services/auth';
import { User } from '../../types';

const SignUpScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    idNumber: '',
    role: 'borrower' as 'borrower' | 'lender',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: process.env.EXPO_CLIENT_ID || 'YOUR_EXPO_CLIENT_ID',
    iosClientId: process.env.IOS_CLIENT_ID || 'YOUR_IOS_CLIENT_ID',
    androidClientId: process.env.ANDROID_CLIENT_ID || 'YOUR_ANDROID_CLIENT_ID',
    webClientId: process.env.WEB_CLIENT_ID || 'YOUR_WEB_CLIENT_ID',
    responseType: ResponseType.IdToken,
  });

  useEffect(() => {
    if (response?.type === 'success' && response.authentication) {
      const idToken = response.authentication.idToken;
      handleGoogleToken(idToken);
    }
  }, [response]);

  const handleGoogleToken = async (idToken: string | undefined) => {
    if (!idToken) return;
    setLoading(true);
    try {
      const res = await AuthService.signInWithGoogle(idToken);
      // Store token locally as needed, then navigate
      Alert.alert('Success', 'Signed up with Google');
      navigation.navigate('Login');
    } catch (err: any) {
      Alert.alert('Google Sign-In Failed', err?.message || 'Unknown error');
    }
    setLoading(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignUp = async () => {
    if (!formData.name || !formData.email || !formData.password || !formData.phone) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await AuthService.signUp(formData.email, formData.password, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        id_number: formData.idNumber,
        role: formData.role,
      } as any);
      Alert.alert('Success', 'Account created successfully!');
      navigation.navigate('Login');
    } catch (error: any) {
      setError(error?.message || 'Sign Up Failed');
      Alert.alert('Sign Up Failed', error?.message || 'Error');
    }
    setLoading(false);
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0052CC" />;
  }
  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Image 
            source={require('../../../assets/shamwari_text.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.subtitle}>Join ShamwariPay</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              placeholder="Enter your full name"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>ID Number</Text>
            <TextInput
              style={styles.input}
              value={formData.idNumber}
              onChangeText={(value) => handleInputChange('idNumber', value)}
              placeholder="Enter your ID number"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>I want to be a:</Text>
            <View style={styles.roleContainer}>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  formData.role === 'borrower' && styles.roleButtonActive
                ]}
                onPress={() => handleInputChange('role', 'borrower')}
              >
                <Text style={[
                  styles.roleButtonText,
                  formData.role === 'borrower' && styles.roleButtonTextActive
                ]}>
                  Borrower
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  formData.role === 'lender' && styles.roleButtonActive
                ]}
                onPress={() => handleInputChange('role', 'lender')}
              >
                <Text style={[
                  styles.roleButtonText,
                  formData.role === 'lender' && styles.roleButtonTextActive
                ]}>
                  Lender
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password *</Text>
            <TextInput
              style={styles.input}
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              placeholder="Enter your password"
              secureTextEntry
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password *</Text>
            <TextInput
              style={styles.input}
              value={formData.confirmPassword}
              onChangeText={(value) => handleInputChange('confirmPassword', value)}
              placeholder="Confirm your password"
              secureTextEntry
            />
          </View>

          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
            <Text style={styles.signUpButtonText}>Create Account</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.signUpButton, styles.googleButton]} 
            onPress={() => promptAsync()}
            disabled={!request}
          >
            <Text style={styles.signUpButtonText}>Sign Up with Google</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.signInLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignUpScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  logo: {
    width: 250,
    height: 60,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#2C2C2C',
    fontFamily: 'Inter-Regular',
  },
  form: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
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
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  roleButtonActive: {
    borderColor: '#00224d',
    backgroundColor: '#F0F4FF',
  },
  roleButtonText: {
    fontSize: 16,
    color: '#2C2C2C',
    fontFamily: 'Inter-Regular',
  },
  roleButtonTextActive: {
    color: '#00224d',
    fontFamily: 'Inter-Bold',
  },
  errorText: {
    color: '#E63946',
    fontSize: 14,
    marginBottom: 16,
    fontFamily: 'Inter-Regular',
  },
  signUpButton: {
    backgroundColor: '#00224d',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  googleButton: {
    backgroundColor: '#4285F4',
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter-Bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    color: '#2C2C2C',
    fontFamily: 'Inter-Regular',
  },
  signInLink: {
    fontSize: 16,
    color: '#00224d',
    fontWeight: '600',
    fontFamily: 'Inter-Bold',
  },
});
