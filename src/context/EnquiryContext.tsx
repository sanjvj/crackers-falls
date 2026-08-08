import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { Product } from '../types';
import { useFirestoreCollection } from '../hooks/useFirestore';
import { DEFAULT_PRODUCTS } from '../lib/firestore';

interface EnquiryContextType {
  quantities: Record<string, number>;
  setQuantity: (productId: string, qty: number) => void;
  handleQuantityChange: (productId: string, delta: number) => void;
  clearCart: () => void;
  count: number;
  total: number;
  products: Product[];
  whatsappHref: string;
}

const EnquiryContext = createContext<EnquiryContextType | null>(null);

export const EnquiryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: products } = useFirestoreCollection<Product>('products', DEFAULT_PRODUCTS);

  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('cf_cart_quantities');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('cf_cart_quantities', JSON.stringify(quantities));
    } catch (e) {}
  }, [quantities]);

  const setQuantity = (productId: string, qty: number) => {
    setQuantities(prev => {
      const next = { ...prev };
      if (qty <= 0) {
        delete next[productId];
      } else {
        next[productId] = qty;
      }
      return next;
    });
  };

  const handleQuantityChange = (productId: string, delta: number) => {
    setQuantities(prev => {
      const current = prev[productId] || 0;
      const next = Math.max(0, current + delta);
      const copy = { ...prev };
      if (next === 0) {
        delete copy[productId];
      } else {
        copy[productId] = next;
      }
      return copy;
    });
  };

  const clearCart = () => {
    setQuantities({});
  };

  const { count, total, bodyText } = useMemo(() => {
    let countSum = 0;
    let totalSum = 0;
    const linesText: string[] = [];

    Object.entries(quantities).forEach(([prodId, qty]) => {
      if (qty <= 0) return;
      const p = products.find(item => item.id === prodId);
      if (p) {
        countSum += qty;
        totalSum += p.price * qty;
        linesText.push(`• ${p.name} (${p.unit}) × ${qty} = ₹${(p.price * qty).toLocaleString('en-IN')}`);
      }
    });

    const body = linesText.length > 0
      ? `Hi Crackers Falls, I would like to order wholesale fireworks:\n\n${linesText.join('\n')}\n\n*Total Amount:* ₹${totalSum.toLocaleString('en-IN')}`
      : `Hi Crackers Falls, please share your Diwali 2026 wholesale price list.`;

    return {
      count: countSum,
      total: totalSum,
      bodyText: body
    };
  }, [quantities, products]);

  const whatsappHref = `https://wa.me/919159038240?text=${encodeURIComponent(bodyText)}`;

  return (
    <EnquiryContext.Provider
      value={{
        quantities,
        setQuantity,
        handleQuantityChange,
        clearCart,
        count,
        total,
        products,
        whatsappHref
      }}
    >
      {children}
    </EnquiryContext.Provider>
  );
};

export const useEnquiry = () => {
  const context = useContext(EnquiryContext);
  if (!context) {
    throw new Error('useEnquiry must be used within an EnquiryProvider');
  }
  return context;
};
