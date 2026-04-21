import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Order } from '../types';
import { formatPrice } from '../lib/utils';
import { Package, Truck, CheckCircle, Clock, Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminDashboard({ user }: { user: any }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
      setLoading(false);
    });
    return unsub;
  }, []);

  const updateStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { 
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'paid': return 'bg-blue-100 text-blue-700';
      case 'preparing': return 'bg-orange-100 text-orange-700';
      case 'ready': return 'bg-purple-100 text-purple-700';
      case 'delivered': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(o => o.status === filterStatus);

  if (loading) return <div className="p-8 text-center text-gray-500">Chargement des commandes...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black">Gestion des Commandes</h1>
          <p className="text-gray-500">Interface {user?.role === 'admin' ? 'Administrateur' : 'Préparateur'}</p>
        </div>

        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-100 shadow-sm overflow-x-auto max-w-full">
          {['all', 'pending', 'paid', 'preparing', 'ready', 'delivered'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                filterStatus === s ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {s === 'all' ? 'Toutes' : s === 'ready' ? 'Prêtes' : s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredOrders.map((order) => (
            <motion.div
              layout
              key={order.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-gray-50 flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ID: {order.id.slice(0, 8)}</p>
                  <p className="font-bold text-gray-900">Magasin: {order.storeId.split('-').slice(1).join(' ')}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>

              <div className="p-6 space-y-4 flex-1">
                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-400 uppercase">Produits ({order.items.length})</p>
                  <ul className="space-y-2">
                    {order.items.map((item, idx) => (
                      <li key={idx} className="text-sm flex justify-between">
                        <span className="text-gray-600">
                          <span className="font-bold text-gray-900 mr-2">{item.quantity}x</span>
                          {item.name}
                        </span>
                        <span className="font-medium text-gray-400">{formatPrice(item.price * item.quantity)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="pt-4 border-t border-gray-50 flex justify-between items-center text-lg">
                  <span className="font-bold text-gray-500">Total</span>
                  <span className="font-black text-brand-blue">{formatPrice(order.totalAmount)}</span>
                </div>
              </div>

              <div className="p-4 bg-gray-50 border-t border-gray-100 grid grid-cols-2 gap-2">
                {order.status === 'paid' && (
                  <button 
                    onClick={() => updateStatus(order.id, 'preparing')}
                    className="col-span-2 py-2 bg-orange-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-orange-600"
                  >
                    <Package className="h-4 w-4" />
                    Lancer la préparation
                  </button>
                )}
                {order.status === 'preparing' && (
                  <button 
                    onClick={() => updateStatus(order.id, 'ready')}
                    className="col-span-2 py-2 bg-purple-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-purple-700"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Marquer comme Prête
                  </button>
                )}
                {order.status === 'ready' && (
                  <button 
                    onClick={() => updateStatus(order.id, 'delivered')}
                    className="col-span-2 py-2 bg-green-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-green-700"
                  >
                    <Truck className="h-4 w-4" />
                    Confirmer le retrait
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredOrders.length === 0 && (
        <div className="py-20 text-center space-y-4">
          <Clock className="h-12 w-12 text-gray-300 mx-auto" />
          <h3 className="text-xl font-bold text-gray-400">Aucune commande trouvée</h3>
        </div>
      )}
    </div>
  );
}
