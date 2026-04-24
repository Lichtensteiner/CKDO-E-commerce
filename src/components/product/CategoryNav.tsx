import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronDown, 
  ShoppingBasket, 
  GlassWater, 
  Drumstick, 
  Apple, 
  Snowflake, 
  Hand, 
  Wand2, 
  Baby, 
  Archive,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  subCategories: string[];
}

const CATEGORIES: Category[] = [
  { 
    id: 'food', 
    name: 'Produits alimentaires', 
    icon: <ShoppingBasket className="w-5 h-5" />, 
    subCategories: ['Riz & céréales', 'Pâtes', 'Conserves', 'Condiments'] 
  },
  { 
    id: 'drinks', 
    name: 'Boissons', 
    icon: <GlassWater className="w-5 h-5" />, 
    subCategories: ['Jus', 'Eaux', 'Boissons gazeuses', 'Bière', 'Vin', 'Liqueur', 'Sirop'] 
  },
  { 
    id: 'fresh', 
    name: 'Produits frais', 
    icon: <Drumstick className="w-5 h-5" />, 
    subCategories: ['Viandes', 'Poissons', 'Produits laitiers'] 
  },
  { 
    id: 'veg', 
    name: 'Fruits & légumes', 
    icon: <Apple className="w-5 h-5" />, 
    subCategories: ['Fruits', 'Légumes'] 
  },
  { 
    id: 'frozen', 
    name: 'Surgelés', 
    icon: <Snowflake className="w-5 h-5" />, 
    subCategories: ['Produits surgelés'] 
  },
  { 
    id: 'hygiene', 
    name: 'Hygiène & beauté', 
    icon: <Hand className="w-5 h-5" />, 
    subCategories: ['Corps', 'Cheveux'] 
  },
  { 
    id: 'home', 
    name: 'Entretien maison', 
    icon: <Wand2 className="w-5 h-5" />, 
    subCategories: ['Nettoyage', 'Accessoires'] 
  },
  { 
    id: 'baby', 
    name: 'Bébé', 
    icon: <Baby className="w-5 h-5" />, 
    subCategories: ['Alimentation bébé', 'Hygiène bébé'] 
  },
  { 
    id: 'bazar', 
    name: 'Bazar / Divers', 
    icon: <Archive className="w-5 h-5" />, 
    subCategories: ['Cuisine', 'Maison'] 
  }
];

interface CategoryNavProps {
  onSelectCategory: (category: string, subCategory: string) => void;
  activeCategory: string;
  activeSubCategory: string;
}

export default function CategoryNav({ onSelectCategory, activeCategory, activeSubCategory }: CategoryNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (catName: string, subName: string = 'Tous') => {
    onSelectCategory(catName, subName);
    setIsOpen(false);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="relative z-50 w-full" ref={dropdownRef}>
      {/* Desktop Navigation Bar Button */}
      <div className="hidden lg:flex items-center gap-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all border-2 ${
            isOpen 
            ? 'bg-brand-blue border-brand-blue text-white shadow-xl shadow-brand-blue/20' 
            : 'bg-card-bg border-transparent hover:border-gray-400 text-app-text shadow-sm'
          }`}
        >
          <Menu className="w-5 h-5" />
          Tous les rayons
          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Selected Pill Indicators */}
        {activeCategory !== 'Tous' && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }} 
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 bg-brand-blue/5 rounded-2xl px-4 py-2 border border-brand-blue/10"
          >
            <span className="text-[10px] font-black text-brand-blue uppercase tracking-widest">{activeCategory}</span>
            {activeSubCategory !== 'Tous' && (
              <>
                <ChevronRight className="w-3 h-3 text-brand-blue/40" />
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{activeSubCategory}</span>
              </>
            )}
            <button 
              onClick={() => handleSelect('Tous')}
              className="ml-2 hover:bg-brand-blue/10 rounded-full p-1 transition-colors"
            >
              <X className="w-3 h-3 text-brand-blue" />
            </button>
          </motion.div>
        )}
      </div>

      {/* Mobile Hamburger Button */}
      <div className="lg:hidden">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex items-center justify-between w-full bg-card-bg border border-border-subtle p-4 rounded-2xl shadow-sm font-bold text-app-text"
        >
          <div className="flex items-center gap-3">
             <Menu className="w-5 h-5 text-brand-blue" />
             {activeCategory === 'Tous' ? 'Explorer les rayons' : activeCategory}
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Desktop Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="hidden lg:flex absolute top-full left-0 mt-3 w-[700px] bg-card-bg rounded-3xl shadow-2xl border border-border-subtle overflow-hidden"
          >
            {/* Categories List (Left) */}
            <div className="w-1/2 border-r border-border-subtle p-4 space-y-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onMouseEnter={() => setHoveredCategory(cat.id)}
                  onClick={() => handleSelect(cat.name)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
                    hoveredCategory === cat.id || activeCategory === cat.name
                    ? 'bg-brand-blue/5 text-brand-blue'
                    : 'text-gray-400 hover:bg-app-background hover:text-app-text'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className={hoveredCategory === cat.id ? 'text-brand-blue' : 'text-gray-400'}>
                      {cat.icon}
                    </span>
                    <span className="font-bold text-sm">{cat.name}</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-opacity ${hoveredCategory === cat.id ? 'opacity-100' : 'opacity-0'}`} />
                </button>
              ))}
            </div>

            {/* Sub-categories List (Right) */}
            <div className="w-1/2 bg-app-background p-8 space-y-6">
              {hoveredCategory ? (
                <>
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-app-text uppercase tracking-tight">
                      {CATEGORIES.find(c => c.id === hoveredCategory)?.name}
                    </h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Rayonnages disponibles</p>
                  </div>
                  <div className="grid gap-2">
                    <button
                      onClick={() => handleSelect(CATEGORIES.find(c => c.id === hoveredCategory)!.name, 'Tous')}
                      className="text-left py-2 px-4 rounded-lg hover:bg-card-bg hover:text-brand-blue hover:shadow-sm transition-all text-sm font-bold text-gray-400"
                    >
                      Voir tout le rayon
                    </button>
                    {CATEGORIES.find(c => c.id === hoveredCategory)?.subCategories.map((sub) => (
                      <button
                        key={sub}
                        onClick={() => handleSelect(CATEGORIES.find(c => c.id === hoveredCategory)!.name, sub)}
                        className={`text-left py-2 px-4 rounded-lg hover:bg-card-bg hover:text-brand-blue hover:shadow-sm transition-all text-sm font-bold ${
                          activeSubCategory === sub ? 'bg-card-bg text-brand-blue shadow-sm' : 'text-gray-400'
                        }`}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="p-4 bg-card-bg rounded-full shadow-sm text-brand-blue border border-border-subtle">
                    <Archive className="w-8 h-8" />
                  </div>
                  <p className="text-gray-500 font-medium text-sm">Survolez un rayon pour voir les détails</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-[85%] max-w-sm bg-card-bg z-[101] shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-border-subtle flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-xl font-black text-app-text uppercase">Nos Rayons</h2>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Naviguer au magasin</p>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 bg-app-background rounded-xl text-gray-500 hover:text-brand-red transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {CATEGORIES.map((cat) => (
                  <div key={cat.id} className="space-y-4">
                    <button
                      onClick={() => handleSelect(cat.name)}
                      className="flex items-center gap-4 w-full text-left group"
                    >
                      <div className="p-3 bg-brand-blue/5 rounded-xl text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-all">
                        {cat.icon}
                      </div>
                      <span className="font-extrabold text-app-text group-hover:text-brand-blue transition-colors uppercase tracking-tight">
                        {cat.name}
                      </span>
                    </button>
                    <div className="grid grid-cols-2 gap-2 pl-14">
                      {cat.subCategories.map((sub) => (
                        <button
                          key={sub}
                          onClick={() => handleSelect(cat.name, sub)}
                          className={`text-left text-xs font-bold py-1 transition-colors ${
                            activeSubCategory === sub ? 'text-brand-blue' : 'text-gray-400 hover:text-brand-blue'
                          }`}
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 bg-app-background border-t border-border-subtle">
                <button 
                  onClick={() => handleSelect('Tous')}
                  className="w-full btn-primary py-4 rounded-2xl flex items-center justify-center gap-2"
                >
                  <Menu className="w-5 h-5" />
                  Voir tout le magasin
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
