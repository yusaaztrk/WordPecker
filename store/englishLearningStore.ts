import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getEnglishWordInfo,
  saveLearnedWord,
  getLearnedWords,
  getSuggestedWords,
  getWordsForReview,
  EnglishWordInfo
} from '@/supabase/englishLearning';
import { useAuthStore } from './authStore';
import { convertToUUID } from '@/supabase/auth';

interface EnglishLearningState {
  learnedWords: any[];
  suggestedWords: EnglishWordInfo[];
  reviewWords: any[];
  currentWord: EnglishWordInfo | null;
  isLoading: boolean;
  error: string | null;

  // Kelime işlemleri
  fetchWordInfo: (word: string) => Promise<EnglishWordInfo | null>;
  markWordAsLearned: (wordId: string, confidence: number) => Promise<void>;
  fetchLearnedWords: () => Promise<void>;
  fetchSuggestedWords: (limit?: number) => Promise<void>;
  fetchWordsForReview: (limit?: number) => Promise<void>;

  // Durum yönetimi
  setCurrentWord: (word: EnglishWordInfo | null) => void;
  clearError: () => void;
}

export const useEnglishLearningStore = create<EnglishLearningState>()(
  persist(
    (set, get) => ({
      learnedWords: [],
      suggestedWords: [],
      reviewWords: [],
      currentWord: null,
      isLoading: false,
      error: null,

      fetchWordInfo: async (word) => {
        set({ isLoading: true, error: null });
        try {
          const wordInfo = await getEnglishWordInfo(word);
          set({ currentWord: wordInfo, isLoading: false });
          return wordInfo;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch word info',
            isLoading: false
          });
          return null;
        }
      },

      markWordAsLearned: async (wordId, confidence) => {
        const { user } = useAuthStore.getState();
        if (!user) {
          set({ error: 'User not authenticated' });
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const uuid = convertToUUID(user.uid);
        await saveLearnedWord(uuid, wordId, confidence);

          // Öğrenilen kelimeleri güncelle
          await get().fetchLearnedWords();

          set({ isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to mark word as learned',
            isLoading: false
          });
        }
      },

      fetchLearnedWords: async () => {
        const { user } = useAuthStore.getState();
        if (!user) {
          set({ error: 'User not authenticated' });
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const uuid = convertToUUID(user.uid);
          const words = await getLearnedWords(uuid);
          set({ learnedWords: words, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch learned words',
            isLoading: false
          });
        }
      },

      fetchSuggestedWords: async (limit = 10) => {
        const { user } = useAuthStore.getState();
        if (!user) {
          set({ error: 'User not authenticated' });
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const uuid = convertToUUID(user.uid);
          const words = await getSuggestedWords(uuid, limit);
          set({ suggestedWords: words, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch suggested words',
            isLoading: false
          });
        }
      },

      fetchWordsForReview: async (limit = 10) => {
        const { user } = useAuthStore.getState();
        if (!user) {
          set({ error: 'User not authenticated' });
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const uuid = convertToUUID(user.uid);
          const words = await getWordsForReview(uuid, limit);
          set({ reviewWords: words, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch words for review',
            isLoading: false
          });
        }
      },

      setCurrentWord: (word) => set({ currentWord: word }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'english-learning-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        learnedWords: state.learnedWords,
      }),
    }
  )
);
