import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser
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
  loginWithEmail: (email: string, password: string, role: "client" | "creator" | "admin") => Promise<void>;
  registerClient: (email: string, password: string, name: string, wilaya: string) => Promise<string>;
  registerCreator: (email: string, password: string, name: string, wilaya: string) => Promise<string>;
  logout: () => Promise<void>;
}

const AppContext = createContext<AppCtx>({} as AppCtx);

// Admin credentials
const ADMIN_EMAIL = "rezig@admin.np";
const ADMIN_PASS = "admin123";

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(() => (localStorage.getItem("np.lang") as Lang) || "en");
  const [dark, setDark] = useState<boolean>(() => localStorage.getItem("np.dark") !== "false");
  const [authState, setAuthState] = useState<AuthState>({
    role: null, email: "", name: "", wilaya: "", uid: "", loading: true
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("np.lang", l);
    document.documentElement.setAttribute("dir", l === "ar" ? "rtl" : "ltr");
    document.documentElement.setAttribute("lang", l);
  };

  const toggleDark = () => {
    setDark((d) => {
      const next = !d;
      localStorage.setItem("np.dark", String(next));
      return next;
    });
  };

  // Apply dark/light
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.remove("theme-light");
      document.documentElement.classList.add("theme-dark");
    } else {
      document.documentElement.classList.remove("theme-dark");
      document.documentElement.classList.add("theme-light");
    }
  }, [dark]);

  // Apply dir on mount
  useEffect(() => {
    document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    document.documentElement.setAttribute("lang", lang);
  }, [lang]);

  // Firebase auth state listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
      if (!user) {
        setAuthState({ role: null, email: "", name: "", wilaya: "", uid: "", loading: false });
        return;
      }
      // Check if admin
      if (user.email === ADMIN_EMAIL) {
        setAuthState({ role: "admin", email: user.email, name: "Admin", wilaya: "", uid: user.uid, loading: false });
        return;
      }
      // Fetch user profile from Firestore
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const data = snap.data();
          setAuthState({
            role: data.role as UserRole,
            email: user.email || "",
            name: data.name || "",
            wilaya: data.wilaya || "",
            uid: user.uid,
            loading: false,
          });
        } else {
          setAuthState({ role: null, email: user.email || "", name: "", wilaya: "", uid: user.uid, loading: false });
        }
      } catch {
        setAuthState({ role: null, email: user.email || "", name: "", wilaya: "", uid: user.uid, loading: false });
      }
    });
    return unsub;
  }, []);

  // ── Login ──
  const loginWithEmail = async (email: string, password: string, role: "client" | "creator" | "admin") => {
    // Admin uses fixed credentials — sign in with Firebase Auth
    await signInWithEmailAndPassword(auth, email, password);
  };

  // ── Register client ──
  const registerClient = async (email: string, password: string, name: string, wilaya: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", cred.user.uid), {
      name, email, wilaya, role: "client", createdAt: new Date().toISOString()
    });
    return cred.user.uid;
  };

  // ── Register creator ──
  const registerCreator = async (email: string, password: string, name: string, wilaya: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", cred.user.uid), {
      name, email, wilaya, role: "creator", createdAt: new Date().toISOString()
    });
    return cred.user.uid;
  };

  // ── Logout ──
  const logout = async () => {
    await signOut(auth);
  };

  const t = (k: TranslationKey): string => translations[lang][k] as string;

  return (
    <AppContext.Provider value={{
      lang, setLang, t, dark, toggleDark,
      auth: authState,
      loginWithEmail, registerClient, registerCreator, logout
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
