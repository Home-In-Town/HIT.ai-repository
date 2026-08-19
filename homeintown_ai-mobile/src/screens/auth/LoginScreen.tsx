import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen({ navigation }: any) {
  const { login, register, skipAuth, isLoading } = useAuth();

  const [phone, setPhone] = useState('');
  const [mpin, setMpin] = useState('');
  const [showMpin, setShowMpin] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [name, setName] = useState('');

  const handleLogin = async () => {
    if (!phone || phone.length < 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }
    if (!mpin || mpin.length < 4) {
      Alert.alert('Error', 'Please enter your 4-digit MPIN');
      return;
    }

    try {
      await login(phone, mpin);
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Invalid credentials');
    }
  };

  const handleRegister = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    if (!phone || phone.length < 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }

    try {
      await register(name.trim(), phone);
      navigation.navigate('OTP', { phone, isRegister: true });
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Something went wrong');
    }
  };

  const handleForgotMpin = () => {
    if (!phone || phone.length < 10) {
      Alert.alert('Enter Phone', 'Please enter your phone number first');
      return;
    }
    navigation.navigate('OTP', { phone, isRegister: false });
  };

  const handleSkip = () => {
    skipAuth();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Skip Button */}
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
          <Ionicons name="arrow-forward" size={16} color={Colors.textSecondary} />
        </TouchableOpacity>

        {/* Logo & Branding */}
        <View style={styles.brandSection}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>HomeInTown</Text>
            <Text style={styles.logoAi}>.ai</Text>
          </View>
          <Text style={styles.tagline}>Find Your Perfect Home</Text>
        </View>

        {/* Form */}
        <View style={styles.formSection}>
          <Text style={styles.formTitle}>
            {isRegisterMode ? 'Create Account' : 'Welcome Back'}
          </Text>
          <Text style={styles.formSubtitle}>
            {isRegisterMode
              ? 'Register with your phone number'
              : 'Login with your phone & MPIN'}
          </Text>

          {/* Name (Register mode only) */}
          {isRegisterMode && (
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color={Colors.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor={Colors.textTertiary}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
          )}

          {/* Phone Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.countryCode}>+91</Text>
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              placeholderTextColor={Colors.textTertiary}
              value={phone}
              onChangeText={(text) => setPhone(text.replace(/[^0-9]/g, '').slice(0, 10))}
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>

          {/* MPIN Input (Login mode only) */}
          {!isRegisterMode && (
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color={Colors.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="4-digit MPIN"
                placeholderTextColor={Colors.textTertiary}
                value={mpin}
                onChangeText={(text) => setMpin(text.replace(/[^0-9]/g, '').slice(0, 4))}
                keyboardType="number-pad"
                maxLength={4}
                secureTextEntry={!showMpin}
              />
              <TouchableOpacity onPress={() => setShowMpin(!showMpin)} style={styles.eyeButton}>
                <Ionicons
                  name={showMpin ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color={Colors.textTertiary}
                />
              </TouchableOpacity>
            </View>
          )}

          {/* Forgot MPIN */}
          {!isRegisterMode && (
            <TouchableOpacity onPress={handleForgotMpin} style={styles.forgotButton}>
              <Text style={styles.forgotText}>Forgot MPIN?</Text>
            </TouchableOpacity>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={isRegisterMode ? handleRegister : handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.textInverse} size="small" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isRegisterMode ? 'Send OTP' : 'Login'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Toggle Register/Login */}
          <View style={styles.toggleRow}>
            <Text style={styles.toggleText}>
              {isRegisterMode ? 'Already have an account?' : "Don't have an account?"}
            </Text>
            <TouchableOpacity onPress={() => setIsRegisterMode(!isRegisterMode)}>
              <Text style={styles.toggleLink}>
                {isRegisterMode ? 'Login' : 'Register'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our Terms & Privacy Policy
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.xxxxl + 16,
    paddingBottom: Spacing.xxxl,
  },
  skipButton: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    gap: Spacing.xs,
  },
  skipText: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
    fontWeight: Typography.medium,
  },
  brandSection: {
    alignItems: 'center',
    marginTop: Spacing.xxxxl,
    marginBottom: Spacing.xxxxl,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  logoText: {
    fontSize: 32,
    fontWeight: Typography.black,
    color: Colors.primary,
  },
  logoAi: {
    fontSize: 32,
    fontWeight: Typography.black,
    color: Colors.textPrimary,
  },
  tagline: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  formSection: {
    flex: 1,
  },
  formTitle: {
    fontSize: Typography.h2,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  formSubtitle: {
    fontSize: Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.xxl,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    height: 52,
  },
  inputIcon: {
    marginRight: Spacing.md,
  },
  countryCode: {
    fontSize: Typography.body,
    color: Colors.textPrimary,
    fontWeight: Typography.semiBold,
    marginRight: Spacing.md,
    paddingRight: Spacing.md,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  input: {
    flex: 1,
    fontSize: Typography.body,
    color: Colors.textPrimary,
  },
  eyeButton: {
    padding: Spacing.sm,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.xl,
  },
  forgotText: {
    fontSize: Typography.bodySmall,
    color: Colors.primary,
    fontWeight: Typography.medium,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: Typography.h4,
    fontWeight: Typography.semiBold,
    color: Colors.textInverse,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xl,
    gap: Spacing.xs,
  },
  toggleText: {
    fontSize: Typography.bodySmall,
    color: Colors.textSecondary,
  },
  toggleLink: {
    fontSize: Typography.bodySmall,
    color: Colors.primary,
    fontWeight: Typography.semiBold,
  },
  footer: {
    alignItems: 'center',
    marginTop: Spacing.xxxl,
  },
  footerText: {
    fontSize: Typography.caption,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
});
