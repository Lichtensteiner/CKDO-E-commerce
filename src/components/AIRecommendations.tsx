import React, { useEffect, useState } from 'react';
import { Sparkles, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';
import { geminiService } from '../services/geminiService';
import { Product, Order } from '../types';
import { formatPrice } from '../lib/utils';
import { Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';

interface AIRecommendationsProps {
  currentCart: Product[];
  userId?: string;
  catalog: Product[];
  onAddToCart: (p: Product) => void;
  title?: string;
}

export default function AIRecommendations({ 
  currentCart, 
  userId, 
  catalog, 
  onAddToCart,
  title = "Recommandé pour vous"
}: AIRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (catalog.length === 0) return;
      
      setLoading(true);
      try {
        let history: Order[] = [];
        
        // Fetch user history if logged in
        if (userId) {
          const q = query(
            collection(db, 'orders'),
            where('customerId', '==', userId),
            limit(10)
          );
          const snap = await getDocs(q);
          history = snap.docs
            .map(d => ({ id: d.id, ...d.data() })) as Order[];
          
          // Sort manually to avoid index requirement
          history.sort((a: any, b: any) => {
            const dateA = a.createdAt?.seconds || 0;
            const dateB = b.createdAt?.seconds || 0;
            return dateB - dateA;
          });
        }

        const recs = await geminiService.getRecommendations(currentCart, history, catalog);
        setRecommendations(recs);
      } catch (err) {
        console.error("Failed to fetch recommendations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [userId, catalog.length]); // Refetch if user or catalog changes

  if (loading || (recommendations.length === 0 && !loading)) return null;

  return (
    <section className="space-y-6 pt-12 border-t border-border-subtle">
      <div className="flex items-center gap-2">
        <div className="bg-brand-blue/10 p-2 rounded-xl">
          <Sparkles className="h-5 w-5 text-brand-blue" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-app-text tracking-tight uppercase italic">{title}</h2>
          <p className="text-xs text-gray-400 font-medium tracking-wide">Basé sur votre comportement & IA</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {recommendations.map((product) => (
          <motion.div
            key={product.id}
            whileHover={{ y: -5 }}
            className="group bg-card-bg rounded-3xl border border-border-subtle overflow-hidden hover:shadow-xl transition-all h-full flex flex-col"
          >
            <Link to={`/product/${product.id}`} className="block relative aspect-square overflow-hidden">
              <img 
                src={product.imageUrl} 
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
            </Link>
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <h3 className="font-bold text-sm text-app-text line-clamp-2">{product.name}</h3>
              <div className="flex items-center justify-between gap-2">
                <span className="font-black text-brand-blue">{formatPrice(product.price)}</span>
                <button 
                  onClick={() => onAddToCart(product)}
                  className="bg-brand-blue/10 text-brand-blue p-2 rounded-xl hover:bg-brand-blue hover:text-white transition-all"
                >
                  <ShoppingBag className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
