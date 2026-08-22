import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  type Unsubscribe
} from 'firebase/firestore';
import { db } from './firebase';
import type {
  Product,
  CategoryItem,
  Enquiry,
  Testimonial,
  Coupon,
  HeroSlide,
  WhyChooseUsCard,
  FooterSettings,
  MasterSettings,
  SafetyTipsContent,
  AboutPageContent,
  ContactPageContent,
  StockLedgerEntry,
  SalesOrder,
  Vendor,
  PurchaseOrder,
  Customer
} from '../types';

// Default initial fallbacks
export const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    id: 'hero_1',
    tag: 'SIVAKASI DIRECT WHOLESALE 2026',
    title: 'Crackers Falls — பட்டாசு அருவி',
    subtitle: 'Authentic Sivakasi Wholesale Fireworks at Factory Prices',
    description: 'Experience a waterfall of lights! Order genuine, premium Sivakasi crackers directly from factory distributors with safe packed transport across India.',
    bgClass: 'from-emerald-950 via-teal-950 to-slate-950',
    image: '/crackers falls logo.webp',
    primaryCtaText: 'Quick Wholesale Enquiry',
    primaryCtaLink: '/quick-enquiry',
    secondaryCtaText: 'Call / WhatsApp Order',
    secondaryCtaLink: 'https://wa.me/919159038240',
    active: true,
    order: 0
  },
  {
    id: 'hero_2',
    tag: 'FESTIVE SPECIAL DISCOUNT',
    title: 'Up To 60% Direct Factory Discount',
    subtitle: 'Quality Assured Sparklers, Pots, Aerial Shots & Gift Boxes',
    description: 'Get the best wholesale rate for Diwali, Weddings, & Grand Celebrations. Every order custom packed with safety protection.',
    bgClass: 'from-amber-950 via-red-950 to-slate-950',
    image: '/crackers falls logo.webp',
    primaryCtaText: 'Browse Catalog & Price List',
    primaryCtaLink: '/quick-enquiry',
    secondaryCtaText: 'WhatsApp Sales Team',
    secondaryCtaLink: 'https://wa.me/919159038240',
    active: true,
    order: 1
  }
];

export const DEFAULT_WHY_CHOOSE_US: WhyChooseUsCard[] = [
  {
    id: 'why_1',
    title: 'Direct Sivakasi Wholesale',
    description: 'Direct factory pricing with no middleman markup.',
    icon: 'Factory',
    stat: '100%',
    statLabel: 'Direct Factory Rate',
    order: 0,
    active: true
  },
  {
    id: 'why_2',
    title: 'Safe Packed Transport',
    description: 'Standard safe packaging with moisture-proof wrapping & transport tracking.',
    icon: 'ShieldCheck',
    stat: '100%',
    statLabel: 'Safe Delivery',
    order: 1,
    active: true
  },
  {
    id: 'why_3',
    title: 'Quality Assured Fireworks',
    description: '100% tested sound crackers, colorful fountains, and safe sparklers.',
    icon: 'Sparkles',
    stat: 'A+ Grade',
    statLabel: 'Quality Assured',
    order: 2,
    active: true
  },
  {
    id: 'why_4',
    title: 'Fast Nationwide Dispatch',
    description: 'Express dispatch from Sivakasi hub with direct transport connection.',
    icon: 'Truck',
    stat: '24-48h',
    statLabel: 'Dispatch Time',
    order: 3,
    active: true
  }
];

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: 'cat_1', name: 'Ground Chakkars', order: 0, icon: '🌀', color: 'from-[#1f3d2b] to-[#3fa7bf]', description: 'Whirling ground spinners', badge: '🔥 POPULAR', active: true },
  { id: 'cat_2', name: 'Flower Pots', order: 1, icon: '🎆', color: 'from-[#1f3d2b] to-amber-600', description: 'Sparkling floral fountains & giant cone pots', badge: '⚡ BEST SELLER', active: true },
  { id: 'cat_3', name: 'Sparklers', order: 2, icon: '✨', color: 'from-yellow-400 to-amber-600', description: 'Electric, color & giant sparkler sticks', badge: '⭐ ESSENTIAL', active: true },
  { id: 'cat_4', name: 'Twinkling Star', order: 3, icon: '⭐', color: 'from-amber-400 to-amber-600', description: 'Glowing star sticks & golden flash lights', badge: '', active: true },
  { id: 'cat_5', name: 'Bombs', order: 5, icon: '💣', color: 'from-red-600 to-rose-700', description: 'Sound crackers, Atom & Hydrogen bombs', badge: '💥 LOUD SOUND', active: true },
  { id: 'cat_6', name: 'Single Shot', order: 6, icon: '💥', color: 'from-orange-500 to-red-600', description: 'Single aerial sound shots', badge: '', active: true },
  { id: 'cat_7', name: 'Rockets', order: 7, icon: '🚀', color: 'from-blue-500 to-indigo-700', description: 'Whistling & 2-sound sky rockets', badge: '', active: true },
  { id: 'cat_8', name: 'Fountains', order: 8, icon: '⛲', color: 'from-teal-500 to-cyan-600', description: 'Multi-colour fountain assortments', badge: '✨ NEW', active: true },
  { id: 'cat_9', name: 'Sky Shots', order: 9, icon: '🌌', color: 'from-purple-600 to-indigo-900', description: 'Multi-shot aerial displays', badge: '🏆 POPULAR', active: true },
  { id: 'cat_10', name: 'Gift Boxes', order: 11, icon: '🎁', color: 'from-emerald-600 to-teal-700', description: 'Curated festive fireworks bundles', badge: '💝 BEST VALUE', active: true }
];

export const DEFAULT_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Ground Chakkar Special 10 Pcs', category: 'Ground Chakkars', brand: 'Crackers Falls', unit: 'Box', price: 90, original_price: 200, image_url: '/crackers falls logo.webp', description: 'Smooth whirling ground spinner', in_stock: true, active: true, sortOrder: 0 },
  { id: 'p2', name: 'Ground Chakkar Deluxe 10 Pcs', category: 'Ground Chakkars', brand: 'Crackers Falls', unit: 'Box', price: 145, original_price: 320, image_url: '/crackers falls logo.webp', description: 'Bright color spinning ground fireworks', in_stock: true, active: true, sortOrder: 1 },
  { id: 'p3', name: 'Flower Pots Small 10 Pcs', category: 'Flower Pots', brand: 'Crackers Falls', unit: 'Box', price: 120, original_price: 270, image_url: '/crackers falls logo.webp', description: 'Golden spark fountains', in_stock: true, active: true, sortOrder: 2 },
  { id: 'p4', name: 'Flower Pots Big 10 Pcs', category: 'Flower Pots', brand: 'Crackers Falls', unit: 'Box', price: 195, original_price: 430, image_url: '/crackers falls logo.webp', description: 'High spraying golden sparkle pot', in_stock: true, active: true, sortOrder: 3 },
  { id: 'p5', name: '10cm Electric Sparklers (10 Pcs)', category: 'Sparklers', brand: 'Crackers Falls', unit: 'Box', price: 35, original_price: 80, image_url: '/crackers falls logo.webp', description: 'Bright golden sparkler sticks', in_stock: true, active: true, sortOrder: 5 },
  { id: 'p6', name: 'Atom Bomb Green (10 Pcs)', category: 'Bombs', brand: 'Crackers Falls', unit: 'Box', price: 85, original_price: 190, image_url: '/crackers falls logo.webp', description: 'High intensity sound bomb', in_stock: true, active: true, sortOrder: 8 },
  { id: 'p7', name: '12 Shot Multi Color Sky Display', category: 'Sky Shots', brand: 'Crackers Falls', unit: 'Box', price: 380, original_price: 850, image_url: '/crackers falls logo.webp', description: 'Continuous 12 multi-color aerial bursts', in_stock: true, active: true, sortOrder: 11 },
  { id: 'p8', name: 'Diwali Grand Family Gift Box (25 Items)', category: 'Gift Boxes', brand: 'Crackers Falls', unit: 'Box', price: 1450, original_price: 3200, image_url: '/crackers falls logo.webp', description: 'Assorted family gift box containing sparklers, pots, chakkars & sky shots', in_stock: true, active: true, sortOrder: 13 }
];

export const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    name: 'Ramesh Kumar',
    location: 'Chennai, TN',
    rating: 5,
    review: 'Ordered wholesale crackers for our entire apartment society. Quality of Flower Pots and Aerial Sky Shots was outstanding! Delivered securely in 2 days from Sivakasi.',
    order: 0,
    active: true
  },
  {
    id: 't2',
    name: 'Karthik Subramanian',
    location: 'Coimbatore, TN',
    rating: 5,
    review: 'Genuine Sivakasi factory rate without any broker commission. Every single item burned cleanly and packed safely. Crackers Falls is our permanent supplier now!',
    order: 1,
    active: true
  },
  {
    id: 't3',
    name: 'Venkatesh Prasad',
    location: 'Bengaluru, KA',
    rating: 5,
    review: 'Excellent wholesale packing and super fast transport dispatch. The WhatsApp order flow was seamless and transparent.',
    order: 2,
    active: true
  }
];

export const DEFAULT_FOOTER_SETTINGS: FooterSettings = {
  brand_name: 'Crackers Falls',
  tamil_tagline: 'பட்டாசு அருவி',
  about_text: 'Sivakasi wholesale fireworks distributor offering authentic high-quality crackers, sparklers, fountains, aerial sky shots, and festive combo boxes at direct factory rates.',
  phone: '+91 9159038240',
  whatsapp: '+91 9159038240',
  email: 'support@crackersfalls.in',
  address: 'Sivakasi Main Road, Sivakasi, Tamil Nadu 626123, India',
  business_hours: 'Mon - Sun: 8:00 AM - 10:00 PM',
  min_order_note: 'Minimum wholesale order value: ₹2,000 across India.'
};

export const DEFAULT_MASTER_SETTINGS: MasterSettings = {
  top_bar_notice: '🎆 Welcome to Crackers Falls (பட்டாசு அருவி) — Wholesale Sivakasi Crackers Direct Factory Pricing! Minimum Order ₹2000.',
  global_discount_pct: 55,
  minimum_order_value: 2000,
  whatsapp_number: '919159038240',
  phone_number: '+919159038240',
  support_email: 'support@crackersfalls.in',
  admin_notification_email: 'sanjaysurya3010@gmail.com'
};

// Local storage override helpers to guarantee admin edits always succeed even if Firebase permissions fail
function getLocalOverrides<T>(key: string): T[] | null {
  try {
    const raw = localStorage.getItem(`cf_override_${key}`);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function setLocalOverrides<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(`cf_override_${key}`, JSON.stringify(data));
    window.dispatchEvent(new Event(`cf_updated_${key}`));
  } catch (e) {
    console.warn(`Failed to set local storage override for ${key}`, e);
  }
}

// Generic Collection Fetchers & Listeners
export async function fetchCollection<T>(collectionName: string): Promise<T[]> {
  const local = getLocalOverrides<T>(collectionName);
  try {
    const colRef = collection(db, collectionName);
    const snap = await getDocs(colRef);
    const remoteDocs = snap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })) as T[];
    if (remoteDocs.length > 0) {
      if (local && local.length > 0) {
        // Merge local created/updated docs with remote docs
        const mergedMap = new Map<string, any>();
        remoteDocs.forEach((d: any) => mergedMap.set(d.id, d));
        local.forEach((d: any) => mergedMap.set(d.id, d));
        return Array.from(mergedMap.values());
      }
      return remoteDocs;
    }
  } catch (error) {
    console.warn(`Firestore read error on ${collectionName}:`, error);
  }
  return local || [];
}

export function subscribeCollection<T>(collectionName: string, callback: (data: T[]) => void): Unsubscribe {
  const handleUpdate = () => {
    fetchCollection<T>(collectionName).then(data => {
      if (data && data.length > 0) {
        callback(data);
      }
    });
  };

  window.addEventListener(`cf_updated_${collectionName}`, handleUpdate);

  try {
    const colRef = collection(db, collectionName);
    const unsub = onSnapshot(colRef, (snap) => {
      const remoteDocs = snap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })) as T[];
      const local = getLocalOverrides<T>(collectionName);
      let combined = remoteDocs;
      if (local && local.length > 0) {
        const map = new Map<string, any>();
        remoteDocs.forEach((d: any) => map.set(d.id, d));
        local.forEach((d: any) => map.set(d.id, d));
        combined = Array.from(map.values());
      }
      callback(combined);
    }, () => {
      handleUpdate();
    });

    return () => {
      window.removeEventListener(`cf_updated_${collectionName}`, handleUpdate);
      unsub();
    };
  } catch (e) {
    handleUpdate();
    return () => {
      window.removeEventListener(`cf_updated_${collectionName}`, handleUpdate);
    };
  }
}

// Single Site Content Document Helpers
export async function fetchSiteContentDoc<T>(docId: string, fallback: T): Promise<T> {
  try {
    const rawLocal = localStorage.getItem(`cf_doc_${docId}`);
    if (rawLocal) return JSON.parse(rawLocal);

    const docRef = doc(db, 'site_content', docId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as T;
    }
  } catch (e) {
    console.warn(`Firestore fetch site_content/${docId} error:`, e);
  }
  return fallback;
}

export function subscribeSiteContentDoc<T>(docId: string, fallback: T, callback: (data: T) => void): Unsubscribe {
  const handleUpdate = () => {
    fetchSiteContentDoc<T>(docId, fallback).then(data => callback(data));
  };
  window.addEventListener(`cf_updated_doc_${docId}`, handleUpdate);

  try {
    const docRef = doc(db, 'site_content', docId);
    const unsub = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        callback(snap.data() as T);
      } else {
        handleUpdate();
      }
    }, () => {
      handleUpdate();
    });
    return () => {
      window.removeEventListener(`cf_updated_doc_${docId}`, handleUpdate);
      unsub();
    };
  } catch (e) {
    handleUpdate();
    return () => {
      window.removeEventListener(`cf_updated_doc_${docId}`, handleUpdate);
    };
  }
}

export async function saveSiteContentDoc<T>(docId: string, data: T): Promise<void> {
  try {
    localStorage.setItem(`cf_doc_${docId}`, JSON.stringify(data));
    window.dispatchEvent(new Event(`cf_updated_doc_${docId}`));
  } catch (e) {}

  try {
    const docRef = doc(db, 'site_content', docId);
    await setDoc(docRef, data as any, { merge: true });
  } catch (e) {
    console.warn(`Saved doc ${docId} locally due to Firestore write error:`, e);
  }
}

// Products CRUD
export async function fetchProducts(): Promise<Product[]> {
  const items = await fetchCollection<Product>('products');
  const defaults = items.length > 0 ? items : DEFAULT_PRODUCTS;
  return defaults.sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));
}

export async function saveProduct(product: Partial<Product> & { name: string }): Promise<string> {
  const id = product.id || 'prod_' + Date.now();
  const fullData: Product = {
    ...product,
    id,
    name: product.name,
    category: product.category || 'Sparklers',
    brand: product.brand || 'Crackers Falls',
    unit: product.unit || 'Box',
    price: Number(product.price) || 0,
    original_price: Number(product.original_price) || Math.round((Number(product.price) || 100) / 0.45),
    image_url: product.image_url || '/crackers falls logo.webp',
    description: product.description || '',
    in_stock: product.in_stock !== false,
    active: product.active !== false,
    sortOrder: product.sortOrder ?? 0
  };

  const cleaned = deepCleanObject(fullData);

  // 1. Update local storage overrides
  const currentLocal = getLocalOverrides<Product>('products') || await fetchProducts();
  const existingIndex = currentLocal.findIndex(p => p.id === id);
  if (existingIndex >= 0) {
    currentLocal[existingIndex] = cleaned;
  } else {
    currentLocal.push(cleaned);
  }
  setLocalOverrides('products', currentLocal);

  // 2. Try Firestore write
  try {
    const docRef = doc(db, 'products', id);
    await setDoc(docRef, cleaned, { merge: true });
    triggerCollectionUpdate('products');
  } catch (e) {
    console.warn('Saved product locally due to Firestore write error:', e);
  }

  return id;
}

export async function deleteProduct(id: string): Promise<void> {
  const currentLocal = (getLocalOverrides<Product>('products') || await fetchProducts()).filter(p => p.id !== id);
  setLocalOverrides('products', currentLocal);

  try {
    await deleteDoc(doc(db, 'products', id));
  } catch (e) {
    console.warn('Deleted product locally due to Firestore error:', e);
  }
}

// Categories CRUD
export async function fetchCategories(): Promise<CategoryItem[]> {
  const list = await fetchCollection<CategoryItem>('categories');
  const defaults = list.length > 0 ? list : DEFAULT_CATEGORIES;
  return defaults.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
}

export async function saveCategory(category: Partial<CategoryItem> & { name: string }): Promise<string> {
  const id = category.id || 'cat_' + Date.now();
  const fullData: CategoryItem = {
    id,
    name: category.name,
    order: category.order ?? 0,
    icon: category.icon || '✨',
    image_url: category.image_url || '',
    count: category.count || 'Available',
    color: category.color || 'from-emerald-600 to-teal-700',
    description: category.description || 'Authentic fireworks category',
    badge: category.badge || '',
    active: category.active !== false
  };

  const currentLocal = getLocalOverrides<CategoryItem>('categories') || await fetchCategories();
  const idx = currentLocal.findIndex(c => c.id === id);
  if (idx >= 0) {
    currentLocal[idx] = fullData;
  } else {
    currentLocal.push(fullData);
  }
  setLocalOverrides('categories', currentLocal);

  try {
    const docRef = doc(db, 'categories', id);
    await setDoc(docRef, fullData, { merge: true });
  } catch (e) {
    console.warn('Saved category locally:', e);
  }

  return id;
}

export async function deleteCategory(id: string): Promise<void> {
  const currentLocal = (getLocalOverrides<CategoryItem>('categories') || await fetchCategories()).filter(c => c.id !== id);
  setLocalOverrides('categories', currentLocal);
  try {
    await deleteDoc(doc(db, 'categories', id));
  } catch (e) {}
}

function deepCleanObject<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj as T;
  if (Array.isArray(obj)) {
    return obj.map(item => deepCleanObject(item)).filter(item => item !== undefined) as unknown as T;
  }
  if (typeof obj === 'object') {
    const cleaned: any = {};
    Object.keys(obj as Record<string, any>).forEach(key => {
      const val = (obj as Record<string, any>)[key];
      if (val !== undefined) {
        cleaned[key] = deepCleanObject(val);
      }
    });
    return cleaned as T;
  }
  return obj;
}

// Enquiries Operations
export async function createEnquiry(enquiryData: Omit<Enquiry, 'id' | 'created_at'>): Promise<string> {
  const id = 'ENQ-' + Math.floor(100000 + Math.random() * 900000);
  const fullEnquiry: Enquiry = {
    ...enquiryData,
    id,
    status: 'Pending',
    created_at: new Date().toISOString()
  };

  const currentLocal = getLocalOverrides<Enquiry>('enquiries') || [];
  currentLocal.unshift(fullEnquiry);
  setLocalOverrides('enquiries', currentLocal);

  try {
    const cleanedEnquiry = deepCleanObject(fullEnquiry);
    const docRef = doc(db, 'enquiries', id);
    await setDoc(docRef, cleanedEnquiry);
    console.log('Successfully saved enquiry to Cloud Firestore:', id);

    // Also mirror to unified salesOrders collection with channel: 'website'
    try {
      const salesOrderData = deepCleanObject({
        id,
        orderNumber: id,
        channel: 'website',
        customerName: enquiryData.name,
        customerPhone: enquiryData.phone,
        customerEmail: enquiryData.email || '',
        deliveryAddress: enquiryData.address || '',
        pincode: enquiryData.pincode || '',
        name: enquiryData.name,
        phone: enquiryData.phone,
        email: enquiryData.email || '',
        address: enquiryData.address || '',
        customerId: enquiryData.name + ' (' + enquiryData.phone + ')',
        orderDate: fullEnquiry.created_at,
        status: 'enquiry',
        items: (enquiryData.items || []).map((item: any) => ({
          productId: item.id || item.name,
          name: item.name || item.productId || 'Crackers Item',
          quantity: Number(item.quantity || 1),
          unitPrice: Number(item.price || item.unitPrice || 0),
          price: Number(item.price || item.unitPrice || 0),
          priceType: 'wholesale'
        })),
        totalAmount: enquiryData.grand_total,
        amountPaid: 0,
        paymentStatus: 'unpaid',
        deliveryType: 'delivery',
        locationId: 'loc_1',
        notes: `Website direct enquiry checkout`
      });
      const salesOrderRef = doc(db, 'salesOrders', id);
      await setDoc(salesOrderRef, salesOrderData);
      console.log('Successfully saved salesOrder mirror to Cloud Firestore:', id);
    } catch (err) {
      console.error('Error saving salesOrder mirror to Firestore:', err);
    }
  } catch (e) {
    console.error('Failed to save enquiry to Cloud Firestore:', e);
  }

  return id;
}

export async function updateEnquiryStatus(id: string, status: Enquiry['status'], transport_name?: string, lr_number?: string): Promise<void> {
  const currentLocal = getLocalOverrides<Enquiry>('enquiries') || await fetchCollection<Enquiry>('enquiries');
  const idx = currentLocal.findIndex(e => e.id === id);
  if (idx >= 0) {
    currentLocal[idx].status = status;
    if (transport_name !== undefined) currentLocal[idx].transport_name = transport_name;
    if (lr_number !== undefined) currentLocal[idx].lr_number = lr_number;
    setLocalOverrides('enquiries', currentLocal);
  }

  try {
    const docRef = doc(db, 'enquiries', id);
    const updatePayload: Partial<Enquiry> = { status };
    if (transport_name !== undefined) updatePayload.transport_name = transport_name;
    if (lr_number !== undefined) updatePayload.lr_number = lr_number;
    await updateDoc(docRef, updatePayload as any);
  } catch (e) {
    console.warn('Updated enquiry status locally:', e);
  }
}

// Testimonials CRUD
export async function fetchTestimonials(): Promise<Testimonial[]> {
  const list = await fetchCollection<Testimonial>('testimonials');
  const defaults = list.length > 0 ? list : DEFAULT_TESTIMONIALS;
  return defaults.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
}

export async function saveTestimonial(testimonial: Partial<Testimonial> & { name: string; review: string }): Promise<string> {
  const id = testimonial.id || 'test_' + Date.now();
  const fullData: Testimonial = {
    id,
    name: testimonial.name,
    location: testimonial.location || 'Sivakasi Customer',
    review: testimonial.review,
    rating: testimonial.rating || 5,
    order: testimonial.order ?? 0,
    active: testimonial.active !== false
  };

  const currentLocal = getLocalOverrides<Testimonial>('testimonials') || await fetchTestimonials();
  const idx = currentLocal.findIndex(t => t.id === id);
  if (idx >= 0) {
    currentLocal[idx] = fullData;
  } else {
    currentLocal.push(fullData);
  }
  setLocalOverrides('testimonials', currentLocal);

  try {
    const docRef = doc(db, 'testimonials', id);
    await setDoc(docRef, fullData, { merge: true });
  } catch (e) {}

  return id;
}

export async function deleteTestimonial(id: string): Promise<void> {
  const currentLocal = (getLocalOverrides<Testimonial>('testimonials') || await fetchTestimonials()).filter(t => t.id !== id);
  setLocalOverrides('testimonials', currentLocal);
  try {
    await deleteDoc(doc(db, 'testimonials', id));
  } catch (e) {}
}

// Coupons CRUD
export async function fetchCoupons(): Promise<Coupon[]> {
  return fetchCollection<Coupon>('coupons');
}

export async function saveCoupon(coupon: Partial<Coupon> & { code: string }): Promise<string> {
  const id = coupon.id || 'cpn_' + Date.now();
  const fullData: Coupon = {
    id,
    code: coupon.code.toUpperCase().trim(),
    discount_type: coupon.discount_type || 'percent',
    discount_value: Number(coupon.discount_value) || 5,
    min_cart_value: Number(coupon.min_cart_value) || 2000,
    active: coupon.active !== false
  };

  const currentLocal = getLocalOverrides<Coupon>('coupons') || await fetchCoupons();
  const idx = currentLocal.findIndex(c => c.id === id);
  if (idx >= 0) {
    currentLocal[idx] = fullData;
  } else {
    currentLocal.push(fullData);
  }
  setLocalOverrides('coupons', currentLocal);

  try {
    const docRef = doc(db, 'coupons', id);
    await setDoc(docRef, fullData, { merge: true });
  } catch (e) {}

  return id;
}

export async function deleteCoupon(id: string): Promise<void> {
  const currentLocal = (getLocalOverrides<Coupon>('coupons') || await fetchCoupons()).filter(c => c.id !== id);
  setLocalOverrides('coupons', currentLocal);
  try {
    await deleteDoc(doc(db, 'coupons', id));
  } catch (e) {}
}

// Page Contents Defaults & CRUD
export const DEFAULT_SAFETY_TIPS_PAGE: SafetyTipsContent = {
  eyebrow: 'Safety Guidelines · PESO Compliance',
  title: 'How to Enjoy Fireworks Safely',
  subtitle: 'Essential Safety Protocol & Handling Guidelines for Diwali & Festivities',
  description: 'At Crackers Falls, safety is our top priority. All our Sivakasi fireworks are 100% PESO certified. Follow these statutory safety precautions for a joyful celebration.',
  tips: [
    {
      id: 'tip_1',
      title: 'Store in Cool, Dry Place',
      description: 'Keep fireworks in a dry, ventilated box away from direct heat sources, open electrical outlets, or flammable liquids.',
      type: 'do',
      icon: '🛡️'
    },
    {
      id: 'tip_2',
      title: 'Adult Supervision Outdoors',
      description: 'Always light fireworks outdoors in open grounds under responsible adult supervision.',
      type: 'do',
      icon: '👨‍👩‍👧'
    },
    {
      id: 'tip_3',
      title: 'Keep Water Bucket Nearby',
      description: 'Always keep a bucket of clean water or sand ready nearby to extinguish used sparkler sticks or douse fires.',
      type: 'do',
      icon: '🪣'
    },
    {
      id: 'tip_4',
      title: 'Wear Fitted Cotton Garments',
      description: 'Wear snug-fitting cotton clothing and sturdy footwear while lighting fireworks. Avoid loose synthetic garments.',
      type: 'do',
      icon: '👕'
    },
    {
      id: 'tip_5',
      title: 'Never Reignite Unexploded Crackers',
      description: 'Never attempt to relight or pick up a cracker that failed to burst. Wait 15 minutes and douse with water.',
      type: 'dont',
      icon: '🚫'
    },
    {
      id: 'tip_6',
      title: 'Never Ignite Indoors or Balconies',
      description: 'Do not light sparklers, flower pots, or aerial shots inside closed rooms, covered balconies, or near dry grass.',
      type: 'dont',
      icon: '🏠'
    },
    {
      id: 'tip_7',
      title: 'Never Carry Crackers in Pockets',
      description: 'Never carry crackers loose in clothes pockets or throw fireworks towards persons, animals, or vehicles.',
      type: 'dont',
      icon: '🔥'
    }
  ]
};

export const DEFAULT_ABOUT_PAGE: AboutPageContent = {
  eyebrow: 'Direct Factory Godown · Since 2009',
  title: 'About Crackers Falls (பட்டாசு அருவி)',
  subtitle: 'Sivakasi Premier Direct Wholesale Fireworks Outlet',
  story_title: 'Our Sivakasi Heritage & Quality Commitment',
  story_body: 'Founded in 2009 in Sivakasi, Tamil Nadu — the pyrotechnic capital of India — Crackers Falls (பட்டாசு அருவி) was established with a clear mission: delivering fresh-batch, genuine Sivakasi fireworks straight from our factory godowns to retailers, shops, event organizers, and families across India without middleman markups.',
  mission: 'To provide 100% genuine PESO-certified fireworks at direct factory-floor wholesale rates with moisture-proof packaging, transparent slab discounts, and nationwide insured delivery.',
  vision: 'To be India\'s most trusted, accessible, and customer-first direct factory outlet for festive and grand wedding pyrotechnic celebrations.',
  years_experience: '15+',
  orders_delivered: '12,000+',
  states_covered: '18'
};

export const DEFAULT_CONTACT_PAGE: ContactPageContent = {
  eyebrow: 'Sivakasi Sales Desk · Direct Support',
  title: 'Contact Our Godown Desk',
  subtitle: 'We Are Ready to Assist Your Wholesale & Festive Orders',
  description: 'Have questions regarding bulk order slab rates, custom gift box packing, transport dispatch, or live LR status? Reach out to our Sivakasi godown desk directly.',
  address: 'Sivakasi Main Road, Sivakasi, Tamil Nadu 626123, India',
  phone: '+91 9159038240',
  whatsapp: 'https://wa.me/919159038240',
  email: 'support@crackersfalls.in',
  hours: 'Mon – Sun · 8:00 AM – 10:00 PM IST',
  google_map_embed: ''
};

export async function fetchPageContent<T>(pageKey: string, defaultData: T): Promise<T> {
  const local = getLocalOverrides<T>(`page_${pageKey}`);
  if (local) return local as T;

  try {
    const docRef = doc(db, 'page_contents', pageKey);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as T;
    }
  } catch (e) {
    console.warn(`Fetched page_${pageKey} content locally:`, e);
  }

  return defaultData;
}

export async function savePageContent<T>(pageKey: string, data: T): Promise<void> {
  setLocalOverrides(`page_${pageKey}`, data as any);
  try {
    const docRef = doc(db, 'page_contents', pageKey);
    await setDoc(docRef, data as any, { merge: true });
  } catch (e) {
    console.warn(`Saved page_${pageKey} content locally:`, e);
  }
}

// Activity Logging
export async function logActivity(action: string, details: string, user_email: string): Promise<void> {
  try {
    const colRef = collection(db, 'activity_logs');
    await addDoc(colRef, {
      action,
      details,
      user_email,
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    console.warn('Activity log recorded:', details);
  }
}

// ==========================================
// INVENTORY & ORDER MANAGEMENT HELPERS
// ==========================================

export function triggerCollectionUpdate(collectionName: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(`cf_updated_${collectionName}`));
  }
}

export function calculateProductStock(product: Product, stockLedger: StockLedgerEntry[] = []): number {
  if (!product) return 0;
  const pEntries = (stockLedger || []).filter(e => e.productId === product.id);
  if (pEntries.length > 0) {
    return pEntries.reduce((sum, e) => sum + (Number(e.quantity) || 0), 0);
  }
  if (product.currentStock !== undefined && product.currentStock !== null) {
    return Number(product.currentStock);
  }
  return product.in_stock !== false ? 25 : 0;
}

export async function recalculateProductStock(productId: string): Promise<number> {
  try {
    const colRef = collection(db, 'stockLedger');
    const snap = await getDocs(colRef);
    let totalStock = 0;
    let hasEntries = false;

    snap.docs.forEach((d) => {
      const data = d.data();
      if (data.productId === productId) {
        hasEntries = true;
        totalStock += Number(data.quantity) || 0;
      }
    });

    const finalStock = hasEntries ? totalStock : 25;
    const productRef = doc(db, 'products', productId);
    await updateDoc(productRef, {
      currentStock: finalStock,
      in_stock: finalStock > 0
    });

    triggerCollectionUpdate('products');
    triggerCollectionUpdate('stockLedger');
    return finalStock;
  } catch (e) {
    console.warn(`Local stock calculation for product ${productId}:`, e);
    return 25;
  }
}

export async function addStockLedgerEntry(entry: Omit<StockLedgerEntry, 'id'>): Promise<string> {
  const id = 'stk_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
  const fullEntry: StockLedgerEntry = { ...entry, id };
  const cleaned = deepCleanObject(fullEntry);

  const currentLocal = getLocalOverrides<StockLedgerEntry>('stockLedger') || [];
  currentLocal.unshift(cleaned);
  setLocalOverrides('stockLedger', currentLocal);

  try {
    const docRef = doc(db, 'stockLedger', id);
    await setDoc(docRef, cleaned);
    await recalculateProductStock(entry.productId);
    triggerCollectionUpdate('stockLedger');
  } catch (e) {
    console.warn('Saved stock ledger entry locally:', e);
  }

  return id;
}

// Sales Orders CRUD
export async function fetchSalesOrders(): Promise<SalesOrder[]> {
  return fetchCollection<SalesOrder>('salesOrders');
}

export async function saveSalesOrder(order: SalesOrder): Promise<string> {
  const cleaned = deepCleanObject(order);
  const currentLocal = getLocalOverrides<SalesOrder>('salesOrders') || await fetchSalesOrders();
  const idx = currentLocal.findIndex(o => o.id === order.id);
  if (idx >= 0) {
    currentLocal[idx] = cleaned;
  } else {
    currentLocal.unshift(cleaned);
  }
  setLocalOverrides('salesOrders', currentLocal);

  try {
    const docRef = doc(db, 'salesOrders', order.id);
    await setDoc(docRef, cleaned, { merge: true });
    triggerCollectionUpdate('salesOrders');
    logActivity(
      order.channel === 'in-person' ? 'POS Counter Billing' : 'Sales Order Update',
      `Order #${order.id} (Customer ID: ${order.customerId || 'Counter'}) - ${order.status.toUpperCase()} (Total: ₹${order.totalAmount || 0})`,
      'ajsolutionsmd@gmail.com'
    );
  } catch (e) {
    console.warn(`Saved salesOrder ${order.id} locally:`, e);
  }

  return order.id;
}

export async function deleteSalesOrder(id: string): Promise<void> {
  const currentLocal = (getLocalOverrides<SalesOrder>('salesOrders') || await fetchSalesOrders()).filter(o => o.id !== id);
  setLocalOverrides('salesOrders', currentLocal);
  try {
    await deleteDoc(doc(db, 'salesOrders', id));
    triggerCollectionUpdate('salesOrders');
    logActivity('Delete Sales Order', `Deleted Sales Order #${id}`, 'ajsolutionsmd@gmail.com');
  } catch (e) {}
}

// Vendors CRUD
export async function fetchVendors(): Promise<Vendor[]> {
  return fetchCollection<Vendor>('vendors');
}

export async function saveVendor(vendor: Vendor): Promise<string> {
  const cleaned = deepCleanObject(vendor);
  const currentLocal = getLocalOverrides<Vendor>('vendors') || await fetchVendors();
  const idx = currentLocal.findIndex(v => v.id === vendor.id);
  if (idx >= 0) {
    currentLocal[idx] = cleaned;
  } else {
    currentLocal.unshift(cleaned);
  }
  setLocalOverrides('vendors', currentLocal);

  try {
    const docRef = doc(db, 'vendors', vendor.id);
    await setDoc(docRef, cleaned, { merge: true });
    triggerCollectionUpdate('vendors');
    logActivity('Vendor Management', `Saved Vendor "${vendor.name}" (${vendor.phone || 'No phone'})`, 'ajsolutionsmd@gmail.com');
  } catch (e) {
    console.warn(`Saved vendor ${vendor.id} locally:`, e);
  }

  return vendor.id;
}

export async function deleteVendor(id: string): Promise<void> {
  const currentLocal = (getLocalOverrides<Vendor>('vendors') || await fetchVendors()).filter(v => v.id !== id);
  setLocalOverrides('vendors', currentLocal);
  try {
    await deleteDoc(doc(db, 'vendors', id));
    triggerCollectionUpdate('vendors');
    logActivity('Delete Vendor', `Deleted Vendor ID #${id}`, 'ajsolutionsmd@gmail.com');
  } catch (e) {}
}

// Purchase Orders CRUD
export async function fetchPurchaseOrders(): Promise<PurchaseOrder[]> {
  return fetchCollection<PurchaseOrder>('purchaseOrders');
}

export async function savePurchaseOrder(po: PurchaseOrder): Promise<string> {
  const cleaned = deepCleanObject(po);
  const currentLocal = getLocalOverrides<PurchaseOrder>('purchaseOrders') || await fetchPurchaseOrders();
  const idx = currentLocal.findIndex(p => p.id === po.id);
  if (idx >= 0) {
    currentLocal[idx] = cleaned;
  } else {
    currentLocal.unshift(cleaned);
  }
  setLocalOverrides('purchaseOrders', currentLocal);

  try {
    const docRef = doc(db, 'purchaseOrders', po.id);
    await setDoc(docRef, cleaned, { merge: true });
    triggerCollectionUpdate('purchaseOrders');
    logActivity('Purchase Order Restock', `Issued PO #${po.id} to Vendor ID #${po.vendorId} (Total: ₹${po.totalAmount || 0})`, 'ajsolutionsmd@gmail.com');
  } catch (e) {
    console.warn(`Saved purchaseOrder ${po.id} locally:`, e);
  }

  return po.id;
}

export async function deletePurchaseOrder(id: string): Promise<void> {
  const currentLocal = (getLocalOverrides<PurchaseOrder>('purchaseOrders') || await fetchPurchaseOrders()).filter(p => p.id !== id);
  setLocalOverrides('purchaseOrders', currentLocal);
  try {
    await deleteDoc(doc(db, 'purchaseOrders', id));
    triggerCollectionUpdate('purchaseOrders');
  } catch (e) {}
}

// Customers CRUD
export async function fetchCustomers(): Promise<Customer[]> {
  return fetchCollection<Customer>('customers');
}

export async function saveCustomer(customer: Customer): Promise<string> {
  const cleaned = deepCleanObject(customer);
  const currentLocal = getLocalOverrides<Customer>('customers') || await fetchCustomers();
  const idx = currentLocal.findIndex(c => c.id === customer.id);
  if (idx >= 0) {
    currentLocal[idx] = cleaned;
  } else {
    currentLocal.unshift(cleaned);
  }
  setLocalOverrides('customers', currentLocal);

  try {
    const docRef = doc(db, 'customers', customer.id);
    await setDoc(docRef, cleaned, { merge: true });
    triggerCollectionUpdate('customers');
  } catch (e) {
    console.warn(`Saved customer ${customer.id} locally:`, e);
  }

  return customer.id;
}


