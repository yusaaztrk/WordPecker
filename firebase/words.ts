// words.ts
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
  writeBatch
} from 'firebase/firestore';
import { db } from './config';
// Word arayüzü
export interface Word {
  id: string;
  term: string;
  definition: string;
  example?: string;
  notes?: string;
  pronunciation?: string;
  imageUrl?: string;
  listId?: string;
  mastery?: number;
  createdAt: number;
  updatedAt: number;
}

// Koleksiyon referansı
const wordsCollection = collection(db, 'words');
const listsCollection = collection(db, 'wordLists');

// Kelime oluştur
export const createWord = async (word: Partial<Word>): Promise<Word> => {
  try {
    const wordRef = await addDoc(wordsCollection, {
      listId: word.listId,
      term: word.term,
      definition: word.definition,
      example: word.example || '',
      pronunciation: word.pronunciation || '',
      notes: word.notes || '',
      imageUrl: word.imageUrl || '',
      mastery: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Kelime sayısını güncelle
    if (word.listId) {
      const listRef = doc(listsCollection, word.listId);
      const listSnap = await getDoc(listRef);

      if (listSnap.exists()) {
        const listData = listSnap.data();
        await updateDoc(listRef, {
          wordCount: (listData.wordCount || 0) + 1,
          updatedAt: serverTimestamp(),
        });
      }
    }

    return {
      id: wordRef.id,
      ...word,
      createdAt: Date.now(),
      updatedAt: Date.now()
    } as Word;
  } catch (error: any) {
    console.error('Kelime oluşturulurken hata:', error.message);
    throw error;
  }
};

// ID'ye göre kelime getir
export const getWord = async (wordId: string): Promise<Word> => {
  try {
    const docRef = doc(wordsCollection, wordId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error('Kelime bulunamadı');
    }

    const data = docSnap.data();
    return {
      id: docSnap.id,
      term: data.term,
      definition: data.definition,
      example: data.example,
      notes: data.notes,
      pronunciation: data.pronunciation,
      imageUrl: data.imageUrl,
      mastery: data.mastery || 0,
      createdAt: data.createdAt?.toMillis() || Date.now(),
      updatedAt: data.updatedAt?.toMillis() || Date.now(),
      listId: data.listId,
    } as Word;
  } catch (error: any) {
    console.error('Kelime alınırken hata:', error.message);
    throw error;
  }
};

// Kelime güncelle
export const updateWord = async (wordId: string, updates: Partial<Word>): Promise<Word> => {
  try {
    const docRef = doc(wordsCollection, wordId);

    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });

    return {
      id: wordId,
      ...updates,
      updatedAt: Date.now()
    } as Word;
  } catch (error: any) {
    console.error('Kelime güncellenirken hata:', error.message);
    throw error;
  }
};

// Kelime sil
export const deleteWord = async (wordId: string, listId: string): Promise<void> => {
  try {
    const docRef = doc(wordsCollection, wordId);
    await deleteDoc(docRef);

    // Kelime sayısını güncelle
    const listRef = doc(listsCollection, listId);
    const listSnap = await getDoc(listRef);

    if (listSnap.exists()) {
      const listData = listSnap.data();
      await updateDoc(listRef, {
        wordCount: Math.max((listData.wordCount || 0) - 1, 0),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error: any) {
    console.error('Kelime silinirken hata:', error.message);
    throw error;
  }
};

// Kelime başarı seviyesini güncelle
export const updateWordMastery = async (wordId: string, mastery: number): Promise<void> => {
  try {
    const docRef = doc(wordsCollection, wordId);

    await updateDoc(docRef, {
      mastery: Math.max(0, Math.min(100, mastery)),
      updatedAt: serverTimestamp()
    });
  } catch (error: any) {
    console.error('Kelime başarısı güncellenirken hata:', error.message);
    throw error;
  }
};

// Toplu kelime başarısı güncelleme
export const batchUpdateWordMastery = async (updates: {wordId: string, mastery: number}[]): Promise<void> => {
  try {
    const batch = writeBatch(db);

    updates.forEach(({ wordId, mastery }) => {
      const docRef = doc(wordsCollection, wordId);
      batch.update(docRef, {
        mastery: Math.max(0, Math.min(100, mastery)),
        updatedAt: serverTimestamp()
      });
    });

    await batch.commit();
  } catch (error: any) {
    console.error('Toplu kelime başarısı güncellenirken hata:', error.message);
    throw error;
  }
};

// Kelime ara
export const searchWords = async (userId: string, searchTerm: string): Promise<any[]> => {
  try {
    // Önce kullanıcının listelerini alalım
    const q = query(
      listsCollection,
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    const lists: {id: string, name: string}[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      lists.push({
        id: doc.id,
        name: data.name
      });
    });

    if (lists.length === 0) {
      return [];
    }

    // Listedeki kelimeleri arayalım
    const listIds = lists.map(list => list.id);
    const results: any[] = [];

    // Her liste için ayrı sorgu yapalım
    for (const listId of listIds) {
      const wordsQuery = query(
        wordsCollection,
        where('listId', '==', listId)
      );

      const wordsSnapshot = await getDocs(wordsQuery);

      wordsSnapshot.forEach((doc) => {
        const data = doc.data();
        const term = data.term?.toLowerCase() || '';
        const definition = data.definition?.toLowerCase() || '';
        const example = data.example?.toLowerCase() || '';
        const search = searchTerm.toLowerCase();

        if (term.includes(search) || definition.includes(search) || example.includes(search)) {
          // Liste adını bulalım
          const listName = lists.find(l => l.id === listId)?.name || '';

          results.push({
            id: doc.id,
            term: data.term,
            definition: data.definition,
            example: data.example,
            listId: data.listId,
            listName: listName,
            createdAt: data.createdAt?.toMillis() || Date.now(),
          });
        }
      });
    }

    return results;
  } catch (error: any) {
    console.error('Kelime aranırken hata:', error.message);
    throw error;
  }
};