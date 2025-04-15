// Firebase yapılandırması
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
// AsyncStorage persistence için gerekli olacak
// import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase yapılandırma bilgileri
const firebaseConfig = {
  apiKey: "AIzaSyDn4wHxwuC0CUXTftUVuBFxyMLviXrRRkY",
  authDomain: "worldwecker.firebaseapp.com",
  projectId: "worldwecker",
  storageBucket: "worldwecker.appspot.com", // .firebasestorage.app yerine .appspot.com kullanın
  messagingSenderId: "395218703678",
  appId: "1:395218703678:android:fa59726393d27db507486f"
};

// Firebase uygulamasını başlat
const app = initializeApp(firebaseConfig);

// Firebase servislerini dışa aktar
export const auth = getAuth(app);

// Not: Daha sonra Firebase Auth persistence için aşağıdaki kodu kullanabilirsiniz:
// import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
// export const auth = initializeAuth(app, {
//   persistence: getReactNativePersistence(AsyncStorage)
// });
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;