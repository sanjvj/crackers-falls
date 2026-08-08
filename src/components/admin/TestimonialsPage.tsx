import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X, Star, Award } from 'lucide-react';
import { saveTestimonial, deleteTestimonial } from '../../lib/firestore';
import type { Testimonial } from '../../types';

interface TestimonialsPageProps {
  testimonials: Testimonial[];
}

export const TestimonialsPage: React.FC<TestimonialsPageProps> = ({ testimonials }) => {
  const [editingTest, setEditingTest] = useState<Partial<Testimonial> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const sortedTestimonials = [...testimonials].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const handleOpenAdd = () => {
    setEditingTest({
      name: '',
      location: 'Sivakasi Buyer',
      review: '',
      rating: 5,
      order: testimonials.length,
      active: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: Testimonial) => {
    setEditingTest({ ...t });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTest?.name || !editingTest?.review) return;
    setIsSaving(true);
    try {
      await saveTestimonial(editingTest as any);
      setIsModalOpen(false);
      setEditingTest(null);
    } catch (err) {
      console.error('Save testimonial error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete review?')) return;
    try {
      await deleteTestimonial(id);
    } catch (err) {
      console.error('Delete review error:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans text-paper-50">
      {/* Top Header Card */}
      <div className="bg-ink-900 p-6 sm:p-8 rounded-3xl border border-gold-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-ember">
        <div>
          <div className="flex items-center gap-2 text-gold-400 font-bold text-xs uppercase tracking-wider">
            <Award size={16} />
            <span>Social Proof &amp; Feedback</span>
          </div>
          <h1 className="text-3xl font-bold font-display text-white mt-1">Customer Reviews Management</h1>
          <p className="text-xs text-paper-300 font-sans mt-1">Manage home page wholesale testimonial quotes and star ratings.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-6 py-3 bg-gold-400 hover:bg-gold-300 text-ink-950 font-extrabold text-xs uppercase tracking-wider rounded-full shadow-ember flex items-center gap-2 cursor-pointer shrink-0 transition-all hover:scale-[1.02]"
        >
          <Plus size={16} />
          <span>Add New Review</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedTestimonials.map((t) => (
          <div key={t.id} className="bg-ink-900 p-6 rounded-3xl border border-paper-50/10 hover:border-gold-400/40 space-y-4 shadow-xl transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-gold-400">
                  {Array.from({ length: t.rating || 5 }).map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" />
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(t)}
                    className="p-2 text-paper-300 hover:text-gold-400 hover:bg-paper-50/5 rounded-xl cursor-pointer transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="p-2 text-paper-300 hover:text-crimson-400 hover:bg-paper-50/5 rounded-xl cursor-pointer transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <p className="text-xs text-paper-300 italic line-clamp-4 font-sans">"{t.review}"</p>
            </div>

            <div className="pt-2 border-t border-paper-50/10">
              <h4 className="font-bold text-white text-sm font-display">{t.name}</h4>
              <span className="text-[10px] text-gold-400 font-semibold uppercase tracking-wider">{t.location}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Dialog */}
      {isModalOpen && editingTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/85 backdrop-blur-md">
          <div className="bg-ink-900 border border-gold-400/40 p-6 sm:p-7 rounded-3xl max-w-lg w-full space-y-4 shadow-2xl text-xs text-paper-50">
            <div className="flex items-center justify-between border-b border-paper-50/10 pb-3">
              <h3 className="text-base font-bold font-display text-gold-400 uppercase tracking-tight">
                {editingTest.id ? 'Edit Customer Review' : 'Add New Review'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-paper-500 hover:text-white cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="block text-paper-300 font-bold mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  value={editingTest.name || ''}
                  onChange={(e) => setEditingTest({ ...editingTest, name: e.target.value })}
                  className="w-full bg-ink-850 border border-paper-50/15 text-white px-4 py-2.5 rounded-2xl outline-none focus:border-gold-400 font-semibold text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-paper-300 font-bold mb-1">Location / Designation</label>
                  <input
                    type="text"
                    value={editingTest.location || 'Sivakasi Buyer'}
                    onChange={(e) => setEditingTest({ ...editingTest, location: e.target.value })}
                    className="w-full bg-ink-850 border border-paper-50/15 text-white px-4 py-2.5 rounded-2xl outline-none focus:border-gold-400 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-paper-300 font-bold mb-1">Rating Stars (1 - 5)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={editingTest.rating ?? 5}
                    onChange={(e) => setEditingTest({ ...editingTest, rating: Number(e.target.value) })}
                    className="w-full bg-ink-850 border border-paper-50/15 text-gold-400 px-4 py-2.5 rounded-2xl outline-none font-extrabold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-paper-300 font-bold mb-1">Review Quote *</label>
                <textarea
                  rows={3}
                  required
                  value={editingTest.review || ''}
                  onChange={(e) => setEditingTest({ ...editingTest, review: e.target.value })}
                  className="w-full bg-ink-850 border border-paper-50/15 text-white px-4 py-2.5 rounded-2xl outline-none font-semibold"
                />
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3.5 bg-gold-400 hover:bg-gold-300 text-ink-950 font-extrabold uppercase tracking-wider rounded-full shadow-ember mt-3 cursor-pointer transition-all"
              >
                {isSaving ? 'Saving Review...' : 'Save Review'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestimonialsPage;
