# North Pixel Studio — Firebase Edition

## Setup

```bash
npm install
npm run dev
```

## Firebase Setup (REQUIRED before deploying)

1. Go to Firebase Console → Authentication → Sign-in method
2. Enable **Email/Password** provider
3. Create the admin account manually:
   - Email: rezig@admin.np
   - Password: admin123
4. Go to Firestore Database → Create database (start in test mode)
5. Go to Firestore → Rules → paste contents of `firestore.rules`

## Deploy to Vercel

```bash
npm run build
```
Then upload `dist/` folder to Vercel, or connect your GitHub repo.

## Environment

All Firebase config is in `src/lib/firebase.ts`
