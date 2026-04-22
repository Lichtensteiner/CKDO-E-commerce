import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Home from './pages/Home';
import ProductList from './pages/ProductList';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import LiveOrderTracker from './components/orders/LiveOrderTracker';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { UserProfile } from './types';

import { ADMIN_EMAILS } from './constants/admins';
import { storeService } from './services/storeService';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    storeService.seedStores();
    let unsubscribeProfile: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const isAdminEmail = ADMIN_EMAILS.includes(firebaseUser.email || '');
        const profileRef = doc(db, 'users', firebaseUser.uid);
        
        // Use real-time synchronization for profile
        unsubscribeProfile = onSnapshot(profileRef, (snap) => {
          if (snap.exists()) {
            const userData = snap.data() as UserProfile;
            // Handle role legacy/admin check
            if ((userData.role as string) === 'user' || (isAdminEmail && userData.role !== 'admin')) {
              setUser({ ...userData, role: isAdminEmail ? 'admin' : 'customer' });
            } else {
              setUser(userData);
            }
          } else {
            // Profile entry doesn't exist yet (new user)
            const newUser: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email!,
              displayName: firebaseUser.displayName || undefined,
              photoURL: firebaseUser.photoURL || undefined,
              role: isAdminEmail ? 'admin' : 'customer',
              createdAt: new Date().toISOString(),
            };
            setUser(newUser);
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

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-app-background">
        <Header user={user} cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)} />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home onAddToCart={addToCart} />} />
            <Route path="/products" element={<ProductList onAddToCart={addToCart} />} />
            <Route path="/cart" element={<Cart cart={cart} setCart={setCart} />} />
            <Route path="/checkout" element={<Checkout cart={cart} setCart={setCart} user={user} />} />
            <Route path="/product/:id" element={<ProductDetail onAddToCart={addToCart} user={user} />} />
            <Route path="/profile" element={<Profile user={user} onAddToCart={addToCart} setCart={setCart} />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin/*" element={user?.role === 'admin' ? <AdminDashboard user={user} /> : <Login />} />
          </Routes>
        </main>
        <LiveOrderTracker user={user} />
      </div>
    </Router>
  );
}
