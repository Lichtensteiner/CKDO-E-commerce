import React, { useState, useEffect } from 'react';
import ProductCard from '../components/product/ProductCard';
import CategoryNav from '../components/product/CategoryNav';
import { Filter, Search, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { productService } from '../services/productService';
import { Product } from '../types';

export default function ProductList({ onAddToCart }: { onAddToCart: (p: Product) => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedRayon, setSelectedRayon] = useState('Tous');
  const [selectedSubCat, setSelectedSubCat] = useState('Tous');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'newest'>('newest');

  useEffect(() => {
    const unsub = productService.subscribeToActiveProducts((fetched) => {
      // Show products if they are explicitly active OR if the isActive field is missing
      setProducts(fetched.filter(p => p.isActive !== false));
      setLoadingProducts(false);
    });
    return () => unsub();
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesRayon = selectedRayon === 'Tous' || p.category === selectedRayon;
    
    const matchesSubCat = selectedSubCat === 'Tous' || 
                         p.subCategory === selectedSubCat ||
                         (!p.subCategory && p.name.toLowerCase().includes(selectedSubCat.split(' ')[0].toLowerCase()));
                         
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesRayon && matchesSubCat && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    return 0; // Keeping newest by default (as matched in DB order mostly)
  });

  const handleSelectNav = (rayon: string, subCat: string) => {
    setSelectedRayon(rayon);
    setSelectedSubCat(subCat);
  };

  return (
    <div className="min-h-screen bg-app-background pb-20">
      <div className="container mx-auto px-4 py-8 space-y-10">
        <header className="space-y-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-app-text uppercase">Le Magasin</h1>
              <p className="text-gray-500 font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
                Mise à jour en temps réel • {filteredProducts.length} articles trouvés
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <div className="relative flex-1 sm:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Chercher un article..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-card-bg border border-border-subtle rounded-2xl py-4 pl-12 pr-4 shadow-sm focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all placeholder:text-gray-400 font-medium text-app-text"
                />
              </div>

              <div className="relative inline-block w-full sm:w-48">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full appearance-none bg-card-bg border border-border-subtle rounded-2xl py-4 pl-4 pr-10 shadow-sm focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue outline-none font-bold text-sm uppercase tracking-tight text-app-text"
                >
                  <option value="newest">Nouveautés</option>
                  <option value="price-asc">Prix croissant</option>
                  <option value="price-desc">Prix décroissant</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
          
          <div className="p-1 bg-app-background rounded-[2.5rem] shadow-inner border border-border-subtle">
            <CategoryNav 
              onSelectCategory={handleSelectNav} 
              activeCategory={selectedRayon}
              activeSubCategory={selectedSubCat}
            />
          </div>
        </header>

        {loadingProducts ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-gray-100 animate-pulse rounded-3xl" />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <motion.div 
            layout
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6"
          >
            <AnimatePresence>
              {filteredProducts.map((product) => (
                <div key={product.id}>
                  <ProductCard 
                    product={product} 
                    onAddToCart={onAddToCart} 
                  />
                </div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="py-32 text-center space-y-6 bg-card-bg rounded-[3rem] border border-dashed border-border-subtle">
            <div className="bg-app-background h-24 w-24 rounded-full flex items-center justify-center mx-auto text-gray-300">
              <Search size={48} />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-app-text uppercase tracking-tight">Aucun résultat</h3>
              <p className="text-gray-500 font-medium max-w-xs mx-auto">Nous n'avons pas trouvé de produits correspondant à "<strong>{searchQuery}</strong>".</p>
            </div>
            <button 
              onClick={() => { setSearchQuery(''); setSelectedRayon('Tous'); setSelectedSubCat('Tous'); }}
              className="btn-secondary px-8 py-3 rounded-2xl font-bold"
            >
              Réinitialiser tout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
