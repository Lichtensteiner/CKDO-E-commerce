import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import ProductCard from '../components/product/ProductCard';
import { Filter, Search, ChevronDown } from 'lucide-react';

const MOCK_PRODUCTS = [
  { id: '1', name: 'Riz Long Grain Luxury 5kg', price: 4500, category: 'Épicerie', isPromo: true, promoPrice: 3900, imageUrl: 'https://picsum.photos/seed/rice/400/400' },
  { id: '2', name: 'Huile de Palme Raffinée 1L', price: 1200, category: 'Épicerie', imageUrl: 'https://picsum.photos/seed/oil/400/400' },
  { id: '3', name: 'Pack Eau Akewa 6x1.5L', price: 2500, category: 'Boissons', imageUrl: 'https://picsum.photos/seed/water/400/400' },
  { id: '4', name: 'Lait en Poudre Nido 400g', price: 3200, category: 'Frais', imageUrl: 'https://picsum.photos/seed/milk/400/400' },
  { id: '5', name: 'Sucre de Canne Grains 1kg', price: 900, category: 'Épicerie', imageUrl: 'https://picsum.photos/seed/sugar/400/400' },
  { id: '6', name: 'Spaghetti Panzani 500g', price: 650, category: 'Épicerie', isPromo: true, promoPrice: 550, imageUrl: 'https://picsum.photos/seed/pasta/400/400' },
  { id: '7', name: 'Savon en Poudre OMO 1kg', price: 1500, category: 'Hygiène', imageUrl: 'https://picsum.photos/seed/soap/400/400' },
  { id: '8', name: 'Viande de Bœuf (Filet) 1kg', price: 6500, category: 'Boucherie', imageUrl: 'https://picsum.photos/seed/meat/400/400' },
  { id: '9', name: 'Jus de Fruit Pressé D\'Ananas 1L', price: 1800, category: 'Boissons', imageUrl: 'https://picsum.photos/seed/juice/400/400' },
  { id: '10', name: 'Yaourt Nature Pack de 4', price: 2200, category: 'Frais', imageUrl: 'https://picsum.photos/seed/yogurt/400/400' },
];

export default function ProductList({ onAddToCart }: { onAddToCart: (p: any) => void }) {
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'Tous' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ['Tous', 'Épicerie', 'Boissons', 'Frais', 'Boucherie', 'Hygiène'];

  return (
    <div className="container mx-auto px-4 py-8 space-y-10">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">Catalogue CKDO</h1>
            <p className="text-gray-500 mt-2">Le meilleur choix au Gabon, à portée de clic.</p>
          </div>
          
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Rechercher un produit..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-100 rounded-2xl py-4 pl-12 pr-4 shadow-sm focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-8 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all border-2 ${
                selectedCategory === cat 
                ? 'border-brand-blue bg-brand-blue text-white shadow-xl shadow-brand-blue/20' 
                : 'bg-white text-gray-500 hover:border-gray-200 border-transparent shadow-sm'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
          {filteredProducts.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onAddToCart={onAddToCart} 
            />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center space-y-4 bg-white rounded-3xl border border-dashed border-gray-200">
          <div className="bg-gray-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto text-gray-400">
            <Search className="h-10 w-10" />
          </div>
          <p className="text-gray-500 font-medium">Aucun produit ne correspond à votre recherche.</p>
          <button 
            onClick={() => { setSearchQuery(''); setSelectedCategory('Tous'); }}
            className="text-brand-blue font-bold px-6 py-2 hover:bg-brand-blue/5 rounded-xl transition-colors"
          >
            Réinitialiser les filtres
          </button>
        </div>
      )}
    </div>
  );
}
