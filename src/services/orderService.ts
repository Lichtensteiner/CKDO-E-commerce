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

export const orderService = {
  // Listen to all orders (Admin only)
  subscribeToAllOrders: (callback: (orders: Order[]) => void) => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as unknown as Order[];
      callback(orders);
    });
  },

  // Listen to orders for a specific customer
  subscribeToCustomerOrders: (userId: string, callback: (orders: Order[]) => void) => {
    const q = query(
      collection(db, 'orders'), 
      where('customerId', '==', userId)
    );
    
    return onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as unknown as Order[];
      // Client-side sort since composite index might be missing
      const sortedOrders = orders.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      callback(sortedOrders);
    });
  },

  // Update order status
  updateOrderStatus: async (orderId: string, status: OrderStatus) => {
    const orderRef = doc(db, 'orders', orderId);
    return await updateDoc(orderRef, { 
      status,
      updatedAt: serverTimestamp()
    });
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
