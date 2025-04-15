import { 
    collection, 
    doc, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    getDocs, 
    getDoc, 
    query, 
    where, 
    orderBy,
    serverTimestamp,
    Timestamp,
    writeBatch
  } from 'firebase/firestore';
  import { db } from './config';
  import { updateWordCount } from './wordLists';
  
  export interface Word {
    id?: string;
    listId: string;
    term: string;
    definition: string;
    example?: string;
    pronunciation?: string;
    notes?: string;
    imageUrl?: string;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
    mastery?: number; // 0-100 mastery level
  }
  
  // Create a new word
  export const createWord = async (word: Omit<Word, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const docRef = await addDoc(collection(db, 'words'), {
        ...word,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        mastery: 0,
      });
      
      // Update word count in the list
      await updateWordCountForList(word.listId);
      
      return { id: docRef.id, ...word };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create word');
    }
  };
  
  // Get all words for a list
  export const getWords = async (listId: string) => {
    try {
      const q = query(
        collection(db, 'words'), 
        where('listId', '==', listId),
        orderBy('createdAt', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const words: Word[] = [];
      
      querySnapshot.forEach((doc) => {
        words.push({ id: doc.id, ...doc.data() } as Word);
      });
      
      return words;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get words');
    }
  };
  
  // Get a single word by ID
  export const getWord = async (wordId: string) => {
    try {
      const docRef = doc(db, 'words', wordId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Word;
      } else {
        throw new Error('Word not found');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get word');
    }
  };
  
  // Update a word
  export const updateWord = async (wordId: string, data: Partial<Word>) => {
    try {
      const docRef = doc(db, 'words', wordId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
      
      return { id: wordId, ...data };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update word');
    }
  };
  
  // Delete a word
  export const deleteWord = async (wordId: string, listId: string) => {
    try {
      await deleteDoc(doc(db, 'words', wordId));
      
      // Update word count in the list
      await updateWordCountForList(listId);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete word');
    }
  };
  
  // Update mastery level for a word
  export const updateWordMastery = async (wordId: string, mastery: number) => {
    try {
      const docRef = doc(db, 'words', wordId);
      await updateDoc(docRef, {
        mastery: Math.max(0, Math.min(100, mastery)), // Ensure mastery is between 0-100
        updatedAt: serverTimestamp(),
      });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update word mastery');
    }
  };
  
  // Batch update mastery levels for multiple words
  export const batchUpdateWordMastery = async (updates: { wordId: string, mastery: number }[]) => {
    try {
      const batch = writeBatch(db);
      
      updates.forEach(({ wordId, mastery }) => {
        const docRef = doc(db, 'words', wordId);
        batch.update(docRef, {
          mastery: Math.max(0, Math.min(100, mastery)),
          updatedAt: serverTimestamp(),
        });
      });
      
      await batch.commit();
    } catch (error: any) {
      throw new Error(error.message || 'Failed to batch update word mastery');
    }
  };
  
  // Helper function to update word count for a list
  const updateWordCountForList = async (listId: string) => {
    try {
      const q = query(collection(db, 'words'), where('listId', '==', listId));
      const querySnapshot = await getDocs(q);
      const count = querySnapshot.size;
      
      await updateWordCount(listId, count);
    } catch (error: any) {
      console.error('Failed to update word count:', error);
    }
  };
  
  // Search words across all user's lists
  export const searchWords = async (userId: string, searchTerm: string) => {
    try {
      // First get all lists for the user
      const listsQuery = query(collection(db, 'wordLists'), where('userId', '==', userId));
      const listsSnapshot = await getDocs(listsQuery);
      const listIds: string[] = [];
      
      listsSnapshot.forEach((doc) => {
        listIds.push(doc.id);
      });
      
      if (listIds.length === 0) {
        return [];
      }
      
      // Then get all words from those lists
      const results: (Word & { listName?: string })[] = [];
      
      // We need to query in batches if there are many lists
      const batchSize = 10;
      for (let i = 0; i < listIds.length; i += batchSize) {
        const batch = listIds.slice(i, i + batchSize);
        const wordsQuery = query(collection(db, 'words'), where('listId', 'in', batch));
        const wordsSnapshot = await getDocs(wordsQuery);
        
        wordsSnapshot.forEach((doc) => {
          const word = { id: doc.id, ...doc.data() } as Word;
          if (
            word.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
            word.definition.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (word.example && word.example.toLowerCase().includes(searchTerm.toLowerCase()))
          ) {
            results.push(word);
          }
        });
      }
      
      // Get list names for the results
      const listMap = new Map<string, string>();
      listsSnapshot.forEach((doc) => {
        const data = doc.data();
        listMap.set(doc.id, data.name);
      });
      
      // Add list names to results
      results.forEach(word => {
        word.listName = listMap.get(word.listId);
      });
      
      return results;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to search words');
    }
  };