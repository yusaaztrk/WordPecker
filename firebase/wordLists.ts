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
import { WordList } from '@/store/wordListStore';

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

// Kelime sayısını güncelle
export const updateWordCount = async (listId: string, count: number): Promise<void> => {
  try {
    const docRef = doc(listsCollection, listId);

    await updateDoc(docRef, {
      wordCount: count,
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    console.error('Kelime sayısı güncellenirken hata:', error.message);
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
export const getWordsInList = async (listId: string): Promise<any[]> => {
  try {
    const q = query(
      wordsCollection,
      where('listId', '==', listId),
      orderBy('createdAt', 'asc')
    );

    const querySnapshot = await getDocs(q);
    const words: any[] = [];

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

// Kelime güncelle
export const updateWord = async (wordId: string, updates: any): Promise<void> => {
  try {
    const docRef = doc(wordsCollection, wordId);

    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
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

// Herkese açık kelime listelerini ara
export const searchPublicWordLists = async (searchTerm: string): Promise<any[]> => {
  try {
    // Not: Firestore tam metin araması desteklemez, bu yüzden basit bir çözüm kullanıyoruz
    // Gerçek bir uygulamada Algolia gibi bir arama servisi kullanmak daha iyi olur
    const q = query(
      listsCollection,
      where('isPublic', '==', true)
    );

    const querySnapshot = await getDocs(q);
    const results: any[] = [];

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
          createdAt: data.createdAt?.toMillis() || Date.now(),
        });
      }
    });

    return results;
  } catch (error: any) {
    console.error('Liste araması sırasında hata:', error.message);
    throw error;
  }
};