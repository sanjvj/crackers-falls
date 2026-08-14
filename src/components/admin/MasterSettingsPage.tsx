import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle } from 'lucide-react';
import {
  saveSiteContentDoc,
  fetchPageContent,
  savePageContent,
  DEFAULT_SAFETY_TIPS_PAGE,
  DEFAULT_ABOUT_PAGE,
  DEFAULT_CONTACT_PAGE
} from '../../lib/firestore';
import type {
  HeroSlide,
  WhyChooseUsCard,
  FooterSettings,
  MasterSettings,
  SafetyTipsContent,
  AboutPageContent,
  ContactPageContent
} from '../../types';

interface MasterSettingsPageProps {
  heroSlides: HeroSlide[];
  whyChooseUs: WhyChooseUsCard[];
  footerSettings: FooterSettings;
  masterSettings: MasterSettings;
}

export const MasterSettingsPage: React.FC<MasterSettingsPageProps> = ({
  heroSlides,
  whyChooseUs,
  footerSettings,
  masterSettings
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'master' | 'safety' | 'about' | 'contact' | 'hero' | 'why' | 'footer'>('master');

  // Local editable states
  const [mSettings, setMSettings] = useState<MasterSettings>(masterSettings);
  const [fSettings, setFSettings] = useState<FooterSettings>(footerSettings);
  const [hSlides, setHSlides] = useState<HeroSlide[]>(heroSlides);
  const [wCards, setWCards] = useState<WhyChooseUsCard[]>(whyChooseUs);

  // Editable Pages Content
  const [safetyPage, setSafetyPage] = useState<SafetyTipsContent>(DEFAULT_SAFETY_TIPS_PAGE);
  const [aboutPage, setAboutPage] = useState<AboutPageContent>(DEFAULT_ABOUT_PAGE);
  const [contactPage, setContactPage] = useState<ContactPageContent>(DEFAULT_CONTACT_PAGE);

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchPageContent<SafetyTipsContent>('safety_tips', DEFAULT_SAFETY_TIPS_PAGE).then(setSafetyPage);
    fetchPageContent<AboutPageContent>('about', DEFAULT_ABOUT_PAGE).then(setAboutPage);
    fetchPageContent<ContactPageContent>('contact', DEFAULT_CONTACT_PAGE).then(setContactPage);
  }, []);

  const triggerSuccess = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSaveMaster = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await saveSiteContentDoc('master_settings', mSettings);
      triggerSuccess();
    } catch (err) {
      console.error('Save master settings error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSafetyPage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await savePageContent('safety_tips', safetyPage);
      triggerSuccess();
    } catch (err) {
      console.error('Save safety page error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAboutPage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await savePageContent('about', aboutPage);
      triggerSuccess();
    } catch (err) {
      console.error('Save about page error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveContactPage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await savePageContent('contact', contactPage);
      triggerSuccess();
    } catch (err) {
      console.error('Save contact page error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveFooter = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await saveSiteContentDoc('footer_settings', fSettings);
      triggerSuccess();
    } catch (err) {
      console.error('Save footer settings error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans text-paper-50">
      {/* Top Header Card */}
      <div className="bg-ink-900 p-6 sm:p-8 rounded-3xl border border-gold-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-ember">
        <div>
          <div className="flex items-center gap-2 text-gold-400 font-bold text-xs uppercase tracking-wider">
            <Settings size={16} />
            <span>Storefront Content &amp; CMS</span>
          </div>
          <h1 className="text-3xl font-bold font-display text-white mt-1">Site Content &amp; CMS Settings</h1>
          <p className="text-xs text-paper-300 font-sans mt-1">Manage global site configuration, Safety Tips, About, and Contact pages in real-time.</p>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-2 bg-leaf-400/20 text-leaf-400 px-4 py-2 rounded-full border border-leaf-400/40 text-xs font-bold shrink-0">
            <CheckCircle size={16} />
            <span>Content Saved &amp; Live!</span>
          </div>
        )}
      </div>

      {/* Sub-navigation Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar bg-ink-900 p-2 rounded-3xl border border-paper-50/10">
        <button
          onClick={() => setActiveSubTab('master')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'master' ? 'bg-gold-400 text-ink-950 shadow-sm' : 'text-paper-300 hover:text-white'
          }`}
        >
          Global Store Defaults
        </button>
        <button
          onClick={() => setActiveSubTab('safety')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'safety' ? 'bg-gold-400 text-ink-950 shadow-sm' : 'text-paper-300 hover:text-white'
          }`}
        >
          Safety Tips Page
        </button>
        <button
          onClick={() => setActiveSubTab('about')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'about' ? 'bg-gold-400 text-ink-950 shadow-sm' : 'text-paper-300 hover:text-white'
          }`}
        >
          About Us Page
        </button>
        <button
          onClick={() => setActiveSubTab('contact')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'contact' ? 'bg-gold-400 text-ink-950 shadow-sm' : 'text-paper-300 hover:text-white'
          }`}
        >
          Contact Page
        </button>
        <button
          onClick={() => setActiveSubTab('footer')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'footer' ? 'bg-gold-400 text-ink-950 shadow-sm' : 'text-paper-300 hover:text-white'
          }`}
        >
          Footer Details
        </button>
      </div>

      {/* Tab Content 1: Master Store Settings */}
      {activeSubTab === 'master' && (
        <form onSubmit={handleSaveMaster} className="bg-ink-900 p-6 sm:p-8 rounded-3xl border border-paper-50/10 space-y-5 shadow-2xl">
          <h3 className="text-lg font-bold font-display text-gold-400 uppercase">Global Store Configuration</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-paper-300 font-bold text-xs mb-1">Store Name / Brand</label>
              <input
                type="text"
                value={mSettings.site_title || 'Crackers Falls'}
                onChange={(e) => setMSettings({ ...mSettings, site_title: e.target.value })}
                className="w-full bg-ink-850 border border-paper-50/15 text-white px-4 py-3 rounded-2xl outline-none font-semibold text-xs focus:border-gold-400"
              />
            </div>
            <div>
              <label className="block text-paper-300 font-bold text-xs mb-1">WhatsApp Helpline Number</label>
              <input
                type="text"
                value={mSettings.whatsapp_number || '+91 9159038240'}
                onChange={(e) => setMSettings({ ...mSettings, whatsapp_number: e.target.value })}
                className="w-full bg-ink-850 border border-paper-50/15 text-white px-4 py-3 rounded-2xl outline-none font-semibold text-xs focus:border-gold-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-paper-300 font-bold text-xs mb-1">Minimum Order Target (₹)</label>
              <input
                type="number"
                value={mSettings.min_order_amount ?? 2000}
                onChange={(e) => setMSettings({ ...mSettings, min_order_amount: Number(e.target.value) })}
                className="w-full bg-ink-850 border border-paper-50/15 text-gold-400 px-4 py-3 rounded-2xl outline-none font-extrabold text-xs focus:border-gold-400"
              />
            </div>
            <div>
              <label className="block text-paper-300 font-bold text-xs mb-1">Admin Business Email (Receives Enquiry PDFs) *</label>
              <input
                type="email"
                required
                value={mSettings.admin_notification_email || 'sanjaysurya3010@gmail.com'}
                onChange={(e) => setMSettings({ ...mSettings, admin_notification_email: e.target.value })}
                className="w-full bg-ink-850 border border-paper-50/15 text-white px-4 py-3 rounded-2xl outline-none font-semibold text-xs focus:border-gold-400 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-paper-300 font-bold text-xs mb-1">Announcement Ticker Banner</label>
            <input
              type="text"
              value={mSettings.banner_announcement || ''}
              onChange={(e) => setMSettings({ ...mSettings, banner_announcement: e.target.value })}
              className="w-full bg-ink-850 border border-paper-50/15 text-white px-4 py-3 rounded-2xl outline-none font-semibold text-xs focus:border-gold-400"
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="px-7 py-3.5 bg-gold-400 hover:bg-gold-300 text-ink-950 font-extrabold text-xs uppercase tracking-wider rounded-full shadow-ember flex items-center gap-2 cursor-pointer transition-all"
          >
            <Save size={16} />
            <span>{isSaving ? 'Saving...' : 'Save Global Settings'}</span>
          </button>
        </form>
      )}

      {/* Tab Content 2: Safety Tips Page */}
      {activeSubTab === 'safety' && (
        <form onSubmit={handleSaveSafetyPage} className="bg-ink-900 p-6 sm:p-8 rounded-3xl border border-paper-50/10 space-y-5 shadow-2xl">
          <h3 className="text-lg font-bold font-display text-gold-400 uppercase">Safety Guidelines &amp; PESO Protocol Editor</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-paper-300 font-bold text-xs mb-1">Eyebrow Tagline</label>
              <input
                type="text"
                value={safetyPage.eyebrow}
                onChange={(e) => setSafetyPage({ ...safetyPage, eyebrow: e.target.value })}
                className="w-full bg-ink-850 border border-paper-50/15 text-white px-4 py-3 rounded-2xl outline-none font-semibold text-xs focus:border-gold-400"
              />
            </div>
            <div>
              <label className="block text-paper-300 font-bold text-xs mb-1">Page Title</label>
              <input
                type="text"
                value={safetyPage.title}
                onChange={(e) => setSafetyPage({ ...safetyPage, title: e.target.value })}
                className="w-full bg-ink-850 border border-paper-50/15 text-white px-4 py-3 rounded-2xl outline-none font-semibold text-xs focus:border-gold-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-paper-300 font-bold text-xs mb-1">Subtitle Overview</label>
            <textarea
              rows={2}
              value={safetyPage.subtitle}
              onChange={(e) => setSafetyPage({ ...safetyPage, subtitle: e.target.value })}
              className="w-full bg-ink-850 border border-paper-50/15 text-white px-4 py-3 rounded-2xl outline-none font-semibold text-xs focus:border-gold-400"
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="px-7 py-3.5 bg-gold-400 hover:bg-gold-300 text-ink-950 font-extrabold text-xs uppercase tracking-wider rounded-full shadow-ember flex items-center gap-2 cursor-pointer transition-all"
          >
            <Save size={16} />
            <span>{isSaving ? 'Saving...' : 'Save Safety Page Content'}</span>
          </button>
        </form>
      )}

      {/* Tab Content 3: About Page */}
      {activeSubTab === 'about' && (
        <form onSubmit={handleSaveAboutPage} className="bg-ink-900 p-6 sm:p-8 rounded-3xl border border-paper-50/10 space-y-5 shadow-2xl">
          <h3 className="text-lg font-bold font-display text-gold-400 uppercase">About Us Page Content Editor</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-paper-300 font-bold text-xs mb-1">Eyebrow Tagline</label>
              <input
                type="text"
                value={aboutPage.eyebrow}
                onChange={(e) => setAboutPage({ ...aboutPage, eyebrow: e.target.value })}
                className="w-full bg-ink-850 border border-paper-50/15 text-white px-4 py-3 rounded-2xl outline-none font-semibold text-xs focus:border-gold-400"
              />
            </div>
            <div>
              <label className="block text-paper-300 font-bold text-xs mb-1">Main Title</label>
              <input
                type="text"
                value={aboutPage.title}
                onChange={(e) => setAboutPage({ ...aboutPage, title: e.target.value })}
                className="w-full bg-ink-850 border border-paper-50/15 text-white px-4 py-3 rounded-2xl outline-none font-semibold text-xs focus:border-gold-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-paper-300 font-bold text-xs mb-1">Sivakasi Heritage Story</label>
            <textarea
              rows={4}
              value={aboutPage.story_body}
              onChange={(e) => setAboutPage({ ...aboutPage, story_body: e.target.value })}
              className="w-full bg-ink-850 border border-paper-50/15 text-white px-4 py-3 rounded-2xl outline-none font-semibold text-xs focus:border-gold-400"
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="px-7 py-3.5 bg-gold-400 hover:bg-gold-300 text-ink-950 font-extrabold text-xs uppercase tracking-wider rounded-full shadow-ember flex items-center gap-2 cursor-pointer transition-all"
          >
            <Save size={16} />
            <span>{isSaving ? 'Saving...' : 'Save About Page Content'}</span>
          </button>
        </form>
      )}

      {/* Tab Content 4: Contact Page */}
      {activeSubTab === 'contact' && (
        <form onSubmit={handleSaveContactPage} className="bg-ink-900 p-6 sm:p-8 rounded-3xl border border-paper-50/10 space-y-5 shadow-2xl">
          <h3 className="text-lg font-bold font-display text-gold-400 uppercase">Contact Us Page Content Editor</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-paper-300 font-bold text-xs mb-1">Support Phone</label>
              <input
                type="text"
                value={contactPage.phone}
                onChange={(e) => setContactPage({ ...contactPage, phone: e.target.value })}
                className="w-full bg-ink-850 border border-paper-50/15 text-white px-4 py-3 rounded-2xl outline-none font-semibold text-xs focus:border-gold-400"
              />
            </div>
            <div>
              <label className="block text-paper-300 font-bold text-xs mb-1">Support Email</label>
              <input
                type="text"
                value={contactPage.email}
                onChange={(e) => setContactPage({ ...contactPage, email: e.target.value })}
                className="w-full bg-ink-850 border border-paper-50/15 text-white px-4 py-3 rounded-2xl outline-none font-semibold text-xs focus:border-gold-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-paper-300 font-bold text-xs mb-1">Godown Office Address</label>
            <textarea
              rows={2}
              value={contactPage.address}
              onChange={(e) => setContactPage({ ...contactPage, address: e.target.value })}
              className="w-full bg-ink-850 border border-paper-50/15 text-white px-4 py-3 rounded-2xl outline-none font-semibold text-xs focus:border-gold-400"
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="px-7 py-3.5 bg-gold-400 hover:bg-gold-300 text-ink-950 font-extrabold text-xs uppercase tracking-wider rounded-full shadow-ember flex items-center gap-2 cursor-pointer transition-all"
          >
            <Save size={16} />
            <span>{isSaving ? 'Saving...' : 'Save Contact Page Content'}</span>
          </button>
        </form>
      )}

      {/* Tab Content 5: Footer */}
      {activeSubTab === 'footer' && (
        <form onSubmit={handleSaveFooter} className="bg-ink-900 p-6 sm:p-8 rounded-3xl border border-paper-50/10 space-y-5 shadow-2xl">
          <h3 className="text-lg font-bold font-display text-gold-400 uppercase">Footer Configuration</h3>

          <div>
            <label className="block text-paper-300 font-bold text-xs mb-1">PESO License &amp; Statutory Info</label>
            <input
              type="text"
              value={fSettings.peso_license_info || ''}
              onChange={(e) => setFSettings({ ...fSettings, peso_license_info: e.target.value })}
              className="w-full bg-ink-850 border border-paper-50/15 text-white px-4 py-3 rounded-2xl outline-none font-semibold text-xs focus:border-gold-400"
            />
          </div>

          <div>
            <label className="block text-paper-300 font-bold text-xs mb-1">Copyright Disclaimer Text</label>
            <input
              type="text"
              value={fSettings.copyright_text || ''}
              onChange={(e) => setFSettings({ ...fSettings, copyright_text: e.target.value })}
              className="w-full bg-ink-850 border border-paper-50/15 text-white px-4 py-3 rounded-2xl outline-none font-semibold text-xs focus:border-gold-400"
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="px-7 py-3.5 bg-gold-400 hover:bg-gold-300 text-ink-950 font-extrabold text-xs uppercase tracking-wider rounded-full shadow-ember flex items-center gap-2 cursor-pointer transition-all"
          >
            <Save size={16} />
            <span>{isSaving ? 'Saving...' : 'Save Footer Settings'}</span>
          </button>
        </form>
      )}
    </div>
  );
};

export default MasterSettingsPage;
