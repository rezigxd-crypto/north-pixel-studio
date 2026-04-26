import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import {
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup,
  sendPasswordResetEmail, EmailAuthProvider, linkWithCredential,
  type User as FirebaseUser
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { bumpPublicStats } from "./store";
import { type Lang, translations, type TranslationKey } from "./i18n";

export type UserRole = "client" | "creator" | "admin" | null;

interface AuthState {
  role: UserRole;
  email: string;
  name: string;
  wilaya?: string;
  uid?: string;
  /** Custom uploaded profile picture URL (Firebase Storage). */
  profilePic?: string;
  /** Selected emoji avatar id for clients (legacy). */
  avatar?: string;
  /** Phone number for client/creator coordination. */
  phone?: string;
  loading: boolean;
}

export type GoogleSignupResult =
  | { status: "existing"; role: UserRole }
  | { status: "new"; email: string; name: string; uid: string };

interface AppCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: TranslationKey) => string;
  dark: boolean;
  toggleDark: () => void;
  auth: AuthState;
  loginWithEmail: (email: string, password: string) => Promise<UserRole>;
  loginWithGoogle: (role: "client" | "creator") => Promise<GoogleSignupResult>;
  completeGoogleSignup: (args: { role: "client" | "creator"; name: string; password: string; wilaya: string; extra?: Record<string, unknown> }) => Promise<UserRole>;
  registerClient: (email: string, password: string, name: string, wilaya: string, phone: string) => Promise<string>;
  registerCreator: (email: string, password: string, name: string, wilaya: string, phone: string) => Promise<string>;
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

  const toggleDark = () => {
    // Disable all CSS transitions for the duration of the theme flip so the
    // colour/border/background swap is instant on every element instead of
    // animating in lockstep (which causes a visible jank on lower-end phones).
    const root = document.documentElement;
    root.classList.add("np-no-transitions");
    setDark((d) => {
      const n = !d;
      localStorage.setItem("np.dark", String(n));
      return n;
    });
    // Wait two frames: one for React to commit the class swap, one for the
    // browser to paint with the new variables, then re-enable transitions.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        root.classList.remove("np-no-transitions");
      });
    });
  };

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
        setAuthState({
          role: data.role as UserRole,
          email: user.email || "",
          name: data.name || user.displayName || "",
          wilaya: data.wilaya || "",
          uid: user.uid,
          profilePic: data.profilePic || "",
          avatar: data.avatar || "",
          phone: data.phone || "",
          loading: false,
        });
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

  const loginWithGoogle = async (role: "client" | "creator"): Promise<GoogleSignupResult> => {
    void role; // role is kept in the API for forward compatibility; actual role is collected on the complete-signup page
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const snap = await getDoc(doc(db, "users", user.uid));
    if (snap.exists()) {
      return { status: "existing", role: snap.data().role as UserRole };
    }
    // New Google user — require them to complete signup
    return {
      status: "new",
      email: user.email || "",
      name: user.displayName || "",
      uid: user.uid,
    };
  };

  const completeGoogleSignup = async ({
    role, name, password, wilaya, extra,
  }: { role: "client" | "creator"; name: string; password: string; wilaya: string; extra?: Record<string, unknown> }): Promise<UserRole> => {
    const user = auth.currentUser;
    if (!user || !user.email) throw new Error("no-google-user");

    // Try linking email/password credential so the user can log in with password too.
    try {
      const cred = EmailAuthProvider.credential(user.email, password);
      await linkWithCredential(user, cred);
    } catch (e: any) {
      // If already linked or provider conflict — ignore, still save profile.
      if (e?.code !== "auth/provider-already-linked" &&
          e?.code !== "auth/credential-already-in-use" &&
          e?.code !== "auth/email-already-in-use") {
        // surface real errors
        throw e;
      }
    }

    await setDoc(doc(db, "users", user.uid), {
      name, email: user.email, wilaya, role,
      createdAt: new Date().toISOString(), provider: "google",
      ...(extra || {}),
    });

    // If creator — also write a pending creator application so admin can see it
    if (role === "creator") {
      const { addDoc, collection: col, serverTimestamp: sts } = await import("firebase/firestore");
      const e = extra || {};
      await addDoc(col(db, "creators"), {
        fullName: name,
        email: user.email,
        country: "Algeria",
        wilaya,
        city: (e.city as string) || "",
        role: (e.creatorRole as string) || "عامل حر (Google)",
        bio: (e.bio as string) || "تسجيل عبر جوجل — سيتم التواصل لإكمال الملف الشخصي.",
        rate: (e.rate as number) || 0,
        portfolio: (e.portfolio as string[]) || [],
        status: "pending",
        createdAt: sts(),
        provider: "google",
        uid: user.uid,
      });
    }
    await loadUser(user);
    return role;
  };

  const registerClient = async (email: string, password: string, name: string, wilaya: string, phone: string): Promise<string> => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", cred.user.uid), { name, email, wilaya, phone, role: "client", createdAt: new Date().toISOString() });
    bumpPublicStats("client").catch(() => {});
    return cred.user.uid;
  };

  const registerCreator = async (email: string, password: string, name: string, wilaya: string, phone: string): Promise<string> => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", cred.user.uid), { name, email, wilaya, phone, role: "creator", createdAt: new Date().toISOString() });
    bumpPublicStats("creator").catch(() => {});
    return cred.user.uid;
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const logout = async () => { await signOut(auth); };

  const t = (k: TranslationKey): string => translations[lang][k] as string;

  return (
    <AppContext.Provider value={{ lang, setLang, t, dark, toggleDark, auth: authState, loginWithEmail, loginWithGoogle, completeGoogleSignup, registerClient, registerCreator, resetPassword, logout, refreshAuth }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
