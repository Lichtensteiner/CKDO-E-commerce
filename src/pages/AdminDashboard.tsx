import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  addDoc, 
  deleteDoc, 
  getDocs,
  where,
  Timestamp,
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Order, UserProfile } from '../types';
import { formatPrice } from '../lib/utils';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  TrendingUp, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Filter,
  CheckCircle,
  Truck,
  Clock,
  LogOut,
  X,
  AlertCircle,
  ShieldCheck,
  Moon,
  Sun,
  Building,
  Bell,
  Globe,
  CreditCard
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  AreaChart, 
  Area 
} from 'recharts';
import { MOCK_PRODUCTS } from '../constants/products';

import { productService } from '../services/productService';
import { userService } from '../services/userService';
import { orderService } from '../services/orderService';

type AdminTab = 'overview' | 'products' | 'orders' | 'customers' | 'settings';

export default function AdminDashboard({ user }: { user: UserProfile | null }) {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [newOrdersCount, setNewOrdersCount] = useState(0);

  // Stats
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    activeProducts: 0,
    pendingOrders: 0
  });

  // Real-time Monthly Sales Data (2020-2030)
  const getSalesData = () => {
    const monthlySales: Record<string, number> = {};
    
    // Initialize months (we don't need all 120 months in memory, but we can filter based on order dates)
    // For visualization, we'll show the last 24 months to keep the chart readable, 
    // but the data can come from the full 2020-2030 range.
    
    orders.forEach(order => {
      if (order.status !== 'cancelled' && order.createdAt) {
        const date = order.createdAt instanceof Timestamp ? order.createdAt.toDate() : new Date(order.createdAt);
        const year = date.getFullYear();
        if (year >= 2020 && year <= 2030) {
          const key = `${year}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          monthlySales[key] = (monthlySales[key] || 0) + order.totalAmount;
        }
      }
    });

    return Object.entries(monthlySales)
      .map(([month, total]) => ({ month, total }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-24); // Show last 24 active months
  };

  const chartData = getSalesData();

  useEffect(() => {
    let initialLoad = true;
    // Orders listener
    const unsubOrders = orderService.subscribeToAllOrders((ordersData) => {
      if (!initialLoad && ordersData.length > orders.length) {
        setNewOrdersCount(prev => prev + (ordersData.length - orders.length));
      }
      initialLoad = false;
      setOrders(ordersData);
      const revenue = ordersData.reduce((acc, o) => acc + (o.status !== 'cancelled' ? o.totalAmount : 0), 0);
      const pending = ordersData.filter(o => o.status === 'pending').length;
      setStats(prev => ({ 
        ...prev, 
        totalOrders: ordersData.length,
        totalRevenue: revenue,
        pendingOrders: pending
      }));
    });

    // Products listener
    const unsubProducts = productService.subscribeToActiveProducts((productsData) => {
      setProducts(productsData);
      const active = productsData.filter(p => p.isActive).length;
      setStats(prev => ({ 
        ...prev, 
        totalProducts: productsData.length,
        activeProducts: active
      }));
    });

    // Customers listener
    const unsubCustomers = userService.subscribeToUsers((customersData) => {
      setCustomers(customersData);
      setStats(prev => ({ ...prev, totalCustomers: customersData.length }));
    });

    setLoading(false);
    return () => {
      unsubOrders();
      unsubProducts();
      unsubCustomers();
    };
  }, []);

  const handleLogout = () => auth.signOut();

  if (loading) return <div className="h-screen flex items-center justify-center">Chargement...</div>;

  return (
    <div className={`min-h-screen bg-app-background flex transition-colors duration-300`}>
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="bg-card-bg border-r border-border-subtle flex flex-col h-screen sticky top-0"
      >
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="bg-brand-blue w-8 h-8 rounded-lg flex items-center justify-center text-white">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <span className="font-black text-xl tracking-tighter">CKDO ADMIN</span>
            </div>
          )}
          {!isSidebarOpen && <ShieldCheck className="h-8 w-8 text-brand-blue mx-auto" />}
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <SidebarItem 
            icon={<LayoutDashboard />} 
            label="Vue d'ensemble" 
            active={activeTab === 'overview'} 
            onClick={() => setActiveTab('overview')} 
            collapsed={!isSidebarOpen}
          />
          <SidebarItem 
            icon={<Package />} 
            label="Produits" 
            active={activeTab === 'products'} 
            onClick={() => setActiveTab('products')} 
            collapsed={!isSidebarOpen}
          />
          <SidebarItem 
            icon={<ShoppingCart />} 
            label="Commandes" 
            active={activeTab === 'orders'} 
            onClick={() => {
              setActiveTab('orders');
              setNewOrdersCount(0);
            }} 
            collapsed={!isSidebarOpen}
            badge={newOrdersCount > 0 ? newOrdersCount : undefined}
          />
          <SidebarItem 
            icon={<Users />} 
            label="Clients" 
            active={activeTab === 'customers'} 
            onClick={() => setActiveTab('customers')} 
            collapsed={!isSidebarOpen}
          />
          <SidebarItem 
            icon={<Settings />} 
            label="Paramètres" 
            active={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')} 
            collapsed={!isSidebarOpen}
          />
        </nav>

        <div className="p-4 border-t border-gray-50">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full p-4 text-gray-500 hover:text-brand-red hover:bg-red-50 rounded-2xl transition-all font-bold"
          >
            <LogOut className="h-5 w-5" />
            {isSidebarOpen && <span>Déconnexion</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 p-6 sticky top-0 z-10 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 uppercase tracking-tight">
            {activeTab === 'overview' && 'Tableau de bord'}
            {activeTab === 'products' && 'Gestion Catalogue'}
            {activeTab === 'orders' && 'Commandes Clients'}
            {activeTab === 'customers' && 'Utilisateurs'}
            {activeTab === 'settings' && 'Configuration'}
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-slate-900">{user?.displayName || 'Administrateur'}</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{user?.email}</p>
            </div>
            <img 
              src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName || 'Admin'}&background=0D52D6&color=fff`} 
              className="w-10 h-10 rounded-xl object-cover border-2 border-brand-blue/10" 
              alt="Admin" 
            />
          </div>
        </header>

        <div className="p-4 md:p-8">
          {activeTab === 'overview' && <OverviewTab stats={stats} chartData={chartData} orders={orders} />}
          {activeTab === 'products' && <ProductsTab products={products} />}
          {activeTab === 'orders' && <OrdersTab orders={orders} />}
          {activeTab === 'customers' && <CustomersTab customers={customers} />}
          {activeTab === 'settings' && <SettingsTab user={user} />}
        </div>
      </main>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function SidebarItem({ icon, label, active, onClick, collapsed, badge }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all font-bold relative ${
        active 
        ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20' 
        : 'text-gray-500 hover:bg-gray-100 hover:text-slate-900'
      }`}
    >
      <span className="shrink-0">{icon}</span>
      {!collapsed && <span className="text-sm">{label}</span>}
      {badge && (
        <span className={`absolute ${collapsed ? 'top-2 right-2' : 'right-4'} bg-brand-red text-white text-[10px] font-black h-5 w-5 flex items-center justify-center rounded-full border-2 border-white animate-bounce`}>
          {badge}
        </span>
      )}
    </button>
  );
}

function StatCard({ label, value, icon, trend, color }: any) {
  return (
    <div className="bg-card-bg p-6 rounded-3xl border border-border-subtle shadow-sm space-y-4">
      <div className="flex justify-between items-start">
        <div className={`p-4 rounded-2xl ${color} bg-opacity-10 text-opacity-100`}>
          {icon}
        </div>
        {trend && (
          <span className="text-green-500 text-xs font-black bg-green-50 px-2 py-1 rounded-lg">
            +{trend}%
          </span>
        )}
      </div>
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</p>
        <h3 className="text-2xl font-black text-app-text">{value}</h3>
      </div>
    </div>
  );
}

// --- TABS ---

function OverviewTab({ stats, chartData, orders }: any) {
  const { theme } = useTheme();
  const recentOrders = [...orders].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  }).slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Chiffre d'affaires" 
          value={formatPrice(stats.totalRevenue)} 
          icon={<TrendingUp />} 
          color="text-emerald-600 bg-emerald-600" 
        />
        <StatCard 
          label="Commandes en attente" 
          value={stats.pendingOrders} 
          icon={<Clock />} 
          color="text-amber-600 bg-amber-600" 
        />
        <StatCard 
          label="Produits Actifs" 
          value={`${stats.activeProducts} / ${stats.totalProducts}`} 
          icon={<Package />} 
          color="text-blue-600 bg-blue-600" 
        />
        <StatCard 
          label="Clients" 
          value={stats.totalCustomers} 
          icon={<Users />} 
          color="text-purple-600 bg-purple-600" 
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-card-bg p-8 rounded-3xl border border-border-subtle shadow-sm">
          <div className="mb-6 flex justify-between items-center">
            <h3 className="font-black text-app-text text-xl">Ventes mensuelles (2020-2030)</h3>
            <span className="bg-app-background text-brand-blue text-[10px] font-black uppercase px-3 py-1 rounded-full">Temps Réel</span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0D52D6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#0D52D6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#E2E8F0'} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10}} tickFormatter={(val) => `${val/1000}k`} />
                <Tooltip 
                  contentStyle={{
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    backgroundColor: theme === 'dark' ? '#1e293b' : '#fff',
                    color: theme === 'dark' ? '#fff' : '#000'
                  }}
                />
                <Area type="monotone" dataKey="total" name="Ventes" stroke="#0D52D6" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card-bg p-8 rounded-3xl border border-border-subtle shadow-sm flex flex-col">
          <h3 className="font-black text-app-text text-xl mb-6">Activité récente</h3>
          <div className="space-y-6 flex-1">
            {recentOrders.length === 0 && (
              <div className="text-center py-10 opacity-30">
                <p className="text-xs font-bold">Aucune commande enregistrée</p>
              </div>
            )}
            {recentOrders.map((order: any) => (
              <div key={order.id} className="flex gap-4 group">
                <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                  order.status === 'paid' ? 'bg-blue-500' : 'bg-yellow-500'
                }`} />
                <div>
                  <p className="text-sm font-bold text-app-text group-hover:text-brand-blue transition-colors">Cmd #{order.id.slice(-6)} - {formatPrice(order.totalAmount)}</p>
                  <p className="text-[10px] font-bold text-gray-400 capitalize">{new Date(order.createdAt).toLocaleString('fr-FR', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full py-3 text-sm font-bold text-brand-blue border-t border-border-subtle mt-4">
            Voir tout l'historique
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductsTab({ products }: any) {
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    category: 'Produits alimentaires',
    subCategory: 'Riz & céréales',
    imageUrl: '',
    stock: 0,
    description: '',
    isActive: true
  });

  const categoryMap: Record<string, string[]> = {
    'Produits alimentaires': ['Riz & céréales', 'Pâtes', 'Conserves', 'Condiments'],
    'Boissons': ['Jus', 'Eaux', 'Boissons gazeuses'],
    'Produits frais': ['Viandes', 'Poissons', 'Produits laitiers'],
    'Fruits & légumes': ['Fruits', 'Légumes'],
    'Surgelés': ['Produits surgelés'],
    'Hygiène & beauté': ['Corps', 'Cheveux'],
    'Entretien maison': ['Nettoyage', 'Accessoires'],
    'Bébé': ['Alimentation bébé', 'Hygiène bébé'],
    'Bazar / Divers': ['Cuisine', 'Maison']
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const category = e.target.value;
    const subs = categoryMap[category] || [];
    setFormData({ 
      ...formData, 
      category, 
      subCategory: subs.length > 0 ? subs[0] : '' 
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("L'image est trop volumineuse (max 2MB)");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setFormData({ ...formData, imageUrl: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingProduct) {
        // Clean up formData to remove the id before updating
        const { id, ...updates } = formData as any;
        await productService.updateProduct(editingProduct.id, updates);
      } else {
        await productService.addProduct(formData as any);
      }
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error(error);
      alert("Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({ 
      name: '', 
      price: 0, 
      category: 'Produits alimentaires', 
      subCategory: 'Riz & céréales',
      imageUrl: '', 
      stock: 0, 
      description: '', 
      isActive: true 
    });
    setImagePreview(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Supprimer ce produit ?')) {
      await productService.deleteProduct(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-black text-slate-900">Catalogue</h3>
        <button 
          onClick={() => { setEditingProduct(null); setShowModal(true); }}
          className="btn-primary px-6 py-3 rounded-2xl flex items-center gap-2 font-bold shadow-lg shadow-brand-blue/20"
        >
          <Plus className="h-5 w-5" /> Ajouter un produit
        </button>
      </div>

      <div className="bg-card-bg rounded-3xl border border-border-subtle shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-app-background border-b border-border-subtle">
                <th className="px-6 py-4 text-xs font-black uppercase text-gray-400">Produit</th>
                <th className="px-6 py-4 text-xs font-black uppercase text-gray-400">Catégorie</th>
                <th className="px-6 py-4 text-xs font-black uppercase text-gray-400">Prix</th>
                <th className="px-6 py-4 text-xs font-black uppercase text-gray-400">Stock</th>
                <th className="px-6 py-4 text-xs font-black uppercase text-gray-400 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {products.map((p: any) => (
                <tr key={p.id} className="hover:bg-app-background transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <img src={p.imageUrl} alt={p.name} className="w-12 h-12 rounded-xl object-cover" />
                      <div>
                        <p className="font-bold text-app-text">{p.name}</p>
                        <p className={`text-[10px] font-black uppercase ${p.isActive ? 'text-green-500' : 'text-red-500'}`}>
                          {p.isActive ? 'Actif' : 'Inactif'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-500">{p.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-black text-brand-blue">{formatPrice(p.price)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-bold ${p.stock < 10 ? 'text-red-500' : 'text-gray-900'}`}>{p.stock}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => { setEditingProduct(p); setFormData(p); setShowModal(true); }}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(p.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-card-bg rounded-3xl shadow-2xl w-full max-w-2xl relative overflow-hidden text-app-text"
            >
              <div className="p-6 border-b border-border-subtle flex justify-between items-center">
                <h3 className="text-xl font-black">{editingProduct ? 'Modifier' : 'Ajouter'} produit</h3>
                <button onClick={() => setShowModal(false)}><X className="h-6 w-6 text-gray-400" /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-gray-400">Nom du produit</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-app-background border border-border-subtle rounded-xl p-3 outline-none focus:border-brand-blue transition-all text-app-text"
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-gray-400">Prix (CFA)</label>
                  <input 
                    type="number" 
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                    className="w-full bg-app-background border border-border-subtle rounded-xl p-3 outline-none focus:border-brand-blue transition-all text-app-text"
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-gray-400">Catégorie</label>
                  <select 
                    value={formData.category}
                    onChange={handleCategoryChange}
                    className="w-full bg-app-background border border-border-subtle rounded-xl p-3 outline-none focus:border-brand-blue transition-all text-app-text"
                  >
                    {Object.keys(categoryMap).map(cat => (
                      <option key={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-gray-400">Sous-catégorie</label>
                  <select 
                    value={formData.subCategory}
                    onChange={(e) => setFormData({...formData, subCategory: e.target.value})}
                    className="w-full bg-app-background border border-border-subtle rounded-xl p-3 outline-none focus:border-brand-blue transition-all text-app-text"
                  >
                    {(categoryMap[formData.category] || []).map(sub => (
                      <option key={sub}>{sub}</option>
                    ))}
                    {(categoryMap[formData.category] || []).length === 0 && <option value="">Aucune</option>}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-gray-400">Stock</label>
                  <input 
                    type="number" 
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})}
                    className="w-full bg-app-background border border-border-subtle rounded-xl p-3 outline-none focus:border-brand-blue transition-all text-app-text"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-black uppercase text-gray-400">Image du produit</label>
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border-subtle rounded-2xl cursor-pointer hover:border-brand-blue hover:bg-brand-blue/5 transition-all">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Plus className="h-6 w-6 text-gray-400 mb-2" />
                          <p className="text-xs text-gray-500">Cliquez pour téléverser (JPG, PNG)</p>
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                      </label>
                    </div>
                    {(imagePreview || formData.imageUrl) && (
                      <div className="w-32 h-32 rounded-2xl overflow-hidden border border-border-subtle flex-shrink-0 relative group">
                        <img src={imagePreview || formData.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                        <button 
                          type="button"
                          onClick={() => { setImagePreview(null); setFormData({...formData, imageUrl: ''}); }}
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                        >
                          <X className="text-white h-6 w-6" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-black uppercase text-gray-400">Description</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-app-background border border-border-subtle rounded-xl p-3 h-24 outline-none focus:border-brand-blue transition-all resize-none text-app-text"
                    placeholder="Détails du produit..."
                  />
                </div>
                <div className="md:col-span-2 flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    className="h-5 w-5 rounded text-brand-blue focus:ring-brand-blue border-gray-300"
                  />
                  <span className="text-sm font-bold text-gray-400">Produit activé (visible par les clients)</span>
                </div>
                
                <div className="md:col-span-2 pt-4">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full btn-primary h-14 rounded-2xl font-bold text-lg disabled:opacity-50 shadow-xl shadow-brand-blue/20"
                  >
                    {loading ? 'Enregistrement...' : (editingProduct ? 'Mettre à jour' : 'Ajouter au catalogue')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function OrdersTab({ orders }: any) {
  const [filter, setFilter] = useState('all');

  const updateStatus = async (id: string, status: string) => {
    await updateDoc(doc(db, 'orders', id), { 
      status, 
      updatedAt: new Date().toISOString() 
    });
  };

  const filtered = filter === 'all' ? orders : orders.filter((o: any) => o.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-2xl font-black text-slate-900">Commandes</h3>
        <div className="flex gap-2 bg-white p-1 rounded-xl border border-gray-100 shadow-sm overflow-x-auto max-w-full">
          {['all', 'pending', 'paid', 'preparing', 'ready', 'delivered'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                filter === s ? 'bg-slate-900 text-white' : 'text-gray-400 hover:bg-gray-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((order: any) => (
          <div key={order.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:border-brand-blue/20 transition-all group">
            <div className="p-6 border-b border-gray-50 flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">#{order.id.slice(0,8)}</p>
                <p className="text-xs font-bold text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                order.status === 'delivered' ? 'bg-green-100 text-green-700' : 
                order.status === 'paid' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {order.status}
              </span>
            </div>
            
            <div className="p-6 flex-1 space-y-4">
              <div className="space-y-2">
                {order.items.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-600 font-medium">{item.quantity}x {item.name}</span>
                    <span className="text-gray-400">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                <span className="font-bold text-gray-400 text-sm italic">{order.paymentMethod === 'momov' ? 'Airtel Money' : 'Cash'}</span>
                <span className="font-black text-slate-900">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 grid grid-cols-2 gap-2">
                {(order.status === 'paid' || order.status === 'pending') && (
                  <>
                    <button 
                      onClick={() => updateStatus(order.id, 'preparing')} 
                      className="py-2 bg-brand-blue text-white rounded-xl text-[10px] font-bold uppercase tracking-wider shadow-sm"
                    >
                      Préparer
                    </button>
                    <button 
                      onClick={() => updateStatus(order.id, 'cancelled')} 
                      className="py-2 bg-white border border-red-100 text-red-500 rounded-xl text-[10px] font-bold uppercase tracking-wider shadow-sm hover:bg-red-50 transition-colors"
                    >
                      Refuser
                    </button>
                  </>
                )}
                {order.status === 'preparing' && (
                  <button onClick={() => updateStatus(order.id, 'ready')} className="col-span-2 py-2 bg-purple-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider">Prête</button>
                )}
                {order.status === 'ready' && (
                  <button onClick={() => updateStatus(order.id, 'delivered')} className="col-span-2 py-2 bg-green-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider">Livrer</button>
                )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CustomersTab({ customers }: any) {
  const toggleBlock = async (id: string, isBlocked: boolean) => {
    await updateDoc(doc(db, 'users', id), { isBlocked: !isBlocked });
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-50">
        <h3 className="text-xl font-black">Gestion Clients</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-xs font-black uppercase text-gray-400">Client</th>
              <th className="px-6 py-4 text-xs font-black uppercase text-gray-400">Email</th>
              <th className="px-6 py-4 text-xs font-black uppercase text-gray-400">Rôle</th>
              <th className="px-6 py-4 text-xs font-black uppercase text-gray-400">Statut</th>
              <th className="px-6 py-4 text-xs font-black uppercase text-gray-400 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {customers.map((c: any) => (
              <tr key={c.id}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={c.photoURL || 'https://via.placeholder.com/40'} className="w-8 h-8 rounded-full border" alt="" />
                    <span className="font-bold text-slate-800">{c.displayName || 'Utilisateur'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{c.email}</td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${
                    c.role === 'admin' ? 'bg-brand-blue text-white' : 'bg-gray-100 text-gray-500'
                  }`}>{c.role}</span>
                </td>
                <td className="px-6 py-4">
                   <span className={`flex items-center gap-2 text-xs font-bold ${c.isBlocked ? 'text-red-500' : 'text-green-500'}`}>
                    <div className={`w-2 h-2 rounded-full ${c.isBlocked ? 'bg-red-500' : 'bg-green-500'}`} />
                    {c.isBlocked ? 'Bloqué' : 'Actif'}
                   </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <button 
                    onClick={() => toggleBlock(c.id, c.isBlocked)}
                    className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 border rounded-xl transition-all ${
                      c.isBlocked ? 'border-green-100 text-green-600 hover:bg-green-50' : 'border-red-100 text-red-600 hover:bg-red-50'
                    }`}
                  >
                    {c.isBlocked ? 'Débloquer' : 'Bloquer'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SettingsTab({ user }: any) {
  const { theme, toggleTheme } = useTheme();
  const [seeding, setSeeding] = useState(false);

  const seedProducts = async () => {
    setSeeding(true);
    try {
      for (const product of MOCK_PRODUCTS) {
        await addDoc(collection(db, 'products'), {
          ...product,
          isActive: true,
          stock: 100,
          createdAt: serverTimestamp()
        });
      }
      alert('Catalogue initialisé avec succès !');
    } catch (err) {
      console.error(err);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="max-w-4xl grid md:grid-cols-2 gap-8 pb-10">
      <div className="space-y-8">
        <div className="bg-card-bg p-8 rounded-3xl border border-border-subtle shadow-sm space-y-6">
          <h3 className="text-xl font-black flex items-center gap-2">
            <Globe className="h-5 w-5 text-brand-blue" /> Boutique
          </h3>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400">Nom de l'enseigne</label>
              <input type="text" defaultValue="CKDO Supermarché" className="w-full bg-app-background border border-border-subtle rounded-xl p-3 outline-none focus:border-brand-blue" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400">Adresse principale</label>
              <input type="text" defaultValue="Libreville, Gabon - Centre Ville" className="w-full bg-app-background border border-border-subtle rounded-xl p-3 outline-none focus:border-brand-blue" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400">Téléphone</label>
                <input type="text" defaultValue="+241 01 00 00 00" className="w-full bg-app-background border border-border-subtle rounded-xl p-3 outline-none focus:border-brand-blue" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400">Email Contact</label>
                <input type="text" defaultValue="contact@ckdo.ga" className="w-full bg-app-background border border-border-subtle rounded-xl p-3 outline-none focus:border-brand-blue" />
              </div>
            </div>
            <button className="w-full py-3 bg-brand-blue text-white font-bold rounded-xl shadow-lg shadow-brand-blue/20">Enregistrer les infos</button>
          </div>
        </div>

        <div className="bg-card-bg p-8 rounded-3xl border border-border-subtle shadow-sm space-y-6">
          <h3 className="text-xl font-black flex items-center gap-2">
            <Truck className="h-5 w-5 text-brand-blue" /> Livraison
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-app-background rounded-2xl">
              <div>
                <p className="font-bold text-app-text">Livraison à domicile</p>
                <p className="text-xs text-gray-400">Activer le service coursier</p>
              </div>
              <input type="checkbox" defaultChecked className="h-6 w-6 rounded-lg text-brand-blue border-gray-200" />
            </div>
            <div className="flex items-center justify-between p-4 bg-app-background rounded-2xl">
              <div>
                <p className="font-bold text-app-text">Frais fixes (CFA)</p>
                <p className="text-xs text-gray-400">Appliqués à chaque commande</p>
              </div>
              <input type="number" defaultValue="2000" className="w-24 bg-card-bg border border-border-subtle rounded-lg p-2 text-center text-sm font-bold" />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="bg-card-bg p-8 rounded-3xl border border-border-subtle shadow-sm space-y-6">
          <h3 className="text-xl font-black flex items-center gap-2">
            <Sun className="h-5 w-5 text-brand-blue" /> Apparence
          </h3>
          <div className="flex items-center justify-between p-6 bg-app-background rounded-[2rem] transition-all">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-slate-800 text-yellow-400' : 'bg-yellow-50 text-yellow-600'}`}>
                {theme === 'dark' ? <Moon className="h-6 w-6" /> : <Sun className="h-6 w-6" />}
              </div>
              <div>
                <p className="font-bold text-app-text">{theme === 'dark' ? 'Mode Sombre' : 'Mode Clair'}</p>
                <p className="text-xs text-gray-400">Personnalisez votre interface</p>
              </div>
            </div>
            <button 
              onClick={toggleTheme}
              className={`w-16 h-8 rounded-full relative transition-all duration-500 ${theme === 'dark' ? 'bg-brand-blue' : 'bg-gray-200'}`}
            >
              <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-500 shadow-sm ${theme === 'dark' ? 'left-9' : 'left-1'}`} />
            </button>
          </div>
        </div>

        <div className="bg-card-bg p-8 rounded-3xl border border-border-subtle shadow-sm space-y-6">
          <h3 className="text-xl font-black flex items-center gap-2">
             <CreditCard className="h-5 w-5 text-brand-blue" /> Paiements
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-app-background rounded-2xl">
              <div>
                <p className="font-bold text-app-text">Airtel Money</p>
                <p className="text-xs text-gray-400">Accepter les paiements mobiles</p>
              </div>
              <input type="checkbox" defaultChecked className="h-6 w-6 rounded-lg text-brand-blue border-gray-200" />
            </div>
            <div className="flex items-center justify-between p-4 bg-app-background rounded-2xl">
              <div>
                <p className="font-bold text-app-text">Moov Cash</p>
                <p className="text-xs text-gray-400">Activer l'intégration Moov</p>
              </div>
              <input type="checkbox" defaultChecked className="h-6 w-6 rounded-lg text-brand-blue border-gray-200" />
            </div>
          </div>
        </div>

        <div className="bg-card-bg p-8 rounded-3xl border border-border-subtle shadow-sm space-y-6">
          <h3 className="text-xl font-black flex items-center gap-2 text-red-500">
            <AlertCircle className="h-5 w-5" /> Maintenance
          </h3>
          <button 
            onClick={seedProducts}
            disabled={seeding}
            className="w-full py-4 border-2 border-dashed border-red-100 text-red-500 font-bold rounded-2xl hover:bg-red-50 transition-all disabled:opacity-50 text-sm"
          >
            {seeding ? 'Réinitialisation...' : 'Réinitialiser / Importer Démo'}
          </button>
        </div>
      </div>
    </div>
  );
}
