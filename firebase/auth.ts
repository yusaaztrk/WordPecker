// auth.js
import { supabase } from './config';

// Giriş yap
export const signIn = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    console.log("Oturum bilgisi:", data.session); // Debug için
    return data.user;
  } catch (error) {
    console.error('Giriş yapılırken hata:', error.message);
    throw error;
  }
};

// Mevcut kullanıcıyı al
export const getCurrentUser = async () => {
  try {
    // Önce session kontrolü yap
    const { data: sessionData } = await supabase.auth.getSession();
    
    // Session yoksa null dön
    if (!sessionData.session) {
      console.log("Aktif oturum bulunamadı");
      return null;
    }
    
    // Session varsa kullanıcı bilgilerini al
    const { data, error } = await supabase.auth.getUser();
    
    if (error) throw error;
    return data.user;
  } catch (error) {
    console.error('Kullanıcı alınırken hata:', error.message);
    return null;
  }
};