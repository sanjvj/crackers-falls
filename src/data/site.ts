export type Feature = {
  stat: string
  statLabel: string
  title: string
  description: string
  icon: string
}

export type Step = {
  number: string
  title: string
  description: string
  detail: string
}

export type Testimonial = {
  id: string
  quote: string
  name: string
  location: string
  rating: number
  orderSize: string
}

export const site = {
  name: 'Crackers Falls',
  tamilName: 'பட்டாசு அருவி',
  phone: '+91 9159038240',
  whatsapp: 'https://wa.me/919159038240',
  email: 'support@crackersfalls.in',
  address: 'Sivakasi Main Road, Sivakasi, Tamil Nadu 626123, India',
  hours: 'Mon – Sun · 8:00 AM – 10:00 PM IST',
  minOrder: '₹2,000',
  season: 'Diwali 2026',
  since: '2009',
}

export const features: Feature[] = [
  {
    stat: '100%',
    statLabel: 'Factory direct rate',
    title: 'Straight from the Sivakasi godown',
    description: 'No distributors, no agents, no markup. You pay the same rate our factory floor quotes.',
    icon: 'factory',
  },
  {
    stat: 'A+',
    statLabel: 'Quality assured',
    title: 'Every batch test-fired',
    description: 'Sound crackers, fountains and sparklers are sample-tested before a box leaves the shelf.',
    icon: 'sparkles',
  },
  {
    stat: '24–48h',
    statLabel: 'Dispatch window',
    title: 'Fast nationwide dispatch',
    description: 'Licensed transport partners with moisture-proof packing and live tracking on WhatsApp.',
    icon: 'truck',
  },
  {
    stat: '12k+',
    statLabel: 'Orders shipped',
    title: 'Trusted by retailers since 2009',
    description: 'Shops, event planners and families across 18 states restock with us every season.',
    icon: 'shield',
  },
]

export const steps: Step[] = [
  {
    number: '01',
    title: 'Build your list',
    description: 'Browse the wholesale catalog and add the boxes and unit sizes you need.',
    detail: 'Live stock status',
  },
  {
    number: '02',
    title: 'Send on WhatsApp',
    description: 'One tap sends your list to our sales desk. We confirm stock and final rates in minutes.',
    detail: 'Reply in ~7 min',
  },
  {
    number: '03',
    title: 'Pay & confirm',
    description: 'Advance via UPI or bank transfer. You get a stamped invoice and packing list instantly.',
    detail: 'GST invoice',
  },
  {
    number: '04',
    title: 'Track till doorstep',
    description: 'Godown photos at packing, LR number at dispatch, and updates until it lands.',
    detail: 'Insured transport',
  },
]

export const testimonials: Testimonial[] = [
  {
    id: 't1',
    quote:
      'Excellent wholesale packing and super fast transport dispatch. The WhatsApp order flow was seamless and completely transparent on rates.',
    name: 'Venkatesh Prasad',
    location: 'Bengaluru, KA',
    rating: 5,
    orderSize: '₹84,000 order',
  },
  {
    id: 't2',
    quote:
      'We stock our two shops entirely from Crackers Falls. Rates beat every local agent and nothing arrived damp even in October rain.',
    name: 'Anitha Raman',
    location: 'Coimbatore, TN',
    rating: 5,
    orderSize: 'Repeat buyer · 4 seasons',
  },
  {
    id: 't3',
    quote:
      'Ordered 120 gift boxes for our company Diwali. Delivered in 3 days with a proper invoice and safety sheet for the office.',
    name: 'Rohit Malhotra',
    location: 'Pune, MH',
    rating: 5,
    orderSize: '₹1.3L corporate order',
  },
]

export const heroLines = [
  'no distributors, no agents, no markup.',
  'slab rates open from ₹2,000 upward.',
  'PESO licensed, insured, test-fired.',
]

export const heroStats = [
  { value: '55%', label: 'Off the printed price list' },
  { value: '12k+', label: 'Orders shipped since 2009' },
  { value: '18', label: 'States we deliver to' },
]

export const tickerItems = [
  'Factory direct pricing',
  'Minimum order ₹2,000',
  'Ships to 18 states',
  'PESO licensed',
  'WhatsApp order desk',
  '24–48h dispatch',
  'Moisture-proof packing',
  '12,000+ orders shipped',
]

export const heroSlides = [
  {
    eyebrow: 'Sivakasi direct wholesale · 2026',
    title: 'Direct factory outlet',
    highlight: '55% off price list',
    body: 'Wholesale fireworks shipped straight from our Sivakasi godown to your doorstep — no distributors, no markup.',
  },
]

export const marqueeItems = tickerItems;
