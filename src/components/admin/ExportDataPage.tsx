import React from 'react';
import { Download, FileText, Table } from 'lucide-react';
import { jsPDF } from 'jspdf';
import type { Product, CategoryItem, Enquiry, Coupon } from '../../types';

interface ExportDataPageProps {
  products: Product[];
  categories: CategoryItem[];
  enquiries: Enquiry[];
  coupons: Coupon[];
}

export const ExportDataPage: React.FC<ExportDataPageProps> = ({
  products,
  enquiries,
}) => {

  const exportProductsCSV = () => {
    const headers = ['ID', 'Name', 'Category', 'Brand', 'Unit', 'Price', 'MRP', 'In Stock'];
    const rows = products.map(p => [p.id, `"${p.name}"`, p.category, p.brand, p.unit, p.price, p.original_price, p.in_stock]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadBlob(csv, 'Products_Export.csv', 'text/csv');
  };

  const exportEnquiriesCSV = () => {
    const headers = ['Ref ID', 'Customer Name', 'Phone', 'Grand Total', 'Status', 'Date'];
    const rows = enquiries.map(e => [e.id, `"${e.name}"`, e.phone, e.grand_total, e.status, e.created_at]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadBlob(csv, 'Enquiries_Export.csv', 'text/csv');
  };

  const exportCatalogPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('CRACKERS FALLS (பட்டாசு அருவி) - WHOLESALE PRICE LIST', 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 14, 28);

    let y = 40;
    doc.setFontSize(11);
    doc.text('Product Name | Category | Selling Price', 14, y);
    doc.line(14, y + 2, 195, y + 2);
    y += 10;

    doc.setFontSize(9);
    products.forEach((p) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(`${p.name.substring(0, 35)} | ${p.category} | INR ${p.price}`, 14, y);
      y += 7;
    });

    doc.save(`CrackersFalls_Catalog_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const downloadBlob = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans text-paper-50">
      {/* Top Header Card */}
      <div className="bg-ink-900 p-6 sm:p-8 rounded-3xl border border-gold-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-ember">
        <div>
          <div className="flex items-center gap-2 text-gold-400 font-bold text-xs uppercase tracking-wider">
            <Download size={16} />
            <span>Data Backups &amp; Formal Documents</span>
          </div>
          <h1 className="text-3xl font-bold font-display text-white mt-1">Export Data &amp; PDF Price Generator</h1>
          <p className="text-xs text-paper-300 font-sans mt-1">Download CSV records or generate formal PDF price sheets for customer distribution.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-ink-900 p-6 rounded-3xl border border-paper-50/10 hover:border-gold-400/40 space-y-4 shadow-xl transition-all">
          <div className="flex items-center gap-3 text-gold-400 font-bold">
            <Table size={22} />
            <span className="font-display font-bold text-base text-white">Product Catalog (CSV)</span>
          </div>
          <p className="text-xs text-paper-300">Export all {products.length} listed products with pricing and category tags.</p>
          <button
            onClick={exportProductsCSV}
            className="w-full py-3 bg-gold-400 hover:bg-gold-300 text-ink-950 font-extrabold text-xs uppercase tracking-wider rounded-full shadow-ember transition-all cursor-pointer"
          >
            Download Products CSV
          </button>
        </div>

        <div className="bg-ink-900 p-6 rounded-3xl border border-paper-50/10 hover:border-gold-400/40 space-y-4 shadow-xl transition-all">
          <div className="flex items-center gap-3 text-leaf-400 font-bold">
            <Download size={22} />
            <span className="font-display font-bold text-base text-white">Customer Enquiries (CSV)</span>
          </div>
          <p className="text-xs text-paper-300">Export all {enquiries.length} customer order leads and status records.</p>
          <button
            onClick={exportEnquiriesCSV}
            className="w-full py-3 bg-leaf-400 hover:bg-leaf-300 text-ink-950 font-extrabold text-xs uppercase tracking-wider rounded-full shadow-ember transition-all cursor-pointer"
          >
            Download Enquiries CSV
          </button>
        </div>

        <div className="bg-ink-900 p-6 rounded-3xl border border-gold-400/40 space-y-4 shadow-xl transition-all">
          <div className="flex items-center gap-3 text-gold-400 font-bold">
            <FileText size={22} />
            <span className="font-display font-bold text-base text-white">Formal Price List (PDF)</span>
          </div>
          <p className="text-xs text-paper-300">Generate a branded PDF document formatted for wholesale customer sharing.</p>
          <button
            onClick={exportCatalogPDF}
            className="w-full py-3 bg-gold-400 hover:bg-gold-300 text-ink-950 font-extrabold text-xs uppercase tracking-wider rounded-full shadow-ember transition-all cursor-pointer"
          >
            Generate Branded PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportDataPage;
