// wordLists.ts
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
  orderBy,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from './config';

// WordList arayüzü
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
  isPublic?: boolean;
}

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

// Koleksiyon referansları
const listsCollection = collection(db, 'wordLists');
const wordsCollection = collection(db, 'words');

// Yeni liste oluştur
export const createList = async (listData: Partial<WordList>): Promise<string> => {
  try {
    const listRef = await addDoc(listsCollection, {
      name: listData.name,
      description: listData.description || '',
      language: listData.language || 'Türkçe',
      targetLanguage: listData.targetLanguage || 'İngilizce',
      tags: listData.tags || [],
      wordCount: 0,
      userId: listData.userId,
      isPublic: listData.isPublic || false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return listRef.id;
  } catch (error: any) {
    console.error('Liste oluşturulurken hata:', error.message);
    throw error;
  }
};

// Kullanıcının tüm listelerini getir
export const getLists = async (userId: string): Promise<WordList[]> => {
  try {
    const q = query(
      listsCollection,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const lists: WordList[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      lists.push({
        id: doc.id,
        name: data.name,
        description: data.description,
        language: data.language,
        targetLanguage: data.targetLanguage,
        tags: data.tags,
        wordCount: data.wordCount || 0,
        isPublic: data.isPublic || false,
        createdAt: data.createdAt?.toMillis() || Date.now(),
        updatedAt: data.updatedAt?.toMillis() || Date.now(),
        userId: data.userId,
      });
    });

    return lists;
  } catch (error: any) {
    console.error('Listeler alınırken hata:', error.message);
    throw error;
  }
};

// ID'ye göre liste getir
export const getListById = async (listId: string): Promise<WordList> => {
  try {
    const docRef = doc(listsCollection, listId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error('Liste bulunamadı');
    }

    const data = docSnap.data();
    return {
      id: docSnap.id,
      name: data.name,
      description: data.description,
      language: data.language,
      targetLanguage: data.targetLanguage,
      tags: data.tags,
      wordCount: data.wordCount || 0,
      isPublic: data.isPublic || false,
      createdAt: data.createdAt?.toMillis() || Date.now(),
      updatedAt: data.updatedAt?.toMillis() || Date.now(),
      userId: data.userId,
    };
  } catch (error: any) {
    console.error('Liste alınırken hata:', error.message);
    throw error;
  }
};

// Liste güncelle
export const updateList = async (listId: string, updates: Partial<WordList>): Promise<void> => {
  try {
    const docRef = doc(listsCollection, listId);

    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    console.error('Liste güncellenirken hata:', error.message);
    throw error;
  }
};

// Liste sil
export const deleteList = async (listId: string): Promise<void> => {
  try {
    // İlk olarak listeye ait kelimeleri sil
    const q = query(wordsCollection, where('listId', '==', listId));
    const querySnapshot = await getDocs(q);

    // Batch işlemi başlat
    const batch = writeBatch(db);

    querySnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Listeyi sil
    const listRef = doc(listsCollection, listId);
    batch.delete(listRef);

    // Batch işlemini tamamla
    await batch.commit();
  } catch (error: any) {
    console.error('Liste silinirken hata:', error.message);
    throw error;
  }
};

// Kelime oluştur (createWord ile aynı işlevi görür)
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

// Listeye kelime ekle
export const addWordToList = async (listId: string, wordData: any): Promise<string> => {
  try {
    // Kelimeyi ekle
    const wordRef = await addDoc(wordsCollection, {
      listId: listId,
      term: wordData.term,
      definition: wordData.definition,
      example: wordData.example || '',
      notes: wordData.notes || '',
      pronunciation: wordData.pronunciation || '',
      imageUrl: wordData.imageUrl || '',
      mastery: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Liste kelime sayısını güncelle
    const listRef = doc(listsCollection, listId);
    const listSnap = await getDoc(listRef);

    if (listSnap.exists()) {
      const listData = listSnap.data();
      await updateDoc(listRef, {
        wordCount: (listData.wordCount || 0) + 1,
        updatedAt: serverTimestamp(),
      });
    }

    return wordRef.id;
  } catch (error: any) {
    console.error('Kelime eklenirken hata:', error.message);
    throw error;
  }
};

// Listedeki kelimeleri getir
export const getWordsInList = async (listId: string): Promise<Word[]> => {
  try {
    const q = query(
      wordsCollection,
      where('listId', '==', listId),
      orderBy('createdAt', 'asc')
    );

    const querySnapshot = await getDocs(q);
    const words: Word[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      words.push({
        id: doc.id,
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
      });
    });

    return words;
  } catch (error: any) {
    console.error('Kelimeler alınırken hata:', error.message);
    throw error;
  }
};

// Kelime getir
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
    // Kelimeyi sil
    const wordRef = doc(wordsCollection, wordId);
    await deleteDoc(wordRef);

    // Liste kelime sayısını güncelle
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

// Herkese açık kelime listelerini ara
export const searchPublicWordLists = async (searchTerm: string): Promise<WordList[]> => {
  try {
    // Not: Firestore tam metin araması desteklemez, bu yüzden basit bir çözüm kullanıyoruz
    const q = query(
      listsCollection,
      where('isPublic', '==', true)
    );

    const querySnapshot = await getDocs(q);
    const results: WordList[] = [];

    // Client-side filtreleme
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const name = data.name?.toLowerCase() || '';
      const description = data.description?.toLowerCase() || '';
      const search = searchTerm.toLowerCase();

      if (name.includes(search) || description.includes(search)) {
        results.push({
          id: doc.id,
          name: data.name,
          description: data.description,
          wordCount: data.wordCount || 0,
          language: data.language,
          targetLanguage: data.targetLanguage,
          isPublic: true,
          createdAt: data.createdAt?.toMillis() || Date.now(),
          updatedAt: data.updatedAt?.toMillis() || Date.now(),
          userId: data.userId,
        });
      }
    });

    return results;
  } catch (error: any) {
    console.error('Liste araması sırasında hata:', error.message);
    throw error;
  }
};
