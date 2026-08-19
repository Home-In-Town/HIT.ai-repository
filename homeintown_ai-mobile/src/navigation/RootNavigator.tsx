import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import AuthStack from './AuthStack';
import MainStack from './MainStack';
import { Colors } from '../constants';

/**
 * Root navigator: shows Auth or Main based on auth state.
 * If user skipped auth or is authenticated, show Main.
 * Otherwise show Auth screens.
 */
export default function RootNavigator() {
  const { isAuthenticated, isSkipped, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Show main app if authenticated OR user chose to skip
  if (isAuthenticated || isSkipped) {
    return <MainStack />;
  }

  return <AuthStack />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});
