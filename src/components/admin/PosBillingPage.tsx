import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Zap,
  Search,
  Barcode,
  Plus,
  Minus,
  Trash2,
  Printer,
  CheckCircle2,
  User,
  CreditCard,
  Building,
  RotateCcw,
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { useFirestoreCollection } from '../../hooks/useFirestore';
import { addStockLedgerEntry, recalculateProductStock, calculateProductStock } from '../../lib/firestore';
import { db } from '../../lib/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { generateThermalReceiptPDF } from '../../lib/thermalBillGenerator';
import type { Product, SalesOrder, Customer, StockLedgerEntry } from '../../types';

interface PosBillingPageProps {
  products?: Product[];
}

export const PosBillingPage: React.FC<PosBillingPageProps> = ({ products: initialProducts = [] }) => {
  // Subscriptions
  const { data: productsData } = useFirestoreCollection<Product>('products');
  const { data: ledgerData } = useFirestoreCollection<StockLedgerEntry>('stockLedger');
  const products = productsData.length > 0 ? productsData : initialProducts;
  const stockLedger = ledgerData;

  // Search & Barcode States
  const [searchTerm, setSearchTerm] = useState('');
  const [skuInput, setSkuInput] = useState('');
  const skuInputRef = useRef<HTMLInputElement>(null);

  // Cart State
  const [cart, setCart] = useState<Array<{
    product: Product;
    quantity: number;
    unitPrice: number;
  }>>([]);

  // Customer & Payment Details
  const [customerName, setCustomerName] = useState('Walk-in Counter Customer');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'UPI' | 'bank_transfer'>('cash');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [billPrefix, setBillPrefix] = useState('CF-POS-');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState('');

  // Auto-focus SKU input on mount
  useEffect(() => {
    skuInputRef.current?.focus();
  }, []);

  // Top Selling Items (quick tap grid)
  const topSellingProducts = useMemo(() => {
    return products.slice(0, 8);
  }, [products]);

  // Search Filtered Products
  const searchedProducts = useMemo(() => {
    if (!searchTerm.trim()) return products.slice(0, 12);
    return products.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [products, searchTerm]);

  // Handle SKU / Barcode Scan Submit
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skuInput.trim()) return;

    const matchedProd = products.find(p => p.sku?.toLowerCase() === skuInput.trim().toLowerCase());
    if (matchedProd) {
      handleAddToCart(matchedProd);
      setSkuInput('');
    } else {
      alert(`No product found matching SKU/Barcode: ${skuInput}`);
    }
  };

  // Add Product to Running Cart
  const handleAddToCart = (p: Product) => {
    const existingIdx = cart.findIndex(item => item.product.id === p.id);
    if (existingIdx >= 0) {
      const updated = [...cart];
      updated[existingIdx].quantity += 1;
      setCart(updated);
    } else {
      const price = p.retailPrice || p.price;
      setCart([...cart, { product: p, quantity: 1, unitPrice: price }]);
    }
  };

  // Update Cart Quantity
  const handleUpdateQty = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean) as typeof cart);
  };

  // Totals Calculations
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  }, [cart]);

  const grandTotal = Math.max(0, subtotal - discountAmount);

  // Clear Cart
  const handleClearCart = () => {
    setCart([]);
    setDiscountAmount(0);
    setCheckoutSuccess('');
  };

  // One-Tap Checkout & Thermal Bill Print
  const handlePOSCheckout = async () => {
    if (cart.length === 0) return;

    setIsSubmitting(true);
    setCheckoutSuccess('');

    try {
      const timestamp = new Date().toISOString();
      const numPart = Math.floor(1000 + Math.random() * 9000).toString();
      const orderId = 'POS-' + Date.now();
      const orderNum = `${billPrefix}${numPart}`;

      // 1. Create SalesOrder document
      const orderItems = cart.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        priceType: 'retail' as const
      }));

      const newOrder: SalesOrder = {
        id: orderId,
        orderNumber: orderNum,
        channel: 'in-person',
        customerId: customerName + (customerPhone ? ` (${customerPhone})` : ''),
        orderDate: timestamp,
        status: 'delivered', // Walk-in counter sale delivered immediately
        items: orderItems,
        totalAmount: grandTotal,
        amountPaid: grandTotal,
        paymentStatus: 'paid',
        deliveryType: 'pickup',
        locationId: 'loc_1',
        notes: `In-Person Counter POS Billing (${paymentMethod.toUpperCase()})`
      };

      await setDoc(doc(db, 'salesOrders', orderId), newOrder);

      // 2. Write Stock Ledger entries for line items
      for (const item of cart) {
        await addStockLedgerEntry({
          productId: item.product.id,
          type: 'sale',
          quantity: -Math.abs(item.quantity),
          locationId: 'loc_1',
          referenceType: 'salesOrderId',
          referenceId: orderId,
          notes: `Counter POS Bill #${orderNum}`,
          createdBy: 'Counter Cashier',
          createdAt: timestamp
        });
        await recalculateProductStock(item.product.id);
      }

      // 3. Generate & Open Thermal Receipt PDF
      generateThermalReceiptPDF({
        billNumber: numPart,
        orderDate: timestamp,
        customerName: customerName.trim() || 'Walk-in Customer',
        customerPhone,
        paymentMethod,
        items: cart.map(i => ({
          name: i.product.name,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          total: i.quantity * i.unitPrice
        })),
        subtotal,
        discount: discountAmount,
        grandTotal,
        billPrefix
      });

      setCheckoutSuccess(`Bill #${orderNum} generated successfully! Receipt ready for thermal printing.`);
      setCart([]);
      setDiscountAmount(0);
      skuInputRef.current?.focus();
    } catch (err) {
      console.error('POS Checkout error:', err);
      alert('Checkout failed. Please check network connection.');
    } finally {
      setIsSubmitting(false);
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
            <Zap size={16} />
            <span>Counter POS &amp; Thermal Bill Station</span>
          </div>
          <h1 className="text-2xl font-bold font-display text-white">In-Person Counter Billing</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-ink-850 px-3.5 py-2 rounded-2xl border border-paper-50/15 text-xs">
            <span className="text-paper-400 font-bold">Prefix:</span>
            <input
              type="text"
              value={billPrefix}
              onChange={(e) => setBillPrefix(e.target.value)}
              className="w-24 bg-ink-900 border border-gold-400/40 text-gold-400 font-mono font-bold px-2 py-0.5 rounded outline-none"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Fast Product Search & Touch Grid (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Barcode & SKU Fast Search Bar */}
          <div className="bg-ink-900 p-4 rounded-3xl border border-paper-50/10 shadow-xl space-y-3">
            <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Barcode className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gold-400" size={18} />
                <input
                  ref={skuInputRef}
                  type="text"
                  placeholder="Scan Barcode or enter SKU code (Press Enter)..."
                  value={skuInput}
                  onChange={(e) => setSkuInput(e.target.value)}
                  className="w-full bg-ink-850 border border-gold-400/40 text-gold-300 font-mono text-sm pl-11 pr-4 py-3 rounded-2xl outline-none font-bold focus:border-gold-400"
                />
              </div>
              <button
                type="submit"
                className="px-5 bg-gold-400 hover:bg-gold-300 text-ink-950 font-extrabold text-xs uppercase rounded-2xl cursor-pointer"
              >
                Scan
              </button>
            </form>

            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-paper-500" size={15} />
              <input
                type="text"
                placeholder="Search product name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-ink-850 border border-paper-50/15 text-white text-xs pl-10 pr-4 py-2.5 rounded-2xl outline-none font-semibold focus:border-gold-400"
              />
            </div>
          </div>

          {/* Quick-Tap Touch Grid for Top-Selling Products */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-gold-400 uppercase tracking-wider block">
              ⚡ Quick-Tap Top Sellers
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {topSellingProducts.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleAddToCart(p)}
                  className="p-3 bg-ink-900 hover:bg-ink-850 border border-paper-50/10 hover:border-gold-400/50 rounded-2xl text-left space-y-1 cursor-pointer transition-all shadow-md active:scale-95 flex flex-col justify-between h-24"
                >
                  <div>
                    <span className="text-[9px] font-bold text-gold-400 uppercase block truncate">{p.category}</span>
                    <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug">{p.name}</h4>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-paper-50/5">
                    <span className="text-xs font-extrabold text-gold-400 font-display">{formatCurrency(p.retailPrice || p.price)}</span>
                    <span className="text-[9px] text-leaf-400 font-bold">{calculateProductStock(p, stockLedger)} in stock</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Searched Product List */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-paper-400 uppercase tracking-wider block">
              Product Directory ({searchedProducts.length})
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[320px] overflow-y-auto pr-1">
              {searchedProducts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleAddToCart(p)}
                  className="p-3 bg-ink-900 border border-paper-50/10 hover:border-gold-400/50 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-all hover:bg-ink-850"
                >
                  <div className="min-w-0">
                    <div className="font-mono text-[9px] text-gold-400 font-bold">{p.sku || 'SKU-NONE'}</div>
                    <h5 className="font-bold text-white text-xs truncate">{p.name}</h5>
                    <div className="text-[10px] text-paper-400">{p.unit || 'Box'}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-extrabold font-display text-white text-sm">{formatCurrency(p.retailPrice || p.price)}</div>
                    <button className="px-2.5 py-1 bg-gold-400 text-ink-950 text-[10px] font-extrabold rounded-lg uppercase mt-1">
                      + Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Running Cart & Thermal Billing Station (5 Cols) */}
        <div className="lg:col-span-5 bg-ink-900 p-6 rounded-3xl border border-gold-400/30 space-y-5 shadow-2xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-paper-50/10 pb-3">
              <div className="flex items-center gap-2 text-gold-400 font-bold text-sm font-display">
                <ShoppingBag size={18} />
                <span>Current Receipt Bill ({cart.length} Items)</span>
              </div>
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearCart}
                  className="text-paper-500 hover:text-crimson-400 text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw size={13} />
                  <span>Clear Cart</span>
                </button>
              )}
            </div>

            {/* Cart Items List */}
            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {cart.length > 0 ? (
                cart.map((item) => (
                  <div key={item.product.id} className="p-3 bg-ink-850 rounded-2xl border border-paper-50/10 flex items-center justify-between text-xs gap-3">
                    <div className="min-w-0 flex-1">
                      <h5 className="font-bold text-white truncate">{item.product.name}</h5>
                      <span className="text-[10px] text-paper-400 block">{formatCurrency(item.unitPrice)} / unit</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleUpdateQty(item.product.id, -1)}
                        className="w-6 h-6 rounded-full bg-ink-900 text-paper-300 flex items-center justify-center cursor-pointer"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-5 text-center font-bold text-gold-400 font-display">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => handleUpdateQty(item.product.id, 1)}
                        className="w-6 h-6 rounded-full bg-gold-400 text-ink-950 font-bold flex items-center justify-center cursor-pointer"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <div className="font-extrabold font-display text-white text-sm shrink-0 min-w-[60px] text-right">
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-paper-500 text-xs">
                  Cart is empty. Tap top sellers or scan barcodes to start billing.
                </div>
              )}
            </div>

            {/* Customer Details Form */}
            <div className="space-y-3 pt-3 border-t border-paper-50/10 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-paper-400 font-bold mb-1">Customer Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-ink-850 border border-paper-50/15 text-white px-3 py-2 rounded-xl outline-none font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-paper-400 font-bold mb-1">Mobile Phone</label>
                  <input
                    type="tel"
                    placeholder="Optional phone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-ink-850 border border-paper-50/15 text-white px-3 py-2 rounded-xl outline-none font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-paper-400 font-bold mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full bg-ink-850 border border-paper-50/15 text-white px-3 py-2 rounded-xl outline-none font-semibold cursor-pointer"
                  >
                    <option value="cash">Cash Payment</option>
                    <option value="UPI">UPI / GPay / PhonePe</option>
                    <option value="bank_transfer">Direct Bank Transfer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-paper-400 font-bold mb-1">Flat Discount (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(Number(e.target.value))}
                    className="w-full bg-ink-850 border border-paper-50/15 text-gold-400 px-3 py-2 rounded-xl outline-none font-extrabold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Receipt Totals & One-Tap Checkout Action */}
          <div className="space-y-4 pt-4 border-t border-paper-50/10">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-paper-400">
                <span>Subtotal:</span>
                <span className="font-bold text-white">{formatCurrency(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-gold-400">
                  <span>Discount:</span>
                  <span className="font-bold">- {formatCurrency(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-extrabold font-display text-white pt-2 border-t border-paper-50/10">
                <span>Grand Total:</span>
                <span className="text-xl text-gold-400">{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            {checkoutSuccess && (
              <div className="p-3 rounded-xl bg-leaf-400/20 border border-leaf-400/40 text-leaf-400 font-bold text-xs">
                {checkoutSuccess}
              </div>
            )}

            <button
              type="button"
              disabled={cart.length === 0 || isSubmitting}
              onClick={handlePOSCheckout}
              className="w-full py-4 bg-gold-400 hover:bg-gold-300 text-ink-950 font-extrabold text-sm uppercase tracking-wider rounded-2xl shadow-ember flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              <Printer size={18} />
              <span>{isSubmitting ? 'Processing Bill...' : 'Checkout & Print Thermal Bill'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PosBillingPage;
