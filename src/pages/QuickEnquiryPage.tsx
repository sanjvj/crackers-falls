import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  Tag,
  Gift,
  Search
} from 'lucide-react';
import { AnnouncementBar } from '../components/AnnouncementBar';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { BrandLoader } from '../components/BrandLoader';
import { FireworksCanvas } from '../components/FireworksCanvas';
import { useFirestoreCollection } from '../hooks/useFirestore';
import {
  createEnquiry,
  DEFAULT_PRODUCTS,
  DEFAULT_CATEGORIES
} from '../lib/firestore';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { validatePhone, validatePincode, validateEmail, sanitizeInput } from '../lib/validation';
import type { Product, CategoryItem, Coupon, EnquiryItem } from '../types';
import { EnquiryProvider, useEnquiry } from '../context/EnquiryContext';

function QuickEnquiryContent() {
  const { data: products, loading: loadingProd } = useFirestoreCollection<Product>('products', DEFAULT_PRODUCTS);
  const { data: categories } = useFirestoreCollection<CategoryItem>('categories', DEFAULT_CATEGORIES);
  const { data: coupons } = useFirestoreCollection<Coupon>('coupons');

  // Shared Cart State from EnquiryContext (syncs across Home & Quick Enquiry)
  const { quantities, handleQuantityChange, clearCart } = useEnquiry();

  // Category Filter & Search State
  const [selectedCat, setSelectedCat] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');

  // Submitting / Success State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedEnquiryId, setSubmittedEnquiryId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');
  const [fireworksActive, setFireworksActive] = useState(false);

  const activeProducts = (products && products.length > 0 ? products : DEFAULT_PRODUCTS)
    .filter(p => p.active !== false);

  const activeCategories = (categories && categories.length > 0 ? categories : DEFAULT_CATEGORIES)
    .filter(c => c.active !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  // Filtered Products
  const filteredProducts = activeProducts.filter(p => {
    const matchesCat = selectedCat === 'All' || p.category?.toLowerCase() === selectedCat.toLowerCase();
    const matchesSearch = !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase()) || (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  // Group products by category for segregation
  const groupedProducts = activeCategories.map(cat => {
    const catProducts = filteredProducts.filter(p => p.category?.toLowerCase() === cat.name.toLowerCase());
    return {
      category: cat,
      products: catProducts
    };
  }).filter(group => group.products.length > 0);

  // Handle uncategorized items
  const categorizedProductIds = new Set(groupedProducts.flatMap(g => g.products.map(p => p.id)));
  const remainingProducts = filteredProducts.filter(p => !categorizedProductIds.has(p.id));
  if (remainingProducts.length > 0) {
    groupedProducts.push({
      category: { id: 'uncategorized', name: 'Other Fireworks', icon: '🎆', order: 99, description: 'Assorted fireworks category', active: true },
      products: remainingProducts
    });
  }

  // Cart items
  const cartItems: EnquiryItem[] = Object.entries(quantities)
    .map(([prodId, qty]) => {
      const p = activeProducts.find(item => item.id === prodId);
      if (!p || qty <= 0) return null;
      const mrp = p.original_price || Math.round(p.price / 0.45);
      return {
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.price,
        original_price: mrp,
        quantity: qty
      };
    })
    .filter(Boolean) as EnquiryItem[];

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalMrp = cartItems.reduce((acc, item) => acc + item.original_price * item.quantity, 0);
  const totalSavings = totalMrp - subtotal;

  // Coupon Logic
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discount_type === 'percent') {
      discountAmount = Math.round((subtotal * appliedCoupon.discount_value) / 100);
    } else {
      discountAmount = appliedCoupon.discount_value;
    }
  }

  const grandTotal = Math.max(0, subtotal - discountAmount);
  const minOrderVal = 2000;
  const minOrderProgress = Math.min(100, Math.round((grandTotal / minOrderVal) * 100));

  const handleApplyCoupon = () => {
    setCouponError('');
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code.');
      return;
    }
    const found = coupons.find(c => c.code.toUpperCase() === couponCode.trim().toUpperCase() && c.active !== false);
    if (!found) {
      setCouponError('Invalid or expired coupon code.');
      return;
    }
    if (subtotal < (found.min_cart_value || 0)) {
      setCouponError(`Minimum cart value of ₹${found.min_cart_value} required for this coupon.`);
      return;
    }
    setAppliedCoupon(found);
  };

  const handleSubmitEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (cartItems.length === 0) {
      setFormError('Please select at least 1 cracker product before submitting.');
      return;
    }

    if (grandTotal < minOrderVal) {
      setFormError(`Minimum order total is ₹${minOrderVal}. Please add more items to proceed.`);
      return;
    }

    const cleanName = sanitizeInput(customerName);
    const cleanPhone = sanitizeInput(phone);
    const cleanEmail = sanitizeInput(email);
    const cleanAddress = sanitizeInput(address);
    const cleanPincode = sanitizeInput(pincode);

    if (!cleanName) {
      setFormError('Please enter your full name.');
      return;
    }

    if (!validatePhone(cleanPhone)) {
      setFormError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!cleanEmail || !validateEmail(cleanEmail)) {
      setFormError('Please enter a valid email address (Required for confirmation PDF).');
      return;
    }

    if (cleanPincode && !validatePincode(cleanPincode)) {
      setFormError('Please enter a valid 6-digit Pincode.');
      return;
    }

    setIsSubmitting(true);
    try {
      const docId = await createEnquiry({
        name: cleanName,
        phone: cleanPhone,
        email: cleanEmail,
        address: cleanAddress,
        pincode: cleanPincode,
        coupon_code: appliedCoupon ? appliedCoupon.code : undefined,
        discount_amount: discountAmount > 0 ? discountAmount : undefined,
        items: cartItems,
        total_mrp: totalMrp,
        grand_total: grandTotal,
        status: 'Pending'
      });

      setSubmittedEnquiryId(docId);
      setFireworksActive(true);
      clearCart();
    } catch (err) {
      console.error('Submit enquiry error:', err);
      setFormError('Failed to record enquiry. Please try again or contact us directly on WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  if (loadingProd) return <BrandLoader message="Loading Sivakasi Wholesale Catalog..." />;

  return (
    <div className="min-h-screen bg-ink-950 text-paper-50 font-sans selection:bg-gold-400 selection:text-ink-950">
      {fireworksActive && <FireworksCanvas />}

      <AnnouncementBar />
      <Navbar />

      <main className="mx-auto max-w-[1400px] px-4 sm:px-8 py-10 sm:py-14 space-y-10">
        {/* Page Hero Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-paper-50/10 pb-8">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
              <Sparkles size={15} />
              <span>Direct Godown Ordering · PESO Certified</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold font-display text-paper-50 tracking-tight">
              Quick Wholesale <span className="text-gold-400 italic glow-gold">Enquiry</span>
            </h1>
            <p className="text-sm text-paper-300 font-normal leading-relaxed">
              Select items from our factory catalog below. Your estimated order list will be recorded and confirmed via official WhatsApp invoice.
            </p>
          </div>

          <a
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-paper-400 hover:text-gold-300 transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft size={16} />
            <span>Return to Homepage</span>
          </a>
        </div>

        {/* Submitted Success Banner View */}
        {submittedEnquiryId ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 sm:p-12 rounded-3xl bg-ink-900 border border-gold-400/40 text-center max-w-2xl mx-auto space-y-6 shadow-2xl"
          >
            <div className="w-16 h-16 rounded-full bg-gold-400/20 text-gold-400 flex items-center justify-center mx-auto border border-gold-400/40">
              <CheckCircle2 size={36} />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400 block">Enquiry Confirmed</span>
              <h2 className="text-3xl font-bold font-display text-paper-50">Wholesale Order Received!</h2>
              <p className="text-xs text-paper-300 font-normal leading-relaxed">
                Thank you, <span className="text-white font-semibold">{customerName}</span>. Your enquiry ref ID is{' '}
                <span className="text-gold-400 font-mono font-bold">#{submittedEnquiryId.slice(0, 8)}</span>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-ink-850 border border-paper-50/10 text-xs text-paper-300 space-y-1 text-left">
              <div className="flex justify-between"><span>Phone Number:</span> <span className="text-white font-semibold">{phone}</span></div>
              <div className="flex justify-between"><span>Net Payable:</span> <span className="text-gold-400 font-bold font-display">{formatCurrency(grandTotal)}</span></div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => {
                  setSubmittedEnquiryId(null);
                  setFireworksActive(false);
                }}
                className="px-8 py-3.5 rounded-full bg-gold-400 text-ink-950 font-bold text-xs uppercase tracking-wider shadow-md hover:bg-gold-300 transition-all cursor-pointer w-full sm:w-auto"
              >
                Place Another Wholesale Order
              </button>
            </div>
          </motion.div>
        ) : (
          /* Main 2-Column Ordering Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Category Pills & Segregated Product Cards Grid (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Search & Category Filter Pills Bar */}
              <div className="space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-paper-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search crackers by title or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-ink-900 border border-paper-50/10 text-paper-50 pl-11 pr-4 py-3 rounded-full text-xs font-normal outline-none focus:border-gold-400/60 placeholder:text-paper-400 transition-colors"
                  />
                </div>

                {/* Category Pills Slider */}
                <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1" role="tablist">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={selectedCat === 'All'}
                    onClick={() => setSelectedCat('All')}
                    className={`rounded-full px-4 py-2 text-xs font-semibold transition-all cursor-pointer shrink-0 border ${
                      selectedCat === 'All'
                        ? 'border-gold-400 bg-gold-400 text-ink-950 shadow-sm'
                        : 'border-paper-50/10 bg-ink-900/80 text-paper-300 hover:border-paper-50/25 hover:text-paper-100'
                    }`}
                  >
                    All Fireworks ({activeProducts.length})
                  </button>

                  {activeCategories.map((c) => {
                    const count = activeProducts.filter(p => p.category?.toLowerCase() === c.name.toLowerCase()).length;
                    if (count === 0) return null;
                    const isActive = selectedCat.toLowerCase() === c.name.toLowerCase();

                    return (
                      <button
                        key={c.id || c.name}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => setSelectedCat(c.name)}
                        className={`rounded-full px-4 py-2 text-xs font-semibold transition-all cursor-pointer shrink-0 border ${
                          isActive
                            ? 'border-gold-400 bg-gold-400 text-ink-950 shadow-sm'
                            : 'border-paper-50/10 bg-ink-900/80 text-paper-300 hover:border-paper-50/25 hover:text-paper-100'
                        }`}
                      >
                        <span>{c.name}</span>
                        <span className={isActive ? 'ml-1.5 opacity-80' : 'ml-1.5 opacity-50'}>({count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Segregated Category Groups */}
              <div className="space-y-8">
                {groupedProducts.map((group) => (
                  <div key={group.category.id || group.category.name} className="space-y-3">
                    {/* Category Title Header */}
                    <div className="flex items-center justify-between border-b border-paper-50/10 pb-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{group.category.icon || '🎆'}</span>
                        <h3 className="text-base font-bold font-display text-paper-100">
                          {group.category.name}
                        </h3>
                      </div>
                      <span className="text-[10px] font-semibold text-paper-400 uppercase tracking-wider">
                        {group.products.length} Products
                      </span>
                    </div>

                    {/* Products List under this Category */}
                    <div className="space-y-2.5">
                      {group.products.map((p) => {
                        const qty = quantities[p.id] || 0;
                        const mrp = p.original_price || Math.round(p.price / 0.45);
                        const savings = mrp - p.price;

                        return (
                          <div
                            key={p.id}
                            className={`p-3.5 rounded-2xl bg-ink-900 border transition-all flex items-center justify-between gap-4 ${
                              qty > 0 ? 'border-gold-400/50 bg-teal-900/15' : 'border-paper-50/10 hover:border-paper-50/20'
                            }`}
                          >
                            <div className="flex items-center gap-3.5 flex-1 min-w-0">
                              <img
                                src={p.image_url || '/crackers falls logo.webp'}
                                alt={p.name}
                                className={`w-14 h-14 rounded-xl border border-paper-50/10 shrink-0 ${
                                  p.image_url?.includes('logo') ? 'object-contain p-1 bg-ink-850' : 'object-cover'
                                }`}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/crackers falls logo.webp';
                                }}
                              />
                              <div className="min-w-0">
                                <span className="text-[10px] font-semibold text-gold-400 uppercase tracking-wider flex items-center gap-2">
                                  <span>{p.category} ({p.unit || 'Box'})</span>
                                </span>
                                <h4 className="text-sm font-semibold font-display text-paper-50 truncate">{p.name}</h4>
                                <div className="flex items-baseline gap-2 mt-0.5">
                                  <span className="text-sm font-semibold text-gold-400 font-display">{formatCurrency(p.price)}</span>
                                  <span className="text-xs text-paper-400 line-through">{formatCurrency(mrp)}</span>
                                  <span className="text-[10px] font-medium text-leaf-400">
                                    Save {formatCurrency(savings)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Quantity Controls Pill */}
                            <div className="flex items-center gap-2 shrink-0">
                              {qty > 0 ? (
                                <div className="flex items-center gap-2 bg-ink-850 border border-paper-50/15 rounded-full p-1">
                                  <button
                                    type="button"
                                    onClick={() => handleQuantityChange(p.id, -1)}
                                    className="h-7 w-7 rounded-full bg-ink-900 text-paper-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                                    aria-label="Decrease quantity"
                                  >
                                    <Minus size={13} />
                                  </button>
                                  <span className="w-5 text-center font-bold text-gold-400 text-xs font-display">{qty}</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setFormError('');
                                      handleQuantityChange(p.id, 1);
                                    }}
                                    className="h-7 w-7 rounded-full bg-gold-400 text-ink-950 flex items-center justify-center font-bold transition-transform hover:scale-105 cursor-pointer"
                                    aria-label="Increase quantity"
                                  >
                                    <Plus size={13} />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFormError('');
                                    handleQuantityChange(p.id, 1);
                                  }}
                                  className="h-9 px-4 rounded-full bg-ink-850 border border-paper-50/15 text-paper-200 hover:border-gold-400/50 hover:text-gold-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                                >
                                  <Plus size={14} />
                                  <span>Add</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Sticky Wholesale Cart & Summary Form (5 Cols) */}
            <div className="lg:col-span-5 sticky top-24 space-y-6">
              <div className="bg-ink-900 border border-paper-50/15 p-6 rounded-3xl space-y-5 shadow-2xl">
                {/* Cart Header */}
                <div className="flex items-center justify-between border-b border-paper-50/10 pb-4">
                  <div className="flex items-center gap-2.5">
                    <ShoppingBag size={18} className="text-gold-400" />
                    <h2 className="text-lg font-bold font-display text-paper-50">Wholesale Cart</h2>
                  </div>
                  <span className="text-xs font-semibold text-paper-300 bg-ink-850 px-3 py-1 rounded-full border border-paper-50/10">
                    {cartItems.length} Products Selected
                  </span>
                </div>

                {/* Minimum Order Limit Target Bar */}
                <div className="space-y-1.5 p-3.5 rounded-2xl bg-ink-850 border border-paper-50/10">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-paper-400">Minimum Order Target:</span>
                    <span className={grandTotal >= minOrderVal ? 'text-leaf-400 font-semibold' : 'text-gold-400 font-semibold'}>
                      {formatCurrency(grandTotal)} / {formatCurrency(minOrderVal)}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-ink-950 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        grandTotal >= minOrderVal ? 'bg-leaf-400' : 'bg-gold-400'
                      }`}
                      style={{ width: `${minOrderProgress}%` }}
                    />
                  </div>
                  {grandTotal < minOrderVal && (
                    <p className="text-[11px] text-paper-400">
                      Add ₹{(minOrderVal - grandTotal).toLocaleString()} more to reach minimum order limit.
                    </p>
                  )}
                </div>

                {/* Cart Items Selected List */}
                {cartItems.length > 0 ? (
                  <div className="space-y-2.5 max-h-44 overflow-y-auto pr-1 custom-scrollbar text-xs">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-2 border-b border-paper-50/5">
                        <div className="min-w-0 pr-2">
                          <p className="font-semibold text-paper-100 truncate">{item.name}</p>
                          <p className="text-[10px] text-paper-400">{item.quantity} x {formatCurrency(item.price)}</p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="font-semibold text-gold-400 font-display">{formatCurrency(item.price * item.quantity)}</span>
                          <button
                            onClick={() => handleQuantityChange(item.id, -item.quantity)}
                            className="text-paper-400 hover:text-crimson-400 cursor-pointer p-1 transition-colors"
                            title="Remove item"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center text-paper-400 text-xs space-y-1.5">
                    <ShoppingBag size={24} className="mx-auto text-paper-400/40" />
                    <p>No products selected yet. Click + Add on any item.</p>
                  </div>
                )}

                {/* Coupon Code Input */}
                <div className="space-y-2 pt-2 border-t border-paper-50/10">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 text-paper-400" size={14} />
                      <input
                        type="text"
                        placeholder="Coupon Code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="w-full bg-ink-850 border border-paper-50/15 text-white pl-9 pr-3 py-2.5 rounded-xl text-xs uppercase font-semibold outline-none placeholder:text-paper-400 focus:border-gold-400/60"
                      />
                    </div>
                    <button
                      onClick={handleApplyCoupon}
                      className="px-4 py-2.5 bg-ink-850 border border-paper-50/15 text-gold-400 hover:bg-gold-400 hover:text-ink-950 font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && <p className="text-[11px] text-crimson-400 font-medium">{couponError}</p>}
                  {appliedCoupon && (
                    <p className="text-[11px] text-leaf-400 font-medium flex items-center gap-1">
                      <Gift size={12} /> Applied Coupon: {appliedCoupon.code} (-₹{discountAmount})
                    </p>
                  )}
                </div>

                {/* Price Summary Breakdown */}
                <div className="p-4 rounded-2xl bg-ink-850 space-y-2 text-xs border border-paper-50/10">
                  <div className="flex justify-between text-paper-400">
                    <span>Total Printed MRP:</span>
                    <span className="line-through">{formatCurrency(totalMrp)}</span>
                  </div>
                  <div className="flex justify-between text-leaf-400 font-medium">
                    <span>Wholesale Savings (55% Off):</span>
                    <span>- {formatCurrency(totalSavings)}</span>
                  </div>
                  <div className="flex justify-between text-paper-200 font-medium border-t border-paper-50/5 pt-1.5">
                    <span>Wholesale Subtotal:</span>
                    <span className="text-white font-semibold">{formatCurrency(subtotal)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-leaf-400 font-medium">
                      <span>Coupon Discount ({appliedCoupon?.code}):</span>
                      <span>- {formatCurrency(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-3 border-t border-paper-50/15">
                    <div>
                      <span className="text-xs font-semibold text-paper-200 block">Amount to be Paid</span>
                      <span className="text-[10px] text-paper-400">Final Net Payable</span>
                    </div>
                    <span className="text-2xl font-bold font-display text-gold-400">
                      {formatCurrency(grandTotal)}
                    </span>
                  </div>
                </div>

                {/* Customer Information Checkout Form */}
                <form onSubmit={handleSubmitEnquiry} className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-paper-300 border-b border-paper-50/10 pb-2">
                    Customer Information
                  </h3>

                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Full Name *"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-ink-850 border border-paper-50/15 text-white px-3.5 py-2.5 rounded-xl text-xs outline-none focus:border-gold-400/60 placeholder:text-paper-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="tel"
                      required
                      placeholder="Mobile Phone (10 digits) *"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-ink-850 border border-paper-50/15 text-white px-3.5 py-2.5 rounded-xl text-xs outline-none focus:border-gold-400/60 placeholder:text-paper-400"
                    />
                    <input
                      type="email"
                      required
                      placeholder="Email Address *"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-ink-850 border border-paper-50/15 text-white px-3.5 py-2.5 rounded-xl text-xs outline-none focus:border-gold-400/60 placeholder:text-paper-400"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Delivery Address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="col-span-2 w-full bg-ink-850 border border-paper-50/15 text-white px-3.5 py-2.5 rounded-xl text-xs outline-none focus:border-gold-400/60 placeholder:text-paper-400"
                    />
                    <input
                      type="text"
                      placeholder="Pincode"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="w-full bg-ink-850 border border-paper-50/15 text-white px-3.5 py-2.5 rounded-xl text-xs outline-none focus:border-gold-400/60 placeholder:text-paper-400"
                    />
                  </div>

                  {formError && (
                    <div className="p-3 rounded-xl bg-crimson-500/10 border border-crimson-500/30 text-crimson-400 text-xs flex items-center gap-2">
                      <AlertCircle size={14} className="shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting || cartItems.length === 0}
                    className="w-full py-4 bg-gold-400 hover:bg-gold-300 text-ink-950 font-extrabold uppercase tracking-wider text-xs rounded-full shadow-ember transition-all cursor-pointer disabled:opacity-50 mt-2"
                  >
                    {isSubmitting ? 'Submitting Enquiry...' : 'Submit Wholesale Order'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export function QuickEnquiryPage() {
  return (
    <EnquiryProvider>
      <QuickEnquiryContent />
    </EnquiryProvider>
  );
}

export default QuickEnquiryPage;
