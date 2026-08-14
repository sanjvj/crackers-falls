import React, { useState, useMemo } from 'react';
import {
  ShoppingBag,
  Plus,
  Search,
  Filter,
  Globe,
  MessageCircle,
  Store,
  Building,
  CheckCircle2,
  Clock,
  Package,
  Truck,
  Check,
  XCircle,
  AlertTriangle,
  CreditCard,
  UserPlus,
  X,
  FileText,
  DollarSign,
  ChevronRight,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { useFirestoreCollection } from '../../hooks/useFirestore';
import { addStockLedgerEntry, recalculateProductStock } from '../../lib/firestore';
import { db } from '../../lib/firebase';
import { collection, addDoc, doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import type {
  Product,
  SalesOrder,
  SalesOrderItem,
  Customer,
  StockLedgerEntry
} from '../../types';

interface SalesOrdersPageProps {
  products?: Product[];
}

export const SalesOrdersPage: React.FC<SalesOrdersPageProps> = ({ products: initialProducts = [] }) => {
  // Real-time Subscriptions
  const { data: salesOrdersData } = useFirestoreCollection<SalesOrder>('salesOrders');
  const { data: productsData } = useFirestoreCollection<Product>('products');
  const { data: customersData } = useFirestoreCollection<Customer>('customers');

  const products = productsData.length > 0 ? productsData : initialProducts;
  const salesOrders = salesOrdersData;

  const defaultCustomers: Customer[] = [
    { id: 'c_1', name: 'Rajarathinam Retailers', phone: '+91 9842100000', customerType: 'wholesale', address: 'Chennai Wholesale Bazaar', totalOutstanding: 0, createdAt: new Date().toISOString() },
    { id: 'c_2', name: 'Priya Fireworks Outlet', phone: '+91 9842200000', customerType: 'retail', address: 'Madurai Main Road', totalOutstanding: 1500, createdAt: new Date().toISOString() },
    { id: 'c_3', name: 'Coimbatore Event Planners', phone: '+91 9842300000', customerType: 'dealer', address: 'Coimbatore Trade Centre', totalOutstanding: 0, createdAt: new Date().toISOString() }
  ];
  const customers = customersData.length > 0 ? customersData : defaultCustomers;

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<'All' | 'website' | 'whatsapp' | 'in-person' | 'wholesale'>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [dateFilter, setDateFilter] = useState<'All' | 'Today' | '7d' | '30d'>('All');

  // New Sale Modal State
  const [isNewSaleOpen, setIsNewSaleOpen] = useState(false);
  const [saleChannel, setSaleChannel] = useState<'website' | 'whatsapp' | 'in-person' | 'wholesale'>('in-person');
  
  // Customer selection / quick-add
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custType, setCustType] = useState<'retail' | 'wholesale' | 'dealer'>('retail');
  const [custAddress, setCustAddress] = useState('');

  // Line items state for New Sale
  const [lineItems, setLineItems] = useState<Array<{
    productId: string;
    quantity: number;
    priceType: 'retail' | 'wholesale' | 'dealer';
    unitPrice: number;
  }>>([]);

  // Active Line Item Input state
  const [activeProdId, setActiveProdId] = useState('');
  const [activeQty, setActiveQty] = useState(1);
  const [activePriceType, setActivePriceType] = useState<'retail' | 'wholesale' | 'dealer'>('retail');
  const [activeUnitPrice, setActiveUnitPrice] = useState(0);

  // Payment State
  const [amountPaidNow, setAmountPaidNow] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'UPI' | 'bank_transfer'>('cash');
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('delivery');
  const [saleNotes, setSaleNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Confirm Enquiry & Stock Resolution Modal State
  const [selectedEnquiry, setSelectedEnquiry] = useState<SalesOrder | null>(null);
  const [resolutionItems, setResolutionItems] = useState<Array<{
    productId: string;
    requestedQty: number;
    currentStock: number;
    finalQty: number;
    unitPrice: number;
    priceType: 'retail' | 'wholesale' | 'dealer';
    action: 'confirm' | 'reduce' | 'backorder' | 'cancel';
  }>>([]);
  const [confirmPaidNow, setConfirmPaidNow] = useState(0);
  const [confirmPayMethod, setConfirmPayMethod] = useState<'cash' | 'UPI' | 'bank_transfer'>('cash');
  const [confirmError, setConfirmError] = useState('');

  // Auto-switch default price tier when channel changes
  const handleChannelChange = (ch: 'website' | 'whatsapp' | 'in-person' | 'wholesale') => {
    setSaleChannel(ch);
    if (ch === 'wholesale') {
      setActivePriceType('wholesale');
      setCustType('wholesale');
    } else {
      setActivePriceType('retail');
      setCustType('retail');
    }
  };

  // When product selection changes, auto-fill unitPrice from chosen priceType
  const handleProductSelect = (prodId: string) => {
    setActiveProdId(prodId);
    const p = products.find(item => item.id === prodId);
    if (p) {
      const price = activePriceType === 'wholesale'
        ? (p.wholesalePrice || p.price)
        : activePriceType === 'dealer'
        ? (p.dealerPrice || p.price)
        : (p.retailPrice || p.original_price || p.price);
      setActiveUnitPrice(price);
    }
  };

  // When priceType changes, recalculate unit price
  const handlePriceTypeChange = (pt: 'retail' | 'wholesale' | 'dealer') => {
    setActivePriceType(pt);
    const p = products.find(item => item.id === activeProdId);
    if (p) {
      const price = pt === 'wholesale'
        ? (p.wholesalePrice || p.price)
        : pt === 'dealer'
        ? (p.dealerPrice || p.price)
        : (p.retailPrice || p.original_price || p.price);
      setActiveUnitPrice(price);
    }
  };

  // Add line item to sale draft
  const handleAddLineItem = () => {
    if (!activeProdId) return;
    const existingIndex = lineItems.findIndex(i => i.productId === activeProdId);
    if (existingIndex >= 0) {
      const updated = [...lineItems];
      updated[existingIndex].quantity += activeQty;
      setLineItems(updated);
    } else {
      setLineItems([...lineItems, {
        productId: activeProdId,
        quantity: activeQty,
        priceType: activePriceType,
        unitPrice: activeUnitPrice
      }]);
    }
    // Reset item inputs
    setActiveProdId('');
    setActiveQty(1);
  };

  // Total order calculations
  const totalAmount = useMemo(() => {
    return lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  }, [lineItems]);

  const balanceDue = Math.max(0, totalAmount - amountPaidNow);

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return salesOrders.filter(order => {
      const matchesChannel = selectedChannel === 'All' || order.channel === selectedChannel;
      const matchesStatus = selectedStatus === 'All' || order.status === selectedStatus;

      const cust = customers.find(c => c.id === order.customerId);
      const custNameText = cust ? cust.name : (order.customerId || '');

      const matchesSearch = !searchTerm ||
        order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        custNameText.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesChannel && matchesStatus && matchesSearch;
    }).sort((a, b) => new Date(b.orderDate || 0).getTime() - new Date(a.orderDate || 0).getTime());
  }, [salesOrders, selectedChannel, selectedStatus, searchTerm, customers]);

  // Open Confirm Enquiry Modal & Re-check currentStock at that exact moment
  const handleOpenConfirmEnquiry = async (order: SalesOrder) => {
    setSelectedEnquiry(order);
    setConfirmError('');

    const resItems = await Promise.all((order.items || []).map(async (item) => {
      const p = products.find(prod => prod.id === item.productId || prod.name === item.productId);
      let liveStock = 25;
      if (p) {
        try {
          const snap = await getDoc(doc(db, 'products', p.id));
          if (snap.exists()) {
            liveStock = snap.data().currentStock ?? (snap.data().in_stock ? 25 : 0);
          } else {
            liveStock = p.currentStock ?? (p.in_stock ? 25 : 0);
          }
        } catch {
          liveStock = p.currentStock ?? (p.in_stock ? 25 : 0);
        }
      }

      const hasDeficit = item.quantity > liveStock;

      return {
        productId: item.productId,
        requestedQty: item.quantity,
        currentStock: liveStock,
        finalQty: item.quantity,
        unitPrice: item.unitPrice || 100,
        priceType: item.priceType || 'retail',
        action: (hasDeficit ? 'reduce' : 'confirm') as any
      };
    }));

    setResolutionItems(resItems);
    setConfirmPaidNow(order.amountPaid || 0);
  };

  // Confirm Enquiry Submit & Write stockLedger entries ONLY NOW
  const handleExecuteEnquiryConfirmation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnquiry) return;

    setIsSubmitting(true);
    setConfirmError('');

    try {
      const activeLineItems = resolutionItems.filter(item => item.action !== 'cancel');
      if (activeLineItems.length === 0) {
        setConfirmError('Cannot confirm order with 0 active items.');
        setIsSubmitting(false);
        return;
      }

      const confirmedItems: SalesOrderItem[] = activeLineItems.map(item => ({
        productId: item.productId,
        quantity: item.action === 'reduce' ? Math.min(item.requestedQty, item.currentStock) : item.finalQty,
        unitPrice: item.unitPrice,
        priceType: item.priceType
      }));

      const newTotal = confirmedItems.reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0);
      const payStatus = confirmPaidNow >= newTotal
        ? 'paid'
        : confirmPaidNow > 0
        ? 'partially-paid'
        : 'unpaid';

      // 1. Update salesOrder status to 'confirmed'
      const orderRef = doc(db, 'salesOrders', selectedEnquiry.id);
      await updateDoc(orderRef, {
        status: 'confirmed',
        items: confirmedItems,
        totalAmount: newTotal,
        amountPaid: confirmPaidNow,
        paymentStatus: payStatus,
        notes: (selectedEnquiry.notes || '') + ` | Confirmed by admin with ${confirmPayMethod} payment.`
      });

      // 2. ONLY NOW write stockLedger entries for confirmed line items
      for (const item of confirmedItems) {
        const prod = products.find(p => p.id === item.productId || p.name === item.productId);
        const pId = prod ? prod.id : item.productId;

        await addStockLedgerEntry({
          productId: pId,
          type: 'sale',
          quantity: -Math.abs(item.quantity),
          locationId: 'loc_1',
          referenceType: 'salesOrderId',
          referenceId: selectedEnquiry.id,
          notes: `Enquiry order confirmed by admin (Ref: ${selectedEnquiry.orderNumber})`,
          createdBy: 'Admin Owner',
          createdAt: new Date().toISOString()
        });
        await recalculateProductStock(pId);
      }

      setSelectedEnquiry(null);
    } catch (err) {
      console.error('Enquiry confirmation error:', err);
      setConfirmError('Failed to confirm enquiry order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit New Sales Order (Direct In-Person/Wholesale Sales)
  const handleConfirmSaleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (lineItems.length === 0) {
      setFormError('Please add at least 1 product line item to the order.');
      return;
    }

    let customerIdToUse = selectedCustomerId;
    if (!customerIdToUse) {
      if (!custName.trim() || !custPhone.trim()) {
        setFormError('Please select an existing customer or enter Customer Name & Mobile Phone.');
        return;
      }
      const newCustId = 'cust_' + Date.now();
      const newCust: Customer = {
        id: newCustId,
        name: custName,
        phone: custPhone,
        customerType: custType,
        address: custAddress,
        totalOutstanding: balanceDue,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'customers', newCustId), newCust);
      customerIdToUse = newCustId;
    } else if (balanceDue > 0) {
      const existingCust = customers.find(c => c.id === customerIdToUse);
      if (existingCust) {
        const custRef = doc(db, 'customers', customerIdToUse);
        await updateDoc(custRef, {
          totalOutstanding: (existingCust.totalOutstanding || 0) + balanceDue
        });
      }
    }

    setIsSubmitting(true);
    try {
      const orderId = 'SO-' + Date.now();
      const orderNum = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
      const timestamp = new Date().toISOString();

      const paymentStat = amountPaidNow >= totalAmount
        ? 'paid'
        : amountPaidNow > 0
        ? 'partially-paid'
        : 'unpaid';

      const newOrder: SalesOrder = {
        id: orderId,
        orderNumber: orderNum,
        channel: saleChannel,
        customerId: customerIdToUse,
        orderDate: timestamp,
        status: 'confirmed',
        items: lineItems,
        totalAmount,
        amountPaid: amountPaidNow,
        paymentStatus: paymentStat,
        deliveryType,
        locationId: 'loc_1',
        notes: saleNotes
      };

      await setDoc(doc(db, 'salesOrders', orderId), newOrder);

      // Write Stock Ledger entries for each line item
      for (const item of lineItems) {
        await addStockLedgerEntry({
          productId: item.productId,
          type: 'sale',
          quantity: -Math.abs(item.quantity),
          locationId: 'loc_1',
          referenceType: 'salesOrderId',
          referenceId: orderId,
          notes: `Sales Order ${orderNum} (${saleChannel} channel)`,
          createdBy: 'Admin Owner',
          createdAt: timestamp
        });
        await recalculateProductStock(item.productId);
      }

      setIsNewSaleOpen(false);
      setLineItems([]);
      setCustName('');
      setCustPhone('');
      setSelectedCustomerId('');
      setAmountPaidNow(0);
    } catch (err) {
      console.error('Create Sales Order Error:', err);
      setFormError('Failed to record sales order.');
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

  const getChannelBadge = (ch: SalesOrder['channel']) => {
    switch (ch) {
      case 'website':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-sky-500/20 text-sky-400 border border-sky-500/30"><Globe size={11} /> Website</span>;
      case 'whatsapp':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-leaf-400/20 text-leaf-400 border border-leaf-400/30"><MessageCircle size={11} /> WhatsApp</span>;
      case 'in-person':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-gold-400/20 text-gold-300 border border-gold-400/30"><Store size={11} /> In-Person</span>;
      case 'wholesale':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30"><Building size={11} /> Wholesale</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold bg-ink-850 text-paper-300">{ch}</span>;
    }
  };

  const getStatusBadge = (status: SalesOrder['status']) => {
    switch (status) {
      case 'enquiry':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">Website Enquiry (Needs Action)</span>;
      case 'pending':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-gold-400/20 text-gold-300 border border-gold-400/30">Pending</span>;
      case 'confirmed':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-sky-500/20 text-sky-400 border border-sky-500/30">Confirmed</span>;
      case 'packed':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">Packed</span>;
      case 'dispatched':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">Dispatched</span>;
      case 'delivered':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-leaf-400/20 text-leaf-400 border border-leaf-400/30">Delivered</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-crimson-500/20 text-crimson-400 border border-crimson-500/30">Cancelled</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans text-paper-50">
      {/* Top Banner Header */}
      <div className="bg-ink-900 p-6 sm:p-8 rounded-3xl border border-gold-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-ember">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-gold-400 font-bold text-xs uppercase tracking-wider">
            <ShoppingBag size={16} />
            <span>Unified Multi-Channel Sales Orders</span>
          </div>
          <h1 className="text-3xl font-bold font-display text-white">Sales &amp; Order Pipeline</h1>
          <p className="text-xs text-paper-300 font-sans">
            Unified order management across Website, WhatsApp, Counter, and Wholesale channels.
          </p>
        </div>

        <button
          onClick={() => setIsNewSaleOpen(true)}
          className="px-6 py-3 bg-gold-400 hover:bg-gold-300 text-ink-950 font-extrabold text-xs uppercase tracking-wider rounded-full shadow-ember flex items-center gap-2 cursor-pointer transition-all shrink-0"
        >
          <Plus size={16} />
          <span>New Sales Order</span>
        </button>
      </div>

      {/* Filter Control Strip */}
      <div className="bg-ink-900 p-5 rounded-3xl border border-paper-50/10 space-y-4 shadow-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-paper-500" size={15} />
            <input
              type="text"
              placeholder="Search Order # or Customer Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-ink-850 border border-paper-50/15 text-white pl-10 pr-4 py-2.5 rounded-2xl outline-none font-semibold text-xs focus:border-gold-400"
            />
          </div>

          {/* Channel Filter */}
          <div>
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value as any)}
              className="w-full bg-ink-850 border border-paper-50/15 text-white px-3.5 py-2.5 rounded-2xl outline-none font-semibold text-xs focus:border-gold-400 cursor-pointer"
            >
              <option value="All">All Channels (Website, WA, Counter, Wholesale)</option>
              <option value="website">🌐 Website Direct Enquiries</option>
              <option value="whatsapp">💬 WhatsApp Orders</option>
              <option value="in-person">🏪 In-Person Counter</option>
              <option value="wholesale">🏢 Wholesale Bulk Orders</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-ink-850 border border-paper-50/15 text-white px-3.5 py-2.5 rounded-2xl outline-none font-semibold text-xs focus:border-gold-400 cursor-pointer"
            >
              <option value="All">All Order Statuses</option>
              <option value="enquiry">🟡 Website Enquiries (Needs Action)</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="packed">Packed</option>
              <option value="dispatched">Dispatched</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="w-full bg-ink-850 border border-paper-50/15 text-white px-3.5 py-2.5 rounded-2xl outline-none font-semibold text-xs focus:border-gold-400 cursor-pointer"
            >
              <option value="All">All Time Range</option>
              <option value="Today">Today</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Unified Orders Table */}
      <div className="bg-ink-900 rounded-3xl border border-paper-50/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-paper-300">
            <thead className="bg-ink-850 border-b border-paper-50/10 text-gold-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-4 px-6">Order # &amp; Date</th>
                <th className="py-4 px-4">Channel</th>
                <th className="py-4 px-4">Customer Name &amp; Phone</th>
                <th className="py-4 px-4 text-right">Total Amount</th>
                <th className="py-4 px-4 text-center">Payment Status</th>
                <th className="py-4 px-4 text-center">Order Status Pipeline</th>
                <th className="py-4 px-6 text-right">Pipeline Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-paper-50/5">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                  const cust = customers.find(c => c.id === order.customerId);
                  const custNameText = cust ? cust.name : (order.customerId || 'Walk-in Customer');
                  const custPhoneText = cust ? cust.phone : '';
                  const due = Math.max(0, (order.totalAmount || 0) - (order.amountPaid || 0));

                  return (
                    <tr key={order.id} className={`hover:bg-ink-850/50 transition-colors ${order.status === 'enquiry' ? 'bg-amber-500/5' : ''}`}>
                      {/* Order # & Date */}
                      <td className="py-4 px-6">
                        <div className="font-extrabold font-mono text-gold-400 text-sm">{order.orderNumber || order.id.slice(0, 8)}</div>
                        <div className="text-[10px] text-paper-500 font-mono">
                          {new Date(order.orderDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* Channel Badge */}
                      <td className="py-4 px-4">
                        {getChannelBadge(order.channel)}
                      </td>

                      {/* Customer Details */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-white font-display">{custNameText}</div>
                        <div className="text-paper-500 text-[10px] font-sans">{custPhoneText}</div>
                      </td>

                      {/* Total Amount & Balance Due */}
                      <td className="py-4 px-4 text-right">
                        <div className="font-extrabold font-display text-white text-sm">{formatCurrency(order.totalAmount || 0)}</div>
                        {due > 0 ? (
                          <span className="text-[10px] font-bold text-crimson-400">Due: {formatCurrency(due)}</span>
                        ) : (
                          <span className="text-[10px] font-bold text-leaf-400">Paid Full</span>
                        )}
                      </td>

                      {/* Payment Status */}
                      <td className="py-4 px-4 text-center uppercase text-[10px] font-extrabold">
                        {order.paymentStatus === 'paid' && <span className="text-leaf-400">Paid</span>}
                        {order.paymentStatus === 'partially-paid' && <span className="text-gold-300">Partial</span>}
                        {order.paymentStatus === 'unpaid' && <span className="text-crimson-400">Unpaid</span>}
                      </td>

                      {/* Order Status Pipeline Badge */}
                      <td className="py-4 px-4 text-center">
                        {getStatusBadge(order.status)}
                      </td>

                      {/* 1-Click Pipeline Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {order.status === 'enquiry' && (
                            <button
                              onClick={() => handleOpenConfirmEnquiry(order)}
                              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-ink-950 font-extrabold rounded-lg text-[11px] uppercase cursor-pointer shadow-sm flex items-center gap-1"
                            >
                              <span>Confirm Order</span>
                              <ChevronRight size={14} />
                            </button>
                          )}
                          {order.status === 'pending' && (
                            <button
                              onClick={() => updateDoc(doc(db, 'salesOrders', order.id), { status: 'confirmed' })}
                              className="px-3 py-1 bg-sky-500/20 text-sky-400 hover:bg-sky-500/30 border border-sky-500/40 rounded-lg text-[10px] font-bold uppercase cursor-pointer"
                            >
                              Confirm
                            </button>
                          )}
                          {order.status === 'confirmed' && (
                            <button
                              onClick={() => updateDoc(doc(db, 'salesOrders', order.id), { status: 'packed' })}
                              className="px-3 py-1 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-500/40 rounded-lg text-[10px] font-bold uppercase cursor-pointer"
                            >
                              Pack
                            </button>
                          )}
                          {order.status === 'packed' && (
                            <button
                              onClick={() => updateDoc(doc(db, 'salesOrders', order.id), { status: 'dispatched' })}
                              className="px-3 py-1 bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/40 rounded-lg text-[10px] font-bold uppercase cursor-pointer"
                            >
                              Dispatch
                            </button>
                          )}
                          {order.status === 'dispatched' && (
                            <button
                              onClick={() => updateDoc(doc(db, 'salesOrders', order.id), { status: 'delivered' })}
                              className="px-3 py-1 bg-leaf-400/20 text-leaf-400 hover:bg-leaf-400/30 border border-leaf-400/40 rounded-lg text-[10px] font-bold uppercase cursor-pointer"
                            >
                              Deliver
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-paper-500 font-semibold">
                    No sales orders found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ----------------------------------------------------------------------------------------- */}
      {/* MODAL 1: CONFIRM ENQUIRY & STOCK RESOLUTION DIALOG */}
      {/* ----------------------------------------------------------------------------------------- */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-ink-900 border border-gold-400/40 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-5 shadow-2xl text-paper-50 font-sans">
            <div className="flex items-center justify-between border-b border-paper-50/10 pb-4">
              <div>
                <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">Website Enquiry Confirmation &amp; Stock Check</span>
                <h3 className="text-xl font-bold font-display text-white">Confirm Order #{selectedEnquiry.orderNumber || selectedEnquiry.id}</h3>
              </div>
              <button onClick={() => setSelectedEnquiry(null)} className="text-paper-400 hover:text-white p-1 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-ink-850 border border-paper-50/10 text-xs space-y-1">
              <p className="text-paper-400">Customer: <strong className="text-white">{selectedEnquiry.customerId}</strong></p>
              <p className="text-paper-400">Submitted: {new Date(selectedEnquiry.orderDate).toLocaleString('en-IN')}</p>
            </div>

            <form onSubmit={handleExecuteEnquiryConfirmation} className="space-y-4 text-xs">
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gold-400">Live Stock Check &amp; Item Resolution</h4>

                {resolutionItems.map((item, idx) => {
                  const p = products.find(prod => prod.id === item.productId || prod.name === item.productId);
                  const pName = p ? p.name : item.productId;
                  const hasDeficit = item.requestedQty > item.currentStock;

                  return (
                    <div key={idx} className={`p-4 rounded-2xl border space-y-2 ${hasDeficit ? 'bg-amber-500/10 border-amber-500/40' : 'bg-ink-850 border-paper-50/10'}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-bold text-white text-sm font-display">{pName}</h5>
                          <p className="text-paper-400 text-[11px]">
                            Requested: <strong className="text-white">{item.requestedQty}</strong> · Available Stock Now: <strong className={item.currentStock > 0 ? 'text-leaf-400' : 'text-crimson-400'}>{item.currentStock}</strong>
                          </p>
                        </div>
                        {hasDeficit && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                            <AlertTriangle size={12} /> Stock Deficit
                          </span>
                        )}
                      </div>

                      {hasDeficit && (
                        <div className="pt-2 border-t border-paper-50/10 flex flex-wrap items-center gap-2">
                          <span className="text-[10px] text-paper-400 font-bold">Admin Resolution:</span>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...resolutionItems];
                              updated[idx].action = 'reduce';
                              updated[idx].finalQty = Math.min(item.requestedQty, item.currentStock);
                              setResolutionItems(updated);
                            }}
                            className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                              item.action === 'reduce' ? 'bg-gold-400 text-ink-950 font-extrabold' : 'bg-ink-900 text-paper-300 border border-paper-50/15'
                            }`}
                          >
                            Reduce to Available ({Math.min(item.requestedQty, item.currentStock)})
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...resolutionItems];
                              updated[idx].action = 'backorder';
                              updated[idx].finalQty = item.requestedQty;
                              setResolutionItems(updated);
                            }}
                            className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                              item.action === 'backorder' ? 'bg-gold-400 text-ink-950 font-extrabold' : 'bg-ink-900 text-paper-300 border border-paper-50/15'
                            }`}
                          >
                            Mark as Backorder ({item.requestedQty})
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...resolutionItems];
                              updated[idx].action = 'cancel';
                              setResolutionItems(updated);
                            }}
                            className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                              item.action === 'cancel' ? 'bg-crimson-500 text-white font-extrabold' : 'bg-ink-900 text-paper-300 border border-paper-50/15'
                            }`}
                          >
                            Cancel Line Item
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Payment Prompt at Confirmation */}
              <div className="p-4 rounded-2xl bg-ink-850 border border-paper-50/10 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gold-400">Record Payment &amp; Commit Sale</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-paper-400 mb-1">Payment Method</label>
                    <select
                      value={confirmPayMethod}
                      onChange={(e) => setConfirmPayMethod(e.target.value as any)}
                      className="w-full bg-ink-900 border border-paper-50/15 text-white px-3 py-2 rounded-xl outline-none font-semibold focus:border-gold-400 cursor-pointer"
                    >
                      <option value="cash">Cash Payment</option>
                      <option value="UPI">UPI / GPay / PhonePe</option>
                      <option value="bank_transfer">Direct Bank Transfer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-paper-400 mb-1">Amount Paid Now (₹)</label>
                    <input
                      type="number"
                      value={confirmPaidNow}
                      onChange={(e) => setConfirmPaidNow(Number(e.target.value))}
                      className="w-full bg-ink-900 border border-paper-50/15 text-leaf-400 px-3 py-2 rounded-xl outline-none font-extrabold focus:border-gold-400"
                    />
                  </div>
                </div>
              </div>

              {confirmError && (
                <div className="p-3 rounded-xl bg-crimson-500/10 border border-crimson-500/30 text-crimson-400 font-semibold text-xs">
                  {confirmError}
                </div>
              )}

              <div className="pt-3 flex justify-end gap-3 border-t border-paper-50/10">
                <button
                  type="button"
                  onClick={() => setSelectedEnquiry(null)}
                  className="px-5 py-2.5 rounded-full bg-ink-850 text-paper-300 font-bold hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-7 py-2.5 rounded-full bg-gold-400 hover:bg-gold-300 text-ink-950 font-extrabold uppercase tracking-wider shadow-ember cursor-pointer"
                >
                  {isSubmitting ? 'Confirming Order & Writing Ledger...' : 'Confirm Sale & Commit Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------------------------------- */}
      {/* MODAL 2: NEW SALE CREATOR FORM */}
      {/* ----------------------------------------------------------------------------------------- */}
      {isNewSaleOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-ink-900 border border-gold-400/40 rounded-3xl p-6 sm:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto space-y-5 shadow-2xl text-paper-50 font-sans">
            <div className="flex items-center justify-between border-b border-paper-50/10 pb-4">
              <div>
                <h3 className="text-xl font-bold font-display text-white">Create Multi-Channel Sales Order</h3>
                <p className="text-xs text-paper-300">Select sales channel, add customer details, and build line items with live stock checks.</p>
              </div>
              <button onClick={() => setIsNewSaleOpen(false)} className="text-paper-400 hover:text-white p-1 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            {/* CHANNEL SELECTOR STRIP AT TOP */}
            <div className="space-y-1.5">
              <label className="block text-paper-300 font-bold text-xs">Sales Channel (Auto-Applies Price Tier) *</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handleChannelChange('in-person')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    saleChannel === 'in-person' ? 'bg-gold-400 text-ink-950 border-gold-400 shadow-md' : 'bg-ink-850 text-paper-300 border-paper-50/15'
                  }`}
                >
                  <Store size={15} />
                  <span>In-Person Counter</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleChannelChange('wholesale')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    saleChannel === 'wholesale' ? 'bg-gold-400 text-ink-950 border-gold-400 shadow-md' : 'bg-ink-850 text-paper-300 border-paper-50/15'
                  }`}
                >
                  <Building size={15} />
                  <span>Wholesale Bulk</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleChannelChange('whatsapp')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    saleChannel === 'whatsapp' ? 'bg-gold-400 text-ink-950 border-gold-400 shadow-md' : 'bg-ink-850 text-paper-300 border-paper-50/15'
                  }`}
                >
                  <MessageCircle size={15} />
                  <span>WhatsApp Lead</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleChannelChange('website')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    saleChannel === 'website' ? 'bg-gold-400 text-ink-950 border-gold-400 shadow-md' : 'bg-ink-850 text-paper-300 border-paper-50/15'
                  }`}
                >
                  <Globe size={15} />
                  <span>Website Direct</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleConfirmSaleOrder} className="space-y-4 text-xs">
              {/* Customer Selection or Quick-Add */}
              <div className="p-4 rounded-2xl bg-ink-850 border border-paper-50/10 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gold-400">Customer Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-paper-400 mb-1">Existing Customer Directory</label>
                    <select
                      value={selectedCustomerId}
                      onChange={(e) => setSelectedCustomerId(e.target.value)}
                      className="w-full bg-ink-900 border border-paper-50/15 text-white px-3 py-2 rounded-xl outline-none font-semibold focus:border-gold-400 cursor-pointer"
                    >
                      <option value="">+ Quick-Add New Customer Below</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                      ))}
                    </select>
                  </div>

                  {!selectedCustomerId && (
                    <>
                      <div>
                        <label className="block text-paper-400 mb-1">Customer Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. S. Kumar"
                          value={custName}
                          onChange={(e) => setCustName(e.target.value)}
                          className="w-full bg-ink-900 border border-paper-50/15 text-white px-3 py-2 rounded-xl outline-none font-semibold focus:border-gold-400"
                        />
                      </div>
                      <div>
                        <label className="block text-paper-400 mb-1">Mobile Phone *</label>
                        <input
                          type="tel"
                          required
                          placeholder="e.g. 9842100000"
                          value={custPhone}
                          onChange={(e) => setCustPhone(e.target.value)}
                          className="w-full bg-ink-900 border border-paper-50/15 text-white px-3 py-2 rounded-xl outline-none font-semibold focus:border-gold-400"
                        />
                      </div>
                      <div>
                        <label className="block text-paper-400 mb-1">Customer Type</label>
                        <select
                          value={custType}
                          onChange={(e) => setCustType(e.target.value as any)}
                          className="w-full bg-ink-900 border border-paper-50/15 text-white px-3 py-2 rounded-xl outline-none font-semibold focus:border-gold-400 cursor-pointer"
                        >
                          <option value="retail">Retail Customer</option>
                          <option value="wholesale">Wholesale Buyer</option>
                          <option value="dealer">Regional Dealer</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Product Line Items Adder */}
              <div className="p-4 rounded-2xl bg-ink-850 border border-paper-50/10 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gold-400">Add Line Items</h4>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
                  <div className="sm:col-span-4">
                    <label className="block text-paper-400 mb-1">Product</label>
                    <select
                      value={activeProdId}
                      onChange={(e) => handleProductSelect(e.target.value)}
                      className="w-full bg-ink-900 border border-paper-50/15 text-white px-3 py-2 rounded-xl outline-none font-semibold focus:border-gold-400 cursor-pointer"
                    >
                      <option value="">Select Product</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.currentStock ?? 0} in stock)</option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-paper-400 mb-1">Price Tier</label>
                    <select
                      value={activePriceType}
                      onChange={(e) => handlePriceTypeChange(e.target.value as any)}
                      className="w-full bg-ink-900 border border-paper-50/15 text-white px-3 py-2 rounded-xl outline-none font-semibold focus:border-gold-400 cursor-pointer"
                    >
                      <option value="retail">Retail Price</option>
                      <option value="wholesale">Wholesale Rate</option>
                      <option value="dealer">Dealer Rate</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-paper-400 mb-1">Unit Rate (₹)</label>
                    <input
                      type="number"
                      value={activeUnitPrice}
                      onChange={(e) => setActiveUnitPrice(Number(e.target.value))}
                      className="w-full bg-ink-900 border border-paper-50/15 text-gold-400 px-3 py-2 rounded-xl outline-none font-extrabold focus:border-gold-400"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-paper-400 mb-1">Qty</label>
                    <input
                      type="number"
                      min={1}
                      value={activeQty}
                      onChange={(e) => setActiveQty(Number(e.target.value))}
                      className="w-full bg-ink-900 border border-paper-50/15 text-white px-3 py-2 rounded-xl outline-none font-semibold focus:border-gold-400"
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <button
                      type="button"
                      onClick={handleAddLineItem}
                      className="w-full py-2 bg-gold-400 hover:bg-gold-300 text-ink-950 font-bold rounded-xl flex items-center justify-center cursor-pointer"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {/* Backorder warning indicator */}
                {activeProdId && (
                  (() => {
                    const targetProd = products.find(p => p.id === activeProdId);
                    const curr = targetProd?.currentStock ?? 0;
                    if (activeQty > curr) {
                      return (
                        <div className="p-2.5 rounded-xl bg-gold-400/20 border border-gold-400/40 text-gold-300 font-semibold text-[11px] flex items-center gap-2">
                          <AlertTriangle size={14} className="shrink-0 text-gold-400" />
                          <span>Backorder Warning: Requested quantity ({activeQty}) exceeds available stock ({curr}). Order will record as backorder.</span>
                        </div>
                      );
                    }
                    return null;
                  })()
                )}

                {/* Line items list */}
                {lineItems.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-paper-50/10">
                    {lineItems.map((item, idx) => {
                      const p = products.find(prod => prod.id === item.productId);
                      return (
                        <div key={idx} className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-ink-900 text-xs">
                          <div>
                            <span className="font-bold text-white">{p?.name || item.productId}</span>
                            <span className="text-[10px] text-paper-500 block">{item.quantity} x {formatCurrency(item.unitPrice)} ({item.priceType})</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-extrabold font-display text-gold-400">{formatCurrency(item.quantity * item.unitPrice)}</span>
                            <button
                              type="button"
                              onClick={() => setLineItems(lineItems.filter((_, i) => i !== idx))}
                              className="text-paper-500 hover:text-crimson-400 p-1 cursor-pointer"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Payment Section */}
              <div className="p-4 rounded-2xl bg-ink-850 border border-paper-50/10 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gold-400">Payment &amp; Delivery Details</h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-paper-400 mb-1">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full bg-ink-900 border border-paper-50/15 text-white px-3 py-2 rounded-xl outline-none font-semibold focus:border-gold-400 cursor-pointer"
                    >
                      <option value="cash">Cash Payment</option>
                      <option value="UPI">UPI / GPay / PhonePe</option>
                      <option value="bank_transfer">Direct Bank Transfer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-paper-400 mb-1">Amount Paid Now (₹)</label>
                    <input
                      type="number"
                      value={amountPaidNow}
                      onChange={(e) => setAmountPaidNow(Number(e.target.value))}
                      className="w-full bg-ink-900 border border-paper-50/15 text-leaf-400 px-3 py-2 rounded-xl outline-none font-extrabold focus:border-gold-400"
                    />
                  </div>

                  <div>
                    <label className="block text-paper-400 mb-1">Delivery Option</label>
                    <select
                      value={deliveryType}
                      onChange={(e) => setDeliveryType(e.target.value as any)}
                      className="w-full bg-ink-900 border border-paper-50/15 text-white px-3 py-2 rounded-xl outline-none font-semibold focus:border-gold-400 cursor-pointer"
                    >
                      <option value="delivery">Safe Packed Transport Delivery</option>
                      <option value="pickup">Store Counter Pickup</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-ink-900 border border-gold-400/30 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-paper-400 block">Total Order Amount: <strong className="text-white font-display">{formatCurrency(totalAmount)}</strong></span>
                    <span className="text-paper-400 block">Amount Paid: <strong className="text-leaf-400 font-display">{formatCurrency(amountPaidNow)}</strong></span>
                  </div>
                  <div className="text-right">
                    <span className="text-paper-500 uppercase text-[10px] font-bold block">Balance Outstanding</span>
                    <span className="text-xl font-extrabold font-display text-crimson-400">{formatCurrency(balanceDue)}</span>
                  </div>
                </div>
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-crimson-500/10 border border-crimson-500/30 text-crimson-400 font-semibold text-xs">
                  {formError}
                </div>
              )}

              <div className="pt-3 flex justify-end gap-3 border-t border-paper-50/10">
                <button
                  type="button"
                  onClick={() => setIsNewSaleOpen(false)}
                  className="px-5 py-2.5 rounded-full bg-ink-850 text-paper-300 font-bold hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-7 py-2.5 rounded-full bg-gold-400 hover:bg-gold-300 text-ink-950 font-extrabold uppercase tracking-wider shadow-ember cursor-pointer"
                >
                  {isSubmitting ? 'Confirming Order...' : 'Confirm Sales Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesOrdersPage;
