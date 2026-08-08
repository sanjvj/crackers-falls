import React, { useState, useMemo } from 'react';
import { Download, TrendingUp, Package, PieChart } from 'lucide-react';
import type { Product, Enquiry } from '../../types';

interface RevenueDashboardPageProps {
  products: Product[];
  enquiries: Enquiry[];
}

export const RevenueDashboardPage: React.FC<RevenueDashboardPageProps> = ({
  products = [],
  enquiries = []
}) => {
  const [brandFilter, setBrandFilter] = useState<'All' | 'Crackers Falls' | 'Multi Brand'>('All');

  const {
    totalRevenue,
    crackersFallsRev,
    multiBrandRev,
    salesList,
    topProducts,
    cfPercent,
    multiPercent
  } = useMemo(() => {
    let total = 0;
    let cfRev = 0;
    let mulRev = 0;
    const salesMap: Record<string, { id: string; name: string; brand: string; qty: number; revenue: number }> = {};

    enquiries.forEach((enq) => {
      if (enq.items && Array.isArray(enq.items)) {
        enq.items.forEach((item) => {
          const itemRev = (item.price || 0) * (item.quantity || 0);
          total += itemRev;

          const p = products.find(prod => prod.id === item.id || prod.name.toLowerCase() === item.name.toLowerCase());
          const brand = p?.brand || 'Crackers Falls';

          if (brand.toLowerCase().includes('multi')) {
            mulRev += itemRev;
          } else {
            cfRev += itemRev;
          }

          const key = p ? p.id : item.name;
          if (!salesMap[key]) {
            salesMap[key] = {
              id: key,
              name: item.name,
              brand: brand.toLowerCase().includes('multi') ? 'Multi Brand' : 'Crackers Falls',
              qty: 0,
              revenue: 0
            };
          }
          salesMap[key].qty += item.quantity || 1;
          salesMap[key].revenue += itemRev;
        });
      } else {
        total += enq.grand_total || 0;
        cfRev += enq.grand_total || 0;
      }
    });

    const list = Object.values(salesMap).sort((a, b) => b.revenue - a.revenue);
    const top = list.slice(0, 5);

    const cfPct = total > 0 ? Math.round((cfRev / total) * 100) : 100;
    const mulPct = total > 0 ? 100 - cfPct : 0;

    return {
      totalRevenue: total,
      crackersFallsRev: cfRev,
      multiBrandRev: mulRev,
      salesList: list,
      topProducts: top,
      cfPercent: cfPct,
      multiPercent: mulPct
    };
  }, [enquiries, products]);

  const filteredSales = salesList.filter(item => {
    if (brandFilter === 'All') return true;
    if (brandFilter === 'Crackers Falls') return item.brand === 'Crackers Falls';
    if (brandFilter === 'Multi Brand') return item.brand === 'Multi Brand';
    return true;
  });

  const exportCSV = () => {
    const headers = ['Product Name', 'Brand', 'Qty Sold', 'Revenue (INR)'];
    const rows = filteredSales.map(item => [item.name, item.brand, item.qty, item.revenue]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CrackersFalls_Revenue_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Top Banner Header */}
      <div className="bg-ink-900 p-6 sm:p-8 rounded-3xl border border-gold-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-ember">
        <div>
          <div className="flex items-center gap-2 text-gold-400 font-bold text-xs uppercase tracking-wider">
            <TrendingUp size={16} />
            <span>Financial Intelligence</span>
          </div>
          <h1 className="text-3xl font-bold font-display text-white mt-1">Revenue Breakdown</h1>
          <p className="text-xs text-paper-500 font-sans mt-1">
            Wholesale revenue distribution between Crackers Falls Direct Godown vs Multi-Brand Stock.
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="px-5 py-3 bg-gold-400 hover:bg-gold-300 text-ink-950 font-extrabold text-xs uppercase tracking-wider rounded-full shadow-ember flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Download size={15} />
          <span>Export Financial CSV</span>
        </button>
      </div>

      {/* Bento Metric Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-ink-900 p-6 rounded-3xl border border-paper-50/10 space-y-2 shadow-xl">
          <span className="text-[11px] uppercase font-bold text-paper-500 tracking-wider">Gross Pipeline Revenue</span>
          <h3 className="text-3xl font-extrabold font-display text-white">{formatCurrency(totalRevenue)}</h3>
          <p className="text-xs text-gold-400 font-semibold font-display">Calculated Across {enquiries.length} Orders</p>
        </div>

        <div className="bg-ink-900 p-6 rounded-3xl border border-gold-400/30 space-y-2 shadow-xl">
          <span className="text-[11px] uppercase font-bold text-paper-500 tracking-wider">Crackers Falls Brand ({cfPercent}%)</span>
          <h3 className="text-3xl font-extrabold font-display text-gold-400">{formatCurrency(crackersFallsRev)}</h3>
          <p className="text-xs text-paper-300 font-semibold font-display">Direct Sivakasi Godown Stock</p>
        </div>

        <div className="bg-ink-900 p-6 rounded-3xl border border-purple-500/30 space-y-2 shadow-xl">
          <span className="text-[11px] uppercase font-bold text-paper-500 tracking-wider">Multi Brand Lines ({multiPercent}%)</span>
          <h3 className="text-3xl font-extrabold font-display text-purple-400">{formatCurrency(multiBrandRev)}</h3>
          <p className="text-xs text-paper-300 font-semibold font-display">Partner Sivakasi Brands</p>
        </div>
      </div>

      {/* Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Brand Mix Donut Bar (5 cols) */}
        <div className="lg:col-span-5 bg-ink-900 p-6 rounded-3xl border border-paper-50/10 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-paper-50/10 pb-4">
            <h3 className="text-base font-bold font-display text-white flex items-center gap-2">
              <PieChart size={18} className="text-gold-400" />
              <span>Brand Revenue Share</span>
            </h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-gold-400">Crackers Falls (Direct Godown)</span>
                <span className="text-white">{cfPercent}% ({formatCurrency(crackersFallsRev)})</span>
              </div>
              <div className="w-full h-3 rounded-full bg-ink-850 overflow-hidden border border-paper-50/10">
                <div className="h-full bg-gold-400 rounded-full" style={{ width: `${cfPercent}%` }} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-purple-400">Multi Brand Products</span>
                <span className="text-white">{multiPercent}% ({formatCurrency(multiBrandRev)})</span>
              </div>
              <div className="w-full h-3 rounded-full bg-ink-850 overflow-hidden border border-paper-50/10">
                <div className="h-full bg-purple-400 rounded-full" style={{ width: `${multiPercent}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Top 5 Products Table (7 cols) */}
        <div className="lg:col-span-7 bg-ink-900 p-6 rounded-3xl border border-paper-50/10 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-paper-50/10 pb-4">
            <h3 className="text-base font-bold font-display text-white flex items-center gap-2">
              <Package size={18} className="text-gold-400" />
              <span>Top 5 Revenue Generating Products</span>
            </h3>
          </div>

          <div className="space-y-2.5">
            {topProducts.map((item, idx) => (
              <div key={item.id} className="p-3.5 rounded-2xl bg-ink-850 border border-paper-50/10 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-gold-400 text-ink-950 font-bold flex items-center justify-center text-xs font-display">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="font-bold font-display text-white">{item.name}</h4>
                    <span className="text-[10px] text-paper-500 uppercase tracking-wider font-semibold">{item.brand}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-extrabold text-gold-400 font-display">{formatCurrency(item.revenue)}</div>
                  <div className="text-[10px] text-paper-500 font-semibold">{item.qty} Boxes Sold</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueDashboardPage;
