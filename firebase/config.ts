// Firebase yapılandırması
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase yapılandırma bilgileri
const firebaseConfig = {
  apiKey: "AIzaSyDn4wHxwuC0CUXTftUVuBFxyMLviXrRRkY",
  authDomain: "worldwecker.firebaseapp.com",
  projectId: "worldwecker",
  storageBucket: "worldwecker.firebasestorage.app",
  messagingSenderId: "395218703678",
  appId: "1:395218703678:android:fa59726393d27db507486f"
};

// Firebase uygulamasını başlat
const app = initializeApp(firebaseConfig);

// Firebase servislerini dışa aktar
// Not: React Native için özel persistence kullanımı gerekebilir
// Şimdilik standart auth kullanıyoruz
export const auth = getAuth(app);

// Firestore ve Storage servislerini başlat
// Test modu için Firestore'u yapılandır (geliştirme sırasında)
export const db = getFirestore(app);

// Not: Firestore güvenlik kurallarını Firebase konsolundan düzenlemek gerekiyor
// Geliştirme sırasında aşağıdaki kuralları kullanabilirsiniz:
/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
*/

export const storage = getStorage(app);
export default app;