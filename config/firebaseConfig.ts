// config/firebaseConfig.ts
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Use the user-provided Firebase configuration.
const firebaseConfig = {
  apiKey: "AIzaSyDSQx45kIdHtn7TI6oFRPEuDgnoDvwP6kY",
  authDomain: "shot-timer-pro.firebaseapp.com",
  projectId: "shot-timer-pro",
  storageBucket: "shot-timer-pro.appspot.com",
  messagingSenderId: "879357719893",
  appId: "1:879357719893:web:2744a557dd3e64e672abdc"
};

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

export { db, auth, app };
