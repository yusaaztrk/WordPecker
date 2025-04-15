import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth'; // Bu satırı import kısmına ekleyin

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBYkQamwman8q7ukmKXN6wXToK5NoeskEk",
  authDomain: "worldwecker.firebaseapp.com",
  projectId: "worldwecker",
  storageBucket: "worldwecker.appspot.com", 
  messagingSenderId: "395218703678",
  appId: "1:395218703678:web:038568716025b1f107486f",
  measurementId: "G-N8BN90QY0Q"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app); // Bu satırı diğer export'ların yanına ekleyin