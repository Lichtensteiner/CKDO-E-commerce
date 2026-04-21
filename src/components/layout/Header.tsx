import React from 'react';
import { ShoppingCart, User, Search, MapPin, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { UserProfile } from '../../types';

export default function Header({ cartCount, user }: { cartCount: number; user: UserProfile | null }) {
  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Menu className="h-6 w-6 lg:hidden" />
          <Link to="/" className="text-2xl font-bold text-brand-blue tracking-tighter">
            CKDO
          </Link>
        </div>

        <div className="hidden md:flex flex-1 max-w-md relative">
          <input
            type="text"
            placeholder="Rechercher un produit..."
            className="w-full bg-gray-100 border-none rounded-full py-2 px-10 focus:ring-2 focus:ring-brand-blue transition-all text-sm"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        </div>

        <div className="flex items-center gap-4 lg:gap-6">
          <div className="hidden lg:flex items-center gap-2 text-sm text-gray-600 hover:text-brand-green cursor-pointer transition-colors">
            <MapPin className="h-4 w-4" />
            <span>CKDO Libreville</span>
          </div>
          
          <Link to="/profile" className="flex items-center gap-2 hover:bg-gray-100 p-1 pr-3 rounded-full transition-colors">
            {user?.photoURL ? (
              <img 
                src={user.photoURL} 
                alt="Account" 
                className="h-8 w-8 rounded-full border border-gray-100" 
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="p-1.5 bg-gray-100 rounded-full">
                <User className="h-5 w-5 text-gray-700" />
              </div>
            )}
            <span className="hidden sm:inline text-sm font-bold text-gray-700">
              {user ? (user.displayName?.split(' ')[0] || 'Compte') : 'Connexion'}
            </span>
          </Link>

          <Link to="/cart" className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
            <ShoppingCart className="h-6 w-6 text-gray-700" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-red text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
