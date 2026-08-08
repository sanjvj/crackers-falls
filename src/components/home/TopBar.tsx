import React, { useState } from 'react';
import { Phone, Sparkles, MessageCircle, ShoppingBag, Menu, X, ArrowRight, ShieldCheck, Flame, UserCheck, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import type { MasterSettings } from '../../types';

interface TopBarProps {
  settings: MasterSettings;
}

export const TopBar: React.FC<TopBarProps> = ({ settings }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const handleHashClick = (hash: string) => {
    setMobileMenuOpen(false);
    if (window.location.pathname !== '/') {
      window.location.href = `/${hash}`;
    } else {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <>
      {/* Announcement Ticker Bar */}
      <div className="bg-[#0a0e14] text-slate-200 text-xs py-2 px-4 border-b border-white/10 relative z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-[11px] sm:text-xs truncate">
            <Sparkles size={14} className="text-amber-400 shrink-0" />
            <span className="truncate">
              {settings.top_bar_notice || '🎆 Direct Sivakasi Wholesale Fireworks — 2026 Festive Season Booking Open! Up to 60% OFF!'}
            </span>
          </div>

          <div className="hidden md:flex items-center gap-5 text-[11px] font-semibold text-slate-300 shrink-0">
            <span className="flex items-center gap-1.5 text-slate-300">
              <ShieldCheck size={13} className="text-emerald-400" />
              <span>100% Genuine Sivakasi Quality</span>
            </span>
            <a
              href={`tel:${settings.phone_number || '+919159038240'}`}
              className="flex items-center gap-1.5 text-slate-300 hover:text-amber-400 transition-colors"
            >
              <Phone size={12} className="text-emerald-400" />
              <span>{settings.phone_number || '+91 9159038240'}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header className="sticky top-0 z-40 bg-[#0d1117]/90 backdrop-blur-md border-b border-white/10 shadow-xl transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <a href="/" className="flex items-center gap-3.5 group">
            <img
              src="/crackers falls logo.webp"
              alt="Crackers Falls"
              className="h-12 w-auto object-contain transform group-hover:scale-105 transition-transform"
            />
            <div>
              <div className="text-xl font-black font-display tracking-tight text-white group-hover:text-amber-400 transition-colors">
                CRACKERS FALLS
              </div>
              <div className="font-tamil text-[11px] font-bold text-amber-400 tracking-wide -mt-0.5">
                பட்டாசு அருவி — Sivakasi Direct
              </div>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-slate-300">
            <a href="/" className="hover:text-amber-400 transition-colors">Home</a>
            <a href="/quick-enquiry" className="hover:text-amber-400 transition-colors flex items-center gap-1 text-amber-400">
              <Flame size={14} className="text-amber-400" />
              <span>Quick Wholesale Enquiry</span>
            </a>
            <button
              onClick={() => handleHashClick('#why-choose-us')}
              className="hover:text-amber-400 transition-colors cursor-pointer bg-transparent border-0 p-0 text-xs font-bold uppercase tracking-wider text-slate-300"
            >
              Why Choose Us
            </button>
            <button
              onClick={() => handleHashClick('#testimonials')}
              className="hover:text-amber-400 transition-colors cursor-pointer bg-transparent border-0 p-0 text-xs font-bold uppercase tracking-wider text-slate-300"
            >
              Reviews
            </button>
            <a href="/admin" className="hover:text-white transition-colors text-slate-400 flex items-center gap-1">
              <UserCheck size={13} />
              <span>Admin Login</span>
            </a>
          </nav>

          {/* Action CTAs & Light/Dark Theme Switcher */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-amber-400 border border-white/10 transition-all cursor-pointer flex items-center gap-1.5"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} className="text-indigo-600" />}
              <span className="hidden sm:inline text-[11px] font-bold uppercase tracking-wider">
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </span>
            </button>

            <a
              href={`https://wa.me/${settings.whatsapp_number || '919159038240'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex px-4 py-2.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 font-bold text-xs items-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <MessageCircle size={16} className="text-emerald-400" />
              <span>WhatsApp</span>
            </a>

            <a
              href="/quick-enquiry"
              className="hidden sm:flex px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg items-center gap-2 transition-all cursor-pointer"
            >
              <ShoppingBag size={16} />
              <span>Quick Order</span>
            </a>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0d1117] border-b border-white/10 p-6 space-y-4 text-sm font-bold animate-fadeIn">
            <a
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-slate-200 hover:text-amber-400 py-2 border-b border-white/5"
            >
              Home Page
            </a>
            <a
              href="/quick-enquiry"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-amber-400 font-black py-2 border-b border-white/5 flex items-center justify-between"
            >
              <span>Quick Wholesale Enquiry Catalog</span>
              <ArrowRight size={16} />
            </a>
            <button
              onClick={() => handleHashClick('#why-choose-us')}
              className="block w-full text-left text-slate-200 hover:text-amber-400 py-2 border-b border-white/5 font-bold"
            >
              Why Choose Us
            </button>
            <button
              onClick={() => handleHashClick('#testimonials')}
              className="block w-full text-left text-slate-200 hover:text-amber-400 py-2 border-b border-white/5 font-bold"
            >
              Customer Reviews
            </button>
            <a
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-slate-300 hover:text-white py-2"
            >
              Admin Dashboard Login
            </a>

            <div className="pt-2 flex flex-col gap-3">
              <a
                href="/quick-enquiry"
                className="w-full py-3.5 bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl text-center shadow-lg"
              >
                Start Quick Wholesale Order
              </a>
              <a
                href={`https://wa.me/${settings.whatsapp_number || '919159038240'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold text-xs uppercase tracking-wider rounded-xl text-center flex items-center justify-center gap-2"
              >
                <MessageCircle size={16} />
                <span>Order via WhatsApp Direct</span>
              </a>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
