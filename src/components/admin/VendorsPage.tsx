import React, { useState, useMemo } from 'react';
import {
  Building2,
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  FileText,
  DollarSign,
  Edit3,
  Trash2,
  X,
  History,
  CheckCircle2,
  CreditCard,
  Building
} from 'lucide-react';
import { useFirestoreCollection } from '../../hooks/useFirestore';
import { saveVendor, deleteVendor } from '../../lib/firestore';
import { db } from '../../lib/firebase';
import { collection, doc, setDoc, deleteDoc } from 'firebase/firestore';
import type { Vendor, PurchaseOrder, Product } from '../../types';

export const VendorsPage: React.FC = () => {
  // Real-time Firestore Subscriptions
  const { data: vendorsData } = useFirestoreCollection<Vendor>('vendors');
  const { data: purchaseOrdersData } = useFirestoreCollection<PurchaseOrder>('purchaseOrders');
  const { data: productsData } = useFirestoreCollection<Product>('products');

  const defaultVendors: Vendor[] = [
    { id: 'v_1', name: 'Sivakasi Fireworks Manufacturing Co.', contactPerson: 'M. Shanmugam', phone: '+91 94431 00000', email: 'shanmugam@sivakasifireworks.com', gstNumber: '33AAAAA0000A1Z5', paymentTerms: 'Net 30', address: 'Sivakasi Factory Complex, Virudhunagar Dist', createdAt: new Date().toISOString() },
    { id: 'v_2', name: 'Sri Kaliswari Pyrotechnics', contactPerson: 'K. Ramesh', phone: '+91 94432 00000', email: 'ramesh@kaliswaripyro.com', gstNumber: '33BBBBB1111B2Z6', paymentTerms: 'Cash on Delivery', address: 'Sivakasi Main Road, Tamil Nadu', createdAt: new Date().toISOString() },
    { id: 'v_3', name: 'Standard Fireworks Industries', contactPerson: 'V. Sundaram', phone: '+91 94433 00000', email: 'sundaram@standardfireworks.com', gstNumber: '33CCCCC2222C3Z7', paymentTerms: 'Advance', address: 'Virudhunagar Highway, Sivakasi', createdAt: new Date().toISOString() }
  ];

  const vendors = vendorsData.length > 0 ? vendorsData : defaultVendors;
  const purchaseOrders = purchaseOrdersData;
  const products = productsData;

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [selectedVendorForHistory, setSelectedVendorForHistory] = useState<Vendor | null>(null);

  // Form States
  const [vName, setVName] = useState('');
  const [vContactPerson, setVContactPerson] = useState('');
  const [vPhone, setVPhone] = useState('');
  const [vEmail, setVEmail] = useState('');
  const [vGst, setVGst] = useState('');
  const [vPaymentTerms, setVPaymentTerms] = useState('Net 30');
  const [vAddress, setVAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingVendor(null);
    setVName('');
    setVContactPerson('');
    setVPhone('');
    setVEmail('');
    setVGst('');
    setVPaymentTerms('Net 30');
    setVAddress('');
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setVName(vendor.name);
    setVContactPerson(vendor.contactPerson);
    setVPhone(vendor.phone);
    setVEmail(vendor.email || '');
    setVGst(vendor.gstNumber || '');
    setVPaymentTerms(vendor.paymentTerms || 'Net 30');
    setVAddress(vendor.address);
    setIsAddModalOpen(true);
  };

  // Submit Add / Edit Vendor Form
  const handleSubmitVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vName.trim() || !vContactPerson.trim()) return;

    setIsSubmitting(true);
    try {
      const vendorId = editingVendor ? editingVendor.id : 'v_' + Date.now();
      const vendorDoc: Vendor = {
        id: vendorId,
        name: vName.trim(),
        contactPerson: vContactPerson.trim(),
        phone: vPhone.trim(),
        email: vEmail.trim() || undefined,
        gstNumber: vGst.trim() || undefined,
        paymentTerms: vPaymentTerms,
        address: vAddress.trim(),
        createdAt: editingVendor ? editingVendor.createdAt : new Date().toISOString()
      };

      await saveVendor(vendorDoc);
      setIsAddModalOpen(false);
      setEditingVendor(null);
    } catch (err) {
      console.error('Save Vendor Error:', err);
      alert('Failed to save vendor details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Vendor
  const handleDeleteVendor = async (vendorId: string, vendorName: string) => {
    if (!window.confirm(`Are you sure you want to delete vendor "${vendorName}"?`)) return;
    try {
      await deleteVendor(vendorId);
    } catch (err) {
      console.error('Delete Vendor Error:', err);
    }
  };

  // Search Filtered Vendors
  const filteredVendors = useMemo(() => {
    if (!searchTerm.trim()) return vendors;
    const term = searchTerm.toLowerCase();
    return vendors.filter(v =>
      v.name.toLowerCase().includes(term) ||
      v.contactPerson.toLowerCase().includes(term) ||
      v.phone.toLowerCase().includes(term) ||
      (v.gstNumber && v.gstNumber.toLowerCase().includes(term))
    );
  }, [vendors, searchTerm]);

  // Vendor Purchase History
  const vendorHistory = useMemo(() => {
    if (!selectedVendorForHistory) return [];
    return purchaseOrders
      .filter(po => po.vendorId === selectedVendorForHistory.id)
      .sort((a, b) => new Date(b.orderDate || 0).getTime() - new Date(a.orderDate || 0).getTime());
  }, [purchaseOrders, selectedVendorForHistory]);

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
            <Building2 size={16} />
            <span>Supplier &amp; Factory Directory</span>
          </div>
          <h1 className="text-3xl font-bold font-display text-white">Vendor Management</h1>
          <p className="text-xs text-paper-300">
            Manage Sivakasi manufacturing vendors, GSTIN numbers, payment terms, and restock purchase history.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-6 py-3 bg-gold-400 hover:bg-gold-300 text-ink-950 font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-ember flex items-center gap-2 cursor-pointer transition-all shrink-0"
        >
          <Plus size={16} />
          <span>Add New Vendor</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-ink-900 p-4 rounded-3xl border border-paper-50/10 shadow-xl flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-paper-500" size={16} />
          <input
            type="text"
            placeholder="Search vendor name, contact person, phone, or GSTIN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-ink-850 border border-paper-50/15 text-white text-xs pl-10 pr-4 py-2.5 rounded-2xl outline-none font-semibold focus:border-gold-400"
          />
        </div>

        <div className="text-xs text-paper-400 font-bold">
          Showing <span className="text-gold-400">{filteredVendors.length}</span> Vendors
        </div>
      </div>

      {/* Vendor List Cards / Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredVendors.map((vendor) => {
          const poList = purchaseOrders.filter(po => po.vendorId === vendor.id);
          const totalSpent = poList.reduce((sum, po) => sum + (po.totalAmount || 0), 0);

          return (
            <div
              key={vendor.id}
              className="bg-ink-900 p-5 rounded-3xl border border-paper-50/10 hover:border-gold-400/40 transition-all space-y-4 shadow-xl flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3 border-b border-paper-50/10 pb-3">
                  <div>
                    <span className="text-[9px] font-bold text-gold-400 font-mono uppercase tracking-wider block">
                      GSTIN: {vendor.gstNumber || 'UNREGISTERED'}
                    </span>
                    <h3 className="text-base font-bold font-display text-white line-clamp-1">{vendor.name}</h3>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleOpenEditModal(vendor)}
                      className="p-1.5 rounded-xl bg-ink-850 text-paper-300 hover:text-gold-400 cursor-pointer"
                      title="Edit Vendor"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => handleDeleteVendor(vendor.id, vendor.name)}
                      className="p-1.5 rounded-xl bg-ink-850 text-paper-300 hover:text-crimson-400 cursor-pointer"
                      title="Delete Vendor"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-paper-300">
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-gold-400 shrink-0" />
                    <span className="font-semibold">{vendor.contactPerson}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-leaf-400 shrink-0" />
                    <span className="font-mono">{vendor.phone}</span>
                  </div>

                  {vendor.email && (
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-sky-400 shrink-0" />
                      <span className="truncate">{vendor.email}</span>
                    </div>
                  )}

                  <div className="flex items-start gap-2">
                    <MapPin size={14} className="text-crimson-400 shrink-0 mt-0.5" />
                    <span className="text-paper-400 line-clamp-2">{vendor.address}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-paper-50/10 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-paper-500 uppercase font-bold block">Payment Terms</span>
                    <span className="font-extrabold text-gold-300">{vendor.paymentTerms || 'Net 30'}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-paper-500 uppercase font-bold block">Total Purchases</span>
                    <span className="font-extrabold text-leaf-400 font-display">{formatCurrency(totalSpent)} ({poList.length} Orders)</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedVendorForHistory(vendor)}
                  className="w-full py-2.5 bg-ink-850 hover:bg-ink-800 border border-paper-50/15 text-paper-200 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <History size={14} />
                  <span>View Restock Order History</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Vendor Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/80 backdrop-blur-sm">
          <div className="bg-ink-900 w-full max-w-lg p-6 rounded-3xl border border-gold-400/30 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-paper-50/10 pb-3">
              <h3 className="text-lg font-bold font-display text-white">
                {editingVendor ? 'Edit Vendor Details' : 'Add New Supplier Vendor'}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-paper-400 hover:text-white p-1 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitVendor} className="space-y-3 text-xs">
              <div>
                <label className="block text-paper-400 font-bold mb-1">Company / Vendor Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sivakasi Fireworks Co."
                  value={vName}
                  onChange={(e) => setVName(e.target.value)}
                  className="w-full bg-ink-850 border border-paper-50/15 text-white px-3.5 py-2.5 rounded-xl outline-none font-semibold focus:border-gold-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-paper-400 font-bold mb-1">Contact Person *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. M. Shanmugam"
                    value={vContactPerson}
                    onChange={(e) => setVContactPerson(e.target.value)}
                    className="w-full bg-ink-850 border border-paper-50/15 text-white px-3.5 py-2.5 rounded-xl outline-none font-semibold focus:border-gold-400"
                  />
                </div>
                <div>
                  <label className="block text-paper-400 font-bold mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 94431 00000"
                    value={vPhone}
                    onChange={(e) => setVPhone(e.target.value)}
                    className="w-full bg-ink-850 border border-paper-50/15 text-white px-3.5 py-2.5 rounded-xl outline-none font-semibold focus:border-gold-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-paper-400 font-bold mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="supplier@domain.com"
                    value={vEmail}
                    onChange={(e) => setVEmail(e.target.value)}
                    className="w-full bg-ink-850 border border-paper-50/15 text-white px-3.5 py-2.5 rounded-xl outline-none font-semibold focus:border-gold-400"
                  />
                </div>
                <div>
                  <label className="block text-paper-400 font-bold mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    placeholder="33AAAAA0000A1Z5"
                    value={vGst}
                    onChange={(e) => setVGst(e.target.value)}
                    className="w-full bg-ink-850 border border-paper-50/15 text-gold-400 font-mono px-3.5 py-2.5 rounded-xl outline-none font-semibold focus:border-gold-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-paper-400 font-bold mb-1">Payment Terms</label>
                <select
                  value={vPaymentTerms}
                  onChange={(e) => setVPaymentTerms(e.target.value)}
                  className="w-full bg-ink-850 border border-paper-50/15 text-white px-3.5 py-2.5 rounded-xl outline-none font-semibold cursor-pointer"
                >
                  <option value="Net 15">Net 15 Days</option>
                  <option value="Net 30">Net 30 Days</option>
                  <option value="Cash on Delivery">Cash on Delivery (COD)</option>
                  <option value="Advance">Advance Payment</option>
                </select>
              </div>

              <div>
                <label className="block text-paper-400 font-bold mb-1">Factory / Office Address *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Full factory or godown address..."
                  value={vAddress}
                  onChange={(e) => setVAddress(e.target.value)}
                  className="w-full bg-ink-850 border border-paper-50/15 text-white px-3.5 py-2.5 rounded-xl outline-none font-semibold focus:border-gold-400"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-paper-50/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 rounded-full bg-ink-850 text-paper-300 font-bold hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-full bg-gold-400 hover:bg-gold-300 text-ink-950 font-extrabold uppercase tracking-wider cursor-pointer"
                >
                  {isSubmitting ? 'Saving...' : 'Save Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vendor History Drawer */}
      {selectedVendorForHistory && (
        <div className="fixed inset-0 z-50 flex justify-end bg-ink-950/80 backdrop-blur-sm">
          <div className="bg-ink-900 w-full max-w-md h-full p-6 space-y-4 shadow-2xl overflow-y-auto border-l border-paper-50/10">
            <div className="flex items-center justify-between border-b border-paper-50/10 pb-3">
              <div>
                <h3 className="text-lg font-bold font-display text-white">{selectedVendorForHistory.name}</h3>
                <span className="text-xs text-gold-400 font-mono">Restock Purchase Orders</span>
              </div>
              <button onClick={() => setSelectedVendorForHistory(null)} className="text-paper-400 hover:text-white p-1 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              {vendorHistory.length > 0 ? (
                vendorHistory.map((po) => (
                  <div key={po.id} className="p-4 rounded-2xl bg-ink-850 border border-paper-50/10 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-bold text-gold-400">{po.id}</span>
                      <span className="text-[10px] font-bold uppercase text-leaf-400 bg-leaf-400/20 px-2 py-0.5 rounded-full">
                        {po.status}
                      </span>
                    </div>
                    <div className="flex justify-between text-paper-300">
                      <span>Total Amount:</span>
                      <strong className="text-white font-display text-sm">{formatCurrency(po.totalAmount || 0)}</strong>
                    </div>
                    <div className="text-[10px] text-paper-500">
                      Date: {new Date(po.orderDate).toLocaleDateString('en-IN')}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-paper-500 text-xs">
                  No restock purchase orders recorded for this vendor yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorsPage;
