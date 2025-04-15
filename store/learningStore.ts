import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  createSession, 
  getSessions, 
  updateSession,
  getSessionsByList
} from '@/firebase/learning';
import { useAuthStore } from './authStore';
import { useWordListStore } from './wordListStore';

export interface LearningSession {
  id: string;
  listId: string;
  userId: string;
  date: number;
  duration: number;
  wordsStudied: number;
  correctAnswers: number;
  incorrectAnswers: number;
  mode: 'learn' | 'test';
  completed: boolean;
  score?: number;
}

export interface WordStats {
  wordId: string;
  listId: string;
  correctCount: number;
  incorrectCount: number;
  lastStudied: number;
  mastery: number; // 0-100 percentage
}

export interface UserStats {
  totalSessions: number;
  totalTimeSpent: number;
  totalWordsStudied: number;
  totalCorrectAnswers: number;
  streakDays: number;
  lastStudyDate: number;
}

interface LearningState {
  sessions: LearningSession[];
  currentSession: LearningSession | null;
  wordStats: Record<string, WordStats>; // key is wordId
  userStats: UserStats;
  isLoading: boolean;
  error: string | null;
  
  // Session operations
  fetchSessions: () => Promise<void>;
  fetchSessionsByList: (listId: string) => Promise<LearningSession[]>;
  startSession: (listId: string, mode: 'learn' | 'test') => Promise<string>;
  completeSession: (sessionId: string, results: {
    duration: number;
    wordsStudied: number;
    correctAnswers: number;
    incorrectAnswers: number;
    score?: number;
  }) => Promise<void>;
  
  // Stats operations
  updateWordStat: (wordId: string, listId: string, isCorrect: boolean) => void;
  updateStats: () => Promise<void>;
  
  // State management
  setCurrentSession: (session: LearningSession | null) => void;
  clearError: () => void;
}

const initialUserStats: UserStats = {
  totalSessions: 0,
  totalTimeSpent: 0,
  totalWordsStudied: 0,
  totalCorrectAnswers: 0,
  streakDays: 0,
  lastStudyDate: 0,
};

export const useLearningStore = create<LearningState>()(
  persist(
    (set, get) => ({
      sessions: [],
      currentSession: null,
      wordStats: {},
      userStats: initialUserStats,
      isLoading: false,
      error: null,
      
      // Session operations
      fetchSessions: async () => {
        const { user } = useAuthStore.getState();
        if (!user) {
          set({ error: 'User not authenticated' });
          return;
        }
        
        set({ isLoading: true, error: null });
        try {
          const sessions = await getSessions(user.uid);
          set({ sessions, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch sessions', 
            isLoading: false 
          });
        }
      },
      
      fetchSessionsByList: async (listId) => {
        const { user } = useAuthStore.getState();
        if (!user) {
          throw new Error('User not authenticated');
        }
        
        set({ isLoading: true, error: null });
        try {
          const sessions = await getSessionsByList(user.uid, listId);
          set({ isLoading: false });
          return sessions;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch sessions', 
            isLoading: false 
          });
          throw error;
        }
      },
      
      startSession: async (listId, mode) => {
        const { user } = useAuthStore.getState();
        if (!user) {
          throw new Error('User not authenticated');
        }
        
        set({ isLoading: true, error: null });
        try {
          const sessionData: Omit<LearningSession, 'id'> = {
            listId,
            userId: user.uid,
            date: Date.now(),
            duration: 0,
            wordsStudied: 0,
            correctAnswers: 0,
            incorrectAnswers: 0,
            mode,
            completed: false,
          };
          
          const sessionId = await createSession(sessionData);
          
          const newSession: LearningSession = {
            id: sessionId,
            ...sessionData,
          };
          
          set({ 
            currentSession: newSession,
            sessions: [...get().sessions, newSession],
            isLoading: false 
          });
          
          return sessionId;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to start session', 
            isLoading: false 
          });
          throw error;
        }
      },
      
      completeSession: async (sessionId, results) => {
        set({ isLoading: true, error: null });
        try {
          const updates = {
            ...results,
            completed: true,
          };
          
          await updateSession(sessionId, updates);
          
          // Update local state
          const updatedSessions = get().sessions.map(session => 
            session.id === sessionId ? { ...session, ...updates } : session
          );
          
          const currentSession = get().currentSession;
          
          set({ 
            sessions: updatedSessions,
            currentSession: currentSession?.id === sessionId 
              ? { ...currentSession, ...updates } 
              : currentSession,
            isLoading: false 
          });
          
          // Update user stats
          await get().updateStats();
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to complete session', 
            isLoading: false 
          });
          throw error;
        }
      },
      
      // Stats operations
      updateWordStat: (wordId, listId, isCorrect) => {
        const stats = get().wordStats[wordId] || {
          wordId,
          listId,
          correctCount: 0,
          incorrectCount: 0,
          lastStudied: 0,
          mastery: 0,
        };
        
        const now = Date.now();
        
        const updatedStats = {
          ...stats,
          correctCount: isCorrect ? stats.correctCount + 1 : stats.correctCount,
          incorrectCount: isCorrect ? stats.incorrectCount : stats.incorrectCount + 1,
          lastStudied: now,
          mastery: calculateMastery(
            isCorrect ? stats.correctCount + 1 : stats.correctCount,
            isCorrect ? stats.incorrectCount : stats.incorrectCount + 1
          ),
        };
        
        set({
          wordStats: {
            ...get().wordStats,
            [wordId]: updatedStats,
          },
        });
      },
      
      updateStats: async () => {
        const { sessions } = get();
        
        if (sessions.length === 0) {
          return;
        }
        
        // Calculate total stats
        const totalSessions = sessions.length;
        const totalTimeSpent = sessions.reduce((sum, session) => sum + session.duration, 0);
        const totalWordsStudied = sessions.reduce((sum, session) => sum + session.wordsStudied, 0);
        const totalCorrectAnswers = sessions.reduce((sum, session) => sum + session.correctAnswers, 0);
        
        // Calculate streak
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayTimestamp = today.getTime();
        
        // Sort sessions by date (newest first)
        const sortedSessions = [...sessions].sort((a, b) => b.date - a.date);
        
        // Get the most recent session date
        const lastStudyDate = sortedSessions.length > 0 ? sortedSessions[0].date : 0;
        
        // Calculate streak
        let streakDays = 0;
        let currentDate = new Date(todayTimestamp);
        
        // Check if studied today
        const studiedToday = sortedSessions.some(session => {
          const sessionDate = new Date(session.date);
          sessionDate.setHours(0, 0, 0, 0);
          return sessionDate.getTime() === todayTimestamp;
        });
        
        if (studiedToday) {
          streakDays = 1;
          
          // Check previous days
          let checkDate = new Date(todayTimestamp);
          checkDate.setDate(checkDate.getDate() - 1);
          
          while (true) {
            const checkTimestamp = checkDate.getTime();
            
            const studiedOnDate = sortedSessions.some(session => {
              const sessionDate = new Date(session.date);
              sessionDate.setHours(0, 0, 0, 0);
              return sessionDate.getTime() === checkTimestamp;
            });
            
            if (studiedOnDate) {
              streakDays++;
              checkDate.setDate(checkDate.getDate() - 1);
            } else {
              break;
            }
          }
        }
        
        set({
          userStats: {
            totalSessions,
            totalTimeSpent,
            totalWordsStudied,
            totalCorrectAnswers,
            streakDays,
            lastStudyDate,
          },
        });
      },
      
      // State management
      setCurrentSession: (session) => set({ currentSession: session }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'learning-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        wordStats: state.wordStats,
        userStats: state.userStats,
      }),
    }
  )
);

// Helper function to calculate mastery percentage
const calculateMastery = (correct: number, incorrect: number): number => {
  if (correct + incorrect === 0) return 0;
  
  // Base mastery on correct percentage with a minimum of 5 attempts
  const totalAttempts = correct + incorrect;
  const correctPercentage = (correct / totalAttempts) * 100;
  
  // Scale mastery based on number of attempts (more attempts = more reliable mastery)
  const attemptFactor = Math.min(1, totalAttempts / 5);
  
  return Math.round(correctPercentage * attemptFactor);
};