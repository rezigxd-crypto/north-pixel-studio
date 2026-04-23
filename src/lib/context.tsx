import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import {
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup,
  sendPasswordResetEmail, type User as FirebaseUser
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { type Lang, translations, type TranslationKey } from "./i18n";

export type UserRole = "client" | "creator" | "admin" | null;

interface AuthState {
  role: UserRole;
  email: string;
  name: string;
  wilaya?: string;
  uid?: string;
  loading: boolean;
}

interface AppCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: TranslationKey) => string;
  dark: boolean;
  toggleDark: () => void;
  auth: AuthState;
  loginWithEmail: (email: string, password: string) => Promise<UserRole>;
  loginWithGoogle: (role: "client" | "creator") => Promise<UserRole>;
  registerClient: (email: string, password: string, name: string, wilaya: string) => Promise<string>;
  registerCreator: (email: string, password: string, name: string, wilaya: string) => Promise<string>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AppContext = createContext<AppCtx>({} as AppCtx);
const ADMIN_EMAIL = "rezig@admin.np";
const googleProvider = new GoogleAuthProvider();

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(() => (localStorage.getItem("np.lang") as Lang) || "ar");
  const [dark, setDark] = useState<boolean>(() => localStorage.getItem("np.dark") !== "false");
  const [authState, setAuthState] = useState<AuthState>({ role: null, email: "", name: "", wilaya: "", uid: "", loading: true });

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("np.lang", l);
    document.documentElement.setAttribute("dir", l === "ar" ? "rtl" : "ltr");
    document.documentElement.setAttribute("lang", l);
  };

  const toggleDark = () => setDark((d) => { const n = !d; localStorage.setItem("np.dark", String(n)); return n; });

  useEffect(() => {
    document.documentElement.classList.toggle("theme-light", !dark);
    document.documentElement.classList.toggle("theme-dark", dark);
  }, [dark]);

  useEffect(() => {
    document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    document.documentElement.setAttribute("lang", lang);
  }, [lang]);

  const loadUser = async (user: FirebaseUser) => {
    if (user.email === ADMIN_EMAIL) {
      setAuthState({ role: "admin", email: user.email, name: "Admin", wilaya: "", uid: user.uid, loading: false });
      return;
    }
    try {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        const data = snap.data();
        setAuthState({ role: data.role as UserRole, email: user.email || "", name: data.name || user.displayName || "", wilaya: data.wilaya || "", uid: user.uid, loading: false });
      } else {
        setAuthState({ role: null, email: user.email || "", name: user.displayName || "", wilaya: "", uid: user.uid, loading: false });
      }
    } catch {
      setAuthState({ role: null, email: user.email || "", name: "", wilaya: "", uid: user.uid, loading: false });
    }
  };

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      if (!user) { setAuthState({ role: null, email: "", name: "", wilaya: "", uid: "", loading: false }); return; }
      await loadUser(user);
    });
  }, []);

  const refreshAuth = async () => {
    const u = auth.currentUser;
    if (u) await loadUser(u);
  };

  const loginWithEmail = async (email: string, password: string): Promise<UserRole> => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    if (cred.user.email === ADMIN_EMAIL) return "admin";
    const snap = await getDoc(doc(db, "users", cred.user.uid));
    return snap.exists() ? (snap.data().role as UserRole) : null;
  };

  const loginWithGoogle = async (role: "client" | "creator"): Promise<UserRole> => {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const snap = await getDoc(doc(db, "users", user.uid));
    if (!snap.exists()) {
      // Write user profile
      await setDoc(doc(db, "users", user.uid), {
        name: user.displayName || "", email: user.email || "",
        wilaya: "", role, createdAt: new Date().toISOString(), provider: "google",
      });
      // If creator — also write a pending creator application so admin can see it
      if (role === "creator") {
        const { addDoc, collection: col, serverTimestamp: sts } = await import("firebase/firestore");
        await addDoc(col(db, "creators"), {
          fullName: user.displayName || user.email?.split("@")[0] || "Creator",
          email: user.email || "",
          country: "Algeria",
          wilaya: "",
          city: "",
          role: "عامل حر (Google)",
          bio: "تسجيل عبر جوجل — يرجى التواصل معه لإكمال الملف الشخصي.",
          rate: 0,
          portfolio: [],
          status: "pending",
          createdAt: sts(),
          provider: "google",
          uid: user.uid,
        });
      }
      return role;
    }
    return snap.data().role as UserRole;
  };

  const registerClient = async (email: string, password: string, name: string, wilaya: string): Promise<string> => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", cred.user.uid), { name, email, wilaya, role: "client", createdAt: new Date().toISOString() });
    return cred.user.uid;
  };

  const registerCreator = async (email: string, password: string, name: string, wilaya: string): Promise<string> => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", cred.user.uid), { name, email, wilaya, role: "creator", createdAt: new Date().toISOString() });
    return cred.user.uid;
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const logout = async () => { await signOut(auth); };

  const t = (k: TranslationKey): string => translations[lang][k] as string;

  return (
    <AppContext.Provider value={{ lang, setLang, t, dark, toggleDark, auth: authState, loginWithEmail, loginWithGoogle, registerClient, registerCreator, resetPassword, logout, refreshAuth }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
