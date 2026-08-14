import React, { useMemo, useState } from 'react';
import {
  TrendingUp,
  ShoppingBag,
  AlertTriangle,
  Clock,
  DollarSign,
  Users,
  Plus,
  ArrowRight,
  Globe,
  MessageCircle,
  Store,
  Building,
  CheckCircle2,
  Package,
  Zap,
  ArrowUpRight,
  TrendingDown,
  Building2,
  FileText,
  BarChart3,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { useFirestoreCollection } from '../../hooks/useFirestore';
import { calculateProductStock } from '../../lib/firestore';
import type {
  Product,
  CategoryItem,
  SalesOrder,
  PurchaseOrder,
  Customer,
  Vendor,
  AlertDoc,
  Enquiry,
  StockLedgerEntry
} from '../../types';

interface DashboardPageProps {
  products?: Product[];
  categories?: CategoryItem[];
  enquiries?: Enquiry[];
  onNavigateTab?: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  products: initialProducts = [],
  categories = [],
  enquiries = [],
  onNavigateTab = () => {}
}) => {
  // Real-time Firestore Subscriptions
  const { data: productsData } = useFirestoreCollection<Product>('products');
  const { data: salesOrdersData } = useFirestoreCollection<SalesOrder>('salesOrders');
  const { data: purchaseOrdersData } = useFirestoreCollection<PurchaseOrder>('purchaseOrders');
  const { data: customersData } = useFirestoreCollection<Customer>('customers');
  const { data: vendorsData } = useFirestoreCollection<Vendor>('vendors');
  const { data: alertsData } = useFirestoreCollection<AlertDoc>('alerts');
  const { data: enquiriesData } = useFirestoreCollection<Enquiry>('enquiries');
  const { data: ledgerData } = useFirestoreCollection<StockLedgerEntry>('stockLedger');

  const products = productsData.length > 0 ? productsData : initialProducts;
  const salesOrders = salesOrdersData;
  const purchaseOrders = purchaseOrdersData;
  const customers = customersData;
  const alerts = alertsData;
  const allEnquiries = enquiriesData.length > 0 ? enquiriesData : enquiries;
  const stockLedger = ledgerData;

  // Time Filter for Analytics Graph (7d / 30d / year)
  const [timeFilter, setTimeFilter] = useState<'7d' | '30d' | 'year'>('30d');

  // -----------------------------------------------------------------------------------------------
  // WIDGET 1: TODAY'S SALES & CHANNEL BREAKDOWN
  // -----------------------------------------------------------------------------------------------
  const todaySalesData = useMemo(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayTime = startOfToday.getTime();

    const todayOrders = salesOrders.filter(o => new Date(o.orderDate || 0).getTime() >= todayTime);
    const totalRev = todayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const channelMap = {
      website: 0,
      whatsapp: 0,
      'in-person': 0,
      wholesale: 0
    };

    todayOrders.forEach(o => {
      const ch = o.channel || 'in-person';
      if (channelMap[ch] !== undefined) {
        channelMap[ch] += (o.totalAmount || 0);
      }
    });

    return {
      totalOrders: todayOrders.length,
      totalRev,
      channels: channelMap
    };
  }, [salesOrders]);

  // -----------------------------------------------------------------------------------------------
  // WIDGET 2: URGENT LOW STOCK ALERTS (TOP 5)
  // -----------------------------------------------------------------------------------------------
  const topLowStockAlerts = useMemo(() => {
    return products
      .map(p => {
        const stock = calculateProductStock(p, stockLedger);
        const threshold = p.reorderThreshold ?? 10;
        const shortfall = threshold - stock;
        return { product: p, stock, threshold, shortfall };
      })
      .filter(item => item.stock <= item.threshold)
      .sort((a, b) => b.shortfall - a.shortfall)
      .slice(0, 5);
  }, [products, stockLedger]);

  // -----------------------------------------------------------------------------------------------
  // WIDGET 3: PENDING ORDERS COUNT
  // -----------------------------------------------------------------------------------------------
  const pendingOrdersCount = useMemo(() => {
    return salesOrders.filter(o => ['enquiry', 'pending', 'confirmed', 'packed'].includes(o.status)).length;
  }, [salesOrders]);

  // -----------------------------------------------------------------------------------------------
  // WIDGET 4: CASH POSITION (RECEIVABLES VS PAYABLES)
  // -----------------------------------------------------------------------------------------------
  const cashPosition = useMemo(() => {
    const receivables = customers.reduce((sum, c) => sum + (c.totalOutstanding || 0), 0);
    const payables = purchaseOrders
      .filter(po => po.paymentStatus !== 'paid')
      .reduce((sum, po) => sum + Math.max(0, (po.totalAmount || 0) - (po.amountPaid || 0)), 0);

    return { receivables, payables };
  }, [customers, purchaseOrders]);

  // -----------------------------------------------------------------------------------------------
  // WIDGET 5: TOP SELLING PRODUCTS THIS WEEK
  // -----------------------------------------------------------------------------------------------
  const topSellingProducts = useMemo(() => {
    const countMap = new Map<string, number>();

    salesOrders.forEach(o => {
      (o.items || []).forEach(item => {
        const current = countMap.get(item.productId) || 0;
        countMap.set(item.productId, current + (item.quantity || 1));
      });
    });

    const ranked = Array.from(countMap.entries())
      .map(([pId, qty]) => {
        const p = products.find(prod => prod.id === pId || prod.name === pId);
        return {
          product: p || { name: pId, category: 'Fireworks', unit: 'Box' },
          qty
        };
      })
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    return ranked.length > 0 ? ranked : products.slice(0, 5).map(p => ({ product: p, qty: 35 }));
  }, [salesOrders, products]);

  // -----------------------------------------------------------------------------------------------
  // FROM OLD DASHBOARD: TOTAL CONFIRMED & PIPELINE REVENUE
  // -----------------------------------------------------------------------------------------------
  const confirmedRevenueTotal = useMemo(() => {
    return salesOrders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  }, [salesOrders]);

  const totalCustomersCount = useMemo(() => {
    return Math.max(customers.length, new Set(salesOrders.map(o => o.customerId)).size);
  }, [customers, salesOrders]);

  // -----------------------------------------------------------------------------------------------
  // FROM OLD DASHBOARD: INTERACTIVE TREND GRAPH DATA GENERATOR
  // -----------------------------------------------------------------------------------------------
  const trendChartData = useMemo(() => {
    const now = Date.now();
    let buckets: { label: string; revenue: number; orders: number }[] = [];

    if (timeFilter === '7d') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now - i * 86400000);
        const dateStr = d.toLocaleDateString('en-IN', { weekday: 'short' });
        const start = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
        const end = start + 86400000;
        const matching = salesOrders.filter(e => {
          const t = new Date(e.orderDate || 0).getTime();
          return t >= start && t < end;
        });
        const rev = matching.reduce((acc, e) => acc + (e.totalAmount || 0), 0);
        buckets.push({ label: dateStr, revenue: rev, orders: matching.length });
      }
    } else if (timeFilter === '30d') {
      for (let i = 4; i >= 0; i--) {
        const dEnd = new Date(now - i * 6 * 86400000);
        const dStart = new Date(dEnd.getTime() - 6 * 86400000);
        const label = `${dStart.getDate()}/${dStart.getMonth() + 1} - ${dEnd.getDate()}/${dEnd.getMonth() + 1}`;
        const matching = salesOrders.filter(e => {
          const t = new Date(e.orderDate || 0).getTime();
          return t >= dStart.getTime() && t <= dEnd.getTime();
        });
        const rev = matching.reduce((acc, e) => acc + (e.totalAmount || 0), 0);
        buckets.push({ label, revenue: rev, orders: matching.length });
      }
    } else {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const curMonth = new Date().getMonth();
      for (let i = 5; i >= 0; i--) {
        const mIdx = (curMonth - i + 12) % 12;
        const matching = salesOrders.filter(e => {
          const d = new Date(e.orderDate || 0);
          return d.getMonth() === mIdx;
        });
        const rev = matching.reduce((acc, e) => acc + (e.totalAmount || 0), 0);
        buckets.push({ label: months[mIdx], revenue: rev, orders: matching.length });
      }
    }

    const maxRev = Math.max(...buckets.map(b => b.revenue), 10000);
    return { buckets, maxRev };
  }, [salesOrders, timeFilter]);

  // Recent Orders List (from old dashboard)
  const recentOrdersList = useMemo(() => {
    return [...salesOrders]
      .sort((a, b) => new Date(b.orderDate || 0).getTime() - new Date(a.orderDate || 0).getTime())
      .slice(0, 6);
  }, [salesOrders]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans text-paper-50">
      {/* ----------------------------------------------------------------------------------------- */}
      {/* WIDGET 6: QUICK ACTIONS BAR (TOP OF DASHBOARD) */}
      {/* ----------------------------------------------------------------------------------------- */}
      <div className="bg-ink-900 p-6 rounded-3xl border border-gold-400/30 shadow-ember flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-gold-400 font-bold text-xs uppercase tracking-wider">
            <Zap size={16} />
            <span>Master Executive Control Centre</span>
          </div>
          <h1 className="text-3xl font-bold font-display text-white">Crackers Falls Integrated Control Panel</h1>
        </div>

        {/* 4 Quick Action Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
          <button
            onClick={() => onNavigateTab('sales_orders')}
            className="px-4 py-2.5 bg-gold-400 hover:bg-gold-300 text-ink-950 font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-ember flex items-center justify-center gap-1.5 cursor-pointer transition-all"
          >
            <Plus size={15} />
            <span>New Sale</span>
          </button>

          <button
            onClick={() => onNavigateTab('alerts')}
            className="px-4 py-2.5 bg-ink-850 hover:bg-ink-800 border border-gold-400/40 text-gold-300 font-bold text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-1.5 cursor-pointer transition-all"
          >
            <ShoppingBag size={15} />
            <span>New PO</span>
          </button>

          <button
            onClick={() => onNavigateTab('inventory')}
            className="px-4 py-2.5 bg-ink-850 hover:bg-ink-800 border border-paper-50/15 text-paper-200 font-bold text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-1.5 cursor-pointer transition-all"
          >
            <Package size={15} />
            <span>Add Product</span>
          </button>

          <button
            onClick={() => onNavigateTab('pos')}
            className="px-4 py-2.5 bg-ink-850 hover:bg-ink-800 border border-paper-50/15 text-leaf-400 font-bold text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-1.5 cursor-pointer transition-all"
          >
            <Zap size={15} />
            <span>Counter POS</span>
          </button>
        </div>
      </div>

      {/* TOP METRIC CARDS STRIP (INTEGRATED OLD & NEW METRICS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* WIDGET 1: TODAY'S SALES SUMMARY */}
        <div className="bg-ink-900 p-5 rounded-3xl border border-gold-400/30 space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-gold-400 text-[10px] font-bold uppercase tracking-wider">
            <span>Today's Total Sales</span>
            <TrendingUp size={14} />
          </div>
          <div className="text-2xl font-extrabold font-display text-white">
            {formatCurrency(todaySalesData.totalRev)}
          </div>
          <div className="text-[10px] text-paper-400 font-semibold">
            {todaySalesData.totalOrders} Orders Today
          </div>
        </div>

        {/* OLD DASHBOARD METRIC: TOTAL CONFIRMED REVENUE */}
        <div className="bg-ink-900 p-5 rounded-3xl border border-paper-50/10 space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-leaf-400 text-[10px] font-bold uppercase tracking-wider">
            <span>Total Confirmed Sales</span>
            <DollarSign size={14} />
          </div>
          <div className="text-2xl font-extrabold font-display text-leaf-400">
            {formatCurrency(confirmedRevenueTotal)}
          </div>
          <div className="text-[10px] text-paper-400 font-semibold">
            Across All Channels
          </div>
        </div>

        {/* WIDGET 3: PENDING ORDERS NEEDING ACTION */}
        <div className="bg-ink-900 p-5 rounded-3xl border border-amber-500/30 space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-amber-300 text-[10px] font-bold uppercase tracking-wider">
            <span>Orders Needing Action</span>
            <Clock size={14} />
          </div>
          <div className="text-2xl font-extrabold font-display text-white">
            {pendingOrdersCount} Orders
          </div>
          <button
            onClick={() => onNavigateTab('sales_orders')}
            className="text-[10px] text-gold-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View Orders Pipeline</span>
            <ArrowRight size={12} />
          </button>
        </div>

        {/* WIDGET 4: CASH POSITION (RECEIVABLES VS PAYABLES) */}
        <div className="bg-ink-900 p-5 rounded-3xl border border-paper-50/10 space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-sky-400 text-[10px] font-bold uppercase tracking-wider">
            <span>Cash Position</span>
            <DollarSign size={14} />
          </div>
          <div className="text-[11px] font-semibold space-y-0.5">
            <div className="flex justify-between">
              <span className="text-paper-400">Customer Dues:</span>
              <strong className="text-leaf-400">{formatCurrency(cashPosition.receivables)}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-paper-400">Vendor Dues:</span>
              <strong className="text-crimson-400">{formatCurrency(cashPosition.payables)}</strong>
            </div>
          </div>
        </div>

        {/* OLD DASHBOARD METRIC: ACTIVE CATALOG & CUSTOMERS */}
        <div className="bg-ink-900 p-5 rounded-3xl border border-paper-50/10 space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-purple-400 text-[10px] font-bold uppercase tracking-wider">
            <span>Catalog &amp; Directory</span>
            <Users size={14} />
          </div>
          <div className="text-2xl font-extrabold font-display text-white">
            {products.length} Products
          </div>
          <div className="text-[10px] text-paper-400 font-semibold">
            {totalCustomersCount} Total Buyers
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------------------------------------- */}
      {/* SECTION 1: REVENUE TREND GRAPH & CHANNEL BREAKDOWN (INTEGRATED FROM OLD DASHBOARD) */}
      {/* ----------------------------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* REVENUE & ORDERS TREND GRAPH (FROM OLD DASHBOARD) */}
        <div className="lg:col-span-8 bg-ink-900 p-6 rounded-3xl border border-paper-50/10 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-paper-50/10 pb-4">
            <div>
              <h3 className="text-lg font-bold font-display text-white flex items-center gap-2">
                <BarChart3 size={18} className="text-gold-400" />
                <span>Sales &amp; Revenue Trends</span>
              </h3>
              <p className="text-xs text-paper-400">Track order volume &amp; revenue performance over time.</p>
            </div>

            {/* Time Filter Pills (7d / 30d / year) */}
            <div className="flex items-center gap-1 bg-ink-850 p-1 rounded-2xl border border-paper-50/15">
              <button
                type="button"
                onClick={() => setTimeFilter('7d')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  timeFilter === '7d' ? 'bg-gold-400 text-ink-950' : 'text-paper-400 hover:text-white'
                }`}
              >
                7 Days
              </button>
              <button
                type="button"
                onClick={() => setTimeFilter('30d')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  timeFilter === '30d' ? 'bg-gold-400 text-ink-950' : 'text-paper-400 hover:text-white'
                }`}
              >
                30 Days
              </button>
              <button
                type="button"
                onClick={() => setTimeFilter('year')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  timeFilter === 'year' ? 'bg-gold-400 text-ink-950' : 'text-paper-400 hover:text-white'
                }`}
              >
                1 Year
              </button>
            </div>
          </div>

          {/* SVG Revenue Bar & Line Chart */}
          <div className="space-y-4 pt-2">
            <div className="h-44 flex items-end justify-between gap-3 px-2">
              {trendChartData.buckets.map((b, idx) => {
                const heightPct = Math.max(12, Math.round((b.revenue / trendChartData.maxRev) * 100));
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-ink-950 text-gold-400 font-bold text-[10px] px-2 py-0.5 rounded-lg border border-gold-400/30 whitespace-nowrap shadow-lg">
                      {formatCurrency(b.revenue)} ({b.orders} orders)
                    </div>
                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-full max-w-[42px] bg-gradient-to-t from-gold-500 to-amber-300 rounded-t-xl group-hover:from-gold-400 group-hover:to-amber-200 transition-all shadow-ember"
                    />
                    <span className="text-[10px] font-mono text-paper-400 truncate w-full text-center">{b.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* WIDGET 1 DETAIL: SALES BREAKDOWN BY CHANNEL */}
        <div className="lg:col-span-4 bg-ink-900 p-6 rounded-3xl border border-paper-50/10 space-y-4 shadow-xl flex flex-col justify-between">
          <h3 className="text-base font-bold font-display text-white">Sales Channel Breakdown</h3>

          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-ink-850 border border-sky-500/30 space-y-1">
              <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1">
                <Globe size={12} /> Website Direct
              </span>
              <p className="text-lg font-extrabold font-display text-white">{formatCurrency(todaySalesData.channels.website)}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-ink-850 border border-leaf-400/30 space-y-1">
              <span className="text-[10px] font-bold text-leaf-400 uppercase tracking-wider flex items-center gap-1">
                <MessageCircle size={12} /> WhatsApp Leads
              </span>
              <p className="text-lg font-extrabold font-display text-white">{formatCurrency(todaySalesData.channels.whatsapp)}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-ink-850 border border-gold-400/30 space-y-1">
              <span className="text-[10px] font-bold text-gold-300 uppercase tracking-wider flex items-center gap-1">
                <Store size={12} /> In-Person Counter
              </span>
              <p className="text-lg font-extrabold font-display text-white">{formatCurrency(todaySalesData.channels['in-person'])}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-ink-850 border border-purple-500/30 space-y-1">
              <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1">
                <Building size={12} /> Wholesale Bulk
              </span>
              <p className="text-lg font-extrabold font-display text-white">{formatCurrency(todaySalesData.channels.wholesale)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------------------------------------- */}
      {/* SECTION 2: INVENTORY ALERTS & TOP PRODUCTS (FROM NEW DASHBOARD) */}
      {/* ----------------------------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* WIDGET 2: LOW STOCK ALERTS PANEL */}
        <div className="lg:col-span-6 bg-ink-900 p-6 rounded-3xl border border-crimson-500/30 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-paper-50/10 pb-3">
            <div className="flex items-center gap-2 text-crimson-400 font-bold text-sm font-display">
              <AlertTriangle size={18} />
              <span>Urgent Low Stock Alerts ({topLowStockAlerts.length})</span>
            </div>
            <button
              onClick={() => onNavigateTab('alerts')}
              className="text-gold-400 hover:underline text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="space-y-2.5">
            {topLowStockAlerts.length > 0 ? (
              topLowStockAlerts.map(({ product, stock, threshold, shortfall }) => (
                <div key={product.id} className="p-3.5 rounded-2xl bg-ink-850 border border-crimson-500/30 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-white font-display text-sm truncate">{product.name}</h5>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-crimson-500/20 text-crimson-400 border border-crimson-500/40">
                      Deficit: -{Math.max(0, shortfall)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-paper-400 text-[11px]">
                    <span>Current Stock: <strong className="text-crimson-400">{stock}</strong></span>
                    <span>Reorder Limit: {threshold}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-paper-500 text-xs">
                All inventory levels healthy. No urgent low stock alerts.
              </div>
            )}
          </div>
        </div>

        {/* WIDGET 5: TOP SELLING PRODUCTS THIS WEEK */}
        <div className="lg:col-span-6 bg-ink-900 p-6 rounded-3xl border border-paper-50/10 space-y-4 shadow-xl">
          <h3 className="text-base font-bold font-display text-white">Top Selling Products This Week</h3>

          <div className="space-y-2.5">
            {topSellingProducts.map((item, index) => (
              <div key={index} className="p-3.5 rounded-2xl bg-ink-850 border border-paper-50/10 flex items-center justify-between text-xs gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-xl bg-gold-400/20 text-gold-400 font-extrabold flex items-center justify-center font-display">
                    #{index + 1}
                  </span>
                  <div>
                    <h4 className="font-bold text-white text-sm font-display">{item.product.name}</h4>
                    <span className="text-[10px] text-paper-500 font-mono">{item.product.category} · {item.product.unit || 'Box'}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-gold-400 font-display block">{item.qty} Units</span>
                  <span className="text-[10px] text-paper-500">Volume Sold</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------------------------------------- */}
      {/* SECTION 3: RECENT ORDERS & ENQUIRIES TABLE (INTEGRATED FROM OLD DASHBOARD) */}
      {/* ----------------------------------------------------------------------------------------- */}
      <div className="bg-ink-900 rounded-3xl border border-paper-50/10 overflow-hidden shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-paper-50/10 pb-3">
          <h3 className="text-lg font-bold font-display text-white flex items-center gap-2">
            <Clock size={18} className="text-gold-400" />
            <span>Recent Customer Orders &amp; Website Enquiries</span>
          </h3>
          <button
            onClick={() => onNavigateTab('sales_orders')}
            className="text-gold-400 hover:underline text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>View Full Pipeline</span>
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-paper-300">
            <thead className="bg-ink-850 border-b border-paper-50/10 text-gold-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Order # &amp; Date</th>
                <th className="py-3.5 px-4">Channel</th>
                <th className="py-3.5 px-4">Customer Info</th>
                <th className="py-3.5 px-4 text-right">Grand Total</th>
                <th className="py-3.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-paper-50/5">
              {recentOrdersList.length > 0 ? (
                recentOrdersList.map((order) => (
                  <tr key={order.id} className="hover:bg-ink-850/50">
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      {order.orderNumber || order.id.slice(0, 8)}
                      <span className="block text-[10px] text-paper-500 font-normal">
                        {new Date(order.orderDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 uppercase text-[10px] font-bold">
                      <span className="px-2 py-0.5 rounded-full bg-ink-850 text-gold-300 border border-gold-400/30">
                        {order.channel || 'in-person'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {order.customerId}
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold font-display text-gold-400">
                      {formatCurrency(order.totalAmount || 0)}
                    </td>
                    <td className="py-3.5 px-4 text-center uppercase text-[10px] font-bold">
                      <span className={`px-2.5 py-1 rounded-full border ${
                        order.status === 'delivered' || order.status === 'confirmed'
                          ? 'bg-leaf-400/20 text-leaf-400 border-leaf-400/30'
                          : order.status === 'enquiry'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-gold-400/20 text-gold-300 border-gold-400/30'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-paper-500">
                    No recent customer orders recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
