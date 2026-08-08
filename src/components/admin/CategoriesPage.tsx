import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X, FolderPlus, Upload } from 'lucide-react';
import { saveCategory, deleteCategory } from '../../lib/firestore';
import { uploadMediaFile } from '../../lib/storage';
import type { CategoryItem } from '../../types';

interface CategoriesPageProps {
  categories: CategoryItem[];
}

export const CategoriesPage: React.FC<CategoriesPageProps> = ({ categories }) => {
  const [editingCat, setEditingCat] = useState<Partial<CategoryItem> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const sortedCategories = [...categories].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const handleOpenAdd = () => {
    setEditingCat({
      name: '',
      icon: '🎆',
      order: categories.length,
      description: 'Sivakasi fireworks category',
      badge: '',
      active: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: CategoryItem) => {
    setEditingCat({ ...cat });
    setIsModalOpen(true);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingCat) return;
    setUploadingImage(true);
    try {
      const downloadUrl = await uploadMediaFile(file, 'categories');
      setEditingCat(prev => prev ? { ...prev, image_url: downloadUrl } : null);
    } catch (err) {
      console.error('Category image upload failed:', err);
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCat?.name) return;
    setIsSaving(true);
    try {
      await saveCategory(editingCat as any);
      setIsModalOpen(false);
      setEditingCat(null);
    } catch (err) {
      console.error('Save category error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete category?')) return;
    try {
      await deleteCategory(id);
    } catch (err) {
      console.error('Delete category error:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans text-paper-50">
      {/* Top Header Card */}
      <div className="bg-ink-900 p-6 sm:p-8 rounded-3xl border border-gold-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-ember">
        <div>
          <div className="flex items-center gap-2 text-gold-400 font-bold text-xs uppercase tracking-wider">
            <FolderPlus size={16} />
            <span>Taxonomy &amp; Organization</span>
          </div>
          <h1 className="text-3xl font-bold font-display text-white mt-1">Categories Management</h1>
          <p className="text-xs text-paper-300 font-sans mt-1">Organize cracker categories, ordering index, and featured badges.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-6 py-3 bg-gold-400 hover:bg-gold-300 text-ink-950 font-extrabold text-xs uppercase tracking-wider rounded-full shadow-ember flex items-center gap-2 cursor-pointer shrink-0 transition-all hover:scale-[1.02]"
        >
          <Plus size={16} />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedCategories.map((cat) => (
          <div key={cat.id} className="bg-ink-900 p-6 rounded-3xl border border-paper-50/10 hover:border-gold-400/40 space-y-4 relative group shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{cat.icon || '🎆'}</span>
                <div>
                  <h3 className="font-bold text-white text-lg font-display">{cat.name}</h3>
                  <span className="text-[10px] text-gold-400 font-bold uppercase tracking-wider">Sort Order Index: #{cat.order ?? 0}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(cat)}
                  className="p-2 text-paper-300 hover:text-gold-400 hover:bg-paper-50/5 rounded-xl cursor-pointer transition-colors"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="p-2 text-paper-300 hover:text-crimson-400 hover:bg-paper-50/5 rounded-xl cursor-pointer transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <p className="text-xs text-paper-300 line-clamp-2">{cat.description || 'No description provided.'}</p>

            {cat.badge && (
              <span className="inline-block bg-leaf-400/20 text-leaf-400 border border-leaf-400/40 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                {cat.badge}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Edit Modal Dialog */}
      {isModalOpen && editingCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/85 backdrop-blur-md">
          <div className="bg-ink-900 border border-gold-400/40 p-6 sm:p-7 rounded-3xl max-w-lg w-full space-y-4 shadow-2xl text-xs text-paper-50">
            <div className="flex items-center justify-between border-b border-paper-50/10 pb-3">
              <h3 className="text-base font-bold font-display text-gold-400 uppercase tracking-tight">
                {editingCat.id ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-paper-500 hover:text-white cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="block text-paper-300 font-bold mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={editingCat.name || ''}
                  onChange={(e) => setEditingCat({ ...editingCat, name: e.target.value })}
                  className="w-full bg-ink-850 border border-paper-50/15 text-white px-4 py-2.5 rounded-2xl outline-none focus:border-gold-400 font-semibold text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-paper-300 font-bold mb-1">Emoji / Icon</label>
                  <input
                    type="text"
                    value={editingCat.icon || '🎆'}
                    onChange={(e) => setEditingCat({ ...editingCat, icon: e.target.value })}
                    className="w-full bg-ink-850 border border-paper-50/15 text-white px-4 py-2.5 rounded-2xl outline-none focus:border-gold-400 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-paper-300 font-bold mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={editingCat.order ?? 0}
                    onChange={(e) => setEditingCat({ ...editingCat, order: Number(e.target.value) })}
                    className="w-full bg-ink-850 border border-paper-50/15 text-white px-4 py-2.5 rounded-2xl outline-none focus:border-gold-400 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-paper-300 font-bold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingCat.description || ''}
                  onChange={(e) => setEditingCat({ ...editingCat, description: e.target.value })}
                  className="w-full bg-ink-850 border border-paper-50/15 text-white px-4 py-2 rounded-2xl outline-none font-semibold"
                />
              </div>

              <button
                type="submit"
                disabled={isSaving || uploadingImage}
                className="w-full py-3.5 bg-gold-400 hover:bg-gold-300 text-ink-950 font-extrabold uppercase tracking-wider rounded-full shadow-ember mt-3 cursor-pointer transition-all"
              >
                {isSaving ? 'Saving Category...' : 'Save Category'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;
