export interface Product {
  id: string;
  name: string;
  category: string;
  brand: string;
  unit: 'Box' | 'Pkt' | 'Piece' | 'Set' | string;
  price: number;
  original_price: number;
  image_url: string;
  description: string;
  in_stock: boolean;
  active: boolean;
  sortOrder: number;
  // Enhanced Inventory Fields
  sku?: string;
  unitsPerBox?: number;
  costPrice?: number;
  retailPrice?: number;
  wholesalePrice?: number;
  dealerPrice?: number;
  reorderThreshold?: number;
  currentStock?: number; // Computed from stockLedger
  batchTracking?: boolean;
  isActive?: boolean;
  createdAt?: string;
}

export interface StockLedgerEntry {
  id: string;
  productId: string;
  type: 'purchase' | 'sale' | 'return' | 'damage' | 'transfer' | 'adjustment';
  quantity: number; // positive or negative
  locationId: string;
  batchId?: string;
  referenceType: 'purchaseOrderId' | 'salesOrderId' | 'manual';
  referenceId?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface InventoryLocation {
  id: string;
  name: string;
  type: 'shop' | 'godown' | 'popup-stall';
  address: string;
  isLicensedStorage: boolean;
}

export interface Vendor {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email?: string;
  gstNumber?: string;
  paymentTerms?: string;
  address: string;
  createdAt: string;
}

export interface PurchaseOrderItem {
  productId: string;
  quantity: number;
  costPrice: number;
  receivedQuantity: number;
}

export interface PurchaseOrder {
  id: string;
  vendorId: string;
  orderDate: string;
  expectedDeliveryDate?: string;
  status: 'draft' | 'ordered' | 'partially-received' | 'received' | 'cancelled';
  items: PurchaseOrderItem[];
  totalAmount: number;
  amountPaid: number;
  paymentStatus: 'unpaid' | 'partially-paid' | 'paid';
  notes?: string;
}

export interface SalesOrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  priceType: 'retail' | 'wholesale' | 'dealer';
}

export interface SalesOrder {
  id: string;
  orderNumber: string;
  channel: 'website' | 'whatsapp' | 'in-person' | 'wholesale';
  customerId: string;
  orderDate: string;
  status: 'enquiry' | 'pending' | 'confirmed' | 'packed' | 'dispatched' | 'delivered' | 'cancelled';
  items: SalesOrderItem[];
  totalAmount: number;
  amountPaid: number;
  paymentStatus: 'unpaid' | 'partially-paid' | 'paid';
  deliveryType: 'pickup' | 'delivery';
  locationId: string;
  notes?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  customerType: 'retail' | 'wholesale' | 'dealer';
  address: string;
  totalOutstanding: number;
  createdAt: string;
}

export interface Batch {
  id: string;
  productId: string;
  batchNumber: string;
  manufactureDate: string;
  quantityReceived: number;
  quantityRemaining: number;
  locationId: string;
}

export interface AlertDoc {
  id: string;
  type: 'low-stock' | 'expiry' | 'system';
  productId: string;
  currentStock: number;
  threshold: number;
  resolved: boolean;
  createdAt: string;
  resolvedAt?: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  order: number;
  icon: string;
  image_url?: string;
  count?: string;
  color?: string;
  description: string;
  badge?: string;
  active: boolean;
}

export interface EnquiryItem {
  id: string;
  name: string;
  category: string;
  price: number;
  original_price: number;
  quantity: number;
}

export interface Enquiry {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  pincode?: string;
  coupon_code?: string;
  discount_amount?: number;
  items: EnquiryItem[];
  total_mrp: number;
  grand_total: number;
  status: 'Pending' | 'Confirmed' | 'Packed' | 'Dispatched' | 'Delivered' | 'Cancelled';
  transport_name?: string;
  lr_number?: string;
  created_at: string;
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  review: string;
  rating: number;
  order: number;
  active: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percent' | 'flat';
  discount_value: number;
  min_cart_value: number;
  active: boolean;
}

export interface HeroSlide {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  description: string;
  bgClass: string;
  image: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  active: boolean;
  order: number;
}

export interface WhyChooseUsCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  stat: string;
  statLabel: string;
  order: number;
  active: boolean;
}

export interface FooterSettings {
  peso_license_info?: string;
  copyright_text?: string;
  address_line?: string;
  contact_phone?: string;
  contact_email?: string;
  business_hours?: string;
  address?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  brand_name?: string;
  tamil_tagline?: string;
  about_text?: string;
  min_order_note?: string;
}

export interface MasterSettings {
  site_title?: string;
  whatsapp_number?: string;
  min_order_amount?: number;
  minimum_order_value?: number;
  season_year?: string;
  banner_announcement?: string;
  top_bar_notice?: string;
  phone_number?: string;
  global_discount_pct?: number;
  support_email?: string;
  admin_notification_email?: string;
}

export interface SafetyTipsContent {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  do_rules?: Array<{ id: string; title: string; desc: string }>;
  dont_rules?: Array<{ id: string; title: string; desc: string }>;
  tips?: Array<{ id?: string; icon?: string; title?: string; description?: string; text?: string; type?: 'do' | 'dont' }>;
  peso_cert_info?: string;
}

export interface AboutPageContent {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  story_title?: string;
  story_body?: string;
  mission?: string;
  vision?: string;
  years_experience?: string;
  orders_delivered?: string;
  states_covered?: string;
  values?: Array<{ id: string; title: string; desc: string; icon: string }>;
  quality_promise?: string;
}

export interface ContactPageContent {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  hours?: string;
  godown_timings?: string;
  google_maps_url?: string;
  google_map_embed?: string;
}
