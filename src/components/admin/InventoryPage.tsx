import React, { useState, useMemo } from 'react';
import {
  Warehouse,
  Package,
  Plus,
  ArrowLeftRight,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  History,
  Edit3,
  X,
  Building2,
  SlidersHorizontal,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  FileText
} from 'lucide-react';
import { useFirestoreCollection } from '../../hooks/useFirestore';
import { addStockLedgerEntry, recalculateProductStock, calculateProductStock, saveProduct, deleteProduct } from '../../lib/firestore';
import { db } from '../../lib/firebase';
import { collection, addDoc, doc, setDoc, writeBatch } from 'firebase/firestore';
import type {
  Product,
  CategoryItem,
  StockLedgerEntry,
  InventoryLocation,
  Batch,
  Vendor
} from '../../types';

interface InventoryPageProps {
  products?: Product[];
  categories?: CategoryItem[];
}

export const InventoryPage: React.FC<InventoryPageProps> = ({
  products: initialProducts = [],
  categories: initialCategories = []
}) => {
  // Real-time Firestore Subscriptions
  const { data: productsData } = useFirestoreCollection<Product>('products');
  const { data: ledgerData } = useFirestoreCollection<StockLedgerEntry>('stockLedger');
  const { data: locationsData } = useFirestoreCollection<InventoryLocation>('locations');
  const { data: categoriesData } = useFirestoreCollection<CategoryItem>('categories');

  const stockLedger = ledgerData;

  const products = useMemo(() => {
    const map = new Map<string, Product>();
    initialProducts.forEach(p => map.set(p.id, p));
    productsData.forEach(p => map.set(p.id, p));
    return Array.from(map.values());
  }, [productsData, initialProducts]);

  const categories = categoriesData.length > 0 ? categoriesData : initialCategories;

  const defaultLocations: InventoryLocation[] = [
    { id: 'loc_1', name: 'Main Godown (Sivakasi Factory)', type: 'godown', address: 'Sivakasi Bypass Road', isLicensedStorage: true },
    { id: 'loc_2', name: 'Retail Counter Shop', type: 'shop', address: 'Main Road Outlet', isLicensedStorage: true },
    { id: 'loc_3', name: 'Festive Popup Stall', type: 'popup-stall', address: 'City Centre Stall #4', isLicensedStorage: false }
  ];
  const locations = locationsData.length > 0 ? locationsData : defaultLocations;

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'In Stock' | 'Low Stock' | 'Out of Stock'>('All');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedProductForDrawer, setSelectedProductForDrawer] = useState<Product | null>(null);
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);

  // Form States - Add Product
  const [newProdName, setNewProdName] = useState('');
  const [newProdSku, setNewProdSku] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('');
  const [newProdBrand, setNewProdBrand] = useState('Crackers Falls');
  const [newProdUnit, setNewProdUnit] = useState('Box');
  const [newProdUnitsPerBox, setNewProdUnitsPerBox] = useState(1);
  const [newProdCostPrice, setNewProdCostPrice] = useState(0);
  const [newProdRetailPrice, setNewProdRetailPrice] = useState(0);
  const [newProdWholesalePrice, setNewProdWholesalePrice] = useState(0);
  const [newProdDealerPrice, setNewProdDealerPrice] = useState(0);
  const [newProdReorderThreshold, setNewProdReorderThreshold] = useState(10);
  const [newProdInitialStock, setNewProdInitialStock] = useState(50);
  const [newProdBatchTracking, setNewProdBatchTracking] = useState(false);
  const [newProdImage, setNewProdImage] = useState('/crackers falls logo.webp');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  // Form States - Stock Transfer
  const [transferProductId, setTransferProductId] = useState('');
  const [transferFromLocation, setTransferFromLocation] = useState(locations[0]?.id || 'loc_1');
  const [transferToLocation, setTransferToLocation] = useState(locations[1]?.id || 'loc_2');
  const [transferQuantity, setTransferQuantity] = useState(10);
  const [transferNotes, setTransferNotes] = useState('');
  const [transferError, setTransferError] = useState('');

  // Form States - Manual Adjustment
  const [adjType, setAdjType] = useState<'purchase' | 'sale' | 'return' | 'damage' | 'adjustment'>('adjustment');
  const [adjQuantity, setAdjQuantity] = useState(5);
  const [adjLocationId, setAdjLocationId] = useState(locations[0]?.id || 'loc_1');
  const [adjReason, setAdjReason] = useState('');
  const [adjError, setAdjError] = useState('');

  // Extract unique brands for filtering
  const brands = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => { if (p.brand) set.add(p.brand); });
    return Array.from(set);
  }, [products]);

  // Derived stock status calculator helper
  const getStockStatus = (p: Product) => {
    const stock = calculateProductStock(p, stockLedger);
    const threshold = p.reorderThreshold ?? 10;
    if (stock <= 0 || stock <= threshold) return 'Out of Stock';
    if (stock <= threshold * 1.2) return 'Low Stock';
    return 'In Stock';
  };

  // Filtered product catalog
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const stock = calculateProductStock(p, stockLedger);
      const threshold = p.reorderThreshold ?? 10;
      const status = getStockStatus(p);

      const matchesSearch = !searchTerm ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCat = selectedCategory === 'All' || !p.category || p.category.trim().toLowerCase() === selectedCategory.trim().toLowerCase();
      const matchesBrand = selectedBrand === 'All' || !p.brand || p.brand.trim().toLowerCase() === selectedBrand.trim().toLowerCase();
      const matchesStatus = selectedStatus === 'All' || status === selectedStatus;

      return matchesSearch && matchesCat && matchesBrand && matchesStatus;
    });
  }, [products, stockLedger, searchTerm, selectedCategory, selectedBrand, selectedStatus]);

  // Format currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Handle Add Product Submit
  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) return;

    setIsFormSubmitting(true);
    try {
      const prodId = 'prod_' + Date.now();
      const newDoc: Product = {
        id: prodId,
        name: newProdName,
        sku: newProdSku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        category: newProdCategory || (categories[0]?.name || 'Sparklers'),
        brand: newProdBrand,
        unit: newProdUnit,
        unitsPerBox: newProdUnitsPerBox,
        price: newProdWholesalePrice || newProdRetailPrice || 100,
        original_price: newProdRetailPrice || 200,
        costPrice: newProdCostPrice,
        retailPrice: newProdRetailPrice,
        wholesalePrice: newProdWholesalePrice,
        dealerPrice: newProdDealerPrice,
        reorderThreshold: newProdReorderThreshold,
        currentStock: 0,
        batchTracking: newProdBatchTracking,
        image_url: newProdImage,
        description: newProdDesc,
        in_stock: newProdInitialStock > 0,
        active: true,
        sortOrder: products.length
      };

      await saveProduct(newDoc);

      // Create initial stock ledger entry if initial stock provided
      if (newProdInitialStock > 0) {
        await addStockLedgerEntry({
          productId: prodId,
          type: 'purchase',
          quantity: newProdInitialStock,
          locationId: locations[0]?.id || 'loc_1',
          referenceType: 'manual',
          notes: 'Initial inventory stock setup',
          createdBy: 'Admin Owner',
          createdAt: new Date().toISOString()
        });
      }

      setIsAddModalOpen(false);
      // Reset form
      setNewProdName('');
      setNewProdSku('');
      setNewProdInitialStock(50);
    } catch (err) {
      console.error('Error adding product:', err);
    } finally {
      setIsFormSubmitting(false);
    }
  };

  // Handle Stock Transfer Submit (Atomic double-entry transaction)
  const handleStockTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTransferError('');

    if (!transferProductId) {
      setTransferError('Please select a product to transfer.');
      return;
    }
    if (transferFromLocation === transferToLocation) {
      setTransferError('Source and Destination locations must be different.');
      return;
    }
    if (transferQuantity <= 0) {
      setTransferError('Transfer quantity must be greater than 0.');
      return;
    }

    setIsFormSubmitting(true);
    try {
      const batch = writeBatch(db);
      const timestamp = new Date().toISOString();
      const refId = 'TRF-' + Date.now();

      // 1. Negative entry at source location
      const sourceRef = doc(collection(db, 'stockLedger'));
      batch.set(sourceRef, {
        productId: transferProductId,
        type: 'transfer',
        quantity: -Math.abs(transferQuantity),
        locationId: transferFromLocation,
        referenceType: 'manual',
        referenceId: refId,
        notes: `Transfer Out to ${locations.find(l => l.id === transferToLocation)?.name || transferToLocation}: ${transferNotes}`,
        createdBy: 'Admin Owner',
        createdAt: timestamp
      });

      // 2. Positive entry at destination location
      const destRef = doc(collection(db, 'stockLedger'));
      batch.set(destRef, {
        productId: transferProductId,
        type: 'transfer',
        quantity: Math.abs(transferQuantity),
        locationId: transferToLocation,
        referenceType: 'manual',
        referenceId: refId,
        notes: `Transfer In from ${locations.find(l => l.id === transferFromLocation)?.name || transferFromLocation}: ${transferNotes}`,
        createdBy: 'Admin Owner',
        createdAt: timestamp
      });

      await batch.commit();
      await recalculateProductStock(transferProductId);

      setIsTransferModalOpen(false);
      setTransferNotes('');
    } catch (err) {
      console.error('Transfer stock error:', err);
      setTransferError('Failed to execute stock transfer.');
    } finally {
      setIsFormSubmitting(false);
    }
  };

  // Handle Manual Stock Adjustment Submit
  const handleManualAdjustmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdjError('');

    if (!selectedProductForDrawer) return;
    if (!adjReason.trim()) {
      setAdjError('Please provide a required reason / note for this stock adjustment.');
      return;
    }
    if (adjQuantity === 0) {
      setAdjError('Quantity adjustment cannot be 0.');
      return;
    }

    setIsFormSubmitting(true);
    try {
      const signedQty = ['sale', 'damage'].includes(adjType) ? -Math.abs(adjQuantity) : Math.abs(adjQuantity);

      await addStockLedgerEntry({
        productId: selectedProductForDrawer.id,
        type: adjType,
        quantity: signedQty,
        locationId: adjLocationId,
        referenceType: 'manual',
        notes: adjReason,
        createdBy: 'Admin Owner',
        createdAt: new Date().toISOString()
      });

      setIsAdjustmentModalOpen(false);
      setAdjReason('');
      setAdjQuantity(5);
    } catch (err) {
      console.error('Stock adjustment error:', err);
      setAdjError('Failed to record stock adjustment.');
    } finally {
      setIsFormSubmitting(false);
    }
  };

  // Product Stock Ledger History for selected product
  const productLedgerHistory = useMemo(() => {
    if (!selectedProductForDrawer) return [];
    return stockLedger
      .filter(entry => entry.productId === selectedProductForDrawer.id)
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }, [stockLedger, selectedProductForDrawer]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans text-paper-50">
      {/* Top Header Card */}
      <div className="bg-ink-900 p-6 sm:p-8 rounded-3xl border border-gold-400/30 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-ember">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-gold-400 font-bold text-xs uppercase tracking-wider">
            <Warehouse size={16} />
            <span>Inventory &amp; Stock Ledger System</span>
          </div>
          <h1 className="text-3xl font-bold font-display text-white">Stock Management &amp; Transfers</h1>
          <p className="text-xs text-paper-300 font-sans">
            Real-time multi-location inventory, stock ledger movements, reorder alerts, and location transfers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="px-5 py-2.5 bg-ink-850 border border-gold-400/40 hover:border-gold-400 text-gold-400 font-bold text-xs uppercase tracking-wider rounded-full shadow-sm flex items-center gap-2 cursor-pointer transition-all"
          >
            <ArrowLeftRight size={15} />
            <span>Stock Transfer</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-6 py-2.5 bg-gold-400 hover:bg-gold-300 text-ink-950 font-extrabold text-xs uppercase tracking-wider rounded-full shadow-ember flex items-center gap-2 cursor-pointer transition-all"
          >
            <Plus size={16} />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Stock Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-ink-900 p-5 rounded-3xl border border-paper-50/10 space-y-1 shadow-xl">
          <div className="text-paper-500 font-bold uppercase text-[10px] tracking-wider">Total Products Listed</div>
          <p className="text-3xl font-extrabold font-display text-white">{products.length}</p>
          <span className="text-gold-400 text-xs font-semibold">{categories.length} Categories</span>
        </div>

        <div className="bg-ink-900 p-5 rounded-3xl border border-paper-50/10 space-y-1 shadow-xl">
          <div className="text-paper-500 font-bold uppercase text-[10px] tracking-wider">Total Available Stock</div>
          <p className="text-3xl font-extrabold font-display text-leaf-400">
            {products.reduce((sum, p) => sum + (p.currentStock ?? (p.in_stock ? 25 : 0)), 0)} Units
          </p>
          <span className="text-paper-300 text-xs font-sans">Across {locations.length} Locations</span>
        </div>

        <div className="bg-ink-900 p-5 rounded-3xl border border-crimson-500/30 space-y-1 shadow-xl">
          <div className="text-paper-500 font-bold uppercase text-[10px] tracking-wider">Low Stock Alerts</div>
          <p className="text-3xl font-extrabold font-display text-crimson-400">
            {products.filter(p => getStockStatus(p) !== 'In Stock').length} Items
          </p>
          <span className="text-crimson-300 text-xs font-bold">Below Reorder Threshold</span>
        </div>

        <div className="bg-ink-900 p-5 rounded-3xl border border-paper-50/10 space-y-1 shadow-xl">
          <div className="text-paper-500 font-bold uppercase text-[10px] tracking-wider">Stock Ledger History</div>
          <p className="text-3xl font-extrabold font-display text-gold-400">{stockLedger.length}</p>
          <span className="text-paper-300 text-xs font-sans">Ledger Movements Logged</span>
        </div>
      </div>

      {/* Filters & Search Control Bar */}
      <div className="bg-ink-900 p-5 rounded-3xl border border-paper-50/10 space-y-4 shadow-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-paper-500" size={15} />
            <input
              type="text"
              placeholder="Search product name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-ink-850 border border-paper-50/15 text-white pl-10 pr-4 py-2.5 rounded-2xl outline-none font-semibold text-xs focus:border-gold-400"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-ink-850 border border-paper-50/15 text-white px-3 py-2.5 rounded-2xl outline-none font-semibold text-xs focus:border-gold-400 cursor-pointer"
            >
              <option value="All">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Brand Filter */}
          <div>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full bg-ink-850 border border-paper-50/15 text-white px-3 py-2.5 rounded-2xl outline-none font-semibold text-xs focus:border-gold-400 cursor-pointer"
            >
              <option value="All">All Brands</option>
              {brands.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Stock Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="w-full bg-ink-850 border border-paper-50/15 text-white px-3 py-2.5 rounded-2xl outline-none font-semibold text-xs focus:border-gold-400 cursor-pointer"
            >
              <option value="All">All Stock Statuses</option>
              <option value="In Stock">In Stock (Green)</option>
              <option value="Low Stock">Low Stock (Yellow)</option>
              <option value="Out of Stock">Out of Stock (Red)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Product Inventory Table */}
      <div className="bg-ink-900 rounded-3xl border border-paper-50/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-paper-300">
            <thead className="bg-ink-850 border-b border-paper-50/10 text-gold-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-4 px-6">Product &amp; SKU</th>
                <th className="py-4 px-4">Brand &amp; Category</th>
                <th className="py-4 px-4 text-right">Current Stock</th>
                <th className="py-4 px-4 text-right">Reorder Threshold</th>
                <th className="py-4 px-4 text-center">Stock Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-paper-50/5">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((p) => {
                  const stock = calculateProductStock(p, stockLedger);
                  const threshold = p.reorderThreshold ?? 10;
                  const status = getStockStatus(p);

                  return (
                    <tr key={p.id} className="hover:bg-ink-850/50 transition-colors">
                      {/* Product Name & SKU */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image_url || '/crackers falls logo.webp'}
                            alt={p.name}
                            className="w-10 h-10 rounded-xl object-cover border border-paper-50/10 bg-ink-850 shrink-0"
                            onError={(e) => { (e.target as HTMLImageElement).src = '/crackers falls logo.webp'; }}
                          />
                          <div>
                            <div className="font-bold text-white font-display text-sm">{p.name}</div>
                            <div className="font-mono text-[10px] text-gold-400 font-semibold">{p.sku || 'SKU-NONE'}</div>
                          </div>
                        </div>
                      </td>

                      {/* Brand & Category */}
                      <td className="py-4 px-4 font-semibold">
                        <div className="text-white font-display">{p.brand || 'Crackers Falls'}</div>
                        <div className="text-paper-500 text-[10px]">{p.category} · {p.unit || 'Box'}</div>
                      </td>

                      {/* Current Stock */}
                      <td className="py-4 px-4 text-right">
                        <span className="text-base font-extrabold font-display text-white">{stock}</span>
                        <span className="text-[10px] text-paper-500 block">{p.unit || 'Units'}</span>
                      </td>

                      {/* Reorder Threshold */}
                      <td className="py-4 px-4 text-right">
                        <span className="text-xs font-bold text-paper-300">{threshold}</span>
                        <span className="text-[10px] text-paper-500 block">Limit</span>
                      </td>

                      {/* Stock Status Badge */}
                      <td className="py-4 px-4 text-center">
                        {status === 'Out of Stock' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-crimson-500/20 text-crimson-400 border border-crimson-500/40">
                            <XCircle size={12} />
                            <span>Out of Stock</span>
                          </span>
                        )}
                        {status === 'Low Stock' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-gold-400/20 text-gold-300 border border-gold-400/40">
                            <AlertTriangle size={12} />
                            <span>Low Stock (20%)</span>
                          </span>
                        )}
                        {status === 'In Stock' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-leaf-400/20 text-leaf-400 border border-leaf-400/40">
                            <CheckCircle2 size={12} />
                            <span>In Stock</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => setSelectedProductForDrawer(p)}
                          className="px-3.5 py-1.5 bg-ink-850 border border-paper-50/15 hover:border-gold-400 text-gold-400 font-bold text-xs rounded-xl flex items-center gap-1.5 ml-auto cursor-pointer transition-all"
                        >
                          <History size={14} />
                          <span>Ledger &amp; Adjust</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-paper-500 font-semibold">
                    No products matching your search or inventory filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ----------------------------------------------------------------------------------------- */}
      {/* MODAL 1: ADD PRODUCT MODAL */}
      {/* ----------------------------------------------------------------------------------------- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-ink-900 border border-gold-400/40 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-5 shadow-2xl text-paper-50 font-sans">
            <div className="flex items-center justify-between border-b border-paper-50/10 pb-4">
              <div>
                <h3 className="text-xl font-bold font-display text-white">Add New Fireworks Product</h3>
                <p className="text-xs text-paper-300">Create a new product with pricing, initial stock, and reorder limit.</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-paper-400 hover:text-white p-1 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-paper-300 font-bold mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 10 cm Electric Sparklers"
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    className="w-full bg-ink-850 border border-paper-50/15 text-white px-3.5 py-2.5 rounded-2xl outline-none font-semibold focus:border-gold-400"
                  />
                </div>
                <div>
                  <label className="block text-paper-300 font-bold mb-1">SKU Code</label>
                  <input
                    type="text"
                    placeholder="e.g. SPK-10CM-01"
                    value={newProdSku}
                    onChange={(e) => setNewProdSku(e.target.value)}
                    className="w-full bg-ink-850 border border-paper-50/15 text-gold-400 px-3.5 py-2.5 rounded-2xl outline-none font-semibold focus:border-gold-400 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-paper-300 font-bold mb-1">Category</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="w-full bg-ink-850 border border-paper-50/15 text-white px-3.5 py-2.5 rounded-2xl outline-none font-semibold focus:border-gold-400 cursor-pointer"
                  >
                    <option value="">Select Category</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-paper-300 font-bold mb-1">Brand</label>
                  <input
                    type="text"
                    value={newProdBrand}
                    onChange={(e) => setNewProdBrand(e.target.value)}
                    className="w-full bg-ink-850 border border-paper-50/15 text-white px-3.5 py-2.5 rounded-2xl outline-none font-semibold focus:border-gold-400"
                  />
                </div>
                <div>
                  <label className="block text-paper-300 font-bold mb-1">Packaging Unit</label>
                  <select
                    value={newProdUnit}
                    onChange={(e) => setNewProdUnit(e.target.value)}
                    className="w-full bg-ink-850 border border-paper-50/15 text-white px-3.5 py-2.5 rounded-2xl outline-none font-semibold focus:border-gold-400 cursor-pointer"
                  >
                    <option value="Box">Box</option>
                    <option value="Pkt">Pkt</option>
                    <option value="Piece">Piece</option>
                    <option value="Set">Set</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-paper-300 font-bold mb-1">Cost Price (₹)</label>
                  <input
                    type="number"
                    value={newProdCostPrice}
                    onChange={(e) => setNewProdCostPrice(Number(e.target.value))}
                    className="w-full bg-ink-850 border border-paper-50/15 text-white px-3 py-2.5 rounded-2xl outline-none font-semibold focus:border-gold-400"
                  />
                </div>
                <div>
                  <label className="block text-paper-300 font-bold mb-1">Retail MRP (₹)</label>
                  <input
                    type="number"
                    value={newProdRetailPrice}
                    onChange={(e) => setNewProdRetailPrice(Number(e.target.value))}
                    className="w-full bg-ink-850 border border-paper-50/15 text-white px-3 py-2.5 rounded-2xl outline-none font-semibold focus:border-gold-400"
                  />
                </div>
                <div>
                  <label className="block text-paper-300 font-bold mb-1">Wholesale Price (₹)</label>
                  <input
                    type="number"
                    value={newProdWholesalePrice}
                    onChange={(e) => setNewProdWholesalePrice(Number(e.target.value))}
                    className="w-full bg-ink-850 border border-paper-50/15 text-gold-400 px-3 py-2.5 rounded-2xl outline-none font-extrabold focus:border-gold-400"
                  />
                </div>
                <div>
                  <label className="block text-paper-300 font-bold mb-1">Dealer Price (₹)</label>
                  <input
                    type="number"
                    value={newProdDealerPrice}
                    onChange={(e) => setNewProdDealerPrice(Number(e.target.value))}
                    className="w-full bg-ink-850 border border-paper-50/15 text-white px-3 py-2.5 rounded-2xl outline-none font-semibold focus:border-gold-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-paper-300 font-bold mb-1">Reorder Threshold Limit</label>
                  <input
                    type="number"
                    value={newProdReorderThreshold}
                    onChange={(e) => setNewProdReorderThreshold(Number(e.target.value))}
                    className="w-full bg-ink-850 border border-paper-50/15 text-crimson-400 px-3.5 py-2.5 rounded-2xl outline-none font-extrabold focus:border-gold-400"
                  />
                </div>
                <div>
                  <label className="block text-paper-300 font-bold mb-1">Initial Opening Stock</label>
                  <input
                    type="number"
                    value={newProdInitialStock}
                    onChange={(e) => setNewProdInitialStock(Number(e.target.value))}
                    className="w-full bg-ink-850 border border-paper-50/15 text-leaf-400 px-3.5 py-2.5 rounded-2xl outline-none font-extrabold focus:border-gold-400"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-ink-850 border border-paper-50/10">
                <input
                  type="checkbox"
                  id="batchTracking"
                  checked={newProdBatchTracking}
                  onChange={(e) => setNewProdBatchTracking(e.target.checked)}
                  className="w-4 h-4 text-gold-400 rounded cursor-pointer accent-gold-400"
                />
                <label htmlFor="batchTracking" className="text-white font-semibold cursor-pointer">
                  Enable Batch Lot Tracking for PESO Expiry Verification
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-paper-50/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 rounded-full bg-ink-850 text-paper-300 font-bold hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isFormSubmitting}
                  className="px-7 py-2.5 rounded-full bg-gold-400 hover:bg-gold-300 text-ink-950 font-extrabold uppercase tracking-wider shadow-ember cursor-pointer"
                >
                  {isFormSubmitting ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------------------------------- */}
      {/* MODAL 2: STOCK TRANSFER MODAL (Atomic double-entry transaction) */}
      {/* ----------------------------------------------------------------------------------------- */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-ink-900 border border-gold-400/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl text-paper-50 font-sans">
            <div className="flex items-center justify-between border-b border-paper-50/10 pb-4">
              <div className="flex items-center gap-2 text-gold-400">
                <ArrowLeftRight size={20} />
                <h3 className="text-xl font-bold font-display text-white">Inter-Location Stock Transfer</h3>
              </div>
              <button onClick={() => setIsTransferModalOpen(false)} className="text-paper-400 hover:text-white p-1 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleStockTransferSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-paper-300 font-bold mb-1">Select Product *</label>
                <select
                  required
                  value={transferProductId}
                  onChange={(e) => setTransferProductId(e.target.value)}
                  className="w-full bg-ink-850 border border-paper-50/15 text-white px-3.5 py-2.5 rounded-2xl outline-none font-semibold focus:border-gold-400 cursor-pointer"
                >
                  <option value="">Choose Cracker Product</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.currentStock ?? 0} in stock)</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-paper-300 font-bold mb-1">From Source Location</label>
                  <select
                    value={transferFromLocation}
                    onChange={(e) => setTransferFromLocation(e.target.value)}
                    className="w-full bg-ink-850 border border-paper-50/15 text-white px-3.5 py-2.5 rounded-2xl outline-none font-semibold focus:border-gold-400 cursor-pointer"
                  >
                    {locations.map(loc => (
                      <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-paper-300 font-bold mb-1">To Destination Location</label>
                  <select
                    value={transferToLocation}
                    onChange={(e) => setTransferToLocation(e.target.value)}
                    className="w-full bg-ink-850 border border-paper-50/15 text-white px-3.5 py-2.5 rounded-2xl outline-none font-semibold focus:border-gold-400 cursor-pointer"
                  >
                    {locations.map(loc => (
                      <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-paper-300 font-bold mb-1">Quantity to Transfer</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={transferQuantity}
                  onChange={(e) => setTransferQuantity(Number(e.target.value))}
                  className="w-full bg-ink-850 border border-paper-50/15 text-gold-400 px-3.5 py-2.5 rounded-2xl outline-none font-extrabold focus:border-gold-400 text-sm"
                />
              </div>

              <div>
                <label className="block text-paper-300 font-bold mb-1">Transfer Notes / Reason</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Transport dispatch to retail outlet for weekend surge"
                  value={transferNotes}
                  onChange={(e) => setTransferNotes(e.target.value)}
                  className="w-full bg-ink-850 border border-paper-50/15 text-white px-3.5 py-2.5 rounded-2xl outline-none font-semibold focus:border-gold-400"
                />
              </div>

              {transferError && (
                <div className="p-3 rounded-xl bg-crimson-500/10 border border-crimson-500/30 text-crimson-400 font-semibold text-xs">
                  {transferError}
                </div>
              )}

              <div className="pt-3 flex justify-end gap-3 border-t border-paper-50/10">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-5 py-2.5 rounded-full bg-ink-850 text-paper-300 font-bold hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isFormSubmitting}
                  className="px-7 py-2.5 rounded-full bg-gold-400 hover:bg-gold-300 text-ink-950 font-extrabold uppercase tracking-wider shadow-ember cursor-pointer"
                >
                  {isFormSubmitting ? 'Transferring...' : 'Execute Stock Transfer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------------------------------- */}
      {/* MODAL 3: PER-PRODUCT DETAIL DRAWER & STOCK LEDGER HISTORY */}
      {/* ----------------------------------------------------------------------------------------- */}
      {selectedProductForDrawer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex justify-end">
          <div className="bg-ink-900 border-l border-gold-400/30 max-w-2xl w-full h-full p-6 sm:p-8 space-y-6 overflow-y-auto shadow-2xl text-paper-50 font-sans">
            <div className="flex items-center justify-between border-b border-paper-50/10 pb-4">
              <div>
                <span className="text-[10px] font-bold text-gold-400 uppercase tracking-wider block">
                  Product Stock Ledger History
                </span>
                <h3 className="text-2xl font-bold font-display text-white">{selectedProductForDrawer.name}</h3>
                <p className="text-xs text-paper-500 font-mono">SKU: {selectedProductForDrawer.sku || 'N/A'} · Category: {selectedProductForDrawer.category}</p>
              </div>
              <button onClick={() => setSelectedProductForDrawer(null)} className="text-paper-400 hover:text-white p-1 cursor-pointer">
                <X size={24} />
              </button>
            </div>

            {/* Product Quick Stats Strip */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-ink-850 border border-paper-50/10 text-xs">
              <div>
                <span className="text-paper-500 text-[10px] uppercase font-bold block">Current Stock</span>
                <span className="text-xl font-extrabold font-display text-white">
                  {calculateProductStock(selectedProductForDrawer, stockLedger)} Units
                </span>
              </div>
              <div>
                <span className="text-paper-500 text-[10px] uppercase font-bold block">Reorder Limit</span>
                <span className="text-xl font-extrabold font-display text-crimson-400">
                  {selectedProductForDrawer.reorderThreshold ?? 10}
                </span>
              </div>
              <div>
                <span className="text-paper-500 text-[10px] uppercase font-bold block">Wholesale Rate</span>
                <span className="text-xl font-extrabold font-display text-gold-400">
                  {formatCurrency(selectedProductForDrawer.wholesalePrice || selectedProductForDrawer.price)}
                </span>
              </div>
            </div>

            {/* Action Bar inside Drawer */}
            <div className="flex items-center justify-between border-b border-paper-50/10 pb-3">
              <h4 className="text-sm font-bold font-display text-white">Ledger Movements Log ({productLedgerHistory.length})</h4>
              <button
                onClick={() => setIsAdjustmentModalOpen(true)}
                className="px-4 py-2 bg-gold-400 hover:bg-gold-300 text-ink-950 font-bold text-xs uppercase tracking-wider rounded-full shadow-ember flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Edit3 size={14} />
                <span>Adjust Stock</span>
              </button>
            </div>

            {/* Stock Ledger Movements Table */}
            <div className="rounded-2xl border border-paper-50/10 overflow-hidden bg-ink-850 text-xs">
              <table className="w-full text-left text-paper-300">
                <thead className="bg-ink-950 text-gold-400 font-bold uppercase text-[9px] tracking-wider border-b border-paper-50/10">
                  <tr>
                    <th className="py-3 px-4">Date / Time</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3 text-right">Quantity</th>
                    <th className="py-3 px-4">Reason / Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-paper-50/5">
                  {productLedgerHistory.length > 0 ? (
                    productLedgerHistory.map((item) => (
                      <tr key={item.id} className="hover:bg-ink-900/50">
                        <td className="py-3 px-4 text-[11px] font-mono text-paper-400">
                          {new Date(item.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3 px-3 uppercase text-[10px] font-extrabold">
                          <span className={`px-2 py-0.5 rounded-full border ${
                            item.quantity > 0
                              ? 'bg-leaf-400/20 text-leaf-400 border-leaf-400/30'
                              : 'bg-crimson-500/20 text-crimson-400 border-crimson-500/30'
                          }`}>
                            {item.type}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-extrabold font-display text-sm">
                          <span className={item.quantity > 0 ? 'text-leaf-400' : 'text-crimson-400'}>
                            {item.quantity > 0 ? `+${item.quantity}` : item.quantity}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[11px] text-paper-300">
                          {item.notes || 'Manual stock update'}
                          <span className="block text-[9px] text-paper-500 font-mono">By: {item.createdBy || 'Admin'}</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-paper-500">
                        No ledger movements recorded yet for this product.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Inner Adjustment Modal */}
            {isAdjustmentModalOpen && (
              <div className="p-5 rounded-2xl bg-ink-950 border border-gold-400/40 space-y-4">
                <div className="flex items-center justify-between border-b border-paper-50/10 pb-2">
                  <h4 className="text-sm font-bold font-display text-gold-400">Manual Stock Adjustment</h4>
                  <button onClick={() => setIsAdjustmentModalOpen(false)} className="text-paper-400 hover:text-white p-1 cursor-pointer">
                    <X size={16} />
                  </button>
                </div>

                <form onSubmit={handleManualAdjustmentSubmit} className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-paper-300 font-bold mb-1">Adjustment Type</label>
                      <select
                        value={adjType}
                        onChange={(e) => setAdjType(e.target.value as any)}
                        className="w-full bg-ink-850 border border-paper-50/15 text-white px-3 py-2 rounded-xl outline-none font-semibold focus:border-gold-400 cursor-pointer"
                      >
                        <option value="adjustment">Stock Adjustment (+/-)</option>
                        <option value="purchase">Purchase Inflow (+)</option>
                        <option value="sale">Manual Sale Outflow (-)</option>
                        <option value="return">Customer Return (+)</option>
                        <option value="damage">Damaged / Expired (-)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-paper-300 font-bold mb-1">Quantity Amount</label>
                      <input
                        type="number"
                        required
                        value={adjQuantity}
                        onChange={(e) => setAdjQuantity(Number(e.target.value))}
                        className="w-full bg-ink-850 border border-paper-50/15 text-gold-400 px-3 py-2 rounded-xl outline-none font-extrabold focus:border-gold-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-paper-300 font-bold mb-1">Required Adjustment Reason *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Damaged during godown unloading / Physical count discrepancy"
                      value={adjReason}
                      onChange={(e) => setAdjReason(e.target.value)}
                      className="w-full bg-ink-850 border border-paper-50/15 text-white px-3.5 py-2 rounded-xl outline-none font-semibold focus:border-gold-400"
                    />
                  </div>

                  {adjError && <p className="text-[11px] text-crimson-400 font-semibold">{adjError}</p>}

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAdjustmentModalOpen(false)}
                      className="px-4 py-2 rounded-full bg-ink-850 text-paper-300 font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isFormSubmitting}
                      className="px-6 py-2 rounded-full bg-gold-400 hover:bg-gold-300 text-ink-950 font-extrabold uppercase tracking-wider cursor-pointer"
                    >
                      {isFormSubmitting ? 'Saving...' : 'Record Entry'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
