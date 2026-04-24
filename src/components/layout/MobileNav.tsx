import React from 'react';
import { Home, ShoppingBag, ShoppingCart, User, Search } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { motion } from 'motion/react';

interface MobileNavProps {
  cartCount: number;
}

export default function MobileNav({ cartCount }: MobileNavProps) {
  const navItems = [
    { icon: <Home size={22} />, label: 'Accueil', path: '/' },
    { icon: <Search size={22} />, label: 'Produits', path: '/products' },
    { icon: <div className="relative">
             <ShoppingCart size={22} />
             {cartCount > 0 && (
               <span className="absolute -top-2 -right-2 bg-brand-red text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-card-bg">
                 {cartCount}
               </span>
             )}
           </div>, 
      label: 'Panier', path: '/cart' 
    },
    { icon: <User size={22} />, label: 'Compte', path: '/profile' },
  ];

  return (
    <nav className="fixed lg:hidden bottom-0 left-0 right-0 z-[60] bg-card-bg border-t border-border-subtle safe-bottom-padding shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `flex flex-col items-center gap-1 min-w-[64px] transition-all ${
                isActive ? 'text-brand-blue' : 'text-gray-400'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <motion.div 
                  whileTap={{ scale: 0.8 }}
                  className={`${isActive ? 'scale-110' : 'scale-100'} transition-transform`}
                >
                  {item.icon}
                </motion.div>
                <span className={`text-[10px] font-black uppercase tracking-tighter ${isActive ? 'opacity-100' : 'opacity-60 font-bold'}`}>
                  {item.label}
                </span>
                {isActive && (
                   <motion.div 
                    layoutId="bubble"
                    className="absolute -bottom-1 w-1 h-1 bg-brand-blue rounded-full"
                   />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
