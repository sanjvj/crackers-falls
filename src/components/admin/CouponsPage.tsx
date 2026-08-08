import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X, Tag } from 'lucide-react';
import { saveCoupon, deleteCoupon } from '../../lib/firestore';
import type { Coupon } from '../../types';

interface CouponsPageProps {
  coupons: Coupon[];
}

export const CouponsPage: React.FC<CouponsPageProps> = ({ coupons }) => {
  const [editingCoupon, setEditingCoupon] = useState<Partial<Coupon> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleOpenAdd = () => {
    setEditingCoupon({
      code: 'DIWALI55',
      discount_type: 'percent',
      discount_value: 5,
      min_cart_value: 2000,
      active: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Coupon) => {
    setEditingCoupon({ ...c });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoupon?.code) return;
    setIsSaving(true);
    try {
      await saveCoupon(editingCoupon as any);
      setIsModalOpen(false);
      setEditingCoupon(null);
    } catch (err) {
      console.error('Save coupon error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete coupon code?')) return;
    try {
      await deleteCoupon(id);
    } catch (err) {
      console.error('Delete coupon error:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans text-paper-50">
      {/* Top Header Card */}
      <div className="bg-ink-900 p-6 sm:p-8 rounded-3xl border border-gold-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-ember">
        <div>
          <div className="flex items-center gap-2 text-gold-400 font-bold text-xs uppercase tracking-wider">
            <Tag size={16} />
            <span>Promotions &amp; Discounts</span>
          </div>
          <h1 className="text-3xl font-bold font-display text-white mt-1">Coupon &amp; Promo Code Management</h1>
          <p className="text-xs text-paper-300 font-sans mt-1">Manage wholesale discount promo codes for quick enquiry orders.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-6 py-3 bg-gold-400 hover:bg-gold-300 text-ink-950 font-extrabold text-xs uppercase tracking-wider rounded-full shadow-ember flex items-center gap-2 cursor-pointer shrink-0 transition-all hover:scale-[1.02]"
        >
          <Plus size={16} />
          <span>Add New Coupon</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((c) => (
          <div key={c.id} className="bg-ink-900 p-6 rounded-3xl border border-paper-50/10 hover:border-gold-400/40 space-y-4 shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <span className="px-4 py-1.5 bg-gold-400 text-ink-950 font-extrabold text-xs font-display rounded-full tracking-wider uppercase shadow-sm">
                {c.code}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(c)}
                  className="p-2 text-paper-300 hover:text-gold-400 hover:bg-paper-50/5 rounded-xl cursor-pointer transition-colors"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="p-2 text-paper-300 hover:text-crimson-400 hover:bg-paper-50/5 rounded-xl cursor-pointer transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="text-2xl font-bold text-white font-display">
              {c.discount_type === 'percent' ? `${c.discount_value}% OFF` : `₹${c.discount_value} FLAT OFF`}
            </div>

            <div className="text-xs text-paper-300">
              Minimum Order Target: <span className="text-gold-400 font-extrabold">₹{c.min_cart_value?.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Dialog */}
      {isModalOpen && editingCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/85 backdrop-blur-md">
          <div className="bg-ink-900 border border-gold-400/40 p-6 sm:p-7 rounded-3xl max-w-lg w-full space-y-4 shadow-2xl text-xs text-paper-50">
            <div className="flex items-center justify-between border-b border-paper-50/10 pb-3">
              <h3 className="text-base font-bold font-display text-gold-400 uppercase tracking-tight">
                {editingCoupon.id ? 'Edit Coupon Code' : 'Add New Coupon'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-paper-500 hover:text-white cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="block text-paper-300 font-bold mb-1">Coupon Code (Uppercase) *</label>
                <input
                  type="text"
                  required
                  value={editingCoupon.code || ''}
                  onChange={(e) => setEditingCoupon({ ...editingCoupon, code: e.target.value.toUpperCase() })}
                  className="w-full bg-ink-850 border border-paper-50/15 text-white px-4 py-2.5 rounded-2xl outline-none focus:border-gold-400 font-extrabold uppercase text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-paper-300 font-bold mb-1">Discount Type</label>
                  <select
                    value={editingCoupon.discount_type || 'percent'}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, discount_type: e.target.value as any })}
                    className="w-full bg-ink-850 border border-paper-50/15 text-white px-3.5 py-2.5 rounded-2xl outline-none font-semibold cursor-pointer"
                  >
                    <option value="percent" className="bg-ink-900">Percentage (%)</option>
                    <option value="flat" className="bg-ink-900">Flat Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-paper-300 font-bold mb-1">Discount Value *</label>
                  <input
                    type="number"
                    required
                    value={editingCoupon.discount_value ?? 0}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, discount_value: Number(e.target.value) })}
                    className="w-full bg-ink-850 border border-paper-50/15 text-gold-400 px-4 py-2.5 rounded-2xl outline-none font-extrabold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-paper-300 font-bold mb-1">Min Order Target (₹)</label>
                <input
                  type="number"
                  value={editingCoupon.min_cart_value ?? 2000}
                  onChange={(e) => setEditingCoupon({ ...editingCoupon, min_cart_value: Number(e.target.value) })}
                  className="w-full bg-ink-850 border border-paper-50/15 text-white px-4 py-2.5 rounded-2xl outline-none font-semibold"
                />
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3.5 bg-gold-400 hover:bg-gold-300 text-ink-950 font-extrabold uppercase tracking-wider rounded-full shadow-ember mt-3 cursor-pointer transition-all"
              >
                {isSaving ? 'Saving Coupon...' : 'Save Coupon'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponsPage;
