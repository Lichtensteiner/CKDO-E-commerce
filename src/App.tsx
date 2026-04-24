import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/layout/Header';
import MobileNav from './components/layout/MobileNav';
import Home from './pages/Home';
import ProductList from './pages/ProductList';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import LiveOrderTracker from './components/orders/LiveOrderTracker';
import AIAssistant from './components/AIAssistant';
import SidebarDrawer from './components/layout/SidebarDrawer';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { UserProfile, Product } from './types';

import { ADMIN_EMAILS } from './constants/admins';
import { storeService } from './services/storeService';
import { productService } from './services/productService';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalProducts, setGlobalProducts] = useState<Product[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    storeService.seedStores();
    
    const unsubProducts = productService.subscribeToActiveProducts((fetched) => {
      setGlobalProducts(fetched);
    });

    let unsubscribeProfile: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const isAdminEmail = ADMIN_EMAILS.includes(firebaseUser.email || '');
        const profileRef = doc(db, 'users', firebaseUser.uid);
        
        // Use real-time synchronization for profile
        unsubscribeProfile = onSnapshot(profileRef, async (snap) => {
          if (snap.exists()) {
            const userData = snap.data() as UserProfile;
            // Handle role legacy/admin check
            if ((userData.role as string) === 'user' || (isAdminEmail && userData.role !== 'admin')) {
              setUser({ ...userData, role: isAdminEmail ? 'admin' : 'customer' });
            } else {
              setUser(userData);
            }
          } else {
            // Profile entry doesn't exist yet (new user) - CREATE IT
            const newUser: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email!,
              displayName: firebaseUser.displayName || undefined,
              photoURL: firebaseUser.photoURL || undefined,
              role: isAdminEmail ? 'admin' : 'customer',
              createdAt: new Date().toISOString(),
              settings: {
                theme: 'light',
                lang: 'FR',
                pushEnabled: true,
                emailFactureEnabled: true
              },
              security: {
                twoFactorEnabled: false
              }
            };
            
            try {
              await setDoc(profileRef, {
                ...newUser,
                updatedAt: serverTimestamp()
              });
              // Local state will be updated by the next snapshot trigger
            } catch (error) {
              console.error("Error creating user profile:", error);
              setUser(newUser); // Fallback to local state
            }
          }
          setLoading(false);
        });
      } else {
        setUser(null);
        if (unsubscribeProfile) unsubscribeProfile();
        setLoading(false);
      }
    });

    return () => {
      unsubAuth();
      unsubProducts();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const addToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const addItemsToCart = (items: any[]) => {
    setCart((prev) => {
      let newCart = [...prev];
      items.forEach(newItem => {
        const existingIdx = newCart.findIndex(item => item.id === newItem.id);
        if (existingIdx > -1) {
          newCart[existingIdx] = { 
            ...newCart[existingIdx], 
            quantity: newCart[existingIdx].quantity + newItem.quantity 
          };
        } else {
          newCart.push(newItem);
        }
      });
      return newCart;
    });
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
      </div>
    );
  }

  return (
    <Router>
      <AppContent 
        user={user} 
        cart={cart} 
        setCart={setCart} 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen}
        globalProducts={globalProducts}
        addToCart={addToCart}
        addItemsToCart={addItemsToCart}
      />
    </Router>
  );
}

function AppContent({ 
  user, 
  cart, 
  setCart, 
  isSidebarOpen, 
  setIsSidebarOpen, 
  globalProducts,
  addToCart,
  addItemsToCart
}: any) {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col bg-app-background">
      {!isAdminPath && (
        <Header 
          user={user} 
          cartCount={cart.reduce((acc: number, item: any) => acc + item.quantity, 0)} 
          onOpenSidebar={() => setIsSidebarOpen(true)}
        />
      )}
      
      {!isAdminPath && (
        <SidebarDrawer 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
          user={user} 
        />
      )}

      <main className={`flex-1 ${!isAdminPath ? 'pb-20 lg:pb-0' : ''}`}>
        <Routes>
          <Route path="/" element={<Home onAddToCart={addToCart} />} />
          <Route path="/products" element={<ProductList onAddToCart={addToCart} />} />
          <Route path="/cart" element={<Cart cart={cart} setCart={setCart} catalog={globalProducts} onAddToCart={addToCart} user={user} />} />
          <Route path="/checkout" element={<Checkout cart={cart} setCart={setCart} user={user} />} />
          <Route path="/product/:id" element={<ProductDetail onAddToCart={addToCart} user={user} catalog={globalProducts} />} />
          <Route path="/profile" element={<Profile user={user} onAddToCart={addToCart} setCart={setCart} catalog={globalProducts} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/*" element={user?.role === 'admin' ? <AdminDashboard user={user} /> : <Login />} />
        </Routes>
      </main>

      {!isAdminPath && <MobileNav cartCount={cart.reduce((acc: number, item: any) => acc + item.quantity, 0)} />}
      {!isAdminPath && <AIAssistant catalog={globalProducts} onAddItemsToCart={addItemsToCart} />}
      {!isAdminPath && <LiveOrderTracker user={user} />}
    </div>
  );
}
