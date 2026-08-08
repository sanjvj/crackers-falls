import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search, Upload, X, Package } from 'lucide-react';
import { saveProduct, deleteProduct, DEFAULT_CATEGORIES } from '../../lib/firestore';
import { uploadMediaFile } from '../../lib/storage';
import type { Product, CategoryItem } from '../../types';

interface ProductsPageProps {
  products: Product[];
  categories: CategoryItem[];
}

export const ProductsPage: React.FC<ProductsPageProps> = ({ products, categories }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [editingProd, setEditingProd] = useState<Partial<Product> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [customCatMode, setCustomCatMode] = useState(false);

  const availableCategories = (categories && categories.length > 0) ? categories : DEFAULT_CATEGORIES;

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = catFilter === 'All' || (p.category && p.category.toLowerCase() === catFilter.toLowerCase());
    return matchesSearch && matchesCat;
  });

  const handleOpenAdd = () => {
    setEditingProd({
      name: '',
      category: availableCategories[0]?.name || 'Sparklers',
      brand: 'Crackers Falls',
      unit: 'Box',
      price: 100,
      original_price: 220,
      image_url: '/crackers falls logo.webp',
      description: '',
      in_stock: true,
      active: true,
      sortOrder: products.length
    });
    setCustomCatMode(false);
    setUploadError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProd({ ...p });
    setCustomCatMode(false);
    setUploadError('');
    setIsModalOpen(true);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProd) return;
    setUploadingImage(true);
    setUploadError('');
    try {
      const downloadUrl = await uploadMediaFile(file, 'products');
      setEditingProd(prev => prev ? { ...prev, image_url: downloadUrl } : null);
    } catch (err: any) {
      console.error('Image upload failed:', err);
      setUploadError('Failed to read image file.');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProd?.name) return;
    setIsSaving(true);
    try {
      await saveProduct(editingProd as any);
      setIsModalOpen(false);
      setEditingProd(null);
    } catch (err) {
      console.error('Save product error:', err);
      setIsModalOpen(false);
      setEditingProd(null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product listing?')) return;
    try {
      await deleteProduct(id);
    } catch (err) {
      console.error('Delete product error:', err);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans text-paper-50">
      {/* Top Header Card */}
      <div className="bg-ink-900 p-6 sm:p-8 rounded-3xl border border-gold-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-ember">
        <div>
          <div className="flex items-center gap-2 text-gold-400 font-bold text-xs uppercase tracking-wider">
            <Package size={16} />
            <span>Sivakasi Inventory Desk</span>
          </div>
          <h1 className="text-3xl font-bold font-display text-white mt-1">Product Catalog Management</h1>
          <p className="text-xs text-paper-300 font-sans mt-1">Manage Sivakasi cracker listings, wholesale rates, and stock availability.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-6 py-3 bg-gold-400 hover:bg-gold-300 text-ink-950 font-extrabold text-xs uppercase tracking-wider rounded-full shadow-ember flex items-center gap-2 cursor-pointer shrink-0 transition-all hover:scale-[1.02]"
        >
          <Plus size={16} />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-paper-500" size={15} />
          <input
            type="text"
            placeholder="Search products by title or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-ink-900 border border-paper-50/15 text-white pl-11 pr-4 py-2.5 rounded-full text-xs outline-none focus:border-gold-400 font-semibold"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 no-scrollbar">
          <button
            onClick={() => setCatFilter('All')}
            className={`px-4 py-2 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer border ${
              catFilter === 'All'
                ? 'bg-gold-400 text-ink-950 border-gold-400 shadow-[0_0_16px_rgba(242,194,48,0.35)]'
                : 'bg-ink-900/60 text-paper-300 border-paper-50/20 hover:border-gold-400/50 hover:text-gold-300'
            }`}
          >
            All ({products.length})
          </button>
          {availableCategories.map((c) => (
            <button
              key={c.id || c.name}
              onClick={() => setCatFilter(c.name)}
              className={`px-4 py-2 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer border ${
                catFilter === c.name
                  ? 'bg-gold-400 text-ink-950 border-gold-400 shadow-[0_0_16px_rgba(242,194,48,0.35)]'
                  : 'bg-ink-900/60 text-paper-300 border-paper-50/20 hover:border-gold-400/50 hover:text-gold-300'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProducts.map((p) => {
          const mrp = p.original_price || Math.round(p.price / 0.45);
          return (
            <div key={p.id} className="bg-ink-900 border border-paper-50/10 hover:border-gold-400/40 p-4.5 rounded-2xl flex items-center justify-between gap-4 transition-all shadow-xl">
              <div className="flex items-center gap-3.5 min-w-0">
                <img
                  src={p.image_url || '/crackers falls logo.webp'}
                  alt={p.name}
                  className={`w-14 h-14 rounded-xl border border-paper-50/15 shrink-0 ${
                    p.image_url?.includes('logo') ? 'object-contain p-1 bg-ink-850' : 'object-cover'
                  }`}
                  onError={(e) => { (e.target as HTMLImageElement).src = '/crackers falls logo.webp'; }}
                />
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-gold-400 uppercase tracking-wider block">{p.category}</span>
                  <h3 className="text-sm font-bold text-white truncate font-display">{p.name}</h3>
                  <div className="flex items-baseline gap-2 mt-0.5 text-xs">
                    <span className="font-extrabold text-gold-400 font-display">{formatCurrency(p.price)}</span>
                    <span className="text-[10px] text-paper-500 line-through">{formatCurrency(mrp)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleOpenEdit(p)}
                  className="p-2 text-paper-300 hover:text-gold-400 hover:bg-paper-50/5 rounded-xl cursor-pointer transition-colors"
                  title="Edit product"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="p-2 text-paper-300 hover:text-crimson-400 hover:bg-paper-50/5 rounded-xl cursor-pointer transition-colors"
                  title="Delete product"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Dialog */}
      {isModalOpen && editingProd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/85 backdrop-blur-md">
          <div className="bg-ink-900 border border-gold-400/40 p-6 sm:p-7 rounded-3xl max-w-lg w-full space-y-4 shadow-2xl text-xs text-paper-50">
            <div className="flex items-center justify-between border-b border-paper-50/10 pb-3">
              <h3 className="text-base font-bold font-display text-gold-400 uppercase tracking-tight">
                {editingProd.id ? 'Edit Cracker Product' : 'Add New Product'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-paper-500 hover:text-white cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="block text-paper-300 font-bold mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={editingProd.name || ''}
                  onChange={(e) => setEditingProd({ ...editingProd, name: e.target.value })}
                  className="w-full bg-ink-850 border border-paper-50/15 text-white px-4 py-2.5 rounded-2xl outline-none focus:border-gold-400 font-semibold text-xs"
                  placeholder="e.g. 15cm Electric Sparklers"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-paper-300 font-bold">Category *</label>
                    <button
                      type="button"
                      onClick={() => setCustomCatMode(!customCatMode)}
                      className="text-[10px] text-gold-400 underline font-bold cursor-pointer"
                    >
                      {customCatMode ? 'Select from list' : '+ Custom'}
                    </button>
                  </div>

                  {customCatMode ? (
                    <input
                      type="text"
                      required
                      placeholder="Type category name"
                      value={editingProd.category || ''}
                      onChange={(e) => setEditingProd({ ...editingProd, category: e.target.value })}
                      className="w-full bg-ink-850 border border-paper-50/15 text-white px-3.5 py-2.5 rounded-2xl outline-none focus:border-gold-400 font-semibold"
                    />
                  ) : (
                    <select
                      value={editingProd.category || availableCategories[0]?.name || 'Sparklers'}
                      onChange={(e) => setEditingProd({ ...editingProd, category: e.target.value })}
                      className="w-full bg-ink-850 border border-paper-50/15 text-white px-3.5 py-2.5 rounded-2xl outline-none font-semibold cursor-pointer focus:border-gold-400"
                    >
                      {availableCategories.map((c) => (
                        <option key={c.id || c.name} value={c.name} className="bg-ink-900 text-white py-2 font-semibold">
                          {c.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-paper-300 font-bold mb-1">Brand *</label>
                  <input
                    type="text"
                    value={editingProd.brand || 'Crackers Falls'}
                    onChange={(e) => setEditingProd({ ...editingProd, brand: e.target.value })}
                    className="w-full bg-ink-850 border border-paper-50/15 text-white px-3.5 py-2.5 rounded-2xl outline-none focus:border-gold-400 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-paper-300 font-bold mb-1">Wholesale Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={editingProd.price ?? 0}
                    onChange={(e) => setEditingProd({ ...editingProd, price: Number(e.target.value) })}
                    className="w-full bg-ink-850 border border-paper-50/15 text-gold-400 px-3.5 py-2.5 rounded-2xl outline-none font-extrabold text-sm"
                  />
                </div>
                <div>
                  <label className="block text-paper-300 font-bold mb-1">MRP (₹) *</label>
                  <input
                    type="number"
                    required
                    value={editingProd.original_price ?? 0}
                    onChange={(e) => setEditingProd({ ...editingProd, original_price: Number(e.target.value) })}
                    className="w-full bg-ink-850 border border-paper-50/15 text-white px-3.5 py-2.5 rounded-2xl outline-none font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-paper-300 font-bold mb-1">Unit *</label>
                  <select
                    value={editingProd.unit || 'Box'}
                    onChange={(e) => setEditingProd({ ...editingProd, unit: e.target.value as any })}
                    className="w-full bg-ink-850 border border-paper-50/15 text-white px-3.5 py-2.5 rounded-2xl outline-none font-semibold cursor-pointer"
                  >
                    <option value="Box" className="bg-ink-900 text-white">Box</option>
                    <option value="Pkt" className="bg-ink-900 text-white">Pkt</option>
                    <option value="Piece" className="bg-ink-900 text-white">Piece</option>
                    <option value="Set" className="bg-ink-900 text-white">Set</option>
                  </select>
                </div>
              </div>

              {/* Image Input with Preview */}
              <div>
                <label className="block text-paper-300 font-bold mb-1">Product Image URL / File Upload</label>
                <div className="flex gap-2 items-center">
                  {editingProd.image_url && (
                    <img
                      src={editingProd.image_url}
                      alt="Preview"
                      className="w-10 h-10 rounded-xl object-cover border border-paper-50/15 shrink-0"
                    />
                  )}
                  <input
                    type="text"
                    value={editingProd.image_url || ''}
                    onChange={(e) => setEditingProd({ ...editingProd, image_url: e.target.value })}
                    className="flex-1 bg-ink-850 border border-paper-50/15 text-white px-3.5 py-2.5 rounded-2xl outline-none font-semibold truncate"
                    placeholder="/crackers falls logo.webp"
                  />
                  <label className="px-4 py-2.5 bg-gold-400 hover:bg-gold-300 text-ink-950 font-bold rounded-2xl cursor-pointer flex items-center gap-1.5 shrink-0 shadow-sm transition-all">
                    <Upload size={14} />
                    <span>{uploadingImage ? 'Uploading...' : 'Upload File'}</span>
                    <input type="file" accept="image/*" onChange={handleImageFileChange} className="hidden" />
                  </label>
                </div>
                {uploadError && <p className="text-[11px] text-crimson-400 font-semibold mt-1">{uploadError}</p>}
              </div>

              <div>
                <label className="block text-paper-300 font-bold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingProd.description || ''}
                  onChange={(e) => setEditingProd({ ...editingProd, description: e.target.value })}
                  className="w-full bg-ink-850 border border-paper-50/15 text-white px-3.5 py-2 rounded-2xl outline-none font-semibold"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProd.in_stock !== false}
                    onChange={(e) => setEditingProd({ ...editingProd, in_stock: e.target.checked })}
                    className="accent-gold-400 h-4 w-4 rounded"
                  />
                  <span className="font-bold text-paper-300">In Stock</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProd.active !== false}
                    onChange={(e) => setEditingProd({ ...editingProd, active: e.target.checked })}
                    className="accent-gold-400 h-4 w-4 rounded"
                  />
                  <span className="font-bold text-paper-300">Active Listing</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSaving || uploadingImage}
                className="w-full py-3.5 bg-gold-400 hover:bg-gold-300 text-ink-950 font-extrabold uppercase tracking-wider rounded-full shadow-ember mt-3 cursor-pointer disabled:opacity-50 transition-all"
              >
                {isSaving ? 'Saving Product...' : 'Save Product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
