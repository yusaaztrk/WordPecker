import React from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/components/ThemeProvider';
import { useSettingsStore } from '@/store/settingsStore';
import { useAuthStore } from '@/store/authStore';
import Card from '@/components/Card';
import {
  Moon,
  Sun,
  Bell,
  Brain,
  Volume2,
  Vibrate,
  LogOut,
  ChevronRight,
  Languages,
  Target,
  HelpCircle,
  Info,
  Trash2,
} from 'lucide-react-native';

export default function SettingsScreen() {
  const router = useRouter();
  const { colors, theme, toggleTheme } = useTheme();
  const { 
    notifications, 
    dailyGoal, 
    learningMode, 
    soundEffects, 
    hapticFeedback, 
    autoPlayPronunciation,
    defaultLanguage,
    updateNotifications,
    updateSoundEffects,
    updateHapticFeedback,
    updateAutoPlayPronunciation,
    resetSettings,
  } = useSettingsStore();
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const confirmLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkış yapmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Çıkış Yap', onPress: handleLogout, style: 'destructive' },
      ]
    );
  };

  const confirmResetSettings = () => {
    Alert.alert(
      'Ayarları Sıfırla',
      'Tüm ayarları varsayılan değerlere sıfırlamak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Sıfırla', onPress: resetSettings, style: 'destructive' },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.text }]}>Ayarlar</Text>
        
        {/* Appearance */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Görünüm
          </Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLabelContainer}>
              {theme === 'dark' ? (
                <Moon size={20} color={colors.primary} />
              ) : (
                <Sun size={20} color={colors.primary} />
              )}
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                {theme === 'dark' ? 'Karanlık Mod' : 'Aydınlık Mod'}
              </Text>
            </View>
            <Switch
              value={theme === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: '#767577', true: colors.primary + '80' }}
              thumbColor={theme === 'dark' ? colors.primary : '#f4f3f4'}
            />
          </View>
        </Card>
        
        {/* Notifications */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Bildirimler
          </Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLabelContainer}>
              <Bell size={20} color={colors.primary} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                Bildirimler
              </Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={updateNotifications}
              trackColor={{ false: '#767577', true: colors.primary + '80' }}
              thumbColor={notifications ? colors.primary : '#f4f3f4'}
            />
          </View>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLabelContainer}>
              <Target size={20} color={colors.primary} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                Günlük Hedef
              </Text>
            </View>
            <View style={styles.settingValueContainer}>
              <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                {dailyGoal} kelime
              </Text>
              <ChevronRight size={20} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>
        </Card>
        
        {/* Learning */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Öğrenme
          </Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLabelContainer}>
              <Brain size={20} color={colors.primary} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                Öğrenme Modu
              </Text>
            </View>
            <View style={styles.settingValueContainer}>
              <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                {learningMode === 'standard' ? 'Standart' : 
                 learningMode === 'spaced' ? 'Aralıklı Tekrar' : 'Yoğun'}
              </Text>
              <ChevronRight size={20} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLabelContainer}>
              <Languages size={20} color={colors.primary} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                Varsayılan Dil
              </Text>
            </View>
            <View style={styles.settingValueContainer}>
              <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                {defaultLanguage}
              </Text>
              <ChevronRight size={20} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLabelContainer}>
              <Volume2 size={20} color={colors.primary} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                Ses Efektleri
              </Text>
            </View>
            <Switch
              value={soundEffects}
              onValueChange={updateSoundEffects}
              trackColor={{ false: '#767577', true: colors.primary + '80' }}
              thumbColor={soundEffects ? colors.primary : '#f4f3f4'}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLabelContainer}>
              <Vibrate size={20} color={colors.primary} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                Titreşim Geri Bildirimi
              </Text>
            </View>
            <Switch
              value={hapticFeedback}
              onValueChange={updateHapticFeedback}
              trackColor={{ false: '#767577', true: colors.primary + '80' }}
              thumbColor={hapticFeedback ? colors.primary : '#f4f3f4'}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLabelContainer}>
              <Volume2 size={20} color={colors.primary} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                Otomatik Telaffuz
              </Text>
            </View>
            <Switch
              value={autoPlayPronunciation}
              onValueChange={updateAutoPlayPronunciation}
              trackColor={{ false: '#767577', true: colors.primary + '80' }}
              thumbColor={autoPlayPronunciation ? colors.primary : '#f4f3f4'}
            />
          </View>
        </Card>
        
        {/* About */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Hakkında
          </Text>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => router.push('/modal')}
          >
            <View style={styles.settingLabelContainer}>
              <Info size={20} color={colors.primary} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                Uygulama Hakkında
              </Text>
            </View>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLabelContainer}>
              <HelpCircle size={20} color={colors.primary} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                Yardım ve Destek
              </Text>
            </View>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </Card>
        
        {/* Account */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Hesap
          </Text>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={confirmResetSettings}
          >
            <View style={styles.settingLabelContainer}>
              <Trash2 size={20} color={colors.warning} />
              <Text style={[styles.settingLabel, { color: colors.warning }]}>
                Ayarları Sıfırla
              </Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={confirmLogout}
          >
            <View style={styles.settingLabelContainer}>
              <LogOut size={20} color={colors.error} />
              <Text style={[styles.settingLabel, { color: colors.error }]}>
                Çıkış Yap
              </Text>
            </View>
          </TouchableOpacity>
        </Card>
        
        <Text style={[styles.versionText, { color: colors.textSecondary }]}>
          Sürüm 1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    marginLeft: 12,
  },
  settingValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: 16,
    marginRight: 8,
  },
  versionText: {
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
});