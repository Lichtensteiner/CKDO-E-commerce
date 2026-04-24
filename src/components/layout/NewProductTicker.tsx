import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X } from 'lucide-react';
import { Product } from '../../types';
import { useTranslation } from 'react-i18next';

export default function NewProductTicker({ products }: { products: Product[] }) {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(true);
  
  // Filter products added in the last 48 hours
  const newProducts = products.filter(p => {
    if (!p.createdAt) return false;
    let date: Date;
    if (p.createdAt?.toDate) {
      date = p.createdAt.toDate();
    } else if (p.createdAt?.seconds) {
      date = new Date(p.createdAt.seconds * 1000);
    } else {
      date = new Date(p.createdAt);
    }
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    return date > fortyEightHoursAgo;
  });

  if (!isVisible || newProducts.length === 0) return null;

  return (
    <div className="bg-brand-red text-white py-2 relative overflow-hidden flex items-center">
      <div className="absolute left-0 top-0 bottom-0 px-4 bg-brand-red z-10 flex items-center shadow-[10px_0_15px_-5px_rgba(0,0,0,0.3)]">
        <Sparkles size={16} className="animate-pulse mr-2" />
        <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
          {t('ticker.new_arrivals', 'Nouveautés Mobile')}
        </span>
      </div>

      <div className="flex-1 overflow-hidden">
        <motion.div 
          animate={{ x: [0, -1000] }}
          transition={{ 
            duration: 25, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="flex whitespace-nowrap gap-12 items-center"
        >
          {[...newProducts, ...newProducts, ...newProducts].map((product, idx) => (
            <div key={`${product.id}-${idx}`} className="flex items-center gap-3">
              <span className="text-[11px] font-bold uppercase tracking-tight">
                🔥 {product.name}
              </span>
              <span className="h-1 w-1 rounded-full bg-white/30" />
            </div>
          ))}
        </motion.div>
      </div>

      <button 
        onClick={() => setIsVisible(false)}
        className="absolute right-0 top-0 bottom-0 px-4 bg-brand-red z-10 hover:bg-white/10 transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
}
