import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Home, ShoppingBag, ShoppingCart, User, Settings, Info, Phone, LogOut, MapPin } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { auth } from '../../lib/firebase';
import { signOut } from 'firebase/auth';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export default function SidebarDrawer({ isOpen, onClose, user }: SidebarDrawerProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    onClose();
    navigate('/login');
  };

  const menuItems = [
    { icon: <Home size={20} />, label: 'Accueil', path: '/' },
    { icon: <ShoppingBag size={20} />, label: 'Boutique', path: '/products' },
    { icon: <ShoppingCart size={20} />, label: 'Mon Panier', path: '/cart' },
    { icon: <User size={20} />, label: 'Profil & Commandes', path: '/profile' },
  ];

  const secondaryItems = [
    { icon: <MapPin size={18} />, label: 'Trouver un magasin', path: '/stores' },
    { icon: <Info size={18} />, label: 'À propos', path: '/about' },
    { icon: <Phone size={18} />, label: 'Contact', path: '/contact' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-card-bg z-[101] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-6 bg-brand-blue text-white">
              <div className="flex justify-between items-start mb-6">
                <div className="p-2 bg-white/10 rounded-2xl">
                  <span className="text-2xl font-black tracking-tighter">CKDO</span>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {user ? (
                <div className="flex items-center gap-4">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName} className="w-14 h-14 rounded-full border-4 border-white/20" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                      <User size={30} />
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-lg leading-tight">{user.displayName || 'Utilisateur'}</p>
                    <p className="text-sm text-blue-200">{user.email}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="font-medium text-blue-100 italic">Connectez-vous pour profiter de tous nos services.</p>
                  <button 
                    onClick={() => { onClose(); navigate('/login'); }}
                    className="w-full py-3 bg-white text-brand-blue rounded-xl font-bold transition-transform active:scale-95"
                  >
                    Se connecter
                  </button>
                </div>
              )}
            </div>

            {/* Menu Sections */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              <div className="space-y-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Menu Principal</p>
                <div className="space-y-1">
                  {menuItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className={({ isActive }) => 
                        `flex items-center gap-4 p-4 rounded-2xl transition-all ${
                          isActive ? 'bg-brand-blue/5 text-brand-blue font-black' : 'text-gray-500 hover:bg-gray-50 font-bold'
                        }`
                      }
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </NavLink>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Aide & Plus</p>
                <div className="space-y-1">
                  {secondaryItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className="flex items-center gap-4 p-4 rounded-2xl text-gray-500 hover:bg-gray-50 font-bold transition-all"
                    >
                      {item.icon}
                      <span className="text-sm">{item.label}</span>
                    </NavLink>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            {user && (
              <div className="p-6 border-t border-border-subtle">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 p-4 text-brand-red font-black hover:bg-red-50 rounded-2xl transition-all"
                >
                  <LogOut size={20} />
                  DÉCONNEXION
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
