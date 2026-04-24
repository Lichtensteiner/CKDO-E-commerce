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
    // Listen directly to 'products' collection
    const q = query(collection(db, 'products'));
    
    return onSnapshot(q, (snapshot) => {
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as unknown as Product[];
      
      // Sort manually in JS as a safer fallback (newest first)
      const sortedProducts = products.sort((a: any, b: any) => {
        const dateA = a.createdAt?.seconds || (a.createdAt ? new Date(a.createdAt).getTime() / 1000 : 0);
        const dateB = b.createdAt?.seconds || (b.createdAt ? new Date(b.createdAt).getTime() / 1000 : 0);
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
  },

  // Migration Utility
  migrateProduitsToProducts: async () => {
    const { getDocs } = await import('firebase/firestore');
    const oldSnap = await getDocs(collection(db, 'produits'));
    console.log(`Starting migration of ${oldSnap.size} products from 'produits' to 'products'...`);
    
    for (const d of oldSnap.docs) {
      const productRef = doc(db, 'products', d.id);
      const { setDoc } = await import('firebase/firestore');
      await setDoc(productRef, d.data());
      console.log(`Migrated doc: ${d.id}`);
    }
    
    console.log("Migration complete!");
  }
};
