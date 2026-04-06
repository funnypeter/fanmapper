import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { useTheme } from '../theme/ThemeContext';
import { useAuthContext } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const { theme } = useTheme();
  const { signIn, signUp, signInWithGoogle, signInWithApple } = useAuthContext();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password);
        Alert.alert('Check your email', 'We sent you a confirmation link.');
      } else {
        await signIn(email, password);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    try {
      await signInWithGoogle();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Google sign in failed');
    }
  }

  async function handleApple() {
    try {
      await signInWithApple();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Apple sign in failed');
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        <Text variant="hero" style={{ textAlign: 'center' }}>
          Fan<Text variant="hero" style={{ color: theme.colors.primary }}>Mapper</Text>
        </Text>
        <Text variant="secondary" style={{ textAlign: 'center', marginTop: 8, marginBottom: 40 }}>
          Track games. Explore wikis. Map worlds.
        </Text>

        <TextInput
          style={[styles.input, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]}
          placeholder="Email"
          placeholderTextColor={theme.colors.textMuted}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={[styles.input, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]}
          placeholder="Password"
          placeholderTextColor={theme.colors.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Button
          title={loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
          onPress={handleSubmit}
          disabled={loading}
          style={{ marginTop: 8 }}
        />

        <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)} style={styles.toggle}>
          <Text variant="secondary">
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <Text variant="body" style={{ color: theme.colors.primary, fontWeight: '600' }}>
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </Text>
          </Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={[styles.line, { backgroundColor: theme.colors.border }]} />
          <Text variant="caption" style={{ marginHorizontal: 16 }}>or</Text>
          <View style={[styles.line, { backgroundColor: theme.colors.border }]} />
        </View>

        <TouchableOpacity
          style={[styles.socialButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
          onPress={handleGoogle}
        >
          <Ionicons name="logo-google" size={20} color={theme.colors.text} />
          <Text variant="body" style={{ marginLeft: 12, fontWeight: '500' }}>Continue with Google</Text>
        </TouchableOpacity>

        {Platform.OS === 'ios' && (
          <TouchableOpacity
            style={[styles.socialButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            onPress={handleApple}
          >
            <Ionicons name="logo-apple" size={20} color={theme.colors.text} />
            <Text variant="body" style={{ marginLeft: 12, fontWeight: '500' }}>Continue with Apple</Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
  content: { paddingHorizontal: 32 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 12,
  },
  toggle: { alignItems: 'center', marginTop: 20 },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  line: { flex: 1, height: 1 },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 12,
  },
});
