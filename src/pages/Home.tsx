import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Clock, ShieldCheck, PhoneCall, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { formatPrice } from '../lib/utils';
import { Product } from '../types';
import { productService } from '../services/productService';

export default function Home({ onAddToCart }: { onAddToCart: (p: Product) => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = productService.subscribeToActiveProducts((fetched) => {
      setProducts(fetched.filter(p => p.isActive).slice(0, 4));
      setLoading(false);
    });
    return () => unsub();
  }, []);
  const featuredCategories = [
    { name: 'Alimentaire', icon: '🥫', id: 'alimentaire' },
    { name: 'Produits Frais', icon: '🥩', id: 'frais' },
    { name: 'Fruits & Légumes', icon: '🥬', id: 'fruits-legumes' },
    { name: 'Surgelés', icon: '❄️', id: 'surgeles' },
  ];

  return (
    <div className="space-y-12 pb-20">
      {/* Hero Section */}
      <section className="relative h-[500px] flex items-center overflow-hidden bg-brand-blue">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://picsum.photos/seed/grocery/1600/900" 
            alt="Hero background" 
            className="w-full h-full object-cover grayscale"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-white">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl space-y-6"
          >
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1]">
              Faites vos courses, on s'occupe du reste.
            </h1>
            <p className="text-xl text-blue-100 max-w-lg">
              Le meilleur de CKDO directement sur votre mobile. Click & Collect rapide ou livraison à domicile.
            </p>
            <Link to="/products" className="btn-primary px-8 py-4 rounded-full font-bold text-lg flex items-center gap-2">
                Commander maintenant
                <ArrowRight className="h-5 w-5" />
              </Link>
              <button className="btn-secondary px-8 py-4 rounded-full font-bold text-lg">
                En savoir plus
              </button>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8 text-app-text">Rayons populaires</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {featuredCategories.map((cat, idx) => (
            <motion.div
              key={cat.id}
              whileHover={{ scale: 1.05 }}
              className="bg-card-bg p-6 rounded-3xl shadow-sm border border-border-subtle flex flex-col items-center text-center gap-4 cursor-pointer"
            >
              <span className="text-5xl">{cat.icon}</span>
              <span className="font-bold text-app-text">{cat.name}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-black text-app-text tracking-tight">En ce moment</h2>
          <Link to="/products" className="text-brand-blue font-bold flex items-center gap-2 hover:underline">
            Voir tout
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-app-background animate-pulse rounded-3xl h-80" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {products.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="group bg-card-bg rounded-3xl border border-border-subtle overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div className="relative aspect-square overflow-hidden bg-app-background">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  {product.isPromo && (
                    <div className="absolute top-3 left-3 bg-brand-red text-white text-[10px] font-black uppercase px-2 py-1 rounded-full">
                      Promo
                    </div>
                  )}
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-bold text-gray-500">4.9 (120)</span>
                  </div>
                  <h3 className="font-bold text-app-text group-hover:text-brand-blue transition-colors line-clamp-1">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-lg font-black text-app-text">{formatPrice(product.price)}</span>
                      {product.promoPrice && (
                        <span className="text-xs text-gray-400 line-through">{formatPrice(product.promoPrice)}</span>
                      )}
                    </div>
                    <button 
                      onClick={() => onAddToCart(product)}
                      className="bg-brand-green/10 text-brand-green p-2.5 rounded-2xl hover:bg-brand-green hover:text-white transition-all transform hover:scale-105 active:scale-95"
                    >
                      <ShoppingBag className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Trust Badges */}
      <section className="bg-app-background py-12 border-y border-border-subtle">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="space-y-4">
              <div className="bg-card-bg h-16 w-16 rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-border-subtle">
                <Clock className="h-8 w-8 text-brand-green" />
              </div>
              <h3 className="font-bold text-lg text-app-text">Click & Collect Rapide</h3>
              <p className="text-gray-500">Récupérez votre commande en moins de 2h dans votre magasin CKDO préféré.</p>
            </div>
            <div className="space-y-4">
              <div className="bg-card-bg h-16 w-16 rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-border-subtle">
                <ShieldCheck className="h-8 w-8 text-brand-green" />
              </div>
              <h3 className="font-bold text-lg text-app-text">Paiement Sécurisé</h3>
              <p className="text-gray-500">Payez en Mobile Money (Airtel/Moov) ou par Carte Bancaire en toute confiance.</p>
            </div>
            <div className="space-y-4">
              <div className="bg-card-bg h-16 w-16 rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-border-subtle">
                <PhoneCall className="h-8 w-8 text-brand-green" />
              </div>
              <h3 className="font-bold text-lg text-app-text">Service Client Local</h3>
              <p className="text-gray-500">Une équipe dédiée basée au Gabon pour vous accompagner dans vos achats.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
