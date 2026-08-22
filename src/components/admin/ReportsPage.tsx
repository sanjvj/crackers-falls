import React, { useMemo } from 'react';
import { FileText, TrendingUp, Package, MessageSquare, ShoppingBag, Building2, Warehouse, Users, ArrowUpRight } from 'lucide-react';
import { useFirestoreCollection } from '../../hooks/useFirestore';
import { calculateProductStock } from '../../lib/firestore';
import type { Product, Enquiry, SalesOrder, Vendor, PurchaseOrder, StockLedgerEntry } from '../../types';

interface ReportsPageProps {
  products?: Product[];
  enquiries?: Enquiry[];
}

export const ReportsPage: React.FC<ReportsPageProps> = ({
  products: initialProducts = [],
  enquiries: initialEnquiries = []
}) => {
  const { data: productsData } = useFirestoreCollection<Product>('products');
  const { data: enquiriesData } = useFirestoreCollection<Enquiry>('enquiries');
  const { data: salesOrdersData } = useFirestoreCollection<SalesOrder>('salesOrders');
  const { data: vendorsData } = useFirestoreCollection<Vendor>('vendors');
  const { data: purchaseOrdersData } = useFirestoreCollection<PurchaseOrder>('purchaseOrders');
  const { data: ledgerData } = useFirestoreCollection<StockLedgerEntry>('stockLedger');

  const products = productsData.length > 0 ? productsData : initialProducts;
  const enquiries = enquiriesData.length > 0 ? enquiriesData : initialEnquiries;
  const salesOrders = salesOrdersData;
  const vendors = vendorsData;
  const purchaseOrders = purchaseOrdersData;
  const stockLedger = ledgerData;

  const metrics = useMemo(() => {
    const totalPosOrders = salesOrders.filter(o => o.channel === 'in-person').length;
    const totalPosRevenue = salesOrders
      .filter(o => o.channel === 'in-person')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const totalWholesaleOrders = salesOrders.filter(o => o.channel !== 'in-person').length || enquiries.length;
    const totalWholesaleRevenue = salesOrders
      .filter(o => o.channel !== 'in-person')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0) || enquiries.reduce((sum, e) => sum + (e.grand_total || 0), 0);

    const grandTotalRevenue = totalPosRevenue + totalWholesaleRevenue;

    const totalStockValue = products.reduce((sum, p) => {
      const currentStock = calculateProductStock(p, stockLedger);
      return sum + (currentStock * (p.price || 0));
    }, 0);

    const confirmedOrders = salesOrders.filter(o => ['confirmed', 'packed', 'dispatched', 'delivered'].includes(o.status)).length;
    const deliveredOrders = salesOrders.filter(o => o.status === 'delivered').length;

    // Category breakdown
    const categoryMap: Record<string, { count: number; stock: number; value: number }> = {};
    products.forEach(p => {
      const cat = p.category || 'Sparklers';
      const stock = calculateProductStock(p, stockLedger);
      if (!categoryMap[cat]) {
        categoryMap[cat] = { count: 0, stock: 0, value: 0 };
      }
      categoryMap[cat].count += 1;
      categoryMap[cat].stock += stock;
      categoryMap[cat].value += stock * (p.price || 0);
    });

    const categoryBreakdown = Object.entries(categoryMap).map(([name, data]) => ({
      name,
      ...data
    })).sort((a, b) => b.value - a.value);

    return {
      totalPosOrders,
      totalPosRevenue,
      totalWholesaleOrders,
      totalWholesaleRevenue,
      grandTotalRevenue,
      totalStockValue,
      confirmedOrders,
      deliveredOrders,
      categoryBreakdown
    };
  }, [salesOrders, enquiries, products, stockLedger]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans text-paper-50">
      {/* Header Card */}
      <div className="bg-ink-900 p-6 sm:p-8 rounded-3xl border border-gold-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-ember">
        <div>
          <div className="flex items-center gap-2 text-gold-400 font-bold text-xs uppercase tracking-wider">
            <FileText size={16} />
            <span>Operational Audit & Analytics</span>
          </div>
          <h1 className="text-3xl font-bold font-display text-white mt-1">Store Performance & Audit Reports</h1>
          <p className="text-xs text-paper-300 font-sans mt-1">Live operational metrics, fulfillment rates, stock valuation, and category distribution.</p>
        </div>
        <div className="flex items-center gap-2 bg-gold-400/10 border border-gold-400/30 text-gold-300 px-4 py-2 rounded-full font-bold text-xs shrink-0">
          <TrendingUp size={16} />
          <span>Total Valuation: {formatCurrency(metrics.grandTotalRevenue + metrics.totalStockValue)}</span>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-ink-900 p-6 rounded-3xl border border-paper-50/10 space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-paper-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Gross Sales Revenue</span>
            <TrendingUp size={16} className="text-leaf-400" />
          </div>
          <p className="text-2xl font-extrabold font-display text-gold-400">{formatCurrency(metrics.grandTotalRevenue)}</p>
          <p className="text-[11px] text-paper-300 font-sans">Combined POS & Wholesale pipeline</p>
        </div>

        <div className="bg-ink-900 p-6 rounded-3xl border border-paper-50/10 space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-paper-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Inventory Valuation</span>
            <Warehouse size={16} className="text-amber-400" />
          </div>
          <p className="text-2xl font-extrabold font-display text-white">{formatCurrency(metrics.totalStockValue)}</p>
          <p className="text-[11px] text-paper-300 font-sans">Active godown stock at wholesale rate</p>
        </div>

        <div className="bg-ink-900 p-6 rounded-3xl border border-paper-50/10 space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-paper-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">POS Billing Counter</span>
            <ShoppingBag size={16} className="text-sky-400" />
          </div>
          <p className="text-2xl font-extrabold font-display text-white">{formatCurrency(metrics.totalPosRevenue)}</p>
          <p className="text-[11px] text-leaf-400 font-semibold">{metrics.totalPosOrders} Counter POS Tickets</p>
        </div>

        <div className="bg-ink-900 p-6 rounded-3xl border border-paper-50/10 space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-paper-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Vendors & Suppliers</span>
            <Building2 size={16} className="text-purple-400" />
          </div>
          <p className="text-2xl font-extrabold font-display text-white">{vendors.length} Vendors</p>
          <p className="text-[11px] text-gold-400 font-semibold">{purchaseOrders.length} Purchase Orders Issued</p>
        </div>
      </div>

      {/* Category Stock Distribution Table */}
      <div className="bg-ink-900 p-6 rounded-3xl border border-paper-50/10 space-y-4 shadow-2xl">
        <h3 className="text-base font-bold font-display text-white flex items-center gap-2">
          <Package size={18} className="text-gold-400" />
          <span>Category Inventory Valuation Breakdown</span>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-paper-50/10 bg-ink-950/60 text-paper-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="p-3">Category</th>
                <th className="p-3">Products Listed</th>
                <th className="p-3">Current Stock Units</th>
                <th className="p-3 text-right">Category Stock Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-paper-50/5">
              {metrics.categoryBreakdown.map((cat, i) => (
                <tr key={i} className="hover:bg-paper-50/5 transition-colors">
                  <td className="p-3 font-bold text-white">{cat.name}</td>
                  <td className="p-3 text-paper-300 font-semibold">{cat.count} Items</td>
                  <td className="p-3 text-paper-300 font-semibold">{cat.stock} Boxes</td>
                  <td className="p-3 text-right font-extrabold text-gold-400 font-display">{formatCurrency(cat.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
