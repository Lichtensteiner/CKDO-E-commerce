import { 
  collection, 
  onSnapshot, 
  query, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';

export const productService = {
  // Listen to all products for the client side
  subscribeToActiveProducts: (callback: (products: Product[]) => void, onError?: (error: any) => void) => {
    console.log("[productService] Attaching real-time listener to 'products' collection...");
    const q = query(collection(db, 'products'));
    
    return onSnapshot(q, (snapshot) => {
      console.log(`[productService] Update: ${snapshot.size} products found in Firestore.`);
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as unknown as Product[];
      
      // Manual sort newest first
      const sorted = products.sort((a: any, b: any) => {
        const getVal = (p: any) => {
          if (!p.createdAt) return 0;
          if (p.createdAt?.seconds) return p.createdAt.seconds;
          if (typeof p.createdAt?.toDate === 'function') return p.createdAt.toDate().getTime() / 1000;
          return new Date(p.createdAt).getTime() / 1000;
        };
        return getVal(b) - getVal(a);
      });
      
      callback(sorted);
    }, (error) => {
      console.error("[productService] Firestore Listener Error:", error);
      if (onError) onError(error);
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
