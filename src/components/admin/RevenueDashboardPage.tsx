import React, { useState, useMemo } from 'react';
import { Download, TrendingUp, Package, Store, ShoppingBag } from 'lucide-react';
import { useFirestoreCollection } from '../../hooks/useFirestore';
import type { Product, Enquiry, SalesOrder } from '../../types';

interface RevenueDashboardPageProps {
  products?: Product[];
  enquiries?: Enquiry[];
}

export const RevenueDashboardPage: React.FC<RevenueDashboardPageProps> = ({
  products: initialProducts = [],
  enquiries: initialEnquiries = []
}) => {
  const { data: productsData } = useFirestoreCollection<Product>('products');
  const { data: enquiriesData } = useFirestoreCollection<Enquiry>('enquiries');
  const { data: salesOrdersData } = useFirestoreCollection<SalesOrder>('salesOrders');

  const products = productsData.length > 0 ? productsData : initialProducts;
  const enquiries = enquiriesData.length > 0 ? enquiriesData : initialEnquiries;
  const salesOrders = salesOrdersData;

  const [brandFilter, setBrandFilter] = useState<'All' | 'Crackers Falls' | 'Multi Brand'>('All');

  const {
    totalRevenue,
    posRevenue,
    onlineRevenue,
    salesList
  } = useMemo(() => {
    let total = 0;
    let posRev = 0;
    let onlineRev = 0;
    let cfRev = 0;
    let mulRev = 0;
    const salesMap: Record<string, { id: string; name: string; brand: string; qty: number; revenue: number }> = {};

    // 1. Process Sales Orders (POS + Online pipeline)
    salesOrders.forEach((order) => {
      const isPos = order.channel === 'in-person';
      const orderAmount = order.totalAmount || 0;
      total += orderAmount;
      if (isPos) {
        posRev += orderAmount;
      } else {
        onlineRev += orderAmount;
      }

      (order.items || []).forEach((item) => {
        const p = products.find(prod => prod.id === item.productId);
        const itemName = p ? p.name : item.productId;
        const brand = p?.brand || 'Crackers Falls';
        const itemRev = (item.unitPrice || p?.price || 0) * (item.quantity || 0);

        if (brand.toLowerCase().includes('multi')) {
          mulRev += itemRev;
        } else {
          cfRev += itemRev;
        }

        const key = p ? p.id : item.productId;
        if (!salesMap[key]) {
          salesMap[key] = {
            id: key,
            name: itemName,
            brand: brand.toLowerCase().includes('multi') ? 'Multi Brand' : 'Crackers Falls',
            qty: 0,
            revenue: 0
          };
        }
        salesMap[key].qty += item.quantity || 1;
        salesMap[key].revenue += itemRev;
      });
    });

    // 2. Process Direct Enquiries if no sales orders yet
    if (salesOrders.length === 0) {
      enquiries.forEach((enq) => {
        total += enq.grand_total || 0;
        onlineRev += enq.grand_total || 0;

        (enq.items || []).forEach((item) => {
          const itemRev = (item.price || 0) * (item.quantity || 0);
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
      });
    }

    const list = Object.values(salesMap).sort((a, b) => b.revenue - a.revenue);

    return {
      totalRevenue: total,
      posRevenue: posRev,
      onlineRevenue: onlineRev,
      salesList: list
    };
  }, [salesOrders, enquiries, products]);

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
    <div className="space-y-6 max-w-7xl mx-auto font-sans text-paper-50">
      {/* Header Card */}
      <div className="bg-ink-900 p-6 sm:p-8 rounded-3xl border border-gold-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-ember">
        <div>
          <div className="flex items-center gap-2 text-gold-400 font-bold text-xs uppercase tracking-wider">
            <TrendingUp size={16} />
            <span>Financial Control & Analytics</span>
          </div>
          <h1 className="text-3xl font-bold font-display text-white mt-1">Revenue Dashboard & Brand Breakdown</h1>
          <p className="text-xs text-paper-300 font-sans mt-1">Live real-time revenue stats from counter POS billing and wholesale online orders.</p>
        </div>
        <button
          onClick={exportCSV}
          className="px-6 py-3 bg-gold-400 hover:bg-gold-300 text-ink-950 font-extrabold text-xs uppercase tracking-wider rounded-full shadow-ember flex items-center gap-2 cursor-pointer shrink-0 transition-all hover:scale-[1.02]"
        >
          <Download size={16} />
          <span>Export Revenue Report (CSV)</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-ink-900 p-6 rounded-3xl border border-gold-400/30 space-y-3 shadow-xl">
          <div className="flex items-center justify-between text-gold-400 font-bold">
            <span className="text-xs uppercase tracking-wider">Total Gross Sales</span>
            <TrendingUp size={18} />
          </div>
          <div className="text-3xl font-extrabold font-display text-gold-400">{formatCurrency(totalRevenue)}</div>
          <p className="text-xs text-paper-300 font-sans">Gross total across counter POS & wholesale</p>
        </div>

        <div className="bg-ink-900 p-6 rounded-3xl border border-paper-50/10 space-y-3 shadow-xl">
          <div className="flex items-center justify-between text-sky-400 font-bold">
            <span className="text-xs uppercase tracking-wider">Counter POS Revenue</span>
            <Store size={18} />
          </div>
          <div className="text-3xl font-extrabold font-display text-white">{formatCurrency(posRevenue)}</div>
          <p className="text-xs text-paper-300 font-sans">In-person walk-in counter sales</p>
        </div>

        <div className="bg-ink-900 p-6 rounded-3xl border border-paper-50/10 space-y-3 shadow-xl">
          <div className="flex items-center justify-between text-purple-400 font-bold">
            <span className="text-xs uppercase tracking-wider">Wholesale Direct Revenue</span>
            <ShoppingBag size={18} />
          </div>
          <div className="text-3xl font-extrabold font-display text-white">{formatCurrency(onlineRevenue)}</div>
          <p className="text-xs text-paper-300 font-sans">Direct web orders & enquiry workflow</p>
        </div>
      </div>

      {/* Sales List Table */}
      <div className="bg-ink-900 p-6 rounded-3xl border border-paper-50/10 space-y-4 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h3 className="text-lg font-bold font-display text-white flex items-center gap-2">
            <Package size={18} className="text-gold-400" />
            <span>Product Revenue Matrix</span>
          </h3>

          <div className="flex items-center gap-2">
            {(['All', 'Crackers Falls', 'Multi Brand'] as const).map((b) => (
              <button
                key={b}
                onClick={() => setBrandFilter(b)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                  brandFilter === b
                    ? 'bg-gold-400 text-ink-950 border-gold-400'
                    : 'bg-ink-850 text-paper-300 border-paper-50/10 hover:border-gold-400/30'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-paper-50/10 bg-ink-950/60 text-paper-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="p-3">Product Name</th>
                <th className="p-3">Brand Tag</th>
                <th className="p-3">Quantity Sold</th>
                <th className="p-3 text-right">Total Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-paper-50/5">
              {filteredSales.length > 0 ? (
                filteredSales.map((item, i) => (
                  <tr key={i} className="hover:bg-paper-50/5 transition-colors">
                    <td className="p-3 font-bold text-white">{item.name}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        item.brand === 'Crackers Falls' ? 'bg-gold-400/10 text-gold-400 border-gold-400/30' : 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                      }`}>
                        {item.brand}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-paper-300">{item.qty} Units</td>
                    <td className="p-3 text-right font-extrabold text-gold-400 font-display">{formatCurrency(item.revenue)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-paper-400 font-medium">
                    No product sales recorded yet. Completed POS bills and sales orders will appear here automatically.
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

export default RevenueDashboardPage;
