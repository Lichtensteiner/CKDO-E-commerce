import React from 'react';
import { Plus, ShoppingBag } from 'lucide-react';
import { formatPrice } from '../../lib/utils';
import { motion } from 'motion/react';

export default function ProductCard({ product, onAddToCart }: { product: any; onAddToCart: (p: any) => void; key?: any }) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col h-full group"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img 
          src={product.imageUrl || `https://picsum.photos/seed/${product.id}/400/400`} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        {product.isPromo && (
          <span className="absolute top-3 left-3 bg-brand-green text-white text-[10px] font-black uppercase px-2 py-1 rounded-md">
            PROMO
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1 gap-2">
        <div className="flex-1">
          <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest leading-none">
            {product.category}
          </span>
          <h3 className="font-bold text-gray-900 group-hover:text-brand-blue transition-colors line-clamp-2 leading-tight mt-1">
            {product.name}
          </h3>
        </div>

        <div className="flex items-end justify-between gap-2 mt-2">
          <div className="flex flex-col">
            {product.isPromo && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(product.price)}
              </span>
            )}
            <span className="text-lg font-black text-brand-blue">
              {formatPrice(product.isPromo ? product.promoPrice : product.price)}
            </span>
          </div>

          <button 
            onClick={() => onAddToCart(product)}
            className="bg-brand-red/5 text-brand-red p-2.5 rounded-xl hover:bg-brand-red hover:text-white transition-all active:scale-90"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
