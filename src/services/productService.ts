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
  subscribeToActiveProducts: (callback: (products: Product[]) => void, onError?: (error: any) => void) => {
    // We'll try to order by createdAt, but we'll provide a fallback in case some docs lack it
    const q = query(
      collection(db, 'produits')
      // Removed mandatory orderBy here to avoid hidden failures if index/field is missing
    );
    
    return onSnapshot(q, (snapshot) => {
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as unknown as Product[];
      
      // Sort manually in JS as a safer fallback
      const sortedProducts = products.sort((a: any, b: any) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA;
      });
      
      callback(sortedProducts);
    }, (error) => {
      if (onError) onError(error);
      else console.error("Snapshot error:", error);
    });
  },

  // Admin: Add a new product
  addProduct: async (productData: Omit<Product, 'id'>) => {
    return await addDoc(collection(db, 'produits'), {
      ...productData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  },

  // Admin: Update a product
  updateProduct: async (id: string, updates: Partial<Product>) => {
    const productRef = doc(db, 'produits', id);
    return await updateDoc(productRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  },

  // Admin: Delete a product
  deleteProduct: async (id: string) => {
    return await deleteDoc(doc(db, 'produits', id));
  }
};
