import React, { useState } from 'react';
import { Mail, ShieldCheck, ArrowLeft, Key, Sparkles } from 'lucide-react';
import { useAdminAuth } from '../hooks/useAuth';
import { useFirestoreCollection, useSiteContent } from '../hooks/useFirestore';
import {
  DEFAULT_HERO_SLIDES,
  DEFAULT_WHY_CHOOSE_US,
  DEFAULT_FOOTER_SETTINGS,
  DEFAULT_MASTER_SETTINGS
} from '../lib/firestore';
import type {
  Product,
  CategoryItem,
  Enquiry,
  Testimonial,
  Coupon,
  HeroSlide,
  WhyChooseUsCard,
  FooterSettings,
  MasterSettings
} from '../types';

// Admin Tab Components
import AdminLayout from '../components/admin/AdminLayout';
import DashboardPage from '../components/admin/DashboardPage';
import ProductsPage from '../components/admin/ProductsPage';
import CategoriesPage from '../components/admin/CategoriesPage';
import EnquiriesPage from '../components/admin/EnquiriesPage';
import TestimonialsPage from '../components/admin/TestimonialsPage';
import CouponsPage from '../components/admin/CouponsPage';
import MasterSettingsPage from '../components/admin/MasterSettingsPage';
import RevenueDashboardPage from '../components/admin/RevenueDashboardPage';
import ReportsPage from '../components/admin/ReportsPage';
import ExportDataPage from '../components/admin/ExportDataPage';
import UsersRolesPage from '../components/admin/UsersRolesPage';
import ActivityLogsPage from '../components/admin/ActivityLogsPage';
import InventoryPage from '../components/admin/InventoryPage';
import SalesOrdersPage from '../components/admin/SalesOrdersPage';
import AlertsPage from '../components/admin/AlertsPage';
import PosBillingPage from '../components/admin/PosBillingPage';
import VendorsPage from '../components/admin/VendorsPage';
import { BrandLoader } from '../components/BrandLoader';

export const AdminPanel: React.FC = () => {
  const { user, isAdmin, role, loading: authLoading, error: authError, loginAdmin, logoutAdmin } = useAdminAuth();

  // Tab State
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Form Login State
  const [email, setEmail] = useState('ajsolutionsmd@gmail.com');
  const [password, setPassword] = useState('admin123');
  const [loginSubmitting, setLoginSubmitting] = useState(false);
  const [localErr, setLocalErr] = useState('');

  // Firestore Subscriptions
  const { data: products } = useFirestoreCollection<Product>('products');
  const { data: categories } = useFirestoreCollection<CategoryItem>('categories');
  const { data: enquiries } = useFirestoreCollection<Enquiry>('enquiries');
  const { data: testimonials } = useFirestoreCollection<Testimonial>('testimonials');
  const { data: coupons } = useFirestoreCollection<Coupon>('coupons');

  const { content: heroSlides } = useSiteContent<HeroSlide[]>('hero_slides', DEFAULT_HERO_SLIDES);
  const { content: whyChooseUs } = useSiteContent<WhyChooseUsCard[]>('why_choose_us', DEFAULT_WHY_CHOOSE_US);
  const { content: footerSettings } = useSiteContent<FooterSettings>('footer', DEFAULT_FOOTER_SETTINGS);
  const { content: masterSettings } = useSiteContent<MasterSettings>('master_settings', DEFAULT_MASTER_SETTINGS);

  const handleLoginSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLocalErr('');
    setLoginSubmitting(true);
    await loginAdmin(email, password);
    setLoginSubmitting(false);
  };

  if (authLoading) {
    return <BrandLoader variant="fullscreen" message="Accessing Crackers Falls Admin Portal..." />;
  }

  // Login View if not authenticated
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-night-950 flex items-center justify-center p-4 font-sans relative overflow-hidden text-ember-50">
        <div className="night-grain absolute inset-0 opacity-40 pointer-events-none" />

        <div className="w-full max-w-md bg-night-900 border border-white/10 p-8 sm:p-10 rounded-3xl space-y-6 shadow-ember relative z-10">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-ember-100/60 hover:text-gold-300 transition-colors mb-2"
          >
            <ArrowLeft size={14} />
            <span>Return to Storefront</span>
          </a>

          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center space-y-2">
            <img
              src="/crackers falls logo.webp"
              alt="Crackers Falls"
              className="h-16 object-contain drop-shadow"
            />
            <h1 className="text-2xl font-extrabold font-display text-fire tracking-tight uppercase">
              Admin Control Panel
            </h1>
            <p className="text-xs text-ember-100/60 font-sans">
              Crackers Falls (பட்டாசு அருவி) — Store Manager Access
            </p>
          </div>

          {(localErr || authError) && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/30 text-red-300 text-xs rounded-xl font-semibold">
              {localErr || authError}
            </div>
          )}

          {/* Demo Login Button */}
          <button
            onClick={() => handleLoginSubmit()}
            disabled={loginSubmitting}
            className="w-full py-3 bg-gradient-to-r from-gold-400 to-ember-500 hover:from-gold-300 hover:to-ember-400 text-night-950 font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-ember cursor-pointer flex items-center justify-center gap-2"
          >
            <Sparkles size={16} />
            <span>{loginSubmitting ? 'Signing In...' : 'Quick Manager Sign In (Demo)'}</span>
          </button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-white/10" />
            <span className="flex-shrink mx-3 text-[10px] text-ember-100/40 uppercase tracking-widest font-bold">
              Or Sign In With Email
            </span>
            <div className="flex-grow border-t border-white/10" />
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-ember-100/70 font-bold mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ember-100/40" size={16} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-night-850 border border-white/10 text-white pl-10 pr-4 py-2.5 rounded-xl outline-none focus:border-gold-400 font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-ember-100/70 font-bold mb-1">Password</label>
              <div className="relative">
                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ember-100/40" size={16} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-night-850 border border-white/10 text-white pl-10 pr-4 py-2.5 rounded-xl outline-none focus:border-gold-400 font-semibold"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loginSubmitting}
              className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold uppercase tracking-wider rounded-xl cursor-pointer"
            >
              Log In
            </button>
          </form>

          <div className="pt-2 text-center text-[10px] text-ember-100/40 font-semibold flex items-center justify-center gap-1.5">
            <ShieldCheck size={13} className="text-peacock-400" />
            <span>Encrypted Firestore Authentication</span>
          </div>
        </div>
      </div>
    );
  }

  // Active Admin View
  return (
    <AdminLayout
      user={user}
      role={role || undefined}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      logoutAdmin={logoutAdmin}
      pendingCount={enquiries.filter(e => e.status === 'Pending').length}
    >
      {activeTab === 'dashboard' && (
        <DashboardPage
          products={products}
          categories={categories}
          onNavigateTab={setActiveTab}
        />
      )}
      {activeTab === 'products' && (
        <ProductsPage products={products} categories={categories} />
      )}
      {activeTab === 'inventory' && (
        <InventoryPage products={products} categories={categories} />
      )}
      {activeTab === 'pos' && (
        <PosBillingPage products={products} />
      )}
      {activeTab === 'sales_orders' && (
        <SalesOrdersPage products={products} />
      )}
      {activeTab === 'alerts' && (
        <AlertsPage products={products} />
      )}
      {activeTab === 'vendors' && (
        <VendorsPage />
      )}
      {activeTab === 'categories' && (
        <CategoriesPage categories={categories} />
      )}
      {activeTab === 'enquiries' && (
        <EnquiriesPage enquiries={enquiries} />
      )}
      {activeTab === 'testimonials' && (
        <TestimonialsPage testimonials={testimonials} />
      )}
      {activeTab === 'coupons' && (
        <CouponsPage coupons={coupons} />
      )}
      {activeTab === 'settings' && (
        <MasterSettingsPage
          heroSlides={heroSlides}
          whyChooseUs={whyChooseUs}
          footerSettings={footerSettings}
          masterSettings={masterSettings}
        />
      )}
      {activeTab === 'revenue' && (
        <RevenueDashboardPage enquiries={enquiries} products={products} />
      )}
      {activeTab === 'reports' && (
        <ReportsPage enquiries={enquiries} products={products} />
      )}
      {activeTab === 'export' && (
        <ExportDataPage enquiries={enquiries} products={products} categories={categories} coupons={coupons} />
      )}
      {activeTab === 'users' && (
        <UsersRolesPage adminEmail={user?.email || 'admin@crackersfalls.in'} />
      )}
      {activeTab === 'logs' && (
        <ActivityLogsPage />
      )}
    </AdminLayout>
  );
};

export default AdminPanel;
