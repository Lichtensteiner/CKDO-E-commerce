import React, { useState } from 'react';
import { Sparkles, X, ShoppingCart, Loader2, ListChecks, ChefHat } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { geminiService, ShoppingPlan } from '../services/geminiService';
import { Product } from '../types';
import { formatPrice } from '../lib/utils';

interface AIAssistantProps {
  catalog: Product[];
  onAddItemsToCart: (items: any[]) => void;
}

export default function AIAssistant({ catalog, onAddItemsToCart }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ShoppingPlan | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResult(null);
    try {
      const plan = await geminiService.planShopping(query, catalog);
      setResult(plan);
    } catch (err) {
      console.error(err);
      alert('Désolé, je n\'ai pas pu traiter votre demande.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!result) return;
    
    // Convert suggested items to cart items
    const cartItems = result.suggestedItems.map(item => {
      const product = catalog.find(p => p.id === item.productId);
      return {
        ...product,
        quantity: item.quantity
      };
    });
    
    onAddItemsToCart(cartItems);
    setIsOpen(false);
    setResult(null);
    setQuery('');
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 bg-brand-blue text-white p-4 rounded-full shadow-2xl z-40 flex items-center gap-2 group border-4 border-white"
        id="ai-assistant-fab"
      >
        <Sparkles className="h-6 w-6" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 font-bold whitespace-nowrap">
          Assistant Intelligent
        </span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="bg-card-bg w-full max-w-lg rounded-t-[2rem] sm:rounded-[2rem] overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
              id="ai-assistant-modal"
            >
              {/* Header */}
              <div className="bg-brand-blue p-6 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-xl">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black">Assistant CKDO</h2>
                    <p className="text-sm text-blue-100">Votre IA pour des courses faciles</p>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-2 rounded-full transition-colors">
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                {!result && !loading && (
                  <div className="space-y-6 text-center py-8">
                    <div className="bg-brand-blue/5 p-4 rounded-3xl inline-block">
                      <ChefHat className="h-12 w-12 text-brand-blue mx-auto" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-app-text">Que voulez-vous cuisiner ?</h3>
                      <p className="text-gray-500 text-sm">
                        Dites-moi simplement ce que vous voulez préparer ou pour combien de personnes, 
                        et je générerai votre liste de courses pour vous.
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap justify-center gap-2">
                        {["Poulet à la Nyembwe pour 4", "Ingrédients pour un mafé", "Petit déjeuner équilibré"].map(txt => (
                            <button 
                                key={txt}
                                onClick={() => setQuery(txt)}
                                className="text-xs bg-gray-100 px-3 py-2 rounded-full hover:bg-brand-blue hover:text-white transition-colors"
                            >
                                "{txt}"
                            </button>
                        ))}
                    </div>
                  </div>
                )}

                {loading && (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <Loader2 className="h-10 w-10 text-brand-blue animate-spin" />
                    <p className="text-gray-500 font-medium">Je prépare votre plan de courses...</p>
                  </div>
                )}

                {result && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="bg-brand-green/10 p-4 rounded-3xl border border-brand-green/20">
                      <h3 className="text-lg font-black text-brand-green flex items-center gap-2">
                        <ChefHat className="h-5 w-5" />
                        {result.recipeName}
                      </h3>
                      <p className="text-sm text-brand-green/80 mt-1">{result.description}</p>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-bold text-app-text flex items-center gap-2">
                        <ListChecks className="h-5 w-5" />
                        Ingrédients du catalogue
                      </h4>
                      <div className="space-y-3">
                        {result.suggestedItems.map((item, id) => (
                          <div key={id} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100">
                            <div>
                              <p className="font-bold text-sm text-app-text">{item.productName}</p>
                              <p className="text-[10px] text-gray-400 italic">{item.reason}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-black text-brand-blue">x{item.quantity}</p>
                              <p className="text-[10px] text-gray-500">{formatPrice(item.price)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gray-900 p-5 rounded-3xl text-white flex items-center justify-between shadow-lg shadow-gray-900/20">
                      <div>
                        <p className="text-[10px] uppercase font-black text-gray-400">Total estimé</p>
                        <p className="text-2xl font-black">{formatPrice(result.totalEstimatedPrice)}</p>
                      </div>
                      <button 
                        onClick={handleApply}
                        className="bg-brand-green text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-md shadow-brand-green/20"
                      >
                        <ShoppingCart className="h-5 w-5" />
                        Tout ajouter
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Input Area */}
                {!loading && (
                    <form onSubmit={handleSubmit} className="relative mt-auto">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Je veux cuisiner..."
                            className="w-full bg-gray-100 rounded-2xl py-4 pl-6 pr-14 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 font-medium"
                        />
                        <button 
                            type="submit"
                            disabled={!query.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand-blue text-white p-2.5 rounded-xl disabled:opacity-50 hover:bg-brand-blue/90"
                        >
                            <Sparkles className="h-5 w-5" />
                        </button>
                    </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
