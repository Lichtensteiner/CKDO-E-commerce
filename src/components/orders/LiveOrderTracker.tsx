import React, { useState, useEffect } from 'react';
import { Package, Truck, Clock, CheckCircle, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Order, UserProfile } from '../../types';
import { orderService } from '../../services/orderService';
import { useNavigate } from 'react-router-dom';

export default function LiveOrderTracker({ user }: { user: UserProfile | null }) {
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const unsubscribe = orderService.subscribeToCustomerOrders(user.uid, (orders) => {
      // Show orders that are not yet delivered or cancelled
      const active = orders.filter(o => 
        ['pending', 'paid', 'preparing', 'ready'].includes(o.status)
      );
      setActiveOrders(active);
      if (active.length > 0) setIsVisible(true);
    });

    return () => unsubscribe();
  }, [user]);

  if (!user || activeOrders.length === 0 || !isVisible) return null;

  const currentOrder = activeOrders[0];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
      case 'paid':
        return { icon: <Clock className="animate-pulse" />, text: 'En attente de validation', color: 'text-amber-500', bg: 'bg-amber-500' };
      case 'preparing':
        return { icon: <Package className="animate-bounce" />, text: 'Préparation en cours', color: 'text-brand-blue', bg: 'bg-brand-blue' };
      case 'ready':
        return { icon: <CheckCircle className="animate-pulse" />, text: 'Commande prête !', color: 'text-brand-green', bg: 'bg-brand-green' };
      default:
        return { icon: <Truck />, text: 'En cours', color: 'text-gray-500', bg: 'bg-gray-500' };
    }
  };

  const config = getStatusConfig(currentOrder.status);

  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-24 lg:bottom-6 right-6 left-6 md:left-auto md:w-96 z-50"
    >
      <div className="bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden ring-4 ring-brand-blue/5">
        <div className="p-1 flex justify-end">
          <button onClick={() => setIsVisible(false)} className="p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-300 hover:text-gray-900">
            <X size={16} />
          </button>
        </div>
        
        <div className="px-6 pb-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className={`${config.bg} p-3 rounded-2xl text-white shadow-lg shadow-current/20`}>
              {config.icon}
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Suivi en direct • #{currentOrder.id.slice(0, 8)}</p>
              <h4 className={`font-black text-lg ${config.color} leading-tight`}>{config.text}</h4>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between group cursor-pointer" onClick={() => navigate('/profile')}>
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center font-black text-[10px] text-gray-400">
                {currentOrder.items.length}
               </div>
               <p className="text-xs font-bold text-gray-600">Détails de la commande</p>
            </div>
            <ChevronRight size={16} className="text-gray-300 group-hover:translate-x-1 transition-transform" />
          </div>

          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div 
               initial={{ width: 0 }}
               animate={{ width: currentOrder.status === 'ready' ? '100%' : '50%' }}
               className={`h-full ${config.bg}`}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
