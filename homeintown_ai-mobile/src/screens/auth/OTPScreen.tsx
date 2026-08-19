import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants';
import { useAuth } from '../../context/AuthContext';

export default function OTPScreen({ route, navigation }: any) {
  const { phone, isRegister } = route.params;
  const { verifyOtp, isLoading } = useAuth();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [mpin, setMpin] = useState('');
  const [showMpinStep, setShowMpinStep] = useState(false);
  const [timer, setTimer] = useState(30);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value.replace(/[^0-9]/g, '');
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length < 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit OTP');
      return;
    }

    if (isRegister && !showMpinStep) {
      // For registration, show MPIN setup step after OTP
      setShowMpinStep(true);
      return;
    }

    if (isRegister && showMpinStep && mpin.length < 4) {
      Alert.alert('Error', 'Please set a 4-digit MPIN');
      return;
    }

    try {
      await verifyOtp(phone, otpString, isRegister ? mpin : undefined);
      // Navigation handled by AuthContext state change
    } catch (error: any) {
      Alert.alert('Verification Failed', error.message || 'Invalid OTP');
    }
  };

  const handleResendOtp = () => {
    setTimer(30);
    Alert.alert('OTP Sent', `A new OTP has been sent to +91 ${phone}`);
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {showMpinStep ? 'Set Your MPIN' : 'Verify OTP'}
        </Text>
        <Text style={styles.subtitle}>
          {showMpinStep
            ? 'Create a 4-digit MPIN for quick login'
            : `Enter the 6-digit code sent to +91 ${phone}`}
        </Text>
      </View>

      {!showMpinStep ? (
        <>
          {/* OTP Input Boxes */}
          <View style={styles.otpRow}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => { inputRefs.current[index] = ref; }}
                style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                onKeyPress={({ nativeEvent }) => handleOtpKeyPress(nativeEvent.key, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
              />
            ))}
          </View>

          {/* Resend OTP */}
          <View style={styles.resendRow}>
            {timer > 0 ? (
              <Text style={styles.timerText}>Resend OTP in {timer}s</Text>
            ) : (
              <TouchableOpacity onPress={handleResendOtp}>
                <Text style={styles.resendLink}>Resend OTP</Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      ) : (
        /* MPIN Setup */
        <View style={styles.mpinSection}>
          <View style={styles.mpinInputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={Colors.textTertiary} style={styles.mpinIcon} />
            <TextInput
              style={styles.mpinInput}
              placeholder="Enter 4-digit MPIN"
              placeholderTextColor={Colors.textTertiary}
              value={mpin}
              onChangeText={(text) => setMpin(text.replace(/[^0-9]/g, '').slice(0, 4))}
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
            />
          </View>
          <Text style={styles.mpinHint}>
            You'll use this MPIN to login quickly next time
          </Text>
        </View>
      )}

      {/* Verify Button */}
      <TouchableOpacity
        style={[styles.verifyButton, isLoading && styles.verifyButtonDisabled]}
        onPress={handleVerify}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        {isLoading ? (
          <ActivityIndicator color={Colors.textInverse} size="small" />
        ) : (
          <Text style={styles.verifyButtonText}>
            {showMpinStep ? 'Complete Registration' : 'Verify'}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.xxxxl + 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  header: {
    marginBottom: Spacing.xxxl,
  },
  title: {
    fontSize: Typography.h1,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xxl,
    gap: Spacing.sm,
  },
  otpBox: {
    width: 48,
    height: 56,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    textAlign: 'center',
    fontSize: Typography.h2,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
  },
  otpBoxFilled: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  resendRow: {
    alignItems: 'center',
    marginBottom: Spacing.xxxl,
  },
  timerText: {
    fontSize: Typography.bodySmall,
    color: Colors.textTertiary,
  },
  resendLink: {
    fontSize: Typography.body,
    color: Colors.primary,
    fontWeight: Typography.semiBold,
  },
  mpinSection: {
    marginBottom: Spacing.xxxl,
  },
  mpinInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    height: 52,
    marginBottom: Spacing.md,
  },
  mpinIcon: {
    marginRight: Spacing.md,
  },
  mpinInput: {
    flex: 1,
    fontSize: Typography.h3,
    color: Colors.textPrimary,
    letterSpacing: 8,
    fontWeight: Typography.bold,
  },
  mpinHint: {
    fontSize: Typography.bodySmall,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
  verifyButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifyButtonDisabled: {
    opacity: 0.7,
  },
  verifyButtonText: {
    fontSize: Typography.h4,
    fontWeight: Typography.semiBold,
    color: Colors.textInverse,
  },
});
