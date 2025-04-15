// auth.ts
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth } from './config';

// Giriş yap
export const signIn = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    console.error('Giriş yapılırken hata:', error.message);
    throw error;
  }
};

// Kayıt ol
export const signUp = async (email: string, password: string, displayName: string): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Kullanıcı profilini güncelle
    await updateProfile(userCredential.user, { displayName });

    return userCredential.user;
  } catch (error: any) {
    console.error('Kayıt olunurken hata:', error.message);
    throw error;
  }
};

// Çıkış yap
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error: any) {
    console.error('Çıkış yapılırken hata:', error.message);
    throw error;
  }
};

// Şifre sıfırlama
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error('Şifre sıfırlanırken hata:', error.message);
    throw error;
  }
};

// Mevcut kullanıcıyı al
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

// Auth durumu değişikliklerini dinle
export const onAuthChanged = (callback: (user: User | null) => void): (() => void) => {
  return onAuthStateChanged(auth, callback);
};