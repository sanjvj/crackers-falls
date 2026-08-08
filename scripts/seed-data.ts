import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "crackersfalls-2026.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "crackersfalls-2026",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "crackersfalls-2026.firebasestorage.app",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.VITE_FIREBASE_APP_ID || ""
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const SEED_CATEGORIES = [
  { id: 'cat_1', name: 'Ground Chakkars', order: 0, icon: '🌀', color: 'from-[#1f3d2b] to-[#3fa7bf]', description: 'Whirling ground spinners', badge: '🔥 POPULAR', active: true },
  { id: 'cat_2', name: 'Flower Pots', order: 1, icon: '🎆', color: 'from-[#1f3d2b] to-amber-600', description: 'Sparkling floral fountains & giant cone pots', badge: '⚡ BEST SELLER', active: true },
  { id: 'cat_3', name: 'Sparklers', order: 2, icon: '✨', color: 'from-yellow-400 to-amber-600', description: 'Electric, color & giant sparkler sticks', badge: '⭐ ESSENTIAL', active: true },
  { id: 'cat_4', name: 'Twinkling Star', order: 3, icon: '⭐', color: 'from-amber-400 to-amber-600', description: 'Glowing star sticks & golden flash lights', badge: '', active: true },
  { id: 'cat_5', name: 'Bombs', order: 5, icon: '💣', color: 'from-red-600 to-rose-700', description: 'Sound crackers, Atom & Hydrogen bombs', badge: '💥 LOUD SOUND', active: true },
  { id: 'cat_6', name: 'Single Shot', order: 6, icon: '💥', color: 'from-orange-500 to-red-600', description: 'Single aerial sound shots', badge: '', active: true },
  { id: 'cat_7', name: 'Rockets', order: 7, icon: '🚀', color: 'from-blue-500 to-indigo-700', description: 'Whistling & 2-sound sky rockets', badge: '', active: true },
  { id: 'cat_8', name: 'Fountains', order: 8, icon: '⛲', color: 'from-teal-500 to-cyan-600', description: 'Multi-colour fountain assortments', badge: '✨ NEW', active: true },
  { id: 'cat_9', name: 'Sky Shots', order: 9, icon: '🌌', color: 'from-purple-600 to-indigo-900', description: 'Multi-shot aerial displays', badge: '🏆 POPULAR', active: true },
  { id: 'cat_10', name: 'Aerial Fancy Shells', order: 10, icon: '🎇', color: 'from-indigo-600 to-[#1f3d2b]', description: 'Pro aerial shell fireworks', badge: '🌟 PREMIUM', active: true },
  { id: 'cat_11', name: 'Gift Boxes', order: 11, icon: '🎁', color: 'from-emerald-600 to-teal-700', description: 'Curated festive fireworks bundles', badge: '💝 BEST VALUE', active: true },
  { id: 'cat_12', name: 'New Collection 2026', order: 12, icon: '🆕', color: 'from-amber-500 to-rose-600', description: 'Exclusive 2026 novelties', badge: 'NEW 2026', active: true }
];

const SEED_PRODUCTS = [
  // Ground Chakkars
  { id: 'p1', name: 'Ground Chakkar Special 10 Pcs', category: 'Ground Chakkars', brand: 'Crackers Falls', unit: 'Box', price: 90, original_price: 200, image_url: '/crackers falls logo.webp', description: 'Smooth whirling ground spinner', in_stock: true, active: true, sortOrder: 0 },
  { id: 'p2', name: 'Ground Chakkar Deluxe 10 Pcs', category: 'Ground Chakkars', brand: 'Crackers Falls', unit: 'Box', price: 145, original_price: 320, image_url: '/crackers falls logo.webp', description: 'Bright color spinning ground fireworks', in_stock: true, active: true, sortOrder: 1 },

  // Flower Pots
  { id: 'p3', name: 'Flower Pots Small 10 Pcs', category: 'Flower Pots', brand: 'Crackers Falls', unit: 'Box', price: 120, original_price: 270, image_url: '/crackers falls logo.webp', description: 'Golden spark fountains', in_stock: true, active: true, sortOrder: 2 },
  { id: 'p4', name: 'Flower Pots Big 10 Pcs', category: 'Flower Pots', brand: 'Crackers Falls', unit: 'Box', price: 195, original_price: 430, image_url: '/crackers falls logo.webp', description: 'High spraying golden sparkle pot', in_stock: true, active: true, sortOrder: 3 },
  { id: 'p5', name: 'Flower Pots Special Multicolor', category: 'Flower Pots', brand: 'Crackers Falls', unit: 'Box', price: 280, original_price: 620, image_url: '/crackers falls logo.webp', description: 'Multi-stage color fountain pot', in_stock: true, active: true, sortOrder: 4 }
];

async function seed() {
  console.log('Seeding categories...');
  for (const c of SEED_CATEGORIES) {
    await setDoc(doc(db, 'categories', c.id), c);
  }
  console.log('Seeding products...');
  for (const p of SEED_PRODUCTS) {
    await setDoc(doc(db, 'products', p.id), p);
  }
  console.log('Seeding completed!');
}

seed().catch(console.error);
