import React from 'react';
import { Plus, ShoppingBag, ExternalLink } from 'lucide-react';
import { formatPrice } from '../../lib/utils';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export default function ProductCard({ product, onAddToCart }: { product: any; onAddToCart: (p: any) => void; key?: any }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -6 }}
      className="bg-card-bg rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-brand-blue/10 border border-border-subtle flex flex-col h-full group transition-all duration-500"
    >
      <Link to={`/product/${product.id}`} className="relative aspect-square overflow-hidden bg-app-background block">
        <img 
          src={product.imageUrl || `https://picsum.photos/seed/${product.id}/400/400`} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          referrerPolicy="no-referrer"
        />
        
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />

        {product.isPromo && (
          <div className="absolute top-4 left-4 bg-brand-red text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-full shadow-lg shadow-brand-red/20 z-10">
            Promo
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20 hidden md:block">
           <button 
             onClick={(e) => { e.preventDefault(); onAddToCart(product); }}
             className="w-full py-3 bg-brand-blue text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-brand-blue/30 hover:bg-slate-900 transition-colors"
           >
             Ajouter au panier
           </button>
        </div>
      </Link>

      <div className="p-5 flex flex-col flex-1 gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-brand-blue uppercase font-black tracking-widest bg-brand-blue/5 px-2 py-0.5 rounded-md">
              {product.category}
            </span>
          </div>
          <Link to={`/product/${product.id}`}>
            <h3 className="font-bold text-app-text group-hover:text-brand-blue transition-colors line-clamp-2 leading-tight text-sm lg:text-base">
              {product.name}
            </h3>
          </Link>
        </div>

        <div className="flex items-center justify-between mt-auto pt-2">
          <div className="flex flex-col">
            {product.isPromo && (
              <span className="text-[10px] text-gray-400 line-through font-bold">
                {formatPrice(product.price)}
              </span>
            )}
            <span className="text-lg font-black text-app-text">
              {formatPrice(product.isPromo ? product.promoPrice : product.price)}
            </span>
          </div>

          <button 
            onClick={() => onAddToCart(product)}
            className="md:hidden bg-brand-blue text-white p-3 rounded-2xl hover:bg-slate-900 transition-all active:scale-90 shadow-lg shadow-brand-blue/20"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
