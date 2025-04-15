// import { supabase } from './config';
// Göstermelik veriler kullanılacak, gerçek Supabase bağlantısı yok

// WordList arayüzü
export interface WordList {
  id: string;
  name: string;
  description?: string;
  language: string;
  target_language: string;
  tags?: string[];
  word_count: number;
  created_at: string;
  updated_at: string;
  user_id: string;
  is_public?: boolean;
}

// Word arayüzü
export interface Word {
  id: string;
  term: string;
  definition: string;
  example?: string;
  notes?: string;
  pronunciation?: string;
  image_url?: string;
  list_id?: string;
  mastery?: number;
  created_at: string;
  updated_at: string;
}

// Yeni liste oluştur - Göstermelik
export const createList = async (listData: Partial<WordList>): Promise<string> => {
  try {
    // Göstermelik bir ID döndür
    const mockId = 'mock-list-' + Date.now();
    console.log('Göstermelik liste oluşturuldu:', listData.name);
    return mockId;
  } catch (error: any) {
    console.error('Liste oluşturulurken hata:', error.message);
    throw error;
  }
};

// Kullanıcının tüm listelerini getir - Göstermelik
export const getLists = async (userId: string): Promise<WordList[]> => {
  try {
    // Göstermelik listeler döndür
    const mockLists: WordList[] = [
      {
        id: 'mock-list-1',
        name: 'İngilizce Temel Kelimeler',
        description: 'Günlük hayatta sık kullanılan temel kelimeler',
        language: 'Türkçe',
        target_language: 'İngilizce',
        tags: ['temel', 'günlük'],
        word_count: 25,
        user_id: userId,
        is_public: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'mock-list-2',
        name: 'İş İngilizcesi',
        description: 'İş hayatında kullanılan İngilizce terimler',
        language: 'Türkçe',
        target_language: 'İngilizce',
        tags: ['iş', 'profesyonel'],
        word_count: 15,
        user_id: userId,
        is_public: false,
        created_at: new Date(Date.now() - 86400000).toISOString(), // 1 gün önce
        updated_at: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 'mock-list-3',
        name: 'Seyahat Kelimeleri',
        description: 'Seyahat ederken işinize yarayacak kelimeler',
        language: 'Türkçe',
        target_language: 'İngilizce',
        tags: ['seyahat', 'turizm'],
        word_count: 20,
        user_id: userId,
        is_public: true,
        created_at: new Date(Date.now() - 172800000).toISOString(), // 2 gün önce
        updated_at: new Date(Date.now() - 172800000).toISOString()
      }
    ];

    return mockLists;
  } catch (error: any) {
    console.error('Listeler alınırken hata:', error.message);
    throw error;
  }
};

// ID'ye göre liste getir - Göstermelik
export const getListById = async (listId: string): Promise<WordList> => {
  try {
    // Göstermelik liste döndür
    const mockList: WordList = {
      id: listId,
      name: listId === 'mock-list-1' ? 'İngilizce Temel Kelimeler' :
           listId === 'mock-list-2' ? 'İş İngilizcesi' : 'Seyahat Kelimeleri',
      description: 'Bu liste için örnek açıklama',
      language: 'Türkçe',
      target_language: 'İngilizce',
      tags: ['temel', 'günlük'],
      word_count: 20,
      user_id: 'mock-user-id',
      is_public: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return mockList;
  } catch (error: any) {
    console.error('Liste alınırken hata:', error.message);
    throw error;
  }
};

// Liste güncelle
export const updateList = async (listId: string, updates: Partial<WordList>): Promise<void> => {
  try {
    const { error } = await supabase
      .from('word_lists')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', listId);

    if (error) throw error;
  } catch (error: any) {
    console.error('Liste güncellenirken hata:', error.message);
    throw error;
  }
};

// Liste sil
export const deleteList = async (listId: string): Promise<void> => {
  try {
    // İlk olarak listeye ait kelimeleri sil
    const { error: wordsError } = await supabase
      .from('words')
      .delete()
      .eq('list_id', listId);

    if (wordsError) throw wordsError;

    // Sonra listeyi sil
    const { error: listError } = await supabase
      .from('word_lists')
      .delete()
      .eq('id', listId);

    if (listError) throw listError;
  } catch (error: any) {
    console.error('Liste silinirken hata:', error.message);
    throw error;
  }
};

// Kelime oluştur
export const createWord = async (word: Partial<Word>): Promise<Word> => {
  try {
    const { data, error } = await supabase
      .from('words')
      .insert({
        list_id: word.list_id,
        term: word.term,
        definition: word.definition,
        example: word.example || '',
        pronunciation: word.pronunciation || '',
        notes: word.notes || '',
        image_url: word.image_url || '',
        mastery: 0,
      })
      .select('*')
      .single();

    if (error) throw error;
    if (!data) throw new Error('Kelime oluşturulamadı');

    // Liste kelime sayısını güncelle
    if (word.list_id) {
      await updateListWordCount(word.list_id, 1);
    }

    return data;
  } catch (error: any) {
    console.error('Kelime oluşturulurken hata:', error.message);
    throw error;
  }
};

// Listeye kelime ekle
export const addWordToList = async (listId: string, wordData: any): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('words')
      .insert({
        list_id: listId,
        term: wordData.term,
        definition: wordData.definition,
        example: wordData.example || '',
        notes: wordData.notes || '',
        pronunciation: wordData.pronunciation || '',
        image_url: wordData.image_url || '',
        mastery: 0,
      })
      .select('id')
      .single();

    if (error) throw error;
    if (!data) throw new Error('Kelime eklenemedi');

    // Liste kelime sayısını güncelle
    await updateListWordCount(listId, 1);

    return data.id;
  } catch (error: any) {
    console.error('Kelime eklenirken hata:', error.message);
    throw error;
  }
};

// Listedeki kelimeleri getir - Göstermelik
export const getWordsInList = async (listId: string): Promise<Word[]> => {
  try {
    // Göstermelik kelimeler döndür
    const mockWords: Word[] = [
      {
        id: 'mock-word-1',
        term: 'elma',
        definition: 'apple',
        example: 'I eat an apple every day.',
        notes: 'Meyve',
        pronunciation: '/æpəl/',
        image_url: '',
        list_id: listId,
        mastery: 80,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'mock-word-2',
        term: 'araba',
        definition: 'car',
        example: 'I drive my car to work.',
        notes: 'Ulaşım aracı',
        pronunciation: '/kɑr/',
        image_url: '',
        list_id: listId,
        mastery: 60,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'mock-word-3',
        term: 'kitap',
        definition: 'book',
        example: 'I read a book before bed.',
        notes: 'Okuma materyali',
        pronunciation: '/bʊk/',
        image_url: '',
        list_id: listId,
        mastery: 90,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'mock-word-4',
        term: 'bilgisayar',
        definition: 'computer',
        example: 'I work on my computer all day.',
        notes: 'Elektronik cihaz',
        pronunciation: '/kəmˈpjuːtər/',
        image_url: '',
        list_id: listId,
        mastery: 70,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'mock-word-5',
        term: 'telefon',
        definition: 'phone',
        example: 'I called my friend on my phone.',
        notes: 'İletişim aracı',
        pronunciation: '/foʊn/',
        image_url: '',
        list_id: listId,
        mastery: 85,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    return mockWords;
  } catch (error: any) {
    console.error('Kelimeler alınırken hata:', error.message);
    throw error;
  }
};

// Kelime getir
export const getWord = async (wordId: string): Promise<Word> => {
  try {
    const { data, error } = await supabase
      .from('words')
      .select('*')
      .eq('id', wordId)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Kelime bulunamadı');

    return data;
  } catch (error: any) {
    console.error('Kelime alınırken hata:', error.message);
    throw error;
  }
};

// Kelime güncelle
export const updateWord = async (wordId: string, updates: Partial<Word>): Promise<Word> => {
  try {
    const { data, error } = await supabase
      .from('words')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', wordId)
      .select('*')
      .single();

    if (error) throw error;
    if (!data) throw new Error('Kelime güncellenemedi');

    return data;
  } catch (error: any) {
    console.error('Kelime güncellenirken hata:', error.message);
    throw error;
  }
};

// Kelime sil
export const deleteWord = async (wordId: string, listId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('words')
      .delete()
      .eq('id', wordId);

    if (error) throw error;

    // Liste kelime sayısını güncelle
    await updateListWordCount(listId, -1);
  } catch (error: any) {
    console.error('Kelime silinirken hata:', error.message);
    throw error;
  }
};

// Kelime başarı seviyesini güncelle
export const updateWordMastery = async (wordId: string, mastery: number): Promise<void> => {
  try {
    const { error } = await supabase
      .from('words')
      .update({
        mastery: Math.max(0, Math.min(100, mastery)),
        updated_at: new Date().toISOString(),
      })
      .eq('id', wordId);

    if (error) throw error;
  } catch (error: any) {
    console.error('Kelime başarısı güncellenirken hata:', error.message);
    throw error;
  }
};

// Toplu kelime başarısı güncelleme
export const batchUpdateWordMastery = async (updates: {wordId: string, mastery: number}[]): Promise<void> => {
  try {
    // Supabase'de toplu güncelleme için her bir kelimeyi ayrı ayrı güncelliyoruz
    for (const update of updates) {
      const { error } = await supabase
        .from('words')
        .update({
          mastery: Math.max(0, Math.min(100, update.mastery)),
          updated_at: new Date().toISOString(),
        })
        .eq('id', update.wordId);

      if (error) throw error;
    }
  } catch (error: any) {
    console.error('Toplu kelime başarısı güncellenirken hata:', error.message);
    throw error;
  }
};

// Kelime ara
export const searchWords = async (userId: string, searchTerm: string): Promise<any[]> => {
  try {
    // Önce kullanıcının listelerini alalım
    const { data: lists, error: listsError } = await supabase
      .from('word_lists')
      .select('id, name')
      .eq('user_id', userId);

    if (listsError) throw listsError;
    if (!lists || lists.length === 0) return [];

    // Listedeki kelimeleri arayalım
    const listIds = lists.map(list => list.id);

    const { data: words, error: wordsError } = await supabase
      .from('words')
      .select('*')
      .in('list_id', listIds)
      .or(`term.ilike.%${searchTerm}%,definition.ilike.%${searchTerm}%,example.ilike.%${searchTerm}%`);

    if (wordsError) throw wordsError;
    if (!words) return [];

    // Sonuçları formatla
    return words.map(word => {
      const list = lists.find(l => l.id === word.list_id);
      return {
        id: word.id,
        term: word.term,
        definition: word.definition,
        example: word.example,
        listId: word.list_id,
        listName: list ? list.name : '',
        createdAt: word.created_at,
      };
    });
  } catch (error: any) {
    console.error('Kelime aranırken hata:', error.message);
    throw error;
  }
};

// Herkese açık kelime listelerini ara
export const searchPublicWordLists = async (searchTerm: string): Promise<WordList[]> => {
  try {
    const { data, error } = await supabase
      .from('word_lists')
      .select('*')
      .eq('is_public', true)
      .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);

    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error('Liste araması sırasında hata:', error.message);
    throw error;
  }
};

// Yardımcı fonksiyon: Liste kelime sayısını güncelle
const updateListWordCount = async (listId: string, change: number): Promise<void> => {
  try {
    // Önce mevcut listeyi al
    const { data: list, error: getError } = await supabase
      .from('word_lists')
      .select('word_count')
      .eq('id', listId)
      .single();

    if (getError) throw getError;
    if (!list) throw new Error('Liste bulunamadı');

    // Kelime sayısını güncelle
    const newCount = Math.max(0, (list.word_count || 0) + change);

    const { error: updateError } = await supabase
      .from('word_lists')
      .update({
        word_count: newCount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', listId);

    if (updateError) throw updateError;
  } catch (error: any) {
    console.error('Liste kelime sayısı güncellenirken hata:', error.message);
    throw error;
  }
};
