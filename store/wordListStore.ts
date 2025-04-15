import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  createList, 
  getLists, 
  getListById, 
  updateList, 
  deleteList,
  addWordToList,
  getWordsInList,
  updateWord,
  deleteWord
} from '@/firebase/wordLists';
import { useAuthStore } from './authStore';

export interface Word {
  id: string;
  term: string;
  definition: string;
  example?: string;
  notes?: string;
  pronunciation?: string;
  imageUrl?: string;
  createdAt: number;
  updatedAt: number;
}

export interface WordList {
  id: string;
  name: string;
  description?: string;
  language: string;
  targetLanguage: string;
  tags?: string[];
  wordCount: number;
  createdAt: number;
  updatedAt: number;
  userId: string;
}

interface WordListState {
  lists: WordList[];
  currentList: WordList | null;
  currentWords: Word[];
  isLoading: boolean;
  error: string | null;
  
  // List operations
  fetchLists: () => Promise<void>;
  fetchListById: (id: string) => Promise<WordList>;
  createNewList: (list: Omit<WordList, 'id' | 'wordCount' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<string>;
  updateListDetails: (id: string, updates: Partial<Omit<WordList, 'id' | 'wordCount' | 'createdAt' | 'updatedAt' | 'userId'>>) => Promise<void>;
  removeList: (id: string) => Promise<void>;
  
  // Word operations
  fetchWordsInList: (listId: string) => Promise<Word[]>;
  addWord: (listId: string, word: Omit<Word, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateWordDetails: (listId: string, wordId: string, updates: Partial<Omit<Word, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  removeWord: (listId: string, wordId: string) => Promise<void>;
  
  // State management
  setCurrentList: (list: WordList | null) => void;
  clearError: () => void;
}

export const useWordListStore = create<WordListState>()(
  persist(
    (set, get) => ({
      lists: [],
      currentList: null,
      currentWords: [],
      isLoading: false,
      error: null,
      
      // List operations
      fetchLists: async () => {
        const { user } = useAuthStore.getState();
        if (!user) {
          set({ error: 'User not authenticated' });
          return;
        }
        
        set({ isLoading: true, error: null });
        try {
          const lists = await getLists(user.uid);
          set({ lists, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch lists', 
            isLoading: false 
          });
        }
      },
      
      fetchListById: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const list = await getListById(id);
          set({ currentList: list, isLoading: false });
          return list;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch list', 
            isLoading: false 
          });
          throw error;
        }
      },
      
      createNewList: async (listData) => {
        const { user } = useAuthStore.getState();
        if (!user) {
          throw new Error('User not authenticated');
        }
        
        set({ isLoading: true, error: null });
        try {
          const listId = await createList({
            ...listData,
            userId: user.uid,
            wordCount: 0,
          });
          
          // Refresh lists after creating a new one
          await get().fetchLists();
          
          set({ isLoading: false });
          return listId;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to create list', 
            isLoading: false 
          });
          throw error;
        }
      },
      
      updateListDetails: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          await updateList(id, updates);
          
          // Update local state
          const updatedLists = get().lists.map(list => 
            list.id === id ? { ...list, ...updates, updatedAt: Date.now() } : list
          );
          
          set({ 
            lists: updatedLists,
            currentList: get().currentList?.id === id 
              ? { ...get().currentList, ...updates, updatedAt: Date.now() } 
              : get().currentList,
            isLoading: false 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update list', 
            isLoading: false 
          });
          throw error;
        }
      },
      
      removeList: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await deleteList(id);
          
          // Update local state
          const updatedLists = get().lists.filter(list => list.id !== id);
          
          set({ 
            lists: updatedLists,
            currentList: get().currentList?.id === id ? null : get().currentList,
            isLoading: false 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete list', 
            isLoading: false 
          });
          throw error;
        }
      },
      
      // Word operations
      fetchWordsInList: async (listId) => {
        set({ isLoading: true, error: null });
        try {
          const words = await getWordsInList(listId);
          set({ currentWords: words, isLoading: false });
          return words;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch words', 
            isLoading: false 
          });
          throw error;
        }
      },
      
      addWord: async (listId, wordData) => {
        set({ isLoading: true, error: null });
        try {
          const wordId = await addWordToList(listId, wordData);
          
          // Update word count in the list
          const updatedLists = get().lists.map(list => 
            list.id === listId ? { ...list, wordCount: list.wordCount + 1 } : list
          );
          
          // Update current list if it's the one we're adding to
          const currentList = get().currentList;
          if (currentList && currentList.id === listId) {
            set({ 
              currentList: { ...currentList, wordCount: currentList.wordCount + 1 }
            });
          }
          
          set({ lists: updatedLists, isLoading: false });
          
          // Refresh words in the list
          await get().fetchWordsInList(listId);
          
          return wordId;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to add word', 
            isLoading: false 
          });
          throw error;
        }
      },
      
      updateWordDetails: async (listId, wordId, updates) => {
        set({ isLoading: true, error: null });
        try {
          await updateWord(listId, wordId, updates);
          
          // Update local state
          const updatedWords = get().currentWords.map(word => 
            word.id === wordId ? { ...word, ...updates, updatedAt: Date.now() } : word
          );
          
          set({ currentWords: updatedWords, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update word', 
            isLoading: false 
          });
          throw error;
        }
      },
      
      removeWord: async (listId, wordId) => {
        set({ isLoading: true, error: null });
        try {
          await deleteWord(listId, wordId);
          
          // Update word count in the list
          const updatedLists = get().lists.map(list => 
            list.id === listId ? { ...list, wordCount: Math.max(0, list.wordCount - 1) } : list
          );
          
          // Update current list if it's the one we're removing from
          const currentList = get().currentList;
          if (currentList && currentList.id === listId) {
            set({ 
              currentList: { 
                ...currentList, 
                wordCount: Math.max(0, currentList.wordCount - 1) 
              }
            });
          }
          
          // Update local words state
          const updatedWords = get().currentWords.filter(word => word.id !== wordId);
          
          set({ 
            lists: updatedLists, 
            currentWords: updatedWords,
            isLoading: false 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete word', 
            isLoading: false 
          });
          throw error;
        }
      },
      
      // State management
      setCurrentList: (list) => set({ currentList: list }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'word-list-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        lists: state.lists,
        currentList: state.currentList,
      }),
    }
  )
);