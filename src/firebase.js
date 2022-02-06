import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCFwGOCjtKT0XsSXlvF8hkuRF2vqL3Uy6M",
  authDomain: "whatsapp-reactjs-68f7e.firebaseapp.com",
  projectId: "whatsapp-reactjs-68f7e",
  storageBucket: "whatsapp-reactjs-68f7e.firebasestorage.app",
  messagingSenderId: "675083267841",
  appId: "1:675083267841:web:68866ffbd74fcaf650f500"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);
const provider = new GoogleAuthProvider();

export { auth, provider };
export default db;
