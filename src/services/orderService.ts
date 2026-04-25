import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  where,
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Order, OrderStatus } from '../types';
import { parseRobustDate } from '../lib/utils';

export const orderService = {
  // Listen to all orders (Admin only)
  subscribeToAllOrders: (callback: (orders: Order[]) => void) => {
    console.log("[orderService] Subscribing to ALL orders (orders + commandes)...");
    let ordersList: Order[] = [];
    let commandesList: Order[] = [];

    const notify = () => {
      try {
        const mergedMap = new Map<string, Order>();
        commandesList.forEach(o => { if(o?.id) mergedMap.set(o.id, o); });
        ordersList.forEach(o => { if(o?.id) mergedMap.set(o.id, o); });
        
        const all = Array.from(mergedMap.values());
        console.log(`[orderService] Total merged orders: ${all.length}`);
        
        const sorted = all.sort((a, b) => {
          const dateA = parseRobustDate(a.createdAt)?.getTime() || 0;
          const dateB = parseRobustDate(b.createdAt)?.getTime() || 0;
          return dateB - dateA;
        });
        
        callback(sorted);
      } catch (err) {
        console.error("[orderService] Merge error:", err);
      }
    };

    const unsub1 = onSnapshot(query(collection(db, 'orders')), (snap) => {
      console.log(`[orderService] 'orders' updated (${snap.size} items)`);
      ordersList = snap.docs.map(doc => ({ 
        status: 'pending',
        totalAmount: 0,
        items: [],
        ...doc.data(),
        id: doc.id 
      } as unknown as Order));
      notify();
    }, (err) => {
      console.error("[orderService] Error on 'orders' listener:", err);
      notify(); // Still notify with what we have
    });

    const unsub2 = onSnapshot(query(collection(db, 'commandes')), (snap) => {
      console.log(`[orderService] 'commandes' updated (${snap.size} items)`);
      commandesList = snap.docs.map(doc => ({ 
        status: 'pending',
        totalAmount: 0,
        items: [],
        ...doc.data(),
        id: doc.id 
      } as unknown as Order));
      notify();
    }, (err) => {
      console.warn("[orderService] 'commandes' fallback notice:", err.message);
      notify();
    });

    return () => {
      unsub1();
      unsub2();
    };
  },

  // Listen to orders for a specific customer
  subscribeToCustomerOrders: (userId: string, callback: (orders: Order[]) => void) => {
    console.log(`[orderService] Subscribing to customer orders: ${userId}`);
    let ordersList: Order[] = [];
    let commandesList: Order[] = [];

    const notify = () => {
      const mergedMap = new Map<string, Order>();
      commandesList.forEach(o => { if(o?.id) mergedMap.set(o.id, o); });
      ordersList.forEach(o => { if(o?.id) mergedMap.set(o.id, o); });
      
      const all = Array.from(mergedMap.values());
      const sorted = all.sort((a, b) => {
        const dateA = parseRobustDate(a.createdAt)?.getTime() || 0;
        const dateB = parseRobustDate(b.createdAt)?.getTime() || 0;
        return dateB - dateA;
      });
      callback(sorted);
    };

    const q1 = query(collection(db, 'orders'), where('customerId', '==', userId));
    const unsub1 = onSnapshot(q1, (snap) => {
      ordersList = snap.docs.map(doc => ({ 
        status: 'pending',
        totalAmount: 0,
        items: [],
        ...doc.data(),
        id: doc.id 
      } as unknown as Order));
      notify();
    }, (err) => {
      console.error("[orderService] Customer orders error:", err);
      notify();
    });

    const q2 = query(collection(db, 'commandes'), where('customerId', '==', userId));
    const unsub2 = onSnapshot(q2, (snap) => {
      commandesList = snap.docs.map(doc => ({ 
        status: 'pending',
        totalAmount: 0,
        items: [],
        ...doc.data(),
        id: doc.id 
      } as unknown as Order));
      notify();
    }, (err) => {
      notify();
    });

    return () => {
      unsub1();
      unsub2();
    };
  },

  // Update order status
  updateOrderStatus: async (orderId: string, status: OrderStatus) => {
    // Try both collections
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { 
        status,
        updatedAt: serverTimestamp()
      });
    } catch (e) {
      const cmdRef = doc(db, 'commandes', orderId);
      await updateDoc(cmdRef, { 
        status,
        updatedAt: serverTimestamp()
      });
    }
  },

  // Create a new order
  createOrder: async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => {
    return await addDoc(collection(db, 'orders'), {
      ...orderData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }
};
