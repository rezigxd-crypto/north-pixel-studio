import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB5VDHDWcZ-GkWZS0dGEdOASJgOufAAZco",
  authDomain: "northpixelsstudio.firebaseapp.com",
  databaseURL: "https://northpixelsstudio-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "northpixelsstudio",
  storageBucket: "northpixelsstudio.firebasestorage.app",
  messagingSenderId: "801694236157",
  appId: "1:801694236157:web:9e490157d4f231cb66ed94"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
