import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signIn, signUp, signOut, resetPassword, getCurrentUser, onAuthChanged } from '@/firebase/auth';

interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const user = await signIn(email, password);
          set({
            user: {
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || '',
              photoURL: user.photoURL || '',
            },
            isAuthenticated: true,
            isLoading: false
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false
          });
          throw error;
        }
      },

      register: async (email, password, displayName) => {
        set({ isLoading: true, error: null });
        try {
          const user = await signUp(email, password, displayName);
          set({
            user: {
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || '',
              photoURL: user.photoURL || '',
            },
            isAuthenticated: true,
            isLoading: false
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Registration failed',
            isLoading: false
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true, error: null });
        try {
          await signOut();
          set({ user: null, isAuthenticated: false, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Logout failed',
            isLoading: false
          });
          throw error;
        }
      },

      resetPassword: async (email) => {
        set({ isLoading: true, error: null });
        try {
          await resetPassword(email);
          set({ isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Password reset failed',
            isLoading: false
          });
          throw error;
        }
      },

      checkAuth: async () => {
        set({ isLoading: true });
        try {
          // Mevcut kullanıcıyı kontrol et
          const currentUser = getCurrentUser();

          if (currentUser) {
            set({
              user: {
                uid: currentUser.uid,
                email: currentUser.email || '',
                displayName: currentUser.displayName || '',
                photoURL: currentUser.photoURL || '',
              },
              isAuthenticated: true
            });
          } else {
            set({ user: null, isAuthenticated: false });
          }

          // Auth durumu değişikliklerini dinle
          onAuthChanged((firebaseUser) => {
            if (firebaseUser) {
              set({
                user: {
                  uid: firebaseUser.uid,
                  email: firebaseUser.email || '',
                  displayName: firebaseUser.displayName || '',
                  photoURL: firebaseUser.photoURL || '',
                },
                isAuthenticated: true,
                isLoading: false
              });
            } else {
              set({ user: null, isAuthenticated: false, isLoading: false });
            }
          });

        } catch (error) {
          console.error('Kimlik doğrulama kontrolü sırasında hata:', error);
          set({ user: null, isAuthenticated: false });
        } finally {
          set({ isLoading: false });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);