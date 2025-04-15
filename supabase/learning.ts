import { supabase } from './config';

// Öğrenme oturumu arayüzü
export interface LearningSession {
  id: string;
  user_id: string;
  list_id: string;
  date: string;
  duration: number;
  words_studied: number;
  correct_answers: number;
  incorrect_answers: number;
  mode: 'learn' | 'test';
  completed: boolean;
  score?: number;
  created_at: string;
  updated_at: string;
}

// Yeni öğrenme oturumu oluştur
export const createSession = async (sessionData: Partial<LearningSession>): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('learning_sessions')
      .insert({
        user_id: sessionData.user_id,
        list_id: sessionData.list_id,
        date: new Date().toISOString(),
        duration: sessionData.duration || 0,
        words_studied: sessionData.words_studied || 0,
        correct_answers: sessionData.correct_answers || 0,
        incorrect_answers: sessionData.incorrect_answers || 0,
        mode: sessionData.mode || 'learn',
        completed: sessionData.completed || false,
        score: sessionData.score,
      })
      .select('id')
      .single();

    if (error) throw error;
    if (!data) throw new Error('Oturum oluşturulamadı');

    return data.id;
  } catch (error: any) {
    console.error('Oturum oluşturulurken hata:', error.message);
    throw error;
  }
};

// Kullanıcının tüm oturumlarını getir
export const getSessions = async (userId: string): Promise<LearningSession[]> => {
  try {
    const { data, error } = await supabase
      .from('learning_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error('Oturumlar alınırken hata:', error.message);
    throw error;
  }
};

// Belirli bir liste için oturumları getir
export const getSessionsByList = async (userId: string, listId: string): Promise<LearningSession[]> => {
  try {
    const { data, error } = await supabase
      .from('learning_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('list_id', listId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error('Liste oturumları alınırken hata:', error.message);
    throw error;
  }
};

// Oturum güncelle
export const updateSession = async (sessionId: string, updates: Partial<LearningSession>): Promise<void> => {
  try {
    const { error } = await supabase
      .from('learning_sessions')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId);

    if (error) throw error;
  } catch (error: any) {
    console.error('Oturum güncellenirken hata:', error.message);
    throw error;
  }
};

// ID'ye göre oturum getir
export const getSessionById = async (sessionId: string): Promise<LearningSession> => {
  try {
    const { data, error } = await supabase
      .from('learning_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Oturum bulunamadı');

    return data;
  } catch (error: any) {
    console.error('Oturum alınırken hata:', error.message);
    throw error;
  }
};
