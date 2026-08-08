import React, { useMemo, useState } from 'react';
import {
  MessageSquare,
  Package,
  Users,
  TrendingUp,
  DollarSign,
  PieChart as PieChartIcon,
  BarChart3,
  Clock,
  CheckCircle2
} from 'lucide-react';
import type { Product, CategoryItem, Enquiry } from '../../types';

interface DashboardPageProps {
  products: Product[];
  categories: CategoryItem[];
  enquiries: Enquiry[];
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  products = [],
  categories = [],
  enquiries = []
}) => {
  const [timeFilter, setTimeFilter] = useState<'7d' | '30d' | 'year'>('30d');

  const confirmedEnquiries = useMemo(
    () => enquiries.filter(e => ['Confirmed', 'Packed', 'Dispatched', 'Delivered'].includes(e.status)),
    [enquiries]
  );

  const pendingEnquiries = useMemo(
    () => enquiries.filter(e => e.status === 'Pending'),
    [enquiries]
  );

  // Confirmed Revenue (Actual confirmed orders)
  const confirmedRevenue = useMemo(
    () => confirmedEnquiries.reduce((sum, e) => sum + (e.grand_total || 0), 0),
    [confirmedEnquiries]
  );

  // Estimated Wholesale Pipeline Value (All leads)
  const pipelineRevenue = useMemo(
    () => enquiries.reduce((sum, e) => sum + (e.grand_total || 0), 0),
    [enquiries]
  );

  const uniqueCustomers = useMemo(
    () => new Set(enquiries.map(e => (e.phone || e.name || '').trim())).size,
    [enquiries]
  );

  const activeProductsCount = useMemo(
    () => products.filter(p => p.active !== false && p.in_stock !== false).length,
    [products]
  );

  const recentEnquiries = useMemo(
    () => [...enquiries].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()).slice(0, 6),
    [enquiries]
  );

  // Dynamic Live Line Graph Data Generator
  const chartData = useMemo(() => {
    const now = Date.now();
    let buckets: { label: string; revenue: number; orders: number }[] = [];

    if (timeFilter === '7d') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now - i * 86400000);
        const dateStr = d.toLocaleDateString('en-IN', { weekday: 'short' });
        const start = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
        const end = start + 86400000;
        const matching = enquiries.filter(e => {
          const t = new Date(e.created_at || 0).getTime();
          return t >= start && t < end;
        });
        const rev = matching.reduce((acc, e) => acc + (e.grand_total || 0), 0);
        buckets.push({ label: dateStr, revenue: rev, orders: matching.length });
      }
    } else if (timeFilter === '30d') {
      for (let i = 4; i >= 0; i--) {
        const startDay = i * 6;
        const label = i === 0 ? 'Recent' : `-${startDay}d`;
        const start = now - (startDay + 6) * 86400000;
        const end = now - startDay * 86400000;
        const matching = enquiries.filter(e => {
          const t = new Date(e.created_at || 0).getTime();
          return t >= start && t < end;
        });
        const rev = matching.reduce((acc, e) => acc + (e.grand_total || 0), 0);
        buckets.push({ label, revenue: rev, orders: matching.length });
      }
    } else {
      const months = [
        { label: 'May', month: 4 },
        { label: 'Jun', month: 5 },
        { label: 'Jul', month: 6 },
        { label: 'Aug', month: 7 },
        { label: 'Sep (peak)', month: 8 }
      ];
      buckets = months.map(m => {
        const matching = enquiries.filter(e => {
          const d = new Date(e.created_at || 0);
          return d.getMonth() === m.month;
        });
        const rev = matching.reduce((acc, e) => acc + (e.grand_total || 0), 0);
        return { label: m.label, revenue: rev, orders: matching.length };
      });
    }

    const maxRev = Math.max(...buckets.map(b => b.revenue), 1000);
    const points = buckets.map((b, i) => {
      const x = Math.round((i / Math.max(buckets.length - 1, 1)) * 500);
      const y = Math.round(150 - (b.revenue / maxRev) * 120);
      return { x, y, label: b.label, revenue: b.revenue, orders: b.orders };
    });

    const pathD = points.length > 0
      ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
      : 'M 0 150 L 500 150';

    const areaD = points.length > 0
      ? `${pathD} L ${points[points.length - 1].x} 180 L ${points[0].x} 180 Z`
      : 'M 0 150 L 500 150 L 500 180 L 0 180 Z';

    return { buckets, points, pathD, areaD, maxRev };
  }, [enquiries, timeFilter]);

  // Category demand analytics
  const categoryStats = useMemo(() => {
    const counts: Record<string, number> = {};
    enquiries.forEach(e => {
      e.items?.forEach(item => {
        const cat = item.category || 'Sparklers';
        counts[cat] = (counts[cat] || 0) + (item.quantity || 1);
      });
    });
    const totalItems = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(counts)
      .map(([name, qty]) => ({
        name,
        qty,
        pct: Math.round((qty / totalItems) * 100)
      }))
      .sort((a, b) => b.qty - a.qty);
  }, [enquiries]);

  // Order status percentages for donut chart
  const statusCounts = useMemo(() => {
    const counts = { Pending: 0, Confirmed: 0, Dispatched: 0, Delivered: 0 };
    enquiries.forEach(e => {
      if (e.status === 'Pending') counts.Pending++;
      else if (e.status === 'Confirmed' || e.status === 'Packed') counts.Confirmed++;
      else if (e.status === 'Dispatched') counts.Dispatched++;
      else if (e.status === 'Delivered') counts.Delivered++;
    });
    const total = enquiries.length || 1;
    return [
      { label: 'Pending', count: counts.Pending, pct: Math.round((counts.Pending / total) * 100), color: '#f2c230' },
      { label: 'Confirmed', count: counts.Confirmed, pct: Math.round((counts.Confirmed / total) * 100), color: '#38bdf8' },
      { label: 'Dispatched', count: counts.Dispatched, pct: Math.round((counts.Dispatched / total) * 100), color: '#a855f7' },
      { label: 'Delivered', count: counts.Delivered, pct: Math.round((counts.Delivered / total) * 100), color: '#8fae63' }
    ];
  }, [enquiries]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans">
      {/* Top Banner Header */}
      <div className="bg-ink-900 p-6 sm:p-8 rounded-3xl border border-gold-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-ember relative overflow-hidden">
        <div className="relative z-10 space-y-1">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.28em] text-paper-500">
            <span className="h-2 w-2 rounded-full bg-gold-400 animate-pulse" />
            Live Analytics &amp; Store Performance
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold font-display uppercase tracking-tight text-paper-50">
            Wholesale <span className="text-gold-400 italic glow-gold">Analytics Dashboard</span>
          </h1>
          <p className="text-xs text-paper-300/80 font-sans">
            Real-time Sivakasi cracker leads, order pipeline, revenue velocity, and catalog metrics.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 shrink-0">
          <div className="flex bg-ink-850 p-1 rounded-2xl border border-paper-50/15">
            <button
              onClick={() => setTimeFilter('7d')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                timeFilter === '7d' ? 'bg-gold-400 text-ink-950 font-extrabold' : 'text-paper-500 hover:text-white'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeFilter('30d')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                timeFilter === '30d' ? 'bg-gold-400 text-ink-950 font-extrabold' : 'text-paper-500 hover:text-white'
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setTimeFilter('year')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                timeFilter === 'year' ? 'bg-gold-400 text-ink-950 font-extrabold' : 'text-paper-500 hover:text-white'
              }`}
            >
              Festive 2026
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Strip (Now including Confirmed Revenue Card & Pipeline Card) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Confirmed Order Revenue Card */}
        <div className="p-5 rounded-3xl bg-ink-900 border border-leaf-400/40 space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-leaf-400">
            <CheckCircle2 size={20} />
            <span className="text-[10px] uppercase font-bold text-leaf-400 tracking-wider">
              {confirmedEnquiries.length} Orders Confirmed
            </span>
          </div>
          <h3 className="text-3xl font-extrabold font-display text-white">{formatCurrency(confirmedRevenue)}</h3>
          <p className="text-xs text-leaf-400 font-semibold font-display">Confirmed Order Value</p>
        </div>

        {/* Est Pipeline Revenue Card */}
        <div className="p-5 rounded-3xl bg-ink-900 border border-gold-400/30 space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-gold-400">
            <DollarSign size={20} />
            <span className="text-[10px] uppercase font-bold text-paper-500 tracking-wider">
              {enquiries.length} Total Leads
            </span>
          </div>
          <h3 className="text-3xl font-extrabold font-display text-gold-400">{formatCurrency(pipelineRevenue)}</h3>
          <p className="text-xs text-paper-300 font-semibold font-display">Est. Wholesale Pipeline Value</p>
        </div>

        <div className="p-5 rounded-3xl bg-ink-900 border border-paper-50/10 space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-purple-400">
            <Users size={20} />
            <span className="text-[10px] uppercase font-bold text-paper-500 tracking-wider">Active Reach</span>
          </div>
          <h3 className="text-3xl font-extrabold font-display text-white">{uniqueCustomers}</h3>
          <p className="text-xs text-purple-400 font-semibold font-display">Unique Verified Buyers</p>
        </div>

        <div className="p-5 rounded-3xl bg-ink-900 border border-paper-50/10 space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-gold-400">
            <Package size={20} />
            <span className="text-[10px] uppercase font-bold text-paper-500 tracking-wider">Ready in Stock</span>
          </div>
          <h3 className="text-3xl font-extrabold font-display text-white">{activeProductsCount} / {products.length}</h3>
          <p className="text-xs text-gold-400 font-semibold font-display">Active Product Listings</p>
        </div>
      </div>

      {/* DYNAMIC ANALYTICS GRAPH TILES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Tile 1 (Large 8 Cols): Live Dynamic Revenue & Lead Velocity Line Graph */}
        <div className="lg:col-span-8 bg-ink-900 p-6 sm:p-8 rounded-3xl border border-paper-50/10 space-y-6 shadow-2xl relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-paper-50/10 pb-4">
            <div>
              <div className="flex items-center gap-2 text-gold-400 font-bold text-xs uppercase tracking-wider">
                <TrendingUp size={16} />
                <span>Live Calculated Revenue Curve ({timeFilter.toUpperCase()})</span>
              </div>
              <h3 className="text-xl font-bold font-display text-white mt-1">
                Order Value &amp; Velocity Trend
              </h3>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-gold-400" />
                <span className="text-paper-300">Live Revenue (₹)</span>
              </div>
            </div>
          </div>

          {/* DYNAMIC SVG LINE GRAPH COMPUTED FROM LIVE FIRESTORE DATA */}
          <div className="relative h-64 w-full pt-4">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 180" preserveAspectRatio="none">
              <line x1="0" y1="30" x2="500" y2="30" stroke="rgba(247, 242, 230, 0.05)" strokeDasharray="4 4" />
              <line x1="0" y1="80" x2="500" y2="80" stroke="rgba(247, 242, 230, 0.05)" strokeDasharray="4 4" />
              <line x1="0" y1="130" x2="500" y2="130" stroke="rgba(247, 242, 230, 0.05)" strokeDasharray="4 4" />

              <defs>
                <linearGradient id="liveGoldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f2c230" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#f2c230" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Dynamic Gradient Fill Area */}
              <path d={chartData.areaD} fill="url(#liveGoldGradient)" />

              {/* Dynamic Spline Line Path */}
              <path
                d={chartData.pathD}
                fill="none"
                stroke="#f2c230"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Dynamic Data Points */}
              {chartData.points.map((pt, idx) => (
                <g key={idx}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={idx === chartData.points.length - 1 ? 6 : 5}
                    fill={idx === chartData.points.length - 1 ? "#8fae63" : "#f2c230"}
                    stroke="#060809"
                    strokeWidth="2"
                  />
                </g>
              ))}
            </svg>

            {/* Dynamic Label Axis */}
            <div className="flex justify-between text-[11px] text-paper-500 font-bold uppercase tracking-wider pt-4">
              {chartData.points.map((pt, idx) => (
                <div key={idx} className="text-center">
                  <span className="block text-paper-300 font-extrabold">{pt.label}</span>
                  <span className="block text-[9px] text-gold-400">{formatCurrency(pt.revenue)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tile 2 (4 Cols): Order Status Donut Breakdown */}
        <div className="lg:col-span-4 bg-ink-900 p-6 sm:p-8 rounded-3xl border border-paper-50/10 space-y-6 shadow-2xl flex flex-col justify-between">
          <div className="border-b border-paper-50/10 pb-4">
            <div className="flex items-center gap-2 text-gold-400 font-bold text-xs uppercase tracking-wider">
              <PieChartIcon size={16} />
              <span>Order Pipeline Meter</span>
            </div>
            <h3 className="text-xl font-bold font-display text-white mt-1">
              Fulfillment Status
            </h3>
          </div>

          <div className="relative w-40 h-40 mx-auto flex items-center justify-center my-2">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="rgba(247, 242, 230, 0.1)"
                strokeWidth="3.8"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#f2c230"
                strokeWidth="3.8"
                strokeDasharray="40, 100"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#8fae63"
                strokeWidth="3.8"
                strokeDasharray="30, 100"
                strokeDashoffset="-40"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-extrabold font-display text-gold-400">{enquiries.length}</span>
              <span className="text-[10px] text-paper-500 uppercase font-bold tracking-wider">Total Leads</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-sans pt-2">
            {statusCounts.map((item) => (
              <div key={item.label} className="p-2.5 rounded-2xl bg-ink-850 border border-paper-50/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-paper-300 font-semibold">{item.label}</span>
                </div>
                <span className="font-bold text-white">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tile 3 (6 Cols): Category Demand Heatmap */}
        <div className="lg:col-span-6 bg-ink-900 p-6 sm:p-8 rounded-3xl border border-paper-50/10 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-paper-50/10 pb-4">
            <div className="flex items-center gap-2 text-gold-400 font-bold text-xs uppercase tracking-wider">
              <BarChart3 size={16} />
              <span>Category Demand Heatmap</span>
            </div>
            <span className="text-[11px] font-bold text-gold-400 bg-ink-950 px-3 py-1 rounded-full border border-gold-400/30">
              Most Popular
            </span>
          </div>

          <div className="space-y-4">
            {categoryStats.length > 0 ? (
              categoryStats.slice(0, 5).map((cat) => (
                <div key={cat.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-white font-display">{cat.name}</span>
                    <span className="text-gold-400">{cat.qty} Box Units ({cat.pct}%)</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-ink-850 overflow-hidden border border-paper-50/10">
                    <div
                      className="h-full bg-gradient-to-r from-gold-400 to-crimson-500 rounded-full transition-all duration-500"
                      style={{ width: `${cat.pct}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-paper-500">No category demand data recorded yet.</p>
            )}
          </div>
        </div>

        {/* Tile 4 (6 Cols): Recent High Value Wholesale Enquiries */}
        <div className="lg:col-span-6 bg-ink-900 p-6 sm:p-8 rounded-3xl border border-paper-50/10 space-y-5 shadow-2xl">
          <div className="flex items-center justify-between border-b border-paper-50/10 pb-4">
            <div className="flex items-center gap-2 text-gold-400 font-bold text-xs uppercase tracking-wider">
              <Clock size={16} />
              <span>Recent Wholesale Leads</span>
            </div>
            <span className="text-xs font-bold text-paper-500">Latest 6 Orders</span>
          </div>

          <div className="space-y-3">
            {recentEnquiries.map((enq) => (
              <div key={enq.id} className="p-3.5 rounded-2xl bg-ink-850 border border-paper-50/10 flex items-center justify-between gap-3 text-xs">
                <div className="min-w-0">
                  <div className="font-bold text-white font-display truncate">{enq.name}</div>
                  <div className="text-[10px] text-paper-500 font-sans">{enq.phone} · {enq.items?.length || 0} Products</div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-extrabold text-gold-400 font-display">{formatCurrency(enq.grand_total)}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                    enq.status === 'Pending' ? 'bg-gold-400/20 text-gold-300 border-gold-400/40' : 'bg-leaf-400/20 text-leaf-400 border-leaf-400/40'
                  }`}>
                    {enq.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
