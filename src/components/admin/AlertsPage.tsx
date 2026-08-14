import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  ShoppingCart,
  CheckCircle2,
  Package,
  TrendingDown,
  Building2,
  X,
  Plus,
  Clock,
  ArrowRight,
  ShieldCheck,
  FileCheck
} from 'lucide-react';
import { useFirestoreCollection } from '../../hooks/useFirestore';
import { db } from '../../lib/firebase';
import { calculateProductStock, addStockLedgerEntry, recalculateProductStock, triggerCollectionUpdate } from '../../lib/firestore';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import type {
  Product,
  AlertDoc,
  Vendor,
  PurchaseOrder,
  PurchaseOrderItem,
  StockLedgerEntry
} from '../../types';

interface AlertsPageProps {
  products?: Product[];
}

export const AlertsPage: React.FC<AlertsPageProps> = ({ products: initialProducts = [] }) => {
  // Real-time Subscriptions
  const { data: productsData } = useFirestoreCollection<Product>('products');
  const { data: alertsData } = useFirestoreCollection<AlertDoc>('alerts');
  const { data: vendorsData } = useFirestoreCollection<Vendor>('vendors');
  const { data: ledgerData } = useFirestoreCollection<StockLedgerEntry>('stockLedger');

  const products = productsData.length > 0 ? productsData : initialProducts;
  const alerts = alertsData;
  const stockLedger = ledgerData;

  const defaultVendors: Vendor[] = [
    { id: 'v_1', name: 'Sivakasi Fireworks Manufacturing Co.', contactPerson: 'M. Shanmugam', phone: '+91 9443100000', address: 'Sivakasi Factory Complex', createdAt: new Date().toISOString() },
    { id: 'v_2', name: 'Sri Kaliswari Pyrotechnics', contactPerson: 'K. Ramesh', phone: '+91 9443200000', address: 'Sivakasi Main Road', createdAt: new Date().toISOString() },
    { id: 'v_3', name: 'Standard Fireworks Industries', contactPerson: 'V. Sundaram', phone: '+91 9443300000', address: 'Virudhunagar Highway', createdAt: new Date().toISOString() }
  ];
  const vendors = vendorsData.length > 0 ? vendorsData : defaultVendors;

  // Pre-fill Purchase Order Modal State
  const [selectedProductForPO, setSelectedProductForPO] = useState<Product | null>(null);
  const [poVendorId, setPoVendorId] = useState(vendors[0]?.id || 'v_1');
  const [poQuantity, setPoQuantity] = useState(50);
  const [poCostPrice, setPoCostPrice] = useState(100);
  const [poNotes, setPoNotes] = useState('');
  const [poSubmitting, setPoSubmitting] = useState(false);
  const [poSuccess, setPoSuccess] = useState('');

  // Calculate low stock products sorted by shortfall severity (how far below threshold)
  const lowStockItems = useMemo(() => {
    return products
      .map(p => {
        const stock = calculateProductStock(p, stockLedger);
        const threshold = p.reorderThreshold ?? 10;
        const shortfall = threshold - stock;
        const alertDoc = alerts.find(a => a.productId === p.id && !a.resolved);
        return {
          product: p,
          stock,
          threshold,
          shortfall,
          isBelowThreshold: stock <= threshold,
          alertDoc
        };
      })
      .filter(item => item.isBelowThreshold || item.alertDoc)
      .sort((a, b) => b.shortfall - a.shortfall);
  }, [products, alerts, stockLedger]);

  // Open Pre-filled Restock Modal
  const handleOpenPOModal = (p: Product, shortfall: number) => {
    setSelectedProductForPO(p);
    setPoCostPrice(p.costPrice || Math.round((p.wholesalePrice || p.price) * 0.6));
    const currentStock = calculateProductStock(p, stockLedger);
    const suggestedQty = Math.max(50, (p.reorderThreshold || 10) * 3 - currentStock);
    setPoQuantity(suggestedQty > 0 ? suggestedQty : 50);
    setPoNotes(`Direct inventory restock for ${p.name}`);
    setPoSuccess('');
  };

  // Submit Direct Restock Stock Entry
  const handlePOSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForPO) return;

    setPoSubmitting(true);
    try {
      const poId = 'RESTOCK-' + Date.now();
      const totalAmt = poQuantity * poCostPrice;

      // 1. Create Purchase Order record
      const newPO: PurchaseOrder = {
        id: poId,
        vendorId: poVendorId,
        orderDate: new Date().toISOString(),
        expectedDeliveryDate: new Date().toISOString(),
        status: 'received',
        items: [
          {
            productId: selectedProductForPO.id,
            quantity: poQuantity,
            costPrice: poCostPrice,
            receivedQuantity: poQuantity
          }
        ],
        totalAmount: totalAmt,
        amountPaid: totalAmt,
        paymentStatus: 'paid',
        notes: poNotes || `Direct stock replenishment for ${selectedProductForPO.name}`
      };

      await setDoc(doc(db, 'purchaseOrders', poId), newPO);

      // 2. Add Stock Ledger entry
      await addStockLedgerEntry({
        productId: selectedProductForPO.id,
        type: 'purchase',
        quantity: Math.abs(poQuantity),
        locationId: 'loc_1',
        referenceType: 'purchaseOrderId',
        referenceId: poId,
        notes: `Restocked ${poQuantity} units via supplier`,
        createdBy: 'Admin',
        createdAt: new Date().toISOString()
      });

      // 3. Recalculate & Trigger instant UI updates
      await recalculateProductStock(selectedProductForPO.id);
      triggerCollectionUpdate('products');
      triggerCollectionUpdate('stockLedger');
      triggerCollectionUpdate('alerts');

      setPoSuccess(`Restocked ${poQuantity} units of "${selectedProductForPO.name}" successfully! Stock updated automatically.`);
      setTimeout(() => {
        setSelectedProductForPO(null);
        setPoSuccess('');
      }, 1500);
    } catch (err) {
      console.error('Restock Error:', err);
      alert('Failed to restock. Please check connection.');
    } finally {
      setPoSubmitting(false);
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
      {/* Top Banner Header */}
      <div className="bg-ink-900 p-6 rounded-3xl border border-gold-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-ember">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-gold-400 font-bold text-xs uppercase tracking-wider">
            <AlertTriangle size={16} />
            <span>Real-Time Inventory Alert System</span>
          </div>
          <h1 className="text-3xl font-bold font-display text-white">Low Stock Alerts &amp; Restocking</h1>
          <p className="text-xs text-paper-300">
            Products falling below reorder threshold limits. Restock inventory with 1-tap stock reflection.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-4 py-2 rounded-2xl bg-ink-850 border border-crimson-500/30 text-crimson-400 font-bold text-xs">
            {lowStockItems.length} Urgent Shortfalls
          </span>
        </div>
      </div>

      {/* Main Alerts List */}
      <div className="space-y-4">
        <h3 className="text-base font-bold font-display text-white flex items-center justify-between">
          <span>Low Stock Inventory Items</span>
          <span className="text-xs text-paper-400 font-normal">Sorted by Severity (Deficit Shortfall)</span>
        </h3>

        {lowStockItems.length > 0 ? (
          <div className="space-y-3">
            {lowStockItems.map(({ product, stock, threshold, shortfall }) => (
              <div
                key={product.id}
                className="bg-ink-900 p-5 rounded-3xl border border-crimson-500/30 hover:border-crimson-500/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl"
              >
                {/* Product Info */}
                <div className="flex items-center gap-4 min-w-0">
                  <img
                    src={product.image_url || '/crackers falls logo.webp'}
                    alt={product.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-paper-50/10 bg-ink-850 shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/crackers falls logo.webp'; }}
                  />
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-crimson-500/20 text-crimson-400 border border-crimson-500/40">
                        Deficit: -{Math.max(0, shortfall)} Units
                      </span>
                      <span className="text-[10px] font-mono text-gold-400 font-semibold">{product.sku || 'SKU-NONE'}</span>
                    </div>
                    <h4 className="text-base font-bold font-display text-white truncate">{product.name}</h4>
                    <p className="text-xs text-paper-400">
                      Category: <span className="text-paper-200">{product.category}</span> · Brand: <span className="text-paper-200">{product.brand || 'Crackers Falls'}</span>
                    </p>
                  </div>
                </div>

                {/* Metrics & Quick Action */}
                <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-paper-50/10">
                  <div className="text-right">
                    <div className="text-xs text-paper-500 uppercase font-bold">Current Stock</div>
                    <div className="text-xl font-extrabold font-display text-crimson-400">{stock} <span className="text-xs font-normal text-paper-400">/ {threshold} Limit</span></div>
                  </div>

                  <button
                    onClick={() => handleOpenPOModal(product, shortfall)}
                    className="px-6 py-3 bg-gold-400 hover:bg-gold-300 text-ink-950 font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-ember flex items-center gap-2 cursor-pointer transition-all shrink-0"
                  >
                    <Plus size={16} />
                    <span>Restock</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-ink-900 p-12 rounded-3xl border border-paper-50/10 text-center space-y-3 shadow-xl">
            <CheckCircle2 size={42} className="mx-auto text-leaf-400" />
            <h3 className="text-lg font-bold font-display text-white">All Stock Levels Healthy</h3>
            <p className="text-xs text-paper-400 max-w-md mx-auto">
              No products are currently below their reorder threshold limit. All low-stock alerts auto-resolve as soon as stock is replenished!
            </p>
          </div>
        )}
      </div>

      {/* ----------------------------------------------------------------------------------------- */}
      {/* MODAL: DIRECT INVENTORY RESTOCK FORM */}
      {/* ----------------------------------------------------------------------------------------- */}
      {selectedProductForPO && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-ink-900 border border-gold-400/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl text-paper-50 font-sans">
            <div className="flex items-center justify-between border-b border-paper-50/10 pb-4">
              <div className="flex items-center gap-2.5 text-gold-400">
                <Package size={20} />
                <h3 className="text-xl font-bold font-display text-white">Restock Inventory Stock</h3>
              </div>
              <button onClick={() => setSelectedProductForPO(null)} className="text-paper-400 hover:text-white p-1 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-ink-850 border border-paper-50/10 space-y-1 text-xs">
              <span className="text-[10px] text-gold-400 font-bold uppercase tracking-wider block">Selected Product</span>
              <p className="font-bold text-white text-sm font-display">{selectedProductForPO.name}</p>
              <p className="text-paper-400">Current Stock: <span className="text-crimson-400 font-bold">{calculateProductStock(selectedProductForPO, stockLedger)}</span> · Reorder Limit: {selectedProductForPO.reorderThreshold ?? 10}</p>
            </div>

            <form onSubmit={handlePOSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-paper-300 font-bold mb-1">Select Supplier Vendor *</label>
                <select
                  required
                  value={poVendorId}
                  onChange={(e) => setPoVendorId(e.target.value)}
                  className="w-full bg-ink-850 border border-paper-50/15 text-white px-3.5 py-2.5 rounded-2xl outline-none font-semibold focus:border-gold-400 cursor-pointer"
                >
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>{v.name} ({v.phone})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-paper-300 font-bold mb-1">Restock Quantity (+)</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={poQuantity}
                    onChange={(e) => setPoQuantity(Number(e.target.value))}
                    className="w-full bg-ink-850 border border-paper-50/15 text-gold-400 px-3.5 py-2.5 rounded-2xl outline-none font-extrabold focus:border-gold-400 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-paper-300 font-bold mb-1">Unit Cost Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={poCostPrice}
                    onChange={(e) => setPoCostPrice(Number(e.target.value))}
                    className="w-full bg-ink-850 border border-paper-50/15 text-white px-3.5 py-2.5 rounded-2xl outline-none font-semibold focus:border-gold-400 text-sm"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-ink-850 border border-gold-400/30 flex items-center justify-between text-xs">
                <span className="text-paper-300 font-bold">Total Restock Value:</span>
                <span className="text-lg font-extrabold font-display text-gold-400">
                  {formatCurrency(poQuantity * poCostPrice)}
                </span>
              </div>

              <div>
                <label className="block text-paper-300 font-bold mb-1">Restock Notes / Invoice Reference</label>
                <textarea
                  rows={2}
                  value={poNotes}
                  onChange={(e) => setPoNotes(e.target.value)}
                  className="w-full bg-ink-850 border border-paper-50/15 text-white px-3.5 py-2.5 rounded-2xl outline-none font-semibold focus:border-gold-400"
                />
              </div>

              {poSuccess && (
                <div className="p-3 rounded-xl bg-leaf-400/20 border border-leaf-400/40 text-leaf-400 font-bold text-xs">
                  {poSuccess}
                </div>
              )}

              <div className="pt-3 flex justify-end gap-3 border-t border-paper-50/10">
                <button
                  type="button"
                  onClick={() => setSelectedProductForPO(null)}
                  className="px-5 py-2.5 rounded-full bg-ink-850 text-paper-300 font-bold hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={poSubmitting}
                  className="px-7 py-2.5 rounded-full bg-gold-400 hover:bg-gold-300 text-ink-950 font-extrabold uppercase tracking-wider shadow-ember cursor-pointer flex items-center gap-2"
                >
                  <Plus size={16} />
                  <span>{poSubmitting ? 'Restocking...' : 'Confirm Restock'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertsPage;
