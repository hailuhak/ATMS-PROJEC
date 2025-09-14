import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBU6HipDksBICVVD0sMEs2HvpEoX-wobvs",
  authDomain: "atms-project-29933.firebaseapp.com",
  projectId: "atms-project-29933",
  storageBucket: "atms-project-29933.firebasestorage.app",
  messagingSenderId: "1009805799311",
  appId: "1:1009805799311:web:94e43c6089cd1b23af25fa"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Connect to emulators in development;
// if (import.meta.env.DEV) {
//   try {
//     connectAuthEmulator(auth, "http://localhost:9099");
//     connectFirestoreEmulator(db, 'localhost', 8080);
//     connectStorageEmulator(storage, "localhost", 9199);
//   } catch (error) {
//     console.log('Emulators already connected or not available');
//   }
// }

export default app;