import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

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

// IMPORTANT: ignoreUndefinedProperties prevents Firestore from throwing
// when an optional field (like deadline / referenceLink / wilaya) is undefined.
// Without it, addDoc/setDoc/updateDoc fails with "Unsupported field value: undefined"
// and the offer creation breaks with a generic "حدث خطأ".
export const db = initializeFirestore(app, {
  ignoreUndefinedProperties: true,
});

export const auth = getAuth(app);
export const storage = getStorage(app);
