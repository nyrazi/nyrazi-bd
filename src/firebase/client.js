import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAEifGUflChZy4HXXfg2poP8c2SmC6_5R8",
  authDomain: "nyrazi-bd.firebaseapp.com",
  projectId: "nyrazi-bd",
  storageBucket: "nyrazi-bd.firebasestorage.app",
  messagingSenderId: "296695998676",
  appId: "1:296695998676:web:4bf32a23e714cdde5e7341"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);