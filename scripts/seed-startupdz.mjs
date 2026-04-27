// Seed two demo accounts for the StartupDZ ministerial pitch.
//
// What this creates (idempotent — safe to re-run):
//   • client@startupdz.dz  — "StartupDZ Demo Client" with one approved project
//   • creator@startupdz.dz — "StartupDZ Demo Creator" with a complete profile + 1 active bid
//
// Run with:  node scripts/seed-startupdz.mjs

import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  initializeFirestore,
  doc,
  setDoc,
  addDoc,
  collection,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB5VDHDWcZ-GkWZS0dGEdOASJgOufAAZco",
  authDomain: "northpixelsstudio.firebaseapp.com",
  databaseURL:
    "https://northpixelsstudio-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "northpixelsstudio",
  storageBucket: "northpixelsstudio.firebasestorage.app",
  messagingSenderId: "801694236157",
  appId: "1:801694236157:web:9e490157d4f231cb66ed94",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = initializeFirestore(app, { ignoreUndefinedProperties: true });

// ─── Demo data ──────────────────────────────────────────────────────────
const PASSWORD = "StartupDZ2026!";

const CLIENT = {
  email: "client@startupdz.dz",
  fullName: "StartupDZ Demo Client",
  wilaya: "16",
  phone: "+213 555 010 101",
  bio: "Demo client account for the StartupDZ ministerial review of North Pixel Studio.",
  profilePic:
    "https://api.dicebear.com/7.x/initials/svg?seed=StartupDZ%20Client&backgroundColor=1E40AF&fontSize=42",
};

const CREATOR = {
  email: "creator@startupdz.dz",
  fullName: "StartupDZ Demo Creator",
  wilaya: "16",
  city: "Algiers",
  phone: "+213 555 020 202",
  role: "Cinematographer",
  bio:
    "Cinematographer based in Algiers — university events, brand films and " +
    "documentary work. Available for on-site coverage across all 58 wilayas.",
  rate: 15000,
  portfolio: [
    "https://vimeo.com/showcase/algerian-shorts",
    "https://www.behance.net/gallery/sample-event-coverage",
    "https://www.youtube.com/@startupdz-demo",
  ],
  username: "startupdz-creator",
  profilePic:
    "https://api.dicebear.com/7.x/initials/svg?seed=StartupDZ%20Creator&backgroundColor=D4AF37&fontSize=42",
};

const OFFER = {
  serviceSlug: "event-coverage",
  serviceTitle: "Event & Institutional Coverage",
  units: 6,
  unitLabel: "ساعة",
  totalPrice: 60000,
  adminCut: 12000,
  creatorPayout: 48000,
  brief:
    "Cover the opening of the digitalization workshop at Université d'Alger 1 — " +
    "Faculty of Sciences. Need same-day reels for social media (3 × 30s), " +
    "one 90-second highlight video, and 30 retouched photos. Crowd will be " +
    "around 150 people. The dean will give the opening speech at 10:00 — " +
    "please arrive 09:00 for setup.",
  matchingRoles: ["Cinematographer", "Photographer", "Video Editor"],
  wilayaFilter: "16",
  shootAddress: "Faculty of Sciences, Bab Ezzouar, Algiers",
  preferredShootDate: new Date(Date.now() + 7 * 86400_000)
    .toISOString()
    .slice(0, 10),
  deliverableCount: 4,
  usageRights: "commercial",
  deadline: new Date(Date.now() + 9 * 86400_000).toISOString().slice(0, 10),
};

const BID = {
  amount: 50000,
  pitch:
    "Available the full day of the event. Two-camera setup + drone for the " +
    "exterior shots. Will deliver social cutdowns the same evening and the " +
    "highlight film within 24 hours.",
};

// ─── Helpers ─────────────────────────────────────────────────────────────
async function ensureSignedUpAndIn(email, password) {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    console.log(`  ✓ created auth account ${email} (uid=${cred.user.uid})`);
    return cred.user;
  } catch (err) {
    if (err.code === "auth/email-already-in-use") {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      console.log(`  • account already exists, signed in ${email}`);
      return cred.user;
    }
    throw err;
  }
}

async function findExistingByEmail(coll, email) {
  const snap = await getDocs(query(collection(db, coll), where("email", "==", email)));
  return snap.docs[0]?.id ?? null;
}

// ─── Main ────────────────────────────────────────────────────────────────
async function main() {
  console.log("─── StartupDZ demo seed ────────────────────────────────────");

  // 1. Client account
  console.log("\n[1/4] Client account");
  const clientUser = await ensureSignedUpAndIn(CLIENT.email, PASSWORD);
  await setDoc(
    doc(db, "users", clientUser.uid),
    {
      name: CLIENT.fullName,
      email: CLIENT.email,
      role: "client",
      wilaya: CLIENT.wilaya,
      phone: CLIENT.phone,
      bio: CLIENT.bio,
      profilePic: CLIENT.profilePic,
      createdAt: new Date().toISOString(),
    },
    { merge: true },
  );
  console.log("  ✓ users/" + clientUser.uid + " written");

  // 2. Project (offer) — created as the client, pre-approved (status="open")
  console.log("\n[2/4] Demo project (offer)");
  let offerId = await findExistingByEmail("offers", CLIENT.email);
  if (offerId) {
    console.log("  • offer already exists: " + offerId);
  } else {
    const ref = await addDoc(collection(db, "offers"), {
      clientUid: clientUser.uid,
      clientName: CLIENT.fullName,
      clientEmail: CLIENT.email,
      clientWilaya: CLIENT.wilaya,
      clientPhone: CLIENT.phone,
      shootAddress: OFFER.shootAddress,
      preferredShootDate: OFFER.preferredShootDate,
      deliverableCount: OFFER.deliverableCount,
      usageRights: OFFER.usageRights,
      serviceSlug: OFFER.serviceSlug,
      serviceTitle: OFFER.serviceTitle,
      units: OFFER.units,
      unitLabel: OFFER.unitLabel,
      totalPrice: OFFER.totalPrice,
      adminCut: OFFER.adminCut,
      creatorPayout: OFFER.creatorPayout,
      bidMin: Math.round(OFFER.creatorPayout * 0.83),
      bidMax: OFFER.creatorPayout,
      brief: OFFER.brief,
      deadline: OFFER.deadline,
      matchingRoles: OFFER.matchingRoles,
      wilayaFilter: OFFER.wilayaFilter,
      // Pre-approved so the minister sees a live, browsable project — no
      // admin-step plumbing in the demo flow.
      status: "open",
      createdAt: serverTimestamp(),
    });
    offerId = ref.id;
    console.log("  ✓ offers/" + offerId + " created (status=open)");
  }

  await signOut(auth);

  // 3. Creator account
  console.log("\n[3/4] Creator account");
  const creatorUser = await ensureSignedUpAndIn(CREATOR.email, PASSWORD);
  await setDoc(
    doc(db, "users", creatorUser.uid),
    {
      name: CREATOR.fullName,
      email: CREATOR.email,
      role: "creator",
      wilaya: CREATOR.wilaya,
      phone: CREATOR.phone,
      bio: CREATOR.bio,
      profilePic: CREATOR.profilePic,
      username: CREATOR.username,
      createdAt: new Date().toISOString(),
    },
    { merge: true },
  );
  console.log("  ✓ users/" + creatorUser.uid + " written");

  // Creator application doc — pre-approved.
  let appId = await findExistingByEmail("creators", CREATOR.email);
  if (appId) {
    console.log("  • creator application already exists: " + appId);
  } else {
    const ref = await addDoc(collection(db, "creators"), {
      uid: creatorUser.uid,
      fullName: CREATOR.fullName,
      email: CREATOR.email,
      country: "Algeria",
      wilaya: CREATOR.wilaya,
      city: CREATOR.city,
      role: CREATOR.role,
      bio: CREATOR.bio,
      rate: CREATOR.rate,
      portfolio: CREATOR.portfolio,
      username: CREATOR.username,
      // Pre-approved so the creator can immediately bid + appear in the
      // /freelancers directory in the demo.
      status: "approved",
      createdAt: serverTimestamp(),
    });
    appId = ref.id;
    console.log("  ✓ creators/" + appId + " created (status=approved)");
  }

  // 4. Bid — placed by the creator on the demo offer.
  console.log("\n[4/4] Demo bid");
  const existingBids = await getDocs(
    query(
      collection(db, "bids"),
      where("offerId", "==", offerId),
      where("creatorEmail", "==", CREATOR.email),
    ),
  );
  if (!existingBids.empty) {
    console.log("  • bid already exists: " + existingBids.docs[0].id);
  } else {
    const ref = await addDoc(collection(db, "bids"), {
      offerId,
      creatorId: creatorUser.uid,
      creatorName: CREATOR.fullName,
      creatorEmail: CREATOR.email,
      amount: BID.amount,
      pitch: BID.pitch,
      status: "pending",
      createdAt: serverTimestamp(),
    });
    console.log("  ✓ bids/" + ref.id + " created (status=pending)");
  }

  await signOut(auth);

  console.log("\n─── Done ───────────────────────────────────────────────────");
  console.log("Login URLs:");
  console.log("  Client : https://thealgerianstudio.com/auth/login");
  console.log("           email: " + CLIENT.email);
  console.log("           pass : " + PASSWORD);
  console.log("  Creator: https://thealgerianstudio.com/auth/login");
  console.log("           email: " + CREATOR.email);
  console.log("           pass : " + PASSWORD);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("\n✗ Seed failed:", err);
    process.exit(1);
  });
