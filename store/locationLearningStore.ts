import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getLocationWords,
  getAllLocationWords,
  suggestLocationWords,
  loadDefaultLocationWords,
  LocationWord
} from '@/supabase/locationLearning';

interface LocationLearningState {
  locationWords: LocationWord[];
  nearbyWords: LocationWord[];
  isLoading: boolean;
  error: string | null;

  // Kelime işlemleri
  fetchAllLocationWords: () => Promise<void>;
  fetchLocationWordsByType: (placeType: string) => Promise<void>;
  fetchNearbyWords: (placeTypes: string[]) => Promise<void>;
  loadDefaultWords: () => Promise<void>;
  
  // Durum yönetimi
  clearError: () => void;
}

export const useLocationLearningStore = create<LocationLearningState>()(
  persist(
    (set) => ({
      locationWords: [],
      nearbyWords: [],
      isLoading: false,
      error: null,

      fetchAllLocationWords: async () => {
        set({ isLoading: true, error: null });
        try {
          const words = await getAllLocationWords();
          set({ locationWords: words, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch location words',
            isLoading: false
          });
        }
      },

      fetchLocationWordsByType: async (placeType) => {
        set({ isLoading: true, error: null });
        try {
          const words = await getLocationWords(placeType);
          set({ locationWords: words, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch location words',
            isLoading: false
          });
        }
      },

      fetchNearbyWords: async (placeTypes) => {
        set({ isLoading: true, error: null });
        try {
          const words = await suggestLocationWords(placeTypes);
          set({ nearbyWords: words, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch nearby words',
            isLoading: false
          });
        }
      },

      loadDefaultWords: async () => {
        set({ isLoading: true, error: null });
        try {
          await loadDefaultLocationWords();
          await getAllLocationWords().then(words => {
            set({ locationWords: words });
          });
          set({ isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load default words',
            isLoading: false
          });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'location-learning-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        locationWords: state.locationWords,
      }),
    }
  )
);
