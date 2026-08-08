export interface Product {
  id: string;
  name: string;
  category: string;
  brand: string;
  unit: 'Box' | 'Pkt' | 'Piece' | 'Set';
  price: number;
  original_price: number;
  image_url: string;
  description: string;
  in_stock: boolean;
  active: boolean;
  sortOrder: number;
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
  about_text?: string;
  contact_phone?: string;
  contact_email?: string;
  contact_address?: string;
  business_hours?: string;
  peso_license_info?: string;
  copyright_text?: string;
  brand_name?: string;
  tamil_tagline?: string;
  min_order_note?: string;
  address?: string;
  phone?: string;
  email?: string;
  whatsapp?: string;
}

export interface MasterSettings {
  site_title?: string;
  site_tagline?: string;
  min_order_amount?: number;
  whatsapp_number?: string;
  banner_announcement?: string;
  season_year?: string;
  enable_coupons?: boolean;
  maintenance_mode?: boolean;
  top_bar_notice?: string;
  phone_number?: string;
  global_discount_pct?: number;
  minimum_order_value?: number;
  support_email?: string;
}

export interface SafetyTipItem {
  id: string;
  title: string;
  description: string;
  type: 'do' | 'dont';
  icon?: string;
}

export interface SafetyTipsContent {
  eyebrow: string;
  title: string;
  subtitle: string;
  description: string;
  tips: SafetyTipItem[];
}

export interface AboutPageContent {
  eyebrow: string;
  title: string;
  subtitle: string;
  story_title: string;
  story_body: string;
  mission: string;
  vision: string;
  years_experience: string;
  orders_delivered: string;
  states_covered: string;
}

export interface ContactPageContent {
  eyebrow: string;
  title: string;
  subtitle: string;
  description: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  hours: string;
  google_map_embed: string;
}
