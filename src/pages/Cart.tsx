import React from 'react';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { formatPrice } from '../lib/utils';
import { Link } from 'react-router-dom';

export default function Cart({ cart, setCart }: { cart: any[]; setCart: any }) {
  const updateQuantity = (id: string, delta: number) => {
    setCart((prev: any[]) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setCart((prev: any[]) => prev.filter((item) => item.id !== id));
  };

  const total = cart.reduce((acc, item) => acc + (item.isPromo ? item.promoPrice : item.price) * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center space-y-6 bg-app-background min-h-[60vh] flex flex-col items-center justify-center">
        <div className="bg-card-bg h-24 w-24 rounded-full flex items-center justify-center mx-auto border border-border-subtle shadow-sm">
          <ShoppingBag className="h-12 w-12 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-app-text">Votre panier est vide</h2>
        <p className="text-gray-400 max-w-xs mx-auto">Commencez à ajouter des produits pour faire vos courses en toute simplicité.</p>
        <Link to="/products" className="inline-block bg-brand-blue text-white px-8 py-3 rounded-full font-bold hover:bg-brand-blue-light transition-colors">
          Voir les produits
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 lg:py-12 bg-app-background min-h-[80vh]">
      <h1 className="text-3xl font-black mb-8 text-app-text">Votre Panier</h1>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          {cart.map((item) => (
            <div key={item.id} className="bg-card-bg p-4 rounded-2xl shadow-sm border border-border-subtle flex gap-4">
              <div className="h-24 w-24 rounded-xl overflow-hidden bg-app-background shrink-0">
                <img 
                  src={item.imageUrl || `https://picsum.photos/seed/${item.id}/200/200`} 
                  alt={item.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              
              <div className="flex-1 flex flex-col justify-between py-1">
                <div>
                  <h3 className="font-bold text-app-text leading-tight">{item.name}</h3>
                  <p className="text-sm text-gray-400 uppercase font-bold text-[10px] tracking-tight">{item.category}</p>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-3 bg-app-background rounded-lg p-1 border border-border-subtle">
                    <button 
                      onClick={() => updateQuantity(item.id, -1)}
                      className="p-1 hover:bg-card-bg hover:shadow-sm rounded-md transition-all disabled:opacity-30 text-app-text"
                      disabled={item.quantity === 1}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="font-bold w-6 text-center text-sm text-app-text">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, 1)}
                      className="p-1 hover:bg-card-bg hover:shadow-sm rounded-md transition-all text-app-text"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="font-black text-lg text-app-text">
                    {formatPrice((item.isPromo ? item.promoPrice : item.price) * item.quantity)}
                  </span>
                </div>
              </div>

              <button 
                onClick={() => removeItem(item.id)}
                className="text-gray-400 hover:text-brand-blue transition-colors p-2 self-start"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="bg-card-bg p-8 rounded-3xl shadow-lg border border-border-subtle space-y-6 sticky top-24">
            <h2 className="text-xl font-bold text-app-text">Récapitulatif</h2>
            <div className="space-y-3 text-gray-400">
              <div className="flex justify-between">
                <span>Sous-total</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between">
                <span>Frais Click & Collect</span>
                <span className="text-brand-green font-bold uppercase text-[10px]">Gratuit</span>
              </div>
              <div className="h-px bg-border-subtle my-4" />
              <div className="flex justify-between text-xl font-black text-app-text">
                <span>Total</span>
                <span className="text-brand-blue">{formatPrice(total)}</span>
              </div>
            </div>

            <Link 
              to="/checkout"
              className="btn-primary w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold"
            >
              Commander
              <ArrowRight className="h-5 w-5" />
            </Link>

            <p className="text-[10px] text-gray-400 text-center px-4 uppercase tracking-wider font-bold">
              En cliquant sur Commander, vous acceptez nos conditions générales de vente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
