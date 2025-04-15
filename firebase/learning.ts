import { 
    collection, 
    doc, 
    addDoc, 
    getDoc, 
    getDocs, 
    updateDoc, 
    query, 
    where, 
    orderBy
  } from 'firebase/firestore';
  import { db } from './config';
  import { LearningSession } from '@/store/learningStore';
  
  // Collection references
  const sessionsCollection = collection(db, 'learningSessions');
  
  // Create a new learning session
  export const createSession = async (sessionData: Omit<LearningSession, 'id'>): Promise<string> => {
    try {
      const docRef = await addDoc(sessionsCollection, sessionData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  };
  
  // Get all sessions for a user
  export const getSessions = async (userId: string): Promise<LearningSession[]> => {
    try {
      const q = query(
        sessionsCollection, 
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as LearningSession));
    } catch (error) {
      console.error('Error getting sessions:', error);
      throw error;
    }
  };
  
  // Get sessions for a specific list
  export const getSessionsByList = async (userId: string, listId: string): Promise<LearningSession[]> => {
    try {
      const q = query(
        sessionsCollection, 
        where('userId', '==', userId),
        where('listId', '==', listId),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as LearningSession));
    } catch (error) {
      console.error('Error getting sessions by list:', error);
      throw error;
    }
  };
  
  // Update a session
  export const updateSession = async (sessionId: string, updates: Partial<Omit<LearningSession, 'id' | 'userId' | 'listId' | 'date'>>): Promise<void> => {
    try {
      const docRef = doc(sessionsCollection, sessionId);
      await updateDoc(docRef, updates);
    } catch (error) {
      console.error('Error updating session:', error);
      throw error;
    }
  };
  
  // Get a specific session by ID
  export const getSessionById = async (sessionId: string): Promise<LearningSession> => {
    try {
      const docRef = doc(sessionsCollection, sessionId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Session not found');
      }
      
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as LearningSession;
    } catch (error) {
      console.error('Error getting session:', error);
      throw error;
    }
  };