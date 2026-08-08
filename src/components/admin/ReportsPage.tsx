import React from 'react';
import { FileText, TrendingUp, Package, MessageSquare } from 'lucide-react';
import type { Product, Enquiry } from '../../types';

interface ReportsPageProps {
  products: Product[];
  enquiries: Enquiry[];
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ products, enquiries }) => {
  const confirmedCount = enquiries.filter(e => ['Confirmed', 'Packed', 'Dispatched', 'Delivered'].includes(e.status)).length;
  const totalRevenue = enquiries.reduce((acc, e) => acc + (e.grand_total || 0), 0);

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
      <div className="bg-ink-900 p-6 sm:p-8 rounded-3xl border border-gold-400/30 flex items-center justify-between shadow-ember">
        <div>
          <div className="flex items-center gap-2 text-gold-400 font-bold text-xs uppercase tracking-wider">
            <FileText size={16} />
            <span>Store Audit &amp; Performance</span>
          </div>
          <h1 className="text-3xl font-bold font-display text-white mt-1">Store Reports Overview</h1>
          <p className="text-xs text-paper-300 font-sans mt-1">Key operational metrics and fulfillment statistics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-ink-900 p-6 rounded-3xl border border-paper-50/10 space-y-2 shadow-xl">
          <div className="text-paper-500 font-bold uppercase text-[10px] tracking-wider">Total Order Enquiries</div>
          <p className="text-3xl font-extrabold font-display text-white">{enquiries.length}</p>
          <span className="text-gold-400 font-bold text-xs">{confirmedCount} Confirmed &amp; Dispatched</span>
        </div>

        <div className="bg-ink-900 p-6 rounded-3xl border border-gold-400/30 space-y-2 shadow-xl">
          <div className="text-paper-500 font-bold uppercase text-[10px] tracking-wider">Est. Wholesale Total Value</div>
          <p className="text-3xl font-extrabold font-display text-gold-400">{formatCurrency(totalRevenue)}</p>
          <span className="text-paper-300 text-xs font-sans">Sum of all order totals</span>
        </div>

        <div className="bg-ink-900 p-6 rounded-3xl border border-paper-50/10 space-y-2 shadow-xl">
          <div className="text-paper-500 font-bold uppercase text-[10px] tracking-wider">Active Listed Products</div>
          <p className="text-3xl font-extrabold font-display text-white">{products.length}</p>
          <span className="text-leaf-400 font-bold text-xs">100% Sivakasi Factory Direct</span>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
