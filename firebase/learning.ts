// learningSessions.js
import { supabase } from './config';

// Yeni öğrenme oturumu oluştur
export const createSession = async (sessionData) => {
  try {
    const { data, error } = await supabase
      .from('learning_sessions')
      .insert([{
        user_id: sessionData.userId,
        list_id: sessionData.listId,
        date: new Date(),
        duration: sessionData.duration,
        words_reviewed: sessionData.wordsReviewed,
        words_learned: sessionData.wordsLearned,
        score: sessionData.score
      }])
      .select();
    
    if (error) throw error;
    return data[0].id;
  } catch (error) {
    console.error('Oturum oluşturulurken hata:', error.message);
    throw error;
  }
};

// Kullanıcının tüm oturumlarını getir
export const getSessions = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('learning_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Oturumlar alınırken hata:', error.message);
    throw error;
  }
};

// Belirli bir liste için oturumları getir
export const getSessionsByList = async (userId, listId) => {
  try {
    const { data, error } = await supabase
      .from('learning_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('list_id', listId)
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Liste oturumları alınırken hata:', error.message);
    throw error;
  }
};

// Oturum güncelle
export const updateSession = async (sessionId, updates) => {
  try {
    const { error } = await supabase
      .from('learning_sessions')
      .update(updates)
      .eq('id', sessionId);
    
    if (error) throw error;
  } catch (error) {
    console.error('Oturum güncellenirken hata:', error.message);
    throw error;
  }
};

// ID'ye göre oturum getir
export const getSessionById = async (sessionId) => {
  try {
    const { data, error } = await supabase
      .from('learning_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Oturum alınırken hata:', error.message);
    throw error;
  }
};