// wordLists.js
import { supabase } from './config';

// Yeni liste oluştur
export const createList = async (listData) => {
  try {
    const { data, error } = await supabase
      .from('word_lists')
      .insert([{
        name: listData.name,
        description: listData.description,
        user_id: listData.userId,
        created_at: new Date(),
        updated_at: new Date(),
      }])
      .select();
    
    if (error) throw error;
    return data[0].id;
  } catch (error) {
    console.error('Liste oluşturulurken hata:', error.message);
    throw error;
  }
};

// Kullanıcının tüm listelerini getir
export const getLists = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('word_lists')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Listeler alınırken hata:', error.message);
    throw error;
  }
};

// ID'ye göre liste getir
export const getListById = async (listId) => {
  try {
    const { data, error } = await supabase
      .from('word_lists')
      .select('*')
      .eq('id', listId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Liste alınırken hata:', error.message);
    throw error;
  }
};

// Liste güncelle
export const updateList = async (listId, updates) => {
  try {
    const { error } = await supabase
      .from('word_lists')
      .update({
        ...updates,
        updated_at: new Date()
      })
      .eq('id', listId);
    
    if (error) throw error;
  } catch (error) {
    console.error('Liste güncellenirken hata:', error.message);
    throw error;
  }
};

// Liste sil
export const deleteList = async (listId) => {
  try {
    // Supabase'de cascade silme sayesinde ilişkili kelimeler otomatik silinecek
    const { error } = await supabase
      .from('word_lists')
      .delete()
      .eq('id', listId);
    
    if (error) throw error;
  } catch (error) {
    console.error('Liste silinirken hata:', error.message);
    throw error;
  }
};

// Kelime sayısını güncelle
export const updateWordCount = async (listId, count) => {
  try {
    const { error } = await supabase
      .from('word_lists')
      .update({
        word_count: count,
        updated_at: new Date()
      })
      .eq('id', listId);
    
    if (error) throw error;
  } catch (error) {
    console.error('Kelime sayısı güncellenirken hata:', error.message);
    throw error;
  }
};