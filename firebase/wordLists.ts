import { 
    collection, 
    doc, 
    addDoc, 
    getDoc, 
    getDocs, 
    updateDoc, 
    deleteDoc, 
    query, 
    where, 
    serverTimestamp,
    Timestamp,
    increment
  } from 'firebase/firestore';
  import { db } from './config';
  import { WordList, Word } from '@/store/wordListStore';
  
  // Collection references
  const listsCollection = collection(db, 'wordLists');
  
  // Create a new word list
  export const createList = async (listData: Omit<WordList, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    try {
      const timestamp = Date.now();
      const docRef = await addDoc(listsCollection, {
        ...listData,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating list:', error);
      throw error;
    }
  };
  
  // Get all lists for a user
  export const getLists = async (userId: string): Promise<WordList[]> => {
    try {
      const q = query(listsCollection, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as WordList));
    } catch (error) {
      console.error('Error getting lists:', error);
      throw error;
    }
  };
  
  // Get a specific list by ID
  export const getListById = async (listId: string): Promise<WordList> => {
    try {
      const docRef = doc(listsCollection, listId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('List not found');
      }
      
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as WordList;
    } catch (error) {
      console.error('Error getting list:', error);
      throw error;
    }
  };
  
  // Update a list
  export const updateList = async (listId: string, updates: Partial<Omit<WordList, 'id' | 'createdAt' | 'updatedAt' | 'userId'>>): Promise<void> => {
    try {
      const docRef = doc(listsCollection, listId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Date.now(),
      });
    } catch (error) {
      console.error('Error updating list:', error);
      throw error;
    }
  };
  
  // Delete a list
  export const deleteList = async (listId: string): Promise<void> => {
    try {
      // First, delete all words in the list
      const wordsCollection = collection(db, `wordLists/${listId}/words`);
      const wordsSnapshot = await getDocs(wordsCollection);
      
      const deletePromises = wordsSnapshot.docs.map(wordDoc => 
        deleteDoc(doc(wordsCollection, wordDoc.id))
      );
      
      await Promise.all(deletePromises);
      
      // Then delete the list itself
      const docRef = doc(listsCollection, listId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting list:', error);
      throw error;
    }
  };
  
  // Add a word to a list
  export const addWordToList = async (listId: string, wordData: Omit<Word, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    try {
      const wordsCollection = collection(db, `wordLists/${listId}/words`);
      const timestamp = Date.now();
      
      const wordDocRef = await addDoc(wordsCollection, {
        ...wordData,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
      
      // Update the word count in the list
      const listDocRef = doc(listsCollection, listId);
      await updateDoc(listDocRef, {
        wordCount: increment(1),
        updatedAt: timestamp,
      });
      
      return wordDocRef.id;
    } catch (error) {
      console.error('Error adding word:', error);
      throw error;
    }
  };
  
  // Get all words in a list
  export const getWordsInList = async (listId: string): Promise<Word[]> => {
    try {
      const wordsCollection = collection(db, `wordLists/${listId}/words`);
      const querySnapshot = await getDocs(wordsCollection);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Word));
    } catch (error) {
      console.error('Error getting words:', error);
      throw error;
    }
  };
  
  // Update a word
  export const updateWord = async (listId: string, wordId: string, updates: Partial<Omit<Word, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
    try {
      const wordDocRef = doc(db, `wordLists/${listId}/words/${wordId}`);
      await updateDoc(wordDocRef, {
        ...updates,
        updatedAt: Date.now(),
      });
      
      // Update the list's updatedAt timestamp
      const listDocRef = doc(listsCollection, listId);
      await updateDoc(listDocRef, {
        updatedAt: Date.now(),
      });
    } catch (error) {
      console.error('Error updating word:', error);
      throw error;
    }
  };
  
  // Delete a word
  export const deleteWord = async (listId: string, wordId: string): Promise<void> => {
    try {
      const wordDocRef = doc(db, `wordLists/${listId}/words/${wordId}`);
      await deleteDoc(wordDocRef);
      
      // Update the word count and timestamp in the list
      const timestamp = Date.now();
      const listDocRef = doc(listsCollection, listId);
      await updateDoc(listDocRef, {
        wordCount: increment(-1),
        updatedAt: timestamp,
      });
    } catch (error) {
      console.error('Error deleting word:', error);
      throw error;
    }
  };