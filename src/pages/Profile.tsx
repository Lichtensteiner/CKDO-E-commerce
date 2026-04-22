import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { signOut, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  doc, 
  updateDoc, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  User, 
  LogOut, 
  Package, 
  Settings, 
  ChevronRight, 
  LogIn, 
  MapPin, 
  CreditCard, 
  LayoutDashboard, 
  Heart, 
  ShieldCheck, 
  Bell, 
  Star, 
  MessageSquare, 
  Plus, 
  Edit3, 
  ChevronLeft,
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { UserProfile, Order, Product } from '../types';
import { formatPrice } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_PRODUCTS } from '../constants/products';
import NearbyStores from '../components/store/NearbyStores';

type ProfileTab = 'dashboard' | 'profile' | 'orders' | 'favorites' | 'addresses' | 'security' | 'settings';

export default function Profile({ user, onAddToCart, setCart }: { user: UserProfile | null; onAddToCart: (p: any) => void; setCart: (c: any[]) => void }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ProfileTab>('dashboard');
  const [orders, setOrders] = useState<Order[]>([]);
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // Listen to user's orders - Removed orderBy to avoid index error
      const q = query(
        collection(db, 'orders'),
        where('customerId', '==', user.uid)
      );
      
      const unsub = onSnapshot(q, (snap) => {
        const fetchedOrders = snap.docs.map(d => ({ id: d.id, ...d.data() } as Order));
        // Sort client-side by date descending
        const sortedOrders = fetchedOrders.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setOrders(sortedOrders);
        setLoading(false);
      }, (error) => {
        console.error("Orders Snapshot error:", error);
        setLoading(false);
      });

      // Fetch favorites
      if (user.favorites && user.favorites.length > 0) {
        const favProducts = MOCK_PRODUCTS.filter(p => user.favorites?.includes(p.id));
        setFavorites(favProducts);
      }

      return () => unsub();
    } else {
      setLoading(false);
    }
  }, [user]);

  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleLogin = async () => {
    if (loginLoading) return;
    setLoginLoading(true);
    setLoginError('');
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('/profile');
    } catch (error: any) {
      if (error.code === 'auth/cancelled-popup-request') {
        setLoginError('Une demande de connexion est déjà en cours.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        setLoginError('La fenêtre a été fermée.');
      } else {
        setLoginError('Échec de la connexion.');
      }
      console.error("Login failed:", error);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => signOut(auth);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-10 text-center space-y-8"
        >
          <div className="bg-brand-blue/10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto">
            <User className="h-10 w-10 text-brand-blue" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-slate-900">Bienvenue chez CKDO</h1>
            <p className="text-gray-500 font-medium">Connectez-vous pour accéder à vos commandes, vos favoris et bien plus encore.</p>
          </div>

          {loginError && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-bold animate-shake">
              {loginError}
            </div>
          )}

          <button 
            onClick={handleLogin}
            disabled={loginLoading}
            className="w-full btn-primary py-4 rounded-2xl flex items-center justify-center gap-3 font-bold text-lg shadow-lg shadow-brand-blue/20 disabled:opacity-50"
          >
            {loginLoading ? (
              'Connexion en cours...'
            ) : (
              <>
                <LogIn className="h-5 w-5" />
                Se connecter avec Google
              </>
            )}
          </button>
          <p className="text-xs text-gray-400 mt-4">En vous connectant, vous acceptez nos conditions d'utilisation.</p>
        </motion.div>
      </div>
    );
  }

  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: <LayoutDashboard /> },
    { id: 'profile', label: 'Mon profil', icon: <User /> },
    { id: 'orders', label: 'Mes commandes', icon: <Package /> },
    { id: 'favorites', label: 'Mes favoris', icon: <Heart /> },
    { id: 'addresses', label: 'Adresses', icon: <MapPin /> },
    { id: 'security', label: 'Sécurité', icon: <ShieldCheck /> },
    { id: 'settings', label: 'Paramètres', icon: <Settings /> },
  ];

  return (
    <div className="min-h-[80vh] bg-app-background flex">
      <div className="container mx-auto px-4 py-8 lg:py-12 flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar */}
        <aside className="w-full lg:w-72 shrink-0">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden sticky top-30">
            {/* User Info Header */}
            <div className="p-6 border-b border-gray-100 flex items-center gap-4 bg-slate-50/50">
              <img 
                src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'Client'}&background=0D52D6&color=fff`} 
                className="w-12 h-12 rounded-xl object-cover ring-2 ring-white shadow-sm" 
                alt="Profile" 
              />
              <div className="overflow-hidden">
                <p className="font-black text-slate-900 truncate uppercase tracking-tighter">{user.displayName || 'Client CKDO'}</p>
                <p className="text-[10px] text-gray-400 font-bold truncate tracking-widest">{user.email}</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="p-4 space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as ProfileTab)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl transition-all group ${
                    activeTab === item.id 
                    ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/20 translate-x-1' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`shrink-0 ${activeTab === item.id ? 'text-white' : 'group-hover:text-brand-blue'}`}>
                      {React.cloneElement(item.icon as React.ReactElement, { size: 18 })}
                    </span>
                    <span className="text-sm font-bold uppercase tracking-tight">{item.label}</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform ${activeTab === item.id ? 'translate-x-1' : 'opacity-0 group-hover:opacity-100'}`} />
                </button>
              ))}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-gray-50 bg-gray-50/30">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors font-black text-xs uppercase tracking-widest"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </button>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 space-y-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && <DashboardSection user={user} orders={orders} setActiveTab={setActiveTab} />}
              {activeTab === 'profile' && <ProfileSection user={user} />}
              {activeTab === 'orders' && <OrdersSection orders={orders} />}
              {activeTab === 'favorites' && <FavoritesSection favorites={favorites} onAddToCart={onAddToCart} />}
              {activeTab === 'addresses' && <AddressesSection user={user} />}
              {/* Other sections can be added placeholder for now */}
              {(activeTab === 'security' || activeTab === 'settings') && (
                <div className="bg-white p-12 rounded-3xl border border-gray-100 shadow-sm text-center space-y-6">
                  <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-gray-300">
                    {activeTab === 'security' ? <ShieldCheck size={40} /> : <Settings size={40} />}
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Prochainement disponible</h3>
                  <p className="text-gray-500 font-medium max-w-sm mx-auto">Nous finalisons cette section pour vous offrir une expérience sécurisée et personnalisée.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

// --- SUB-SECTIONS ---

function DashboardSection({ user, orders, setActiveTab }: { user: UserProfile, orders: Order[], setActiveTab: (tab: ProfileTab) => void }) {
  const navigate = useNavigate();
  const totalSpent = orders.reduce((acc, current) => acc + (current.status !== 'cancelled' ? current.totalAmount : 0), 0);
  const lastOrder = orders[0];

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Tableau de bord</h2>
        <p className="text-gray-500 font-medium">Bienvenue sur votre espace personnel CKDO.</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between h-40 group hover:border-brand-blue/30 transition-all">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Commandes</p>
          <div className="flex items-end justify-between">
            <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{orders.length}</h3>
            <div className="p-3 bg-brand-blue/5 rounded-2xl text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-all">
              <Package size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between h-40 group hover:border-brand-green/30 transition-all">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Dépensé</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-black text-brand-green-dark tracking-tighter">{formatPrice(totalSpent)}</h3>
            <div className="p-3 bg-brand-green/5 rounded-2xl text-brand-green group-hover:bg-brand-green group-hover:text-white transition-all">
              <ShoppingBag size={24} />
            </div>
          </div>
        </div>
        <div className="bg-brand-blue p-8 rounded-3xl text-white flex flex-col justify-between h-40 shadow-xl shadow-brand-blue/20">
          <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Points Fidélité</p>
          <div className="flex items-end justify-between">
            <h3 className="text-4xl font-black tracking-tighter">{user.loyaltyPoints || 150}</h3>
            <div className="p-3 bg-white/10 rounded-2xl">
              <Star size={24} fill="white" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Last Order Shortcut */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h4 className="font-black text-lg text-slate-900 uppercase">Dernière Commande</h4>
            <Clock className="text-gray-300" size={20} />
          </div>
          {lastOrder ? (
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">ID Commande</p>
                  <p className="font-bold text-slate-800 text-sm">#{lastOrder.id.slice(0, 8)}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  lastOrder.status === 'delivered' ? 'bg-green-100 text-green-700' : 
                  lastOrder.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                  'bg-brand-blue/10 text-brand-blue'
                }`}>
                  {lastOrder.status}
                </div>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 flex justify-between items-center">
                <div className="flex -space-x-3">
                  {lastOrder.items.slice(0, 3).map((item, i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-white border-2 border-gray-50 flex items-center justify-center text-[10px] font-black text-gray-400 overflow-hidden shadow-sm">
                      <span className="truncate px-1">{item.name.charAt(0)}</span>
                    </div>
                  ))}
                  {lastOrder.items.length > 3 && (
                    <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-gray-50 flex items-center justify-center text-[10px] font-black text-gray-500 shadow-sm">
                      +{lastOrder.items.length - 3}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Montant</p>
                  <p className="font-black text-slate-900">{formatPrice(lastOrder.totalAmount)}</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveTab('orders')}
                className="w-full py-4 border-2 border-brand-blue/20 text-brand-blue rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-blue/5 transition-all"
              >
                Détails de la commande
              </button>
            </div>
          ) : (
            <div className="py-10 text-center space-y-3">
              <p className="text-gray-400 font-bold text-sm italic">Aucune commande récente</p>
              <button 
                onClick={() => navigate('/products')}
                className="text-brand-blue font-black text-xs uppercase tracking-widest underline decoration-2 underline-offset-4"
              >
                Commencer mes achats
              </button>
            </div>
          )}
        </div>

        {/* Nearby Stores Component */}
        <div className="lg:col-span-1">
          <NearbyStores />
        </div>
      </div>
    </div>
  );
}

function ProfileSection({ user }: { user: UserProfile }) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email,
    phoneNumber: user.phoneNumber || ''
  });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { email, ...updateData } = formData;
      await updateDoc(doc(db, 'users', user.uid), {
        ...updateData,
        displayName: `${formData.firstName} ${formData.lastName}`.trim(),
        updatedAt: serverTimestamp()
      });
      setEditing(false);
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la mise à jour");
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Mon Profil</h2>
          <p className="text-gray-500 font-medium">Gérez vos informations personnelles et votre compte.</p>
        </div>
        {!editing && (
          <button 
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-100 rounded-xl font-bold text-sm text-slate-800 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Edit3 size={18} /> Modifier
          </button>
        )}
      </header>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
        <div className="p-8 flex flex-col md:flex-row gap-10 items-center">
          <div className="relative group">
            <img 
              src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'Client'}&background=0D52D6&color=fff`} 
              className="w-32 h-32 rounded-3xl object-cover ring-4 ring-gray-50 shadow-lg" 
              alt="Profile" 
            />
            <button className="absolute -bottom-2 -right-2 p-3 bg-brand-blue text-white rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all">
              <Edit3 size={16} />
            </button>
          </div>
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">{user.displayName || 'Nouveau Client'}</h3>
            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest bg-gray-50 px-3 py-1 rounded-full inline-block">Membre depuis {new Date(user.createdAt).getFullYear()}</p>
            <div className="flex justify-center md:justify-start gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-500"><CheckCircle2 size={14} className="text-green-500" /> Email vérifié</div>
              <div className="flex items-center gap-2 text-xs font-bold text-gray-500"><AlertCircle size={14} className="text-brand-blue" /> KYC niveau 1</div>
            </div>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="p-8 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Prénom</label>
              <input 
                type="text" 
                disabled={!editing}
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:ring-4 focus:ring-brand-blue/5 focus:border-brand-blue disabled:opacity-50 transition-all font-bold text-slate-800"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Nom de famille</label>
              <input 
                type="text" 
                disabled={!editing}
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:ring-4 focus:ring-brand-blue/5 focus:border-brand-blue disabled:opacity-50 transition-all font-bold text-slate-800"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Email</label>
              <input 
                type="email" 
                disabled={true}
                value={formData.email}
                className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-4 px-6 font-bold text-gray-400 cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Téléphone</label>
              <input 
                type="tel" 
                disabled={!editing}
                placeholder="+241 00 00 00 00"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:ring-4 focus:ring-brand-blue/5 focus:border-brand-blue disabled:opacity-50 transition-all font-bold text-slate-800"
              />
            </div>
          </div>

          <AnimatePresence>
            {editing && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-col sm:flex-row gap-4 pt-4"
              >
                <button 
                  type="submit"
                  className="flex-1 btn-primary py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-brand-blue/20"
                >
                  Enregistrer les modifications
                </button>
                <button 
                  type="button"
                  onClick={() => setEditing(false)}
                  className="flex-1 bg-gray-100 text-gray-600 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-all"
                >
                  Annuler
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>
    </div>
  );
}

function OrdersSection({ orders }: { orders: Order[] }) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<string>('all');

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Mes Commandes</h2>
          <p className="text-gray-500 font-medium">Historique complet de vos achats.</p>
        </div>
        <div className="flex gap-2 p-1 bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto max-w-full">
          {['all', 'pending', 'paid', 'delivered', 'cancelled'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                filter === f ? 'bg-slate-900 text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'
              }`}
            >
              {f === 'all' ? 'Toutes' : f}
            </button>
          ))}
        </div>
      </header>

      {filtered.length > 0 ? (
        <div className="grid gap-6">
          {filtered.map((order) => (
            <div key={order.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:border-brand-blue/30 transition-all group">
              <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between gap-6 md:items-center">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-all">
                    <Package size={28} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">#{order.id.slice(0, 8)}</p>
                    <h4 className="text-xl font-black text-slate-900 tracking-tight">{formatPrice(order.totalAmount)}</h4>
                    <p className="text-xs text-gray-500 font-bold">{new Date(order.createdAt).toLocaleDateString()} • {order.items.length} articles</p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border self-start sm:self-center ${
                    order.status === 'delivered' ? 'bg-green-50 border-green-100 text-green-600' : 
                    order.status === 'cancelled' ? 'bg-red-50 border-red-100 text-red-600' :
                    'bg-brand-blue/5 border-brand-blue/10 text-brand-blue'
                  }`}>
                    {order.status}
                  </div>
                  <button className="px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-blue transition-all shadow-lg hover:shadow-brand-blue/20">
                    Détails
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-20 rounded-3xl border border-gray-100 shadow-sm text-center space-y-6">
          <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-gray-200">
            <Package size={40} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-800 uppercase">Aucune commande trouvée</h3>
            <p className="text-gray-400 font-medium">Il semblerait que vous n'ayez pas encore passé de commande avec ces critères.</p>
          </div>
          <button 
            onClick={() => navigate('/products')}
            className="btn-primary px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs"
          >
            Commencer mes achats
          </button>
        </div>
      )}
    </div>
  );
}

function FavoritesSection({ favorites, onAddToCart }: { favorites: Product[], onAddToCart: (p: any) => void }) {
  const navigate = useNavigate();
  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Mes Favoris</h2>
        <p className="text-gray-500 font-medium">Retrouvez ici tous les produits que vous avez aimés.</p>
      </header>

      {favorites.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {favorites.map((p) => (
            <div key={p.id} onClick={() => navigate(`/product/${p.id}`)} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 space-y-4 cursor-pointer hover:-translate-y-1 transition-transform group">
              <div className="aspect-square rounded-2xl bg-gray-50 overflow-hidden relative">
                <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                <button className="absolute top-3 right-3 p-2 bg-white rounded-lg shadow-sm text-brand-red">
                  <Heart size={16} fill="currentColor" />
                </button>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-slate-900 text-sm truncate">{p.name}</p>
                <div className="flex justify-between items-center">
                  <p className="font-black text-brand-blue text-xs uppercase tracking-tight">{formatPrice(p.price)}</p>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToCart(p);
                    }}
                    className="p-2 bg-brand-blue/5 text-brand-blue rounded-lg hover:bg-brand-blue hover:text-white transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-20 rounded-3xl border border-gray-100 shadow-sm text-center space-y-6">
          <div className="bg-red-50/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-brand-red/30">
            <Heart size={40} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-800 uppercase">La liste est vide</h3>
            <p className="text-gray-400 font-medium font-medium">Vous n'avez pas encore ajouté de coups de cœur.</p>
          </div>
          <button 
            onClick={() => navigate('/products')}
            className="btn-primary px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs"
          >
            Explorer le catalogue
          </button>
        </div>
      )}
    </div>
  );
}

function AddressesSection({ user }: { user: UserProfile }) {
  const [showAdd, setShowAdd] = useState(false);
  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Mes Adresses</h2>
          <p className="text-gray-500 font-medium">Gérez vos différents lieux de livraison.</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-5 py-3 bg-brand-blue text-white rounded-xl font-bold text-sm hover:bg-brand-blue-dark transition-colors shadow-lg shadow-brand-blue/20"
        >
          <Plus size={18} /> Ajouter
        </button>
      </header>

      <div className="grid md:grid-cols-2 gap-6">
        {(user.addresses && user.addresses.length > 0) ? user.addresses.map((addr) => (
          <div key={addr.id} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6 relative group border-2 border-transparent hover:border-brand-blue/10 transition-all">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-gray-50 rounded-2xl text-gray-400 group-hover:bg-brand-blue group-hover:text-white transition-all">
                <MapPin size={24} />
              </div>
              {addr.isDefault && (
                <span className="text-[9px] font-black uppercase tracking-widest text-green-600 bg-green-50 px-3 py-1.2 rounded-full border border-green-100">Défaut</span>
              )}
            </div>
            <div className="space-y-1">
              <h4 className="font-black text-slate-900 uppercase tracking-tight">{addr.name}</h4>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">{addr.street}<br/>{addr.city}, Gabon</p>
            </div>
            <div className="flex gap-4 pt-2">
              <button className="text-brand-blue font-black text-[10px] uppercase tracking-widest hover:underline decoration-2 underline-offset-4 transition-all">Modifier</button>
              <button className="text-red-400 font-black text-[10px] uppercase tracking-widest hover:underline decoration-2 underline-offset-4 transition-all">Supprimer</button>
            </div>
          </div>
        )) : (
          <div className="md:col-span-2 bg-white p-12 rounded-3xl border-2 border-dashed border-gray-100 text-center space-y-4">
             <MapPin className="mx-auto text-gray-200" size={40} />
             <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Aucune adresse enregistrée</p>
          </div>
        )}
      </div>
    </div>
  );
}
