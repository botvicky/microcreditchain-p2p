import React, { useState } from 'react';
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
  Image,
} from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { DevLoginHelper } from '../../components/DevLoginHelper';

const LoginScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, loading, error } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    try {
      await signIn(email, password);
    } catch (error) {
      const errorMsg = typeof error === 'object' && error !== null && 'message' in error ? (error as any).message : String(error);
      Alert.alert('Login Failed', errorMsg);
    }
  };

  const handleDevLogin = (devEmail: string, devPassword: string) => {
    setEmail(devEmail);
    setPassword(devPassword);
  };

  if (loading) {
    return <LoadingSpinner message="Signing in..." />;
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <DevLoginHelper onSelectAccount={handleDevLogin} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Image 
            source={require('../../../assets/shamwari_text.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.subtitle}>Welcome back</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry
            />
          </View>

          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.forgotPassword} onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.signUpLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    width: 250,
    height: 60,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
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
  errorText: {
    color: '#E63946',
    fontSize: 14,
    marginBottom: 16,
    fontFamily: 'Inter-Regular',
  },
  loginButton: {
    backgroundColor: '#00224d',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter-Bold',
  },
  forgotPassword: {
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: '#00224d',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
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
  signUpLink: {
    fontSize: 16,
    color: '#00224d',
    fontWeight: '600',
    fontFamily: 'Inter-Bold',
  },
});
