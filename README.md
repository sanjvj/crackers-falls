# Crackers Falls (பட்டாசு அருவி) — Premium Wholesale Fireworks Website

A brand-new, premium, upgraded website for **Crackers Falls (crackersfalls.in)** — a Sivakasi wholesale crackers/fireworks brand. Features a creative, 3D-animated UI built with **React 19**, **Vite**, **TypeScript**, **Tailwind CSS v4**, **Three.js / React Three Fiber**, **Framer Motion**, and **Firebase**.

---

## 🌟 Key Architecture & Security Highlights

1. **Only 2 Public Pages + Admin Portal**:
   - ` / ` — Immersive Home Page showpiece with 3D waterfall particle system, drifting mist, glowing gold logo, Tamil tagline, feature cards, catalog showcase, customer reviews, and footer.
   - ` /quick-enquiry ` — Wholesale enquiry browser, custom cart selector, customer info form, coupon discounts, and instant WhatsApp order pre-fill (`+91 9159038240`).
   - ` /admin ` — Security-first Firebase Authenticated admin panel mirroring JCS architecture with Crackers Falls dark forest-green UI and reduced scope.

2. **100% Cloud & ZERO LocalStorage**:
   - No `localStorage` or `sessionStorage` anywhere in the app.
   - All catalog data, enquiries, content slides, and settings are managed via real-time Firestore listeners (`onSnapshot`).
   - All media uploads go directly to Firebase Cloud Storage.

3. **Strict Security-First Auth**:
   - Admin access is gated strictly by Firebase Authentication and the Firebase Custom Claim `{ admin: true }`.
   - Token claims are verified via `user.getIdTokenResult(true)`.
   - No hardcoded passwords, PINs, or backdoor email checks.

---

## 🚀 Getting Started

### 1. Installation
```bash
npm install
```

### 2. Environment Variables (.env)
Create a `.env` file in the project root:
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=crackersfalls-2026.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=crackersfalls-2026
VITE_FIREBASE_STORAGE_BUCKET=crackersfalls-2026.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

### 3. Granting Admin Access (Custom Claims)
To grant an admin account the `{ admin: true }` claim:
1. Download your Service Account JSON key from **Firebase Console** -> **Project Settings** -> **Service Accounts**.
2. Save it as `serviceAccountKey.json` in the root directory.
3. Run the admin claim script:
```bash
node scripts/set-admin-claim.js owner@crackersfalls.in
```

### 4. Database Seeding (Optional)
To seed default Sivakasi product categories and sample items into Firestore:
```bash
npx tsx scripts/seed-data.ts
```

### 5. Running Development Server
```bash
npm run dev
```

---

## 🛠️ Verification & Build Commands

```bash
# Verify clean TypeScript compilation and Vite bundle
npm run build

# Vulnerability Audit
npm audit
```

---

## 🚀 Firebase Deployment

> **Note**: As requested, deployment should be executed manually after reviewing build output.

```bash
firebase deploy
```
