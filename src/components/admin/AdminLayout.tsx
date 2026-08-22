import React, { useState } from 'react';
import {
  Home,
  Package,
  FolderPlus,
  Tag,
  MessageSquare,
  TrendingUp,
  Settings,
  ExternalLink,
  LogOut,
  FileText,
  Download,
  Users,
  Clock,
  Menu,
  X,
  Award,
  Warehouse,
  ShoppingBag,
  AlertTriangle,
  Zap,
  Building2,
  Sun,
  Moon
} from 'lucide-react';

interface AdminLayoutProps {
  user?: any;
  role?: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  counts?: {
    products?: number;
    categories?: number;
    enquiries?: number;
    coupons?: number;
  };
  pendingCount?: number;
  adminEmail?: string;
  adminRole?: string;
  logoutAdmin?: () => void;
  onLogout?: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  user,
  role,
  activeTab,
  setActiveTab,
  counts = { products: 0, categories: 0, enquiries: 0, coupons: 0 },
  pendingCount = 0,
  adminEmail,
  adminRole,
  logoutAdmin,
  onLogout,
  children
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('cf_admin_theme') as 'dark' | 'light') || 'dark';
    }
    return 'dark';
  });

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cf_admin_theme', nextTheme);
    }
  };

  const displayEmail = adminEmail || user?.email || 'admin@crackersfalls.in';
  const displayRole = adminRole || role || 'Super Admin';
  const handleLogout = onLogout || logoutAdmin || (() => window.location.reload());

  interface NavItem {
    id: string;
    label: string;
    icon: React.FC<{ size?: number; className?: string }>;
    count?: number;
    badge?: string;
  }

  const navGroups: { title: string; items: NavItem[] }[] = [
    {
      title: 'CATALOG',
      items: [
        { id: 'products', label: 'Products', icon: Package, count: counts.products },
        { id: 'categories', label: 'Categories', icon: FolderPlus, count: counts.categories },
        { id: 'coupons', label: 'Coupons', icon: Tag, count: counts.coupons }
      ]
    },
    {
      title: 'ANALYTICS',
      items: [
        { id: 'revenue', label: 'Revenue Dashboard', icon: TrendingUp, badge: 'Analytics' },
        { id: 'reports', label: 'Reports Overview', icon: FileText },
        { id: 'export', label: 'Export Data', icon: Download }
      ]
    },
    {
      title: 'OPERATIONS',
      items: [
        { id: 'pos', label: 'Counter POS Billing', icon: Zap, badge: 'POS' },
        { id: 'sales_orders', label: 'Sales Orders Pipeline', icon: ShoppingBag, badge: 'Orders' },
        { id: 'alerts', label: 'Low Stock Alerts', icon: AlertTriangle, badge: 'Alerts' },
        { id: 'inventory', label: 'Inventory & Stock', icon: Warehouse, badge: 'Stock' },
        { id: 'vendors', label: 'Vendor Management', icon: Building2, badge: 'Suppliers' },
        { id: 'enquiries', label: 'Enquiries / Orders', icon: MessageSquare, count: pendingCount || counts.enquiries },
        { id: 'testimonials', label: 'Customer Reviews', icon: Award }
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { id: 'settings', label: 'Site Content & CMS', icon: Settings },
        { id: 'users', label: 'Users & Roles', icon: Users },
        { id: 'activity', label: 'Activity Logs', icon: Clock }
      ]
    }
  ];

  return (
    <div className={`flex h-screen overflow-hidden font-sans selection:bg-gold-400 selection:text-ink-950 ${
      theme === 'light' ? 'admin-light-theme bg-slate-100 text-slate-900' : 'bg-ink-950 text-paper-50'
    }`}>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[270px] ${
          theme === 'light' ? 'bg-slate-900 border-r border-slate-700 text-white' : 'bg-ink-900 border-r border-paper-50/10 text-white'
        } flex flex-col transform transition-transform duration-300 lg:relative lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-paper-50/10">
          <div className="flex items-center gap-3">
            <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-gold-400/40 bg-teal-900">
              <img
                src="https://cdn.magicpatterns.com/uploads/aecqRUdxkvo1WGGYnaiUPC/image.png"
                alt=""
                className="h-full w-full scale-[1.6] object-cover object-[50%_38%]"
              />
            </span>
            <div>
              <h1 className="text-base font-bold font-display text-gold-400 leading-none">CRACKERS FALLS</h1>
              <p className="text-[10px] text-paper-500 font-bold uppercase tracking-wider mt-1">Sivakasi Admin Desk</p>
            </div>
          </div>
          <button className="lg:hidden text-paper-500 hover:text-white cursor-pointer" onClick={() => setMobileOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-5 custom-scrollbar">
          <button
            onClick={() => {
              setActiveTab('dashboard');
              setMobileOpen(false);
            }}
            className={`w-full flex items-center px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-gold-400 text-ink-950 font-extrabold shadow-ember'
                : 'text-paper-300 hover:bg-paper-50/5 hover:text-gold-300'
            }`}
          >
            <Home size={16} className="mr-3" />
            <span className="font-display font-bold text-sm">Dashboard Overview</span>
          </button>

          {navGroups.map((group, idx) => (
            <div key={idx} className="space-y-1">
              <h2 className="px-3.5 text-[10px] font-bold text-gold-400/80 uppercase tracking-widest mb-2">
                {group.title}
              </h2>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileOpen(false);
                    }}
                    className={`w-full flex items-center px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-gold-400 text-ink-950 font-extrabold shadow-ember'
                        : 'text-paper-300/80 hover:bg-paper-50/5 hover:text-gold-300'
                    }`}
                  >
                    <Icon size={16} className="mr-3 shrink-0" />
                    <span className="flex-1 text-left truncate">{item.label}</span>
                    {item.count !== undefined && item.count > 0 && (
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-ink-950 text-gold-300' : 'bg-paper-50/10 text-gold-300'
                      }`}>
                        {item.count}
                      </span>
                    )}
                    {item.badge && (
                      <span className="ml-2 bg-leaf-400/20 text-leaf-400 border border-leaf-400/40 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-paper-50/10 bg-ink-950">
          <div className="flex items-center justify-between text-xs">
            <div className="min-w-0 pr-2">
              <div className="font-bold text-white truncate max-w-[150px]">{displayEmail}</div>
              <div className="text-[10px] text-gold-400 font-semibold uppercase">{displayRole}</div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-crimson-500/20 text-crimson-400 hover:bg-crimson-500 hover:text-white transition-colors cursor-pointer shrink-0"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Bar Header */}
        <header className={`${
          theme === 'light' ? 'bg-white border-b border-slate-200 text-slate-900 shadow-sm' : 'bg-ink-900 border-b border-paper-50/10 text-white'
        } h-16 flex items-center justify-between px-4 sm:px-6 shrink-0`}>
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-paper-300 cursor-pointer" onClick={() => setMobileOpen(true)}>
              <Menu size={22} />
            </button>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 text-xs font-bold ${
                theme === 'light'
                  ? 'text-amber-700 bg-amber-50 border border-amber-300/80 hover:bg-amber-100'
                  : 'text-gold-400 bg-ink-850 border border-gold-400/30 hover:bg-gold-400 hover:text-ink-950'
              } rounded-full px-4 py-2 transition-all cursor-pointer shadow-sm`}
            >
              <ExternalLink size={14} />
              <span>View Live Website</span>
            </a>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold">
            {/* Theme Switcher Toggle */}
            <button
              onClick={toggleTheme}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border shadow-sm ${
                theme === 'light'
                  ? 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
                  : 'bg-ink-850 text-gold-300 border-gold-400/30 hover:bg-gold-400/20'
              }`}
              title="Switch Admin Theme (Light / Dark)"
            >
              {theme === 'light' ? (
                <>
                  <Sun size={15} className="text-amber-500 shrink-0" />
                  <span>Light Theme</span>
                </>
              ) : (
                <>
                  <Moon size={15} className="text-gold-400 shrink-0" />
                  <span>Dark Theme</span>
                </>
              )}
            </button>

            <div className={`hidden sm:flex items-center gap-2 ${
              theme === 'light'
                ? 'text-emerald-700 bg-emerald-50 border border-emerald-300'
                : 'text-leaf-400 bg-teal-900/30 border border-leaf-400/30'
            } px-3.5 py-1.5 rounded-full`}>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Sivakasi Direct Admin Control</span>
            </div>
          </div>
        </header>

        {/* Content View */}
        <main className={`flex-1 overflow-y-auto p-4 sm:p-6 ${
          theme === 'light' ? 'bg-slate-100 text-slate-900' : 'bg-ink-950 text-paper-50'
        } custom-scrollbar`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
