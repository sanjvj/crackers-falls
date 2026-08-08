import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, MessageCircle, Mail, Clock, ArrowLeft, Send } from 'lucide-react';
import { AnnouncementBar } from '../components/AnnouncementBar';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { BrandLoader } from '../components/BrandLoader';
import { fetchPageContent, DEFAULT_CONTACT_PAGE } from '../lib/firestore';
import type { ContactPageContent } from '../types';

export function ContactPage() {
  const [content, setContent] = useState<ContactPageContent>(DEFAULT_CONTACT_PAGE);
  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchPageContent<ContactPageContent>('contact', DEFAULT_CONTACT_PAGE)
      .then((data) => setContent(data))
      .finally(() => setLoading(false));
  }, []);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    let waText = `*NEW CONTACT INQUIRY - CRACKERS FALLS*\n`;
    waText += `*Name:* ${name}\n`;
    waText += `*Phone:* ${phone}\n`;
    if (message) waText += `*Message:* ${message}\n`;

    const encoded = `https://wa.me/919159038240?text=${encodeURIComponent(waText)}`;
    setSubmitted(true);
    setTimeout(() => {
      window.open(encoded, '_blank');
    }, 600);
  };

  if (loading) {
    return <BrandLoader variant="fullscreen" message="Loading Contact Details..." />;
  }

  return (
    <div className="min-h-screen bg-ink-950 text-paper-50 font-sans antialiased selection:bg-gold-400 selection:text-ink-950">
      <AnnouncementBar />
      <Navbar />

      <main className="py-12 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto space-y-12">
        {/* Header Section */}
        <div className="max-w-3xl space-y-4">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-paper-300/80 hover:text-gold-300 transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Back to Home</span>
          </a>
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.28em] text-paper-500">
            <span className="h-2 w-2 rounded-full bg-gold-400 animate-pulse" />
            {content.eyebrow}
          </p>
          <h1 className="text-3xl sm:text-5xl font-bold font-display uppercase tracking-tight text-paper-50">
            {content.title}
          </h1>
          <p className="text-sm sm:text-base leading-relaxed text-paper-300/80 font-sans">
            {content.description}
          </p>
        </div>

        {/* Contact Info Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl bg-ink-900 border border-paper-50/10 space-y-3 shadow-xl">
            <div className="w-10 h-10 rounded-2xl bg-gold-400/10 text-gold-400 flex items-center justify-center font-bold">
              <MapPin size={20} />
            </div>
            <h3 className="font-bold font-display text-gold-400 text-sm uppercase">Sivakasi Godown Address</h3>
            <p className="text-xs text-paper-300/80 leading-relaxed font-sans">{content.address}</p>
          </div>

          <div className="p-6 rounded-3xl bg-ink-900 border border-paper-50/10 space-y-3 shadow-xl">
            <div className="w-10 h-10 rounded-2xl bg-leaf-400/10 text-leaf-400 flex items-center justify-center font-bold">
              <Phone size={20} />
            </div>
            <h3 className="font-bold font-display text-gold-400 text-sm uppercase">Direct Call Desk</h3>
            <a href={`tel:${content.phone.replace(/\s/g, '')}`} className="block text-xs font-bold text-white hover:text-gold-300">
              {content.phone}
            </a>
            <p className="text-[11px] text-paper-500 font-sans">Direct line to Sivakasi Godown Manager</p>
          </div>

          <div className="p-6 rounded-3xl bg-ink-900 border border-paper-50/10 space-y-3 shadow-xl">
            <div className="w-10 h-10 rounded-2xl bg-leaf-400/10 text-leaf-400 flex items-center justify-center font-bold">
              <MessageCircle size={20} />
            </div>
            <h3 className="font-bold font-display text-gold-400 text-sm uppercase">WhatsApp Support Desk</h3>
            <a href={content.whatsapp} target="_blank" rel="noreferrer" className="block text-xs font-bold text-leaf-400 hover:underline">
              Open WhatsApp Chat →
            </a>
            <p className="text-[11px] text-paper-500 font-sans">Quick reply for wholesale rates</p>
          </div>

          <div className="p-6 rounded-3xl bg-ink-900 border border-paper-50/10 space-y-3 shadow-xl">
            <div className="w-10 h-10 rounded-2xl bg-gold-400/10 text-gold-400 flex items-center justify-center font-bold">
              <Clock size={20} />
            </div>
            <h3 className="font-bold font-display text-gold-400 text-sm uppercase">Business Hours</h3>
            <p className="text-xs text-paper-300/80 leading-relaxed font-sans">{content.hours}</p>
          </div>
        </div>

        {/* Interactive Form & Map Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Send Direct Message Form (7 cols) */}
          <div className="lg:col-span-7 bg-ink-900 p-8 rounded-3xl border border-paper-50/10 shadow-xl space-y-6">
            <div>
              <h2 className="text-2xl font-bold font-display text-white">Send Direct Message to Godown Desk</h2>
              <p className="text-xs text-paper-500 mt-1 font-sans">Fill out the form below to send an instant order query via WhatsApp.</p>
            </div>

            {submitted ? (
              <div className="p-6 rounded-2xl bg-leaf-400/20 border border-leaf-400/30 text-center space-y-2">
                <h4 className="text-lg font-bold font-display text-leaf-400">Message Redirected to WhatsApp!</h4>
                <p className="text-xs text-paper-300">Our Sivakasi representative will assist you with pricing and packing options.</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-paper-500 mb-1.5">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-ink-850 border border-paper-50/15 text-white px-4 py-3 rounded-xl text-xs font-semibold outline-none focus:border-gold-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-paper-500 mb-1.5">Mobile Phone (10 Digits) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="Enter 10-digit mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-ink-850 border border-paper-50/15 text-white px-4 py-3 rounded-xl text-xs font-semibold outline-none focus:border-gold-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-paper-500 mb-1.5">Message / Inquiry Details</label>
                  <textarea
                    rows={4}
                    placeholder="Specify box quantities, delivery city, or custom packing requests..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-ink-850 border border-paper-50/15 text-white px-4 py-3 rounded-xl text-xs font-semibold outline-none focus:border-gold-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-gold-400 hover:bg-gold-300 text-ink-950 font-extrabold text-xs uppercase tracking-wider rounded-full shadow-ember transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send size={16} />
                  <span>Send Query via WhatsApp Desk</span>
                </button>
              </form>
            )}
          </div>

          {/* Email Support Card (5 cols) */}
          <div className="lg:col-span-5 bg-ink-900 p-8 rounded-3xl border border-gold-400/30 shadow-xl space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-gold-400 text-ink-950 flex items-center justify-center font-bold">
                <Mail size={24} />
              </div>
              <h3 className="text-2xl font-bold font-display text-paper-50">Email Support Desk</h3>
              <p className="text-xs leading-relaxed text-paper-300/80 font-sans">
                Prefer email communication for bulk corporate Diwali orders or GST invoice inquiries? Write to us directly:
              </p>
              <a
                href={`mailto:${content.email}`}
                className="inline-block font-display text-lg font-bold text-gold-400 hover:underline"
              >
                {content.email}
              </a>
            </div>

            <div className="p-5 rounded-2xl bg-teal-900/30 border border-paper-50/10 space-y-2">
              <span className="block text-xs font-bold text-leaf-400">Direct Factory Assurance</span>
              <p className="text-[11px] text-paper-500 leading-relaxed">
                All inquiries received during working hours (8:00 AM – 10:00 PM IST) are answered within 15 minutes by our Sivakasi godown team.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default ContactPage;
