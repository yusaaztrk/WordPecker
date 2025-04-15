import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, ArrowLeft } from 'lucide-react-native';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/components/ThemeProvider';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const { resetPassword, isLoading } = useAuthStore();
  const router = useRouter();
  const { colors } = useTheme();
  
  const validateEmail = () => {
    if (!email) {
      setError('E-posta adresi gereklidir');
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Geçerli bir e-posta adresi giriniz');
      return false;
    }
    
    setError(null);
    return true;
  };
  
  const handleResetPassword = async () => {
    if (!validateEmail()) {
      return;
    }
    
    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Şifre sıfırlama işlemi başarısız oldu');
      }
    }
  };
  
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView 
        contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        
        <Text style={[styles.title, { color: colors.text }]}>Şifre Sıfırlama</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Şifrenizi sıfırlamak için e-posta adresinizi girin
        </Text>
        
        {success ? (
          <View style={[styles.successContainer, { backgroundColor: colors.success + '20' }]}>
            <Text style={[styles.successText, { color: colors.success }]}>
              Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen e-postanızı kontrol edin.
            </Text>
            <Button
              title="Giriş Sayfasına Dön"
              onPress={() => router.replace('/(auth)/login')}
              style={styles.loginButton}
              variant="outline"
            />
          </View>
        ) : (
          <View style={styles.form}>
            {error && (
              <View style={[styles.errorContainer, { backgroundColor: colors.error + '20' }]}>
                <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
              </View>
            )}
            
            <Input
              label="E-posta"
              placeholder="E-posta adresinizi girin"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Mail size={20} color={colors.textSecondary} />}
            />
            
            <Button
              title="Şifremi Sıfırla"
              onPress={handleResetPassword}
              isLoading={isLoading}
              style={styles.resetButton}
            />
            
            <Button
              title="Giriş Sayfasına Dön"
              onPress={() => router.replace('/(auth)/login')}
              variant="outline"
            />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 24,
    zIndex: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  form: {
    width: '100%',
  },
  resetButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  loginButton: {
    marginTop: 16,
  },
  errorContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  successContainer: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  successText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
});