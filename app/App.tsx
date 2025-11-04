import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from './src/store/authStore';
import { LoadingSpinner } from './src/components/LoadingSpinner';

// Auth Screens
import LoginScreen from './src/screens/auth/LoginScreen';
import SignUpScreen from './src/screens/auth/SignUpScreen';
import ForgotPasswordScreen from './src/screens/auth/ForgotPasswordScreen';

// Dashboard Screens
import { BorrowerDashboard } from './src/screens/borrower/BorrowerDashboard';
import { LenderDashboard } from './src/screens/lender/LenderDashboard';
import { AdminDashboard } from './src/screens/admin/AdminDashboard';

// Additional Screens
import { LoanApplicationScreen } from './src/screens/borrower/LoanApplicationScreen';
import { CreateOfferScreen } from './src/screens/lender/CreateOfferScreen';
import { NotificationsScreen } from './src/screens/notifications/NotificationsScreen';

const Stack = createStackNavigator();

export default function App() {
  const { user, loading, loadCurrentUser } = useAuthStore();

  useEffect(() => {
    loadCurrentUser();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading..." />;
  }

  const getInitialRouteName = () => {
    if (!user) {
      return 'Login';
    }
    
    switch (user.role) {
      case 'borrower':
        return 'BorrowerDashboard';
      case 'lender':
        return 'LenderDashboard';
      case 'admin':
        return 'AdminDashboard';
      default:
        return 'Login';
    }
  };

  const getScreenOptions = (title: string) => ({
    title,
    headerStyle: {
      backgroundColor: '#00224d',
    },
    headerTintColor: '#FFFFFF',
    headerTitleStyle: {
      fontFamily: 'Poppins-SemiBold',
      fontSize: 18,
    },
  });

  return (
    <NavigationContainer>
      <StatusBar style="light" backgroundColor="#00224d" />
      <Stack.Navigator
        initialRouteName={getInitialRouteName()}
        screenOptions={{
          headerShown: false,
        }}
      >
        {!user ? (
          // Auth Stack
          <>
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="SignUp" 
              component={SignUpScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="ForgotPassword" 
              component={ForgotPasswordScreen}
              options={{ headerShown: false }}
            />
          </>
        ) : (
          // Dashboard Stack based on user role
          <>
            {user.role === 'borrower' && (
              <>
                <Stack.Screen 
                  name="BorrowerDashboard" 
                  component={BorrowerDashboard}
                  options={{ headerShown: false }}
                />
                <Stack.Screen 
                  name="LoanApplication" 
                  children={({ route, navigation }) => (
                    <LoanApplicationScreen 
                      offerId={(route as any)?.params?.offerId ?? ''}
                      onApplicationSubmitted={() => navigation.goBack()} 
                    />
                  )}
                  options={{ 
                    headerShown: true,
                    ...getScreenOptions('Apply for Loan')
                  }}
                />
                <Stack.Screen 
                  name="Notifications" 
                  component={NotificationsScreen}
                  options={{ 
                    headerShown: true,
                    ...getScreenOptions('Notifications')
                  }}
                />
              </>
            )}
            {user.role === 'lender' && (
              <>
                <Stack.Screen 
                  name="LenderDashboard" 
                  component={LenderDashboard}
                  options={{ headerShown: false }}
                />
                <Stack.Screen 
                  name="CreateOffer" 
                  children={(props) => (
                    <CreateOfferScreen onOfferCreated={() => {}} {...props} />
                  )}
                  options={{ 
                    headerShown: true,
                    ...getScreenOptions('Create Loan Offer')
                  }}
                />
                <Stack.Screen 
                  name="Notifications" 
                  component={NotificationsScreen}
                  options={{ 
                    headerShown: true,
                    ...getScreenOptions('Notifications')
                  }}
                />
              </>
            )}
            {user.role === 'admin' && (
              <>
                <Stack.Screen 
                  name="AdminDashboard" 
                  component={AdminDashboard}
                  options={{ headerShown: false }}
                />
                <Stack.Screen 
                  name="Notifications" 
                  component={NotificationsScreen}
                  options={{ 
                    headerShown: true,
                    ...getScreenOptions('Notifications')
                  }}
                />
              </>
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}