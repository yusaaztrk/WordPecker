import { supabase } from './config';
import { User } from '@supabase/supabase-js';

// Kayıt ol
export const signUp = async (email: string, password: string): Promise<User> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) throw new Error('Kullanıcı oluşturulamadı');

    return data.user;
  } catch (error: any) {
    console.error('Kayıt olurken hata:', error.message);
    throw error;
  }
};

// Giriş yap
export const signIn = async (email: string, password: string): Promise<User> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) throw new Error('Giriş yapılamadı');

    return data.user;
  } catch (error: any) {
    console.error('Giriş yapılırken hata:', error.message);
    throw error;
  }
};

// Çıkış yap
export const signOut = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error: any) {
    console.error('Çıkış yapılırken hata:', error.message);
    throw error;
  }
};

// Şifre sıfırlama e-postası gönder
export const resetPassword = async (email: string): Promise<void> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'wordpecker://reset-password',
    });
    if (error) throw error;
  } catch (error: any) {
    console.error('Şifre sıfırlama e-postası gönderilirken hata:', error.message);
    throw error;
  }
};

// Mevcut kullanıcıyı kontrol et
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { data } = await supabase.auth.getUser();
    return data.user;
  } catch (error: any) {
    console.error('Kullanıcı bilgisi alınırken hata:', error.message);
    return null;
  }
};

// Firebase UID'yi Supabase UUID'ye dönüştür
// Firebase UID'ler genellikle 28 karakter uzunluğunda ve UUID formatında değil
// Bu fonksiyon, Firebase UID'yi geçerli bir UUID'ye dönüştürür
export const convertToUUID = (firebaseUid: string): string => {
  // Eğer zaten UUID formatındaysa, doğrudan döndür
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(firebaseUid)) {
    return firebaseUid;
  }

  // Firebase UID'yi hash'leyerek UUID oluştur
  let hash = 0;
  for (let i = 0; i < firebaseUid.length; i++) {
    hash = ((hash << 5) - hash) + firebaseUid.charCodeAt(i);
    hash |= 0; // 32-bit integer'a dönüştür
  }

  // UUID v4 formatında bir string oluştur
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (hash + Math.random() * 16) % 16 | 0;
    hash = Math.floor(hash / 16);
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });

  return uuid;
};

// Auth durumu değişikliklerini dinle
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user || null);
  });

  return () => {
    data.subscription.unsubscribe();
  };
};
