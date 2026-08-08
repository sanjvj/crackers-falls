import React from 'react';
import { Phone, Mail, MapPin, Clock, MessageCircle, ShieldCheck, Flame } from 'lucide-react';
import type { FooterSettings, MasterSettings } from '../../types';

interface FooterProps {
  footer: FooterSettings;
  settings: MasterSettings;
}

export const Footer: React.FC<FooterProps> = ({ footer, settings }) => {
  return (
    <footer className="bg-[#0a0e14] text-slate-300 font-sans border-t border-white/10 relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/crackers falls logo.webp"
                alt="Crackers Falls Logo"
                className="h-14 object-contain"
              />
              <div>
                <h3 className="text-lg font-black font-display text-white tracking-tight">
                  CRACKERS FALLS
                </h3>
                <p className="font-tamil text-amber-400 font-bold text-xs">
                  {footer.tamil_tagline || 'பட்டாசு அருவி — Sivakasi'}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {footer.about_text || 'Authentic Sivakasi wholesale fireworks direct factory pricing with safe moisture-proof packed transport.'}
            </p>

            <div className="p-3 rounded-xl bg-[#161b22] border border-white/10 text-amber-400 text-xs font-bold flex items-center gap-2">
              <Flame size={15} className="text-amber-400 shrink-0" />
              <span>{footer.min_order_note || 'Minimum Wholesale Order: ₹2,000 across India'}</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold font-display text-white uppercase tracking-wider border-b border-white/10 pb-2">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li>
                <a href="/" className="hover:text-amber-400 transition-colors">
                  Home Page
                </a>
              </li>
              <li>
                <a href="/quick-enquiry" className="hover:text-amber-400 transition-colors text-amber-400">
                  Quick Wholesale Order Form
                </a>
              </li>
              <li>
                <a href="/#why-choose-us" className="hover:text-amber-400 transition-colors">
                  Why Choose Us
                </a>
              </li>
              <li>
                <a href="/#testimonials" className="hover:text-amber-400 transition-colors">
                  Customer Reviews
                </a>
              </li>
              <li>
                <a href="/admin" className="hover:text-white transition-colors text-slate-400">
                  Admin Portal Login
                </a>
              </li>
            </ul>
          </div>

          {/* Business Hours */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold font-display text-white uppercase tracking-wider border-b border-white/10 pb-2">
              Operating Hours
            </h4>
            <div className="flex items-start gap-3 text-xs">
              <Clock size={16} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">Wholesale Order Support</p>
                <p className="text-slate-400 mt-0.5">{footer.business_hours || 'Mon - Sun: 8:00 AM - 10:00 PM'}</p>
                <p className="text-[11px] text-emerald-400 mt-2 font-bold flex items-center gap-1">
                  <ShieldCheck size={13} />
                  <span>Direct Sivakasi Dispatch Active</span>
                </p>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold font-display text-white uppercase tracking-wider border-b border-white/10 pb-2">
              Sivakasi Contact Details
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-start gap-2.5">
                <MapPin size={16} className="text-amber-400 shrink-0 mt-0.5" />
                <span className="text-slate-300">{footer.address || 'Sivakasi Fireworks Hub, Tamil Nadu, India'}</span>
              </li>

              <li className="flex items-center gap-2.5">
                <Phone size={16} className="text-emerald-400 shrink-0" />
                <a href={`tel:${footer.phone || '+919159038240'}`} className="hover:text-amber-400 font-semibold transition-colors">
                  {footer.phone || '+91 9159038240'}
                </a>
              </li>

              <li className="flex items-center gap-2.5">
                <MessageCircle size={16} className="text-emerald-400 shrink-0" />
                <a
                  href={`https://wa.me/${settings.whatsapp_number || '919159038240'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-300 text-emerald-400 font-bold transition-colors"
                >
                  WhatsApp: +91 {settings.whatsapp_number || '9159038240'}
                </a>
              </li>

              <li className="flex items-center gap-2.5">
                <Mail size={16} className="text-amber-400 shrink-0" />
                <a href={`mailto:${footer.email || 'support@crackersfalls.in'}`} className="hover:text-amber-400 transition-colors">
                  {footer.email || 'support@crackersfalls.in'}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4 text-center sm:text-left">
          <p>© {new Date().getFullYear()} Crackers Falls (பட்டாசு அருவி). All Rights Reserved.</p>
          <div className="flex items-center gap-2 text-[11px] text-amber-400 font-semibold">
            <ShieldCheck size={13} className="text-emerald-400" />
            <span>Direct Sivakasi Wholesale Certified</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
