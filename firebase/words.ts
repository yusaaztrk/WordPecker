// words.js
import { supabase } from './config';
import { updateWordCount } from './wordLists';

// Kelime oluştur
export const createWord = async (word) => {
  try {
    const { data, error } = await supabase
      .from('words')
      .insert([{
        list_id: word.listId,
        term: word.term,
        definition: word.definition,
        example: word.example,
        pronunciation: word.pronunciation,
        notes: word.notes,
        image_url: word.imageUrl,
        mastery: 0,
        created_at: new Date(),
        updated_at: new Date()
      }])
      .select();
    
    if (error) throw error;
    
    // Kelime sayısını güncelle
    await updateWordCountForList(word.listId);
    
    return { id: data[0].id, ...word };
  } catch (error) {
    console.error('Kelime oluşturulurken hata:', error.message);
    throw error;
  }
};

// Liste için kelimeleri getir
export const getWords = async (listId) => {
  try {
    const { data, error } = await supabase
      .from('words')
      .select('*')
      .eq('list_id', listId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Kelimeler alınırken hata:', error.message);
    throw error;
  }
};

// ID'ye göre kelime getir
export const getWord = async (wordId) => {
  try {
    const { data, error } = await supabase
      .from('words')
      .select('*')
      .eq('id', wordId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Kelime alınırken hata:', error.message);
    throw error;
  }
};

// Kelime güncelle
export const updateWord = async (wordId, data) => {
  try {
    const { error } = await supabase
      .from('words')
      .update({
        ...data,
        updated_at: new Date()
      })
      .eq('id', wordId);
    
    if (error) throw error;
    return { id: wordId, ...data };
  } catch (error) {
    console.error('Kelime güncellenirken hata:', error.message);
    throw error;
  }
};

// Kelime sil
export const deleteWord = async (wordId, listId) => {
  try {
    const { error } = await supabase
      .from('words')
      .delete()
      .eq('id', wordId);
    
    if (error) throw error;
    
    // Kelime sayısını güncelle
    await updateWordCountForList(listId);
  } catch (error) {
    console.error('Kelime silinirken hata:', error.message);
    throw error;
  }
};

// Kelime başarı seviyesini güncelle
export const updateWordMastery = async (wordId, mastery) => {
  try {
    const { error } = await supabase
      .from('words')
      .update({
        mastery: Math.max(0, Math.min(100, mastery)),
        updated_at: new Date()
      })
      .eq('id', wordId);
    
    if (error) throw error;
  } catch (error) {
    console.error('Kelime başarısı güncellenirken hata:', error.message);
    throw error;
  }
};

// Toplu kelime başarısı güncelleme
export const batchUpdateWordMastery = async (updates) => {
  try {
    // Supabase'de toplu güncelleme için işlemleri sırayla yapalım
    for (const { wordId, mastery } of updates) {
      const { error } = await supabase
        .from('words')
        .update({
          mastery: Math.max(0, Math.min(100, mastery)),
          updated_at: new Date()
        })
        .eq('id', wordId);
      
      if (error) throw error;
    }
  } catch (error) {
    console.error('Toplu kelime başarısı güncellenirken hata:', error.message);
    throw error;
  }
};

// Bir liste için kelime sayısını güncelle
const updateWordCountForList = async (listId) => {
  try {
    // Önce kelime sayısını hesapla
    const { count, error } = await supabase
      .from('words')
      .select('*', { count: 'exact', head: true })
      .eq('list_id', listId);
    
    if (error) throw error;
    
    // Sonra liste tablosunu güncelle
    await updateWordCount(listId, count);
  } catch (error) {
    console.error('Kelime sayısı güncellenirken hata:', error.message);
  }
};

// Kelime ara
export const searchWords = async (userId, searchTerm) => {
  try {
    // Önce kullanıcının listelerini alalım
    const { data: lists, error: listsError } = await supabase
      .from('word_lists')
      .select('id, name')
      .eq('user_id', userId);
    
    if (listsError) throw listsError;
    
    if (lists.length === 0) {
      return [];
    }
    
    // Listedeki kelimeleri arayalım
    const listIds = lists.map(list => list.id);
    
    const { data: words, error: wordsError } = await supabase
      .from('words')
      .select('*')
      .in('list_id', listIds)
      .or(`term.ilike.%${searchTerm}%,definition.ilike.%${searchTerm}%,example.ilike.%${searchTerm}%`);
    
    if (wordsError) throw wordsError;
    
    // Kelimelere liste adlarını ekleyelim
    const listMap = {};
    lists.forEach(list => {
      listMap[list.id] = list.name;
    });
    
    return words.map(word => ({
      ...word,
      listName: listMap[word.list_id]
    }));
  } catch (error) {
    console.error('Kelime aranırken hata:', error.message);
    throw error;
  }
};