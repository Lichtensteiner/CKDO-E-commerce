import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';

export const productService = {
  // Listen to all active products for the client side
  subscribeToActiveProducts: (callback: (products: Product[]) => void) => {
    const q = query(
      collection(db, 'products'),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as unknown as Product[];
      callback(products);
    });
  },

  // Admin: Add a new product
  addProduct: async (productData: Omit<Product, 'id'>) => {
    return await addDoc(collection(db, 'products'), {
      ...productData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  },

  // Admin: Update a product
  updateProduct: async (id: string, updates: Partial<Product>) => {
    const productRef = doc(db, 'products', id);
    return await updateDoc(productRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  },

  // Admin: Delete a product
  deleteProduct: async (id: string) => {
    return await deleteDoc(doc(db, 'products', id));
  }
};
