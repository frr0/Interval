import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/theme';
import { useApp } from '../../context/AppContext';

export default function LoginScreen() {
  const { login, loginDemo, error, clearError } = useApp();
  const [apiKey, setApiKey] = useState('');
  const [athleteId, setAthleteId] = useState('');
  const [secureKey, setSecureKey] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleConnect = async () => {
    if (!apiKey.trim()) {
      setLocalError('Please enter your Intervals.icu API Key.');
      return;
    }
    setLocalError(null);
    clearError();
    setSubmitting(true);

    try {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {
        // Ignore haptics
      }

      await login(apiKey.trim(), athleteId.trim() || '0');
      router.replace('/(tabs)');
    } catch (err: any) {
      setLocalError(err.message || 'Connection failed. Please check your API Key.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemo = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Ignore haptics
    }
    setSubmitting(true);
    await loginDemo();
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Brand Header */}
          <View style={styles.heroHeader}>
            <View style={styles.iconCircle}>
              <Ionicons name="pulse" size={36} color={Colors.whoopMint} />
            </View>
            <Text style={styles.brandTitle}>INTERVALS PULSE</Text>
            <Text style={styles.brandSubtitle}>
              Next-gen performance & recovery dashboard for Intervals.icu
            </Text>
          </View>

          {/* Setup Guide Card */}
          <View style={styles.guideCard}>
            <View style={styles.guideHeader}>
              <Ionicons name="key-outline" size={18} color={Colors.whoopMint} />
              <Text style={styles.guideTitle}>HOW TO GET YOUR API KEY</Text>
            </View>
            <Text style={styles.guideStep}>
              1. Open <Text style={styles.highlight}>intervals.icu</Text> in your browser
            </Text>
            <Text style={styles.guideStep}>
              2. Go to <Text style={styles.highlight}>Settings</Text> (bottom left or profile)
            </Text>
            <Text style={styles.guideStep}>
              3. Scroll to <Text style={styles.highlight}>Developer Settings</Text> at bottom
            </Text>
            <Text style={styles.guideStep}>
              4. Copy or generate your personal <Text style={styles.highlight}>API Key</Text>
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Error Banner */}
            {(localError || error) && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={18} color={Colors.dangerRed} />
                <Text style={styles.errorText}>{localError || error}</Text>
              </View>
            )}

            {/* API Key Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>INTERVALS.ICU API KEY</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  style={styles.input}
                  value={apiKey}
                  onChangeText={(val) => {
                    setApiKey(val);
                    if (localError) setLocalError(null);
                  }}
                  placeholder="Paste your API key here"
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry={secureKey}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.inputAction}
                  onPress={() => setSecureKey(!secureKey)}
                >
                  <Ionicons
                    name={secureKey ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color={Colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Optional Athlete ID */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>ATHLETE ID</Text>
                <Text style={styles.optionalTag}>OPTIONAL (DEFAULT: 0)</Text>
              </View>
              <View style={styles.inputWrap}>
                <TextInput
                  style={styles.input}
                  value={athleteId}
                  onChangeText={setAthleteId}
                  placeholder="0 (your own athlete account)"
                  placeholderTextColor={Colors.textMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              <Text style={styles.inputHelper}>
                Leave blank or &apos;0&apos; to automatically load your personal athlete profile.
              </Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.primaryButton, submitting && styles.buttonDisabled]}
              onPress={handleConnect}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color={Colors.textDark} />
              ) : (
                <>
                  <Ionicons name="shield-checkmark" size={18} color={Colors.textDark} />
                  <Text style={styles.primaryButtonText}>CONNECT INTERVALS.ICU</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR EXPLORE FIRST</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Demo Mode Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.demoButton}
              onPress={handleDemo}
              disabled={submitting}
            >
              <Ionicons name="flash" size={18} color={Colors.stravaOrange} />
              <View style={styles.demoButtonContent}>
                <Text style={styles.demoButtonTitle}>LAUNCH DEMO MODE</Text>
                <Text style={styles.demoButtonDesc}>
                  Preview charts, workouts, and strain rings with sample data
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  heroHeader: {
    alignItems: 'center',
    marginVertical: 24,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(0, 229, 163, 0.12)',
    borderWidth: 2,
    borderColor: 'rgba(0, 229, 163, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    maxWidth: 290,
  },
  guideCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: 20,
  },
  guideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  guideTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.whoopMint,
    letterSpacing: 0.8,
  },
  guideStep: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  highlight: {
    color: Colors.text,
    fontWeight: '700',
  },
  formContainer: {
    width: '100%',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    gap: 10,
  },
  errorText: {
    fontSize: 12,
    color: Colors.dangerRed,
    flex: 1,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  optionalTag: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    height: 48,
    color: Colors.text,
    fontSize: 14,
  },
  inputAction: {
    padding: 8,
  },
  inputHelper: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 4,
  },
  primaryButton: {
    backgroundColor: Colors.whoopMint,
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    shadowColor: Colors.whoopMint,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: 13,
    fontWeight: '900',
    color: Colors.textDark,
    letterSpacing: 0.8,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.surfaceBorder,
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textMuted,
    marginHorizontal: 12,
    letterSpacing: 1,
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  demoButtonContent: {
    flex: 1,
  },
  demoButtonTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: 0.5,
  },
  demoButtonDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
