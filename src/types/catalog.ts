export type Product = {
  id: string
  name: string
  tamilName: string
  category: string
  unit: string
  mrp: number
  price: number
  discount: number
  image: string
  blurb: string
  inStock: boolean
  bestseller?: boolean
}

export type Category = {
  id: string
  label: string
  tamilLabel: string
}

export type Feature = {
  stat: string
  statLabel: string
  title: string
  description: string
  icon: string
}

export type Testimonial = {
  id: string
  quote: string
  name: string
  location: string
  rating: number
  orderSize: string
}

export type Step = {
  number: string
  title: string
  description: string
}

export type EnquiryLine = {
  product: Product
  qty: number
}
