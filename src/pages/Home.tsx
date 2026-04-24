import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Clock, ShieldCheck, PhoneCall, Star, Target, Zap, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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

  const [currentSlide, setCurrentSlide] = useState(0);
  const heroImages = [
    "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1600",
    "https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=80&w=1600",
    "https://images.unsplash.com/photo-1604719312563-8912e9223c6a?auto=format&fit=crop&q=80&w=1600",
    "https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?auto=format&fit=crop&q=80&w=1600",
    "https://images.unsplash.com/photo-1516594798947-e65505dbb29d?auto=format&fit=crop&q=80&w=1600"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  return (
    <div className="space-y-12 pb-20">
      {/* Hero Section */}
      <section className="relative h-[400px] md:h-[600px] flex items-center overflow-hidden bg-brand-blue">
        {/* Background Slideshow */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 0.35, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <img 
                src={heroImages[currentSlide]} 
                alt="Supermarket scene" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/80 via-brand-blue/40 to-transparent" />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-white">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl space-y-6"
          >
            <h1 className="text-3xl sm:text-4xl md:text-7xl font-extrabold tracking-tight leading-[1.1] uppercase italic">
              Faites vos courses, on s'occupe du reste.
            </h1>
            <p className="text-lg md:text-xl text-blue-100 max-w-lg font-medium">
              Le meilleur de CKDO directement sur votre mobile. Click & Collect rapide ou livraison à domicile.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/products" className="btn-primary px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-2xl shadow-brand-red/30">
                  Commander
                  <ArrowRight className="h-4 w-4" />
              </Link>
              <button className="px-8 py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all">
                Nos magasins
              </button>
            </div>
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

      {/* Mission & Vision Section */}
      <section className="bg-app-background py-24 border-y border-border-subtle overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-blue bg-brand-blue/5 px-4 py-2 rounded-full">
                  Notre Engagement
                </span>
                <h2 className="text-4xl md:text-5xl font-black text-app-text tracking-tighter leading-tight italic uppercase">
                  Une Vision pour le Gabon.
                </h2>
                <p className="text-lg text-gray-500 font-medium leading-relaxed max-w-xl">
                  Chez <strong>Ludo_Consulting</strong>, nous croyons que la technologie doit simplifier la vie. Notre mission est de transformer la façon dont vous accédez aux produits essentiels avec excellence.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-8 bg-card-bg rounded-[2.5rem] border border-border-subtle shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                  <div className="w-14 h-14 bg-brand-blue/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand-blue group-hover:text-white transition-colors">
                    <Target size={28} />
                  </div>
                  <h3 className="text-lg font-black text-app-text mb-3 uppercase tracking-tight">Notre Mission</h3>
                  <p className="text-sm text-gray-400 font-medium leading-relaxed">
                    Offrir une plateforme de commerce fluide, sécurisée et ultra-rapide pour tous les Gabonais, partout et tout le temps.
                  </p>
                </div>

                <div className="p-8 bg-card-bg rounded-[2.5rem] border border-border-subtle shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                  <div className="w-14 h-14 bg-brand-red/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand-red group-hover:text-white transition-colors">
                    <ShieldCheck size={28} />
                  </div>
                  <h3 className="text-lg font-black text-app-text mb-3 uppercase tracking-tight">Nos Valeurs</h3>
                  <p className="text-sm text-gray-400 font-medium leading-relaxed">
                    Transparence totale, respect des données utilisateurs et excellence dans le service client sont au cœur de notre ADN.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative z-10"
              >
                <div className="absolute -inset-4 bg-brand-blue/5 rounded-[4rem] -rotate-3" />
                <img 
                  src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1000" 
                  alt="Grocery selection" 
                  className="relative rounded-[3rem] w-full aspect-[4/5] object-cover shadow-2xl"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute -bottom-8 -right-8 bg-white p-8 rounded-[2.5rem] shadow-2xl border border-gray-100 hidden sm:block">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-brand-green text-white rounded-2xl">
                      <Heart size={24} />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-app-text">100%</p>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Passionné</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
