// learning.ts
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';

// Öğrenme oturumu arayüzü
export interface LearningSession {
  id: string;
  userId: string;
  listId: string;
  date: number;
  duration: number;
  wordsStudied: number;
  correctAnswers: number;
  incorrectAnswers: number;
  mode: 'learn' | 'test';
  completed: boolean;
  score?: number;
  createdAt: number;
  updatedAt: number;
}

// Koleksiyon referansı
const sessionsCollection = collection(db, 'learningSessions');

// Yeni öğrenme oturumu oluştur
export const createSession = async (sessionData: Partial<LearningSession>): Promise<string> => {
  try {
    const sessionRef = await addDoc(sessionsCollection, {
      userId: sessionData.userId,
      listId: sessionData.listId,
      date: Date.now(),
      duration: sessionData.duration || 0,
      wordsStudied: sessionData.wordsStudied || 0,
      correctAnswers: sessionData.correctAnswers || 0,
      incorrectAnswers: sessionData.incorrectAnswers || 0,
      mode: sessionData.mode || 'learn',
      completed: sessionData.completed || false,
      score: sessionData.score,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return sessionRef.id;
  } catch (error: any) {
    console.error('Oturum oluşturulurken hata:', error.message);
    throw error;
  }
};

// Kullanıcının tüm oturumlarını getir
export const getSessions = async (userId: string): Promise<LearningSession[]> => {
  try {
    const q = query(
      sessionsCollection,
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const sessions: LearningSession[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      sessions.push({
        id: doc.id,
        userId: data.userId,
        listId: data.listId,
        date: data.date,
        duration: data.duration,
        wordsStudied: data.wordsStudied,
        correctAnswers: data.correctAnswers,
        incorrectAnswers: data.incorrectAnswers,
        mode: data.mode,
        completed: data.completed,
        score: data.score,
        createdAt: data.createdAt?.toMillis() || Date.now(),
        updatedAt: data.updatedAt?.toMillis() || Date.now(),
      });
    });

    return sessions;
  } catch (error: any) {
    console.error('Oturumlar alınırken hata:', error.message);
    throw error;
  }
};

// Belirli bir liste için oturumları getir
export const getSessionsByList = async (userId: string, listId: string): Promise<LearningSession[]> => {
  try {
    const q = query(
      sessionsCollection,
      where('userId', '==', userId),
      where('listId', '==', listId),
      orderBy('date', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const sessions: LearningSession[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      sessions.push({
        id: doc.id,
        userId: data.userId,
        listId: data.listId,
        date: data.date,
        duration: data.duration,
        wordsStudied: data.wordsStudied,
        correctAnswers: data.correctAnswers,
        incorrectAnswers: data.incorrectAnswers,
        mode: data.mode,
        completed: data.completed,
        score: data.score,
        createdAt: data.createdAt?.toMillis() || Date.now(),
        updatedAt: data.updatedAt?.toMillis() || Date.now(),
      });
    });

    return sessions;
  } catch (error: any) {
    console.error('Liste oturumları alınırken hata:', error.message);
    throw error;
  }
};

// Oturum güncelle
export const updateSession = async (sessionId: string, updates: Partial<LearningSession>): Promise<void> => {
  try {
    const docRef = doc(sessionsCollection, sessionId);

    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error: any) {
    console.error('Oturum güncellenirken hata:', error.message);
    throw error;
  }
};

// ID'ye göre oturum getir
export const getSessionById = async (sessionId: string): Promise<LearningSession> => {
  try {
    const docRef = doc(sessionsCollection, sessionId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error('Oturum bulunamadı');
    }

    const data = docSnap.data();
    return {
      id: docSnap.id,
      userId: data.userId,
      listId: data.listId,
      date: data.date,
      duration: data.duration,
      wordsStudied: data.wordsStudied,
      correctAnswers: data.correctAnswers,
      incorrectAnswers: data.incorrectAnswers,
      mode: data.mode,
      completed: data.completed,
      score: data.score,
      createdAt: data.createdAt?.toMillis() || Date.now(),
      updatedAt: data.updatedAt?.toMillis() || Date.now(),
    };
  } catch (error: any) {
    console.error('Oturum alınırken hata:', error.message);
    throw error;
  }
};