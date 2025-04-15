import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeType = 'dark' | 'light' | 'system';
export type LearningMode = 'standard' | 'spaced' | 'intensive';

interface SettingsState {
  theme: ThemeType;
  notifications: boolean;
  dailyGoal: number;
  learningMode: LearningMode;
  soundEffects: boolean;
  hapticFeedback: boolean;
  autoPlayPronunciation: boolean;
  defaultLanguage: string;
  
  updateTheme: (theme: ThemeType) => void;
  updateNotifications: (enabled: boolean) => void;
  updateDailyGoal: (goal: number) => void;
  updateLearningMode: (mode: LearningMode) => void;
  updateSoundEffects: (enabled: boolean) => void;
  updateHapticFeedback: (enabled: boolean) => void;
  updateAutoPlayPronunciation: (enabled: boolean) => void;
  updateDefaultLanguage: (language: string) => void;
  resetSettings: () => void;
}

const defaultSettings = {
  theme: 'light' as ThemeType,
  notifications: true,
  dailyGoal: 10,
  learningMode: 'standard' as LearningMode,
  soundEffects: true,
  hapticFeedback: true,
  autoPlayPronunciation: true,
  defaultLanguage: 'Türkçe',
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,
      
      updateTheme: (theme) => set({ theme }),
      updateNotifications: (notifications) => set({ notifications }),
      updateDailyGoal: (dailyGoal) => set({ dailyGoal }),
      updateLearningMode: (learningMode) => set({ learningMode }),
      updateSoundEffects: (soundEffects) => set({ soundEffects }),
      updateHapticFeedback: (hapticFeedback) => set({ hapticFeedback }),
      updateAutoPlayPronunciation: (autoPlayPronunciation) => set({ autoPlayPronunciation }),
      updateDefaultLanguage: (defaultLanguage) => set({ defaultLanguage }),
      resetSettings: () => set(defaultSettings),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);