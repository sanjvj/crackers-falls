import React, { useState } from 'react';
import { Search, Eye, MessageSquare, X, Mail } from 'lucide-react';
import { updateEnquiryStatus } from '../../lib/firestore';
import type { Enquiry } from '../../types';

interface EnquiriesPageProps {
  enquiries: Enquiry[];
}

export const EnquiriesPage: React.FC<EnquiriesPageProps> = ({ enquiries }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);

  const [newStatus, setNewStatus] = useState<Enquiry['status']>('Pending');
  const [transportName, setTransportName] = useState('');
  const [lrNumber, setLrNumber] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState('');

  const filteredEnquiries = enquiries.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase()) || e.phone.includes(searchTerm) || (e.id || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

  const handleOpenDetail = (e: Enquiry) => {
    setSelectedEnquiry(e);
    setNewStatus(e.status || 'Pending');
    setTransportName(e.transport_name || '');
    setLrNumber(e.lr_number || '');
    setResendStatus('');
  };

  const handleResendEmail = async (orderId: string) => {
    setIsResending(true);
    setResendStatus('');
    try {
      const res = await fetch(`https://us-central1-crackersfalls-2026.cloudfunctions.net/resendEnquiryEmail?orderId=${orderId}`);
      const data = await res.json();
      if (data.success) {
        setResendStatus('Confirmation email & PDF resent successfully!');
      } else {
        setResendStatus(`Resend Error: ${data.error || 'Failed to send'}`);
      }
    } catch (err: any) {
      setResendStatus(`Resend Error: ${err.message}`);
    } finally {
      setIsResending(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedEnquiry) return;
    setIsUpdating(true);
    try {
      await updateEnquiryStatus(selectedEnquiry.id, newStatus, transportName, lrNumber);
      setSelectedEnquiry(null);
    } catch (err) {
      console.error('Failed to update enquiry status:', err);
      alert('Error updating status.');
    } finally {
      setIsUpdating(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Confirmed': return <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-sky-400/20 text-sky-300 border border-sky-400/40">Confirmed</span>;
      case 'Packed': return <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-purple-400/20 text-purple-300 border border-purple-400/40">Packed</span>;
      case 'Dispatched': return <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-indigo-400/20 text-indigo-300 border border-indigo-400/40">Dispatched</span>;
      case 'Delivered': return <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-leaf-400/20 text-leaf-400 border border-leaf-400/40">Delivered</span>;
      case 'Cancelled': return <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-crimson-500/20 text-crimson-400 border border-crimson-500/40">Cancelled</span>;
      default: return <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-gold-400/20 text-gold-300 border border-gold-400/40">Pending</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans text-paper-50">
      {/* Top Header Card */}
      <div className="bg-ink-900 p-6 sm:p-8 rounded-3xl border border-gold-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-ember">
        <div>
          <div className="flex items-center gap-2 text-gold-400 font-bold text-xs uppercase tracking-wider">
            <MessageSquare size={16} />
            <span>Order Fulfillment Center</span>
          </div>
          <h1 className="text-3xl font-bold font-display text-white mt-1">Wholesale Enquiries &amp; Orders</h1>
          <p className="text-xs text-paper-300 font-sans mt-1">Manage customer order workflows, transport assignments, and LR receipt numbers.</p>
        </div>
        <div className="text-xs font-extrabold text-gold-400 bg-ink-850 px-5 py-2.5 rounded-full border border-gold-400/30 shrink-0">
          Total Leads: {enquiries.length}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-paper-500" size={15} />
          <input
            type="text"
            placeholder="Search by customer name, phone, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-ink-900 border border-paper-50/15 text-white pl-11 pr-4 py-2.5 rounded-full text-xs outline-none focus:border-gold-400 font-semibold"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 no-scrollbar">
          {['All', 'Pending', 'Confirmed', 'Packed', 'Dispatched', 'Delivered', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-4 py-2 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer border ${
                statusFilter === st
                  ? 'bg-gold-400 text-ink-950 border-gold-400 shadow-[0_0_16px_rgba(242,194,48,0.35)]'
                  : 'bg-ink-900/60 text-paper-300 border-paper-50/20 hover:border-gold-400/50 hover:text-gold-300'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Enquiries Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredEnquiries.map((e) => (
          <div key={e.id} className="bg-ink-900 p-6 rounded-3xl border border-paper-50/10 hover:border-gold-400/40 space-y-4 shadow-xl transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                {getStatusBadge(e.status)}
                <span className="text-[10px] text-paper-500 font-semibold">
                  {new Date(e.created_at || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-white text-base font-display">{e.name}</h3>
                <p className="text-xs text-gold-400 font-semibold mt-0.5">{e.phone}</p>
                {e.address && <p className="text-[11px] text-paper-300 line-clamp-1 mt-1 font-sans">{e.address}</p>}
              </div>

              <div className="p-3 rounded-2xl bg-ink-850 border border-paper-50/10 flex items-center justify-between text-xs font-semibold">
                <span className="text-paper-300">{e.items?.length || 0} Products</span>
                <span className="font-extrabold text-gold-400 font-display text-base">{formatCurrency(e.grand_total)}</span>
              </div>
            </div>

            <button
              onClick={() => handleOpenDetail(e)}
              className="w-full py-2.5 rounded-full bg-ink-850 border border-paper-50/15 hover:bg-gold-400 hover:text-ink-950 hover:border-gold-400 text-gold-400 text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all mt-2"
            >
              <Eye size={14} />
              <span>Manage Order Workflow</span>
            </button>
          </div>
        ))}
      </div>

      {/* Order Workflow Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/85 backdrop-blur-md">
          <div className="bg-ink-900 border border-gold-400/40 p-6 sm:p-7 rounded-3xl max-w-lg w-full space-y-4 shadow-2xl text-xs text-paper-50">
            <div className="flex items-center justify-between border-b border-paper-50/10 pb-3">
              <div>
                <h3 className="text-base font-bold font-display text-gold-400 uppercase">Order Workflow Management</h3>
                <p className="text-[10px] text-paper-500 font-sans mt-0.5">Customer: {selectedEnquiry.name} ({selectedEnquiry.phone})</p>
              </div>
              <button onClick={() => setSelectedEnquiry(null)} className="text-paper-500 hover:text-white cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-paper-300 font-bold mb-1">Update Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full bg-ink-850 border border-paper-50/15 text-white px-4 py-2.5 rounded-2xl outline-none font-semibold cursor-pointer"
                >
                  <option value="Pending" className="bg-ink-900">Pending</option>
                  <option value="Confirmed" className="bg-ink-900">Confirmed</option>
                  <option value="Packed" className="bg-ink-900">Packed</option>
                  <option value="Dispatched" className="bg-ink-900">Dispatched</option>
                  <option value="Delivered" className="bg-ink-900">Delivered</option>
                  <option value="Cancelled" className="bg-ink-900">Cancelled</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-paper-300 font-bold mb-1">Transport Service Name</label>
                  <input
                    type="text"
                    value={transportName}
                    onChange={(e) => setTransportName(e.target.value)}
                    placeholder="e.g. VRL Logistics"
                    className="w-full bg-ink-850 border border-paper-50/15 text-white px-3.5 py-2.5 rounded-2xl outline-none font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-paper-300 font-bold mb-1">LR Receipt Number</label>
                  <input
                    type="text"
                    value={lrNumber}
                    onChange={(e) => setLrNumber(e.target.value)}
                    placeholder="e.g. LR-98402"
                    className="w-full bg-ink-850 border border-paper-50/15 text-white px-3.5 py-2.5 rounded-2xl outline-none font-semibold"
                  />
                </div>
              </div>

              <button
                onClick={handleUpdateStatus}
                disabled={isUpdating}
                className="w-full py-3 bg-gold-400 hover:bg-gold-300 text-ink-950 font-extrabold uppercase tracking-wider rounded-full shadow-ember mt-2 cursor-pointer transition-all"
              >
                {isUpdating ? 'Saving Workflow Status...' : 'Save Order Status & Tracking'}
              </button>

              <div className="pt-2 border-t border-paper-50/10 space-y-2">
                <button
                  type="button"
                  onClick={() => handleResendEmail(selectedEnquiry.id)}
                  disabled={isResending}
                  className="w-full py-2.5 bg-ink-850 hover:bg-ink-800 border border-gold-400/30 text-gold-300 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Mail size={14} />
                  <span>{isResending ? 'Resending Confirmation Email...' : 'Resend Confirmation Email & PDF'}</span>
                </button>

                {resendStatus && (
                  <div className={`p-2.5 rounded-xl text-[11px] font-bold text-center ${resendStatus.includes('Error') ? 'bg-crimson-500/20 text-crimson-400 border border-crimson-500/30' : 'bg-leaf-400/20 text-leaf-400 border border-leaf-400/30'}`}>
                    {resendStatus}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnquiriesPage;
