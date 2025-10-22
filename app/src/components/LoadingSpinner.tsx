import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Loading...' 
}) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0052CC" />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    color: '#2C2C2C',
    fontFamily: 'Inter-Regular',
  },
});
