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
  AlertCircle,
  Download,
  FileText,
  Trash2,
  Smartphone,
  Key,
  Globe,
  Moon,
  Sun,
  Eye,
  EyeOff,
  UserX
} from 'lucide-react';
import { UserProfile, Order, Product } from '../types';
import { formatPrice } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_PRODUCTS } from '../constants/products';
import NearbyStores from '../components/store/NearbyStores';
import InvoiceModal from '../components/orders/InvoiceModal';

type ProfileTab = 'dashboard' | 'profile' | 'orders' | 'favorites' | 'addresses' | 'security' | 'settings';

export default function Profile({ user, onAddToCart, setCart }: { user: UserProfile | null; onAddToCart: (p: any) => void; setCart: (c: any[]) => void }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ProfileTab>('dashboard');
  const [orders, setOrders] = useState<Order[]>([]);
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  const openInvoice = (order: Order) => {
    setSelectedOrder(order);
    setIsInvoiceOpen(true);
  };

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
        const sortedOrders = fetchedOrders.sort((a, b) => {
          const dateA = a.createdAt && (a.createdAt as any).seconds 
            ? (a.createdAt as any).seconds * 1000 
            : new Date(a.createdAt).getTime();
          const dateB = b.createdAt && (b.createdAt as any).seconds 
            ? (b.createdAt as any).seconds * 1000 
            : new Date(b.createdAt).getTime();
          return (dateB || 0) - (dateA || 0);
        });
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
          className="max-w-md w-full bg-card-bg rounded-3xl shadow-xl border border-border-subtle p-10 text-center space-y-8"
        >
          <div className="bg-brand-blue/10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto">
            <User className="h-10 w-10 text-brand-blue" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-app-text">Bienvenue chez CKDO</h1>
            <p className="text-gray-400 font-medium">Connectez-vous pour accéder à vos commandes, vos favoris et bien plus encore.</p>
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
          <div className="bg-card-bg rounded-3xl border border-border-subtle shadow-sm overflow-hidden sticky top-30">
            {/* User Info Header */}
            <div className="p-6 border-b border-border-subtle flex items-center gap-4 bg-app-background">
              <img 
                src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'Client'}&background=0D52D6&color=fff`} 
                className="w-12 h-12 rounded-xl object-cover ring-2 ring-card-bg shadow-sm" 
                alt="Profile" 
              />
              <div className="overflow-hidden">
                <p className="font-black text-app-text truncate uppercase tracking-tighter">{user.displayName || 'Client CKDO'}</p>
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
                    : 'text-gray-400 hover:bg-app-background hover:text-app-text'
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
            <div className="p-4 border-t border-border-subtle bg-app-background/30">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors font-black text-xs uppercase tracking-widest"
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
              {activeTab === 'dashboard' && <DashboardSection user={user} orders={orders} setActiveTab={setActiveTab} onOpenInvoice={openInvoice} />}
              {activeTab === 'profile' && <ProfileSection user={user} />}
              {activeTab === 'orders' && <OrdersSection orders={orders} onOpenInvoice={openInvoice} />}
              {activeTab === 'favorites' && <FavoritesSection favorites={favorites} onAddToCart={onAddToCart} />}
              {activeTab === 'addresses' && <AddressesSection user={user} />}
              {activeTab === 'security' && <SecuritySection user={user} />}
              {activeTab === 'settings' && <SettingsSection user={user} />}
            </motion.div>
          </AnimatePresence>

          <InvoiceModal 
            isOpen={isInvoiceOpen}
            onClose={() => setIsInvoiceOpen(false)}
            order={selectedOrder}
            customer={user}
          />
        </main>
      </div>
    </div>
  );
}

// --- SUB-SECTIONS ---

function DashboardSection({ user, orders, setActiveTab, onOpenInvoice }: { user: UserProfile, orders: Order[], setActiveTab: (tab: ProfileTab) => void, onOpenInvoice: (o: Order) => void }) {
  const navigate = useNavigate();
  const totalSpent = orders.reduce((acc, current) => acc + (current.status !== 'cancelled' ? current.totalAmount : 0), 0);
  const lastOrder = orders[0];

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h2 className="text-3xl font-black text-app-text uppercase tracking-tighter">Tableau de bord</h2>
        <p className="text-gray-400 font-medium">Bienvenue sur votre espace personnel CKDO.</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-card-bg p-8 rounded-3xl border border-border-subtle shadow-sm flex flex-col justify-between h-40 group hover:border-brand-blue/30 transition-all">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Commandes</p>
          <div className="flex items-end justify-between">
            <h3 className="text-4xl font-black text-app-text tracking-tighter">{orders.length}</h3>
            <div className="p-3 bg-brand-blue/5 rounded-2xl text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-all">
              <Package size={24} />
            </div>
          </div>
        </div>
        <div className="bg-card-bg p-8 rounded-3xl border border-border-subtle shadow-sm flex flex-col justify-between h-40 group hover:border-brand-green/30 transition-all">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Dépensé</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-black text-brand-green tracking-tighter">{formatPrice(totalSpent)}</h3>
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
        <div className="bg-card-bg p-8 rounded-3xl border border-border-subtle shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h4 className="font-black text-lg text-app-text uppercase">Dernière Commande</h4>
            <Clock className="text-gray-400" size={20} />
          </div>
          {lastOrder ? (
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">ID Commande</p>
                  <p className="font-bold text-app-text text-sm">#{lastOrder.id.slice(0, 8)}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  lastOrder.status === 'delivered' ? 'bg-green-500/10 text-green-500' : 
                  lastOrder.status === 'cancelled' ? 'bg-red-500/10 text-red-500' :
                  'bg-brand-blue/10 text-brand-blue'
                }`}>
                  {lastOrder.status}
                </div>
              </div>
              <div className="bg-app-background rounded-2xl p-4 flex justify-between items-center">
                <div className="flex -space-x-3">
                  {lastOrder.items.slice(0, 3).map((item, i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-card-bg border-2 border-border-subtle flex items-center justify-center text-[10px] font-black text-gray-400 overflow-hidden shadow-sm">
                      <span className="truncate px-1">{item.name.charAt(0)}</span>
                    </div>
                  ))}
                  {lastOrder.items.length > 3 && (
                    <div className="w-10 h-10 rounded-full bg-border-subtle border-2 border-card-bg flex items-center justify-center text-[10px] font-black text-gray-500 shadow-sm">
                      +{lastOrder.items.length - 3}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Montant</p>
                  <p className="font-black text-app-text">{formatPrice(lastOrder.totalAmount)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setActiveTab('orders')}
                  className="w-full py-4 border-2 border-brand-blue/20 text-brand-blue rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-blue/5 transition-all"
                >
                  Mes Commandes
                </button>
                <button 
                  onClick={() => (setActiveTab('orders'), setSelectedOrder(lastOrder), setIsInvoiceOpen(true))}
                  className="w-full py-4 bg-brand-blue/10 text-brand-blue rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-blue hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <FileText size={14} /> Facture
                </button>
              </div>
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
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email,
    phoneNumber: user.phoneNumber || ''
  });

  // Sync formData with user prop when not editing
  useEffect(() => {
    if (!editing) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email,
        phoneNumber: user.phoneNumber || ''
      });
    }
  }, [user, editing]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    
    console.log("Starting profile update for user:", user.uid);
    console.log("Update data:", formData);
    
    setSaving(true);
    try {
      const { email, ...updateData } = formData;
      const docRef = doc(db, 'users', user.uid);
      console.log("Target document path: users/", user.uid);
      
      await updateDoc(docRef, {
        ...updateData,
        displayName: `${formData.firstName} ${formData.lastName}`.trim(),
        updatedAt: serverTimestamp()
      });
      
      console.log("Profile update successful");
      setEditing(false);
    } catch (error) {
      console.error("Profile update FAILED:", error);
      alert("Erreur lors de la mise à jour : " + (error instanceof Error ? error.message : "Erreur inconnue"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-app-text uppercase tracking-tighter">Mon Profil</h2>
          <p className="text-gray-400 font-medium">Gérez vos informations personnelles et votre compte.</p>
        </div>
        {!editing && (
          <button 
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 px-5 py-3 bg-card-bg border border-border-subtle rounded-xl font-bold text-sm text-app-text hover:bg-app-background transition-colors shadow-sm"
          >
            <Edit3 size={18} /> Modifier
          </button>
        )}
      </header>

      <div className="bg-card-bg rounded-3xl border border-border-subtle shadow-sm overflow-hidden divide-y divide-border-subtle">
        <div className="p-8 flex flex-col md:flex-row gap-10 items-center">
          <div className="relative group">
            <img 
              src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'Client'}&background=0D52D6&color=fff`} 
              className="w-32 h-32 rounded-3xl object-cover ring-4 ring-app-background shadow-lg" 
              alt="Profile" 
            />
            <button className="absolute -bottom-2 -right-2 p-3 bg-brand-blue text-white rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all">
              <Edit3 size={16} />
            </button>
          </div>
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl font-black text-app-text tracking-tighter uppercase">{user.displayName || 'Nouveau Client'}</h3>
            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest bg-app-background px-3 py-1 rounded-full inline-block">Membre depuis {new Date(user.createdAt).getFullYear()}</p>
            <div className="flex justify-center md:justify-start gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400"><CheckCircle2 size={14} className="text-green-500" /> Email vérifié</div>
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400"><AlertCircle size={14} className="text-brand-blue" /> KYC niveau 1</div>
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
                className="w-full bg-app-background border border-border-subtle rounded-2xl py-4 px-6 outline-none focus:ring-4 focus:ring-brand-blue/5 focus:border-brand-blue disabled:opacity-50 transition-all font-bold text-app-text"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Nom de famille</label>
              <input 
                type="text" 
                disabled={!editing}
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                className="w-full bg-app-background border border-border-subtle rounded-2xl py-4 px-6 outline-none focus:ring-4 focus:ring-brand-blue/5 focus:border-brand-blue disabled:opacity-50 transition-all font-bold text-app-text"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Email</label>
              <input 
                type="email" 
                disabled={true}
                value={formData.email}
                className="w-full bg-app-background/50 border border-border-subtle rounded-2xl py-4 px-6 font-bold text-gray-400 cursor-not-allowed"
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
                className="w-full bg-app-background border border-border-subtle rounded-2xl py-4 px-6 outline-none focus:ring-4 focus:ring-brand-blue/5 focus:border-brand-blue disabled:opacity-50 transition-all font-bold text-app-text"
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
                  disabled={saving}
                  className="flex-1 btn-primary py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-brand-blue/20 disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
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

function OrdersSection({ orders, onOpenInvoice }: { orders: Order[], onOpenInvoice: (order: Order) => void }) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<string>('all');

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-app-text uppercase tracking-tighter">Mes Commandes</h2>
          <p className="text-gray-400 font-medium">Historique complet de vos achats.</p>
        </div>
        <div className="flex gap-2 p-1 bg-card-bg rounded-xl border border-border-subtle shadow-sm overflow-x-auto max-w-full">
          {['all', 'pending', 'paid', 'delivered', 'cancelled'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                filter === f ? 'bg-app-text text-app-background shadow-md' : 'text-gray-400 hover:bg-app-background text-app-text'
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
            <div key={order.id} className="bg-card-bg rounded-3xl border border-border-subtle shadow-sm overflow-hidden hover:border-brand-blue/30 transition-all group font-sans">
              <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between gap-6 md:items-center">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-app-background flex items-center justify-center text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-all">
                    <Package size={28} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">#{order.id.slice(0, 8)}</p>
                    <h4 className="text-xl font-black text-app-text tracking-tight">{formatPrice(order.totalAmount)}</h4>
                    <p className="text-xs text-gray-500 font-bold font-sans">
                      {order.createdAt && (order.createdAt as any).seconds 
                        ? new Date((order.createdAt as any).seconds * 1000).toLocaleDateString()
                        : new Date(order.createdAt).toLocaleDateString()
                      } • {order.items.length} articles
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border self-start sm:self-center ${
                    order.status === 'delivered' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 
                    order.status === 'cancelled' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                    'bg-brand-blue/10 border-brand-blue/10 text-brand-blue'
                  }`}>
                    {order.status}
                  </div>

                  {(order.status === 'paid' || order.status === 'delivered' || order.status === 'preparing' || order.status === 'ready') && (
                    <button 
                      onClick={() => onOpenInvoice(order)}
                      className="flex items-center gap-2 px-6 py-3 bg-brand-blue/10 text-brand-blue rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-blue hover:text-white transition-all shadow-md group-hover:shadow-brand-blue/20"
                    >
                      <FileText size={14} /> Facture
                    </button>
                  )}

                  <button 
                    onClick={() => onOpenInvoice(order)}
                    className="px-6 py-3 bg-app-text text-app-background rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-blue transition-all shadow-lg hover:shadow-brand-blue/20"
                  >
                    Détails
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card-bg p-20 rounded-3xl border border-border-subtle shadow-sm text-center space-y-6">
          <div className="bg-app-background w-20 h-20 rounded-full flex items-center justify-center mx-auto text-gray-400">
            <Package size={40} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-app-text uppercase">Aucune commande trouvée</h3>
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
        <h2 className="text-3xl font-black text-app-text uppercase tracking-tighter">Mes Favoris</h2>
        <p className="text-gray-400 font-medium">Retrouvez ici tous les produits que vous avez aimés.</p>
      </header>

      {favorites.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {favorites.map((p) => (
            <div key={p.id} onClick={() => navigate(`/product/${p.id}`)} className="bg-card-bg rounded-3xl border border-border-subtle shadow-sm p-4 space-y-4 cursor-pointer hover:-translate-y-1 transition-transform group">
              <div className="aspect-square rounded-2xl bg-app-background overflow-hidden relative">
                <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                <button className="absolute top-3 right-3 p-2 bg-card-bg rounded-lg shadow-sm text-brand-red border border-border-subtle">
                  <Heart size={16} fill="currentColor" />
                </button>
              </div>
              <div className="space-y-1 text-app-text">
                <p className="font-bold text-app-text text-sm truncate">{p.name}</p>
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
        <div className="bg-card-bg p-20 rounded-3xl border border-border-subtle shadow-sm text-center space-y-6">
          <div className="bg-red-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-brand-red/30">
            <Heart size={40} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-app-text uppercase">La liste est vide</h3>
            <p className="text-gray-400 font-medium tracking-tight">Vous n'avez pas encore ajouté de coups de cœur.</p>
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
  const [editingAddr, setEditingAddr] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: 'Maison',
    street: '',
    city: 'Libreville',
    isDefault: false
  });

  const handleOpenAdd = () => {
    setEditingAddr(null);
    setFormData({ name: 'Maison', street: '', city: 'Libreville', isDefault: false });
    setShowAdd(true);
  };

  const handleOpenEdit = (addr: any) => {
    setEditingAddr(addr);
    setFormData({ name: addr.name, street: addr.street, city: addr.city, isDefault: addr.isDefault });
    setShowAdd(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let currentAddresses = user.addresses || [];
      if (editingAddr) {
        currentAddresses = currentAddresses.map(a => a.id === editingAddr.id ? { ...a, ...formData } : a);
      } else {
        currentAddresses.push({ ...formData, id: Math.random().toString(36).substr(2, 9) });
      }

      if (formData.isDefault) {
        currentAddresses = currentAddresses.map(a => ({ 
          ...a, 
          isDefault: a.id === (editingAddr ? editingAddr.id : currentAddresses[currentAddresses.length - 1].id) 
        }));
      }

      await updateDoc(doc(db, 'users', user.uid), {
        addresses: currentAddresses,
        updatedAt: serverTimestamp()
      });
      setShowAdd(false);
    } catch (error) {
      console.error(error);
      alert("Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette adresse ?')) return;
    try {
      const currentAddresses = (user.addresses || []).filter(a => a.id !== id);
      await updateDoc(doc(db, 'users', user.uid), {
        addresses: currentAddresses,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-app-text uppercase tracking-tighter">Mes Adresses</h2>
          <p className="text-gray-400 font-medium">Gérez vos différents lieux de livraison.</p>
        </div>
        {!showAdd && (
          <button 
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-5 py-3 bg-brand-blue text-white rounded-xl font-bold text-sm hover:bg-brand-blue-dark transition-colors shadow-lg shadow-brand-blue/20"
          >
            <Plus size={18} /> Ajouter
          </button>
        )}
      </header>

      {showAdd ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card-bg p-8 rounded-3xl border border-border-subtle shadow-sm space-y-6"
        >
          <div className="flex items-center gap-4 mb-2">
             <button onClick={() => setShowAdd(false)} className="p-2 hover:bg-app-background rounded-full transition-colors text-gray-400">
                <ChevronLeft size={24} />
             </button>
             <h3 className="text-xl font-black text-app-text uppercase">{editingAddr ? 'Modifier l\'adresse' : 'Nouvelle adresse'}</h3>
          </div>
          
          <form onSubmit={handleSave} className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Type (Maison, Bureau...)</label>
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-app-background border border-border-subtle rounded-2xl py-4 px-6 font-bold text-app-text"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Ville</label>
              <select 
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                className="w-full bg-app-background border border-border-subtle rounded-2xl py-4 px-6 font-bold text-app-text"
              >
                <option value="Libreville">Libreville</option>
                <option value="Port-Gentil">Port-Gentil</option>
                <option value="Franceville">Franceville</option>
                <option value="Oyem">Oyem</option>
              </select>
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Adresse complète / Rue</label>
              <textarea 
                required
                value={formData.street}
                onChange={(e) => setFormData({...formData, street: e.target.value})}
                className="w-full bg-app-background border border-border-subtle rounded-2xl py-4 px-6 font-bold text-app-text h-32 resize-none"
                placeholder="Ex: Rue d'Ozangué, Immeuble ABC"
              />
            </div>
            <div className="md:col-span-2 flex items-center gap-3 p-4 bg-app-background rounded-2xl">
              <input 
                type="checkbox" 
                id="defaultAddr" 
                checked={formData.isDefault}
                onChange={(e) => setFormData({...formData, isDefault: e.target.checked})}
                className="w-5 h-5 accent-brand-blue"
              />
              <label htmlFor="defaultAddr" className="text-sm font-bold text-gray-400 cursor-pointer">Définir comme adresse par défaut</label>
            </div>
            <div className="md:col-span-2 flex gap-4 pt-4">
              <button 
                type="submit" 
                disabled={loading}
                className="flex-1 btn-primary py-4 rounded-2xl font-black uppercase tracking-widest text-xs"
              >
                {loading ? 'Enregistrement...' : 'Enregistrer l\'adresse'}
              </button>
              <button 
                type="button" 
                onClick={() => setShowAdd(false)}
                className="flex-1 bg-gray-100 text-gray-600 py-4 rounded-2xl font-black uppercase tracking-widest text-xs"
              >
                Annuler
              </button>
            </div>
          </form>
        </motion.div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {(user.addresses && user.addresses.length > 0) ? user.addresses.map((addr) => (
            <div key={addr.id} className="bg-card-bg p-8 rounded-3xl border border-border-subtle shadow-sm space-y-6 relative group border-2 border-transparent hover:border-brand-blue/10 transition-all">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-app-background rounded-2xl text-gray-400 group-hover:bg-brand-blue group-hover:text-white transition-all">
                  <MapPin size={24} />
                </div>
                {addr.isDefault ? (
                  <span className="text-[9px] font-black uppercase tracking-widest text-green-600 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20">Défaut</span>
                ) : (
                  <button 
                    onClick={async () => {
                      const updated = user.addresses?.map(a => ({ ...a, isDefault: a.id === addr.id }));
                      await updateDoc(doc(db, 'users', user.uid), { addresses: updated });
                    }}
                    className="text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-brand-blue"
                  >
                    Définir par défaut
                  </button>
                )}
              </div>
              <div className="space-y-1">
                <h4 className="font-black text-app-text uppercase tracking-tight">{addr.name}</h4>
                <p className="text-sm text-gray-400 font-medium leading-relaxed font-sans">{addr.street}<br/>{addr.city}, Gabon</p>
              </div>
              <div className="flex gap-4 pt-2 border-t border-border-subtle/50">
                <button 
                  onClick={() => handleOpenEdit(addr)}
                  className="text-brand-blue font-black text-[10px] uppercase tracking-widest hover:underline decoration-2 underline-offset-4 transition-all flex items-center gap-2"
                >
                  <Edit3 size={12} /> Modifier
                </button>
                <button 
                  onClick={() => handleDelete(addr.id)}
                  className="text-brand-red font-black text-[10px] uppercase tracking-widest hover:underline decoration-2 underline-offset-4 transition-all flex items-center gap-2"
                >
                  <Trash2 size={12} /> Supprimer
                </button>
              </div>
            </div>
          )) : (
            <div className="md:col-span-2 bg-card-bg p-12 rounded-3xl border-2 border-dashed border-border-subtle text-center space-y-6">
               <div className="w-20 h-20 bg-app-background rounded-full flex items-center justify-center mx-auto text-gray-400">
                 <MapPin size={32} />
               </div>
               <div className="space-y-1">
                 <h3 className="text-xl font-bold text-app-text uppercase tracking-tight">Aucune adresse</h3>
                 <p className="text-gray-400 font-medium tracking-tight">Ajoutez une adresse pour faciliter vos futurs achats.</p>
               </div>
               <button 
                  onClick={handleOpenAdd}
                  className="btn-primary px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs"
               >
                 Ajouter ma première adresse
               </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SecuritySection({ user }: { user: UserProfile }) {
  const [loading, setLoading] = useState(false);

  const toggleSecurityFlag = async (flag: string, value: boolean) => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        [`security.${flag}`]: value,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Security update error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h2 className="text-3xl font-black text-app-text uppercase tracking-tighter">Sécurité</h2>
        <p className="text-gray-400 font-medium">Gérez la protection de votre compte.</p>
      </header>

      <div className="grid gap-6">
        {/* Verification Status */}
        <div className="bg-card-bg p-8 rounded-3xl border border-border-subtle shadow-sm flex items-center justify-between group hover:border-brand-green/20 transition-all">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-green-500/10 text-green-500 rounded-2xl group-hover:bg-green-500 group-hover:text-white transition-all">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h4 className="font-black text-app-text uppercase tracking-tight">Statut du compte</h4>
              <p className="text-sm text-gray-400 font-medium font-sans">Votre compte est protégé et vérifié.</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-500/20">
            Sécurisé
          </div>
        </div>

        {/* Password */}
        <div className="bg-card-bg p-8 rounded-3xl border border-border-subtle shadow-sm flex items-center justify-between group hover:border-brand-blue/20 transition-all">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-brand-blue/10 text-brand-blue rounded-2xl group-hover:bg-brand-blue group-hover:text-white transition-all">
              <Key size={28} />
            </div>
            <div>
              <h4 className="font-black text-app-text uppercase tracking-tight">Mot de passe</h4>
              <p className="text-sm text-gray-400 font-medium font-sans">Chaque modification renforce votre sécurité.</p>
            </div>
          </div>
          <button className="px-5 py-3 bg-app-background text-app-text border border-border-subtle rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-blue hover:text-white transition-all shadow-sm">
            Changer
          </button>
        </div>

        {/* 2FA Emulator (Example) */}
        <div className="bg-card-bg p-8 rounded-3xl border border-border-subtle shadow-sm flex items-center justify-between group hover:border-brand-blue/20 transition-all">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-purple-500/10 text-purple-500 rounded-2xl group-hover:bg-purple-500 group-hover:text-white transition-all">
              <Smartphone size={28} />
            </div>
            <div>
              <h4 className="font-black text-app-text uppercase tracking-tight">Double authentification</h4>
              <p className="text-sm text-gray-400 font-medium font-sans">Recevoir des codes par SMS.</p>
            </div>
          </div>
          <button 
            disabled={loading}
            onClick={() => toggleSecurityFlag('twoFactorEnabled', !user.security?.twoFactorEnabled)}
            className={`w-12 h-6 rounded-full p-1 transition-all ${user.security?.twoFactorEnabled ? 'bg-brand-blue' : 'bg-gray-200'}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${user.security?.twoFactorEnabled ? 'translate-x-6' : ''}`} />
          </button>
        </div>

        {/* Danger Zone */}
        <div className="mt-10 pt-10 border-t border-border-subtle space-y-6">
          <div className="space-y-1">
            <h3 className="text-xl font-black text-red-500 uppercase tracking-tight">Zone de danger</h3>
            <p className="text-gray-400 font-medium">Les actions suivantes sont irréversibles.</p>
          </div>
          
          <div className="bg-red-500/5 p-8 rounded-3xl border border-red-500/10 flex items-center justify-between group hover:bg-red-500/10 transition-all">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-red-500/10 text-red-500 rounded-2xl group-hover:bg-red-500 group-hover:text-white transition-all">
                <UserX size={28} />
              </div>
              <div>
                <h4 className="font-black text-app-text uppercase tracking-tight">Supprimer mon compte</h4>
                <p className="text-sm text-gray-400 font-medium font-sans">Toutes vos données seront effacées définitivement.</p>
              </div>
            </div>
            <button className="px-5 py-3 border border-red-500/20 text-red-500 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsSection({ user }: { user: UserProfile }) {
  const [loading, setLoading] = useState(false);

  const updateSettings = async (key: string, value: any) => {
    if (loading) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        [`settings.${key}`]: value,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Settings update error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h2 className="text-3xl font-black text-app-text uppercase tracking-tighter">Paramètres</h2>
        <p className="text-gray-400 font-medium">Personnalisez votre expérience CKDO.</p>
      </header>

      <div className="grid gap-8">
        {/* Notifications */}
        <section className="bg-card-bg rounded-3xl border border-border-subtle shadow-sm overflow-hidden">
          <div className="p-6 bg-app-background border-b border-border-subtle flex items-center gap-3">
             <Bell size={18} className="text-brand-blue" />
             <h3 className="font-black text-app-text uppercase text-sm tracking-tight">Notifications</h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-app-text">Alertes de commande</h4>
                <p className="text-xs text-gray-400 font-sans">Recevoir des mises à jour sur vos achats.</p>
              </div>
              <button 
                disabled={loading}
                onClick={() => updateSettings('pushEnabled', !user.settings?.pushEnabled)}
                className={`w-12 h-6 rounded-full p-1 transition-all ${user.settings?.pushEnabled ? 'bg-brand-blue' : 'bg-gray-200'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${user.settings?.pushEnabled ? 'translate-x-6' : ''}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-app-text">Factures par email</h4>
                <p className="text-xs text-gray-400 font-sans">Envoi automatique de vos reçus PDF.</p>
              </div>
              <button 
                disabled={loading}
                onClick={() => updateSettings('emailFactureEnabled', !user.settings?.emailFactureEnabled)}
                className={`w-12 h-6 rounded-full p-1 transition-all ${user.settings?.emailFactureEnabled ? 'bg-brand-blue' : 'bg-gray-200'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${user.settings?.emailFactureEnabled ? 'translate-x-6' : ''}`} />
              </button>
            </div>
          </div>
        </section>

        {/* Preferences */}
        <section className="bg-card-bg rounded-3xl border border-border-subtle shadow-sm overflow-hidden">
          <div className="p-6 bg-app-background border-b border-border-subtle flex items-center gap-3">
             <Globe size={18} className="text-brand-blue" />
             <h3 className="font-black text-app-text uppercase text-sm tracking-tight">Préférences d'affichage</h3>
          </div>
          <div className="p-8 space-y-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-1">
                <h4 className="font-bold text-app-text">Thème de l'application</h4>
                <p className="text-xs text-gray-400 font-sans">Choisissez votre ambiance visuelle.</p>
              </div>
              <div className="flex gap-2 p-1 bg-app-background rounded-2xl border border-border-subtle">
                <button 
                  disabled={loading}
                  onClick={() => updateSettings('theme', 'light')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${user.settings?.theme !== 'dark' ? 'bg-white text-brand-blue shadow-sm shadow-brand-blue/5' : 'text-gray-400'}`}
                >
                  <Sun size={14} /> Clair
                </button>
                <button 
                  disabled={loading}
                  onClick={() => updateSettings('theme', 'dark')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${user.settings?.theme === 'dark' ? 'bg-slate-900 text-white shadow-lg' : 'text-gray-400'}`}
                >
                  <Moon size={14} /> Sombre
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-1">
                <h4 className="font-bold text-app-text">Langue</h4>
                <p className="text-xs text-gray-400 font-sans">Language interface de l'application.</p>
              </div>
              <select 
                disabled={loading}
                value={user.settings?.lang || 'FR'}
                onChange={(e) => updateSettings('lang', e.target.value)}
                className="bg-app-background border border-border-subtle rounded-xl px-6 py-3 font-bold text-app-text text-sm min-w-40"
              >
                <option value="FR">Français (Gabon)</option>
                <option value="EN">English</option>
              </select>
            </div>
          </div>
        </section>

        {/* Version Info */}
        <div className="text-center py-4">
           <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] opacity-40">CKDO V1.2.4 • Build 240423</p>
        </div>
      </div>
    </div>
  );
}
