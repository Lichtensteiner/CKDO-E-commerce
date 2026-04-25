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

import { parseRobustDate } from '../lib/utils';

export const productService = {
  // Listen to all products for the client side
  subscribeToActiveProducts: (callback: (products: Product[]) => void, onError?: (error: any) => void) => {
    console.log("[productService] Initializing robust listeners for 'products' and 'produits'...");
    
    let productsList: Product[] = [];
    let produitsList: Product[] = [];

    const notify = () => {
      try {
        const mergedMap = new Map<string, Product>();
        
        // Process products from 'produits' first
        produitsList.forEach(p => {
          if (p && p.id) mergedMap.set(p.id, p);
        });
        
        // Process products from 'products', potentially overwriting (this is intentional)
        productsList.forEach(p => {
          if (p && p.id) mergedMap.set(p.id, p);
        });
        
        const all = Array.from(mergedMap.values());
        console.log(`[productService] Combined catalog size: ${all.length}`);
        
        const sorted = all.sort((a, b) => {
          const dateA = parseRobustDate(a.createdAt)?.getTime() || 0;
          const dateB = parseRobustDate(b.createdAt)?.getTime() || 0;
          return dateB - dateA;
        });
        
        callback(sorted);
      } catch (err) {
        console.error("[productService] Critical merge error:", err);
      }
    };

    const unsub1 = onSnapshot(query(collection(db, 'products')), (snap) => {
      console.log(`[productService] Snapshot: 'products' updated (${snap.size} items)`);
      productsList = snap.docs.map(doc => {
        const data = doc.data();
        return { 
          isActive: true,
          stock: 0,
          price: 0,
          name: 'Produit sans nom',
          ...data, 
          id: doc.id, 
          dataId: data.id || doc.id,
          _source: 'products'
        } as unknown as Product;
      });
      notify();
    }, (err) => {
      console.error("[productService] FATAL Error on 'products':", err);
      if (onError) onError(err);
      // Even if one fails, we want to try to notify with whatever we have
      notify();
    });

    const unsub2 = onSnapshot(query(collection(db, 'produits')), (snap) => {
      console.log(`[productService] Snapshot: 'produits' updated (${snap.size} items)`);
      produitsList = snap.docs.map(doc => {
        const data = doc.data();
        return { 
          isActive: true,
          stock: 0,
          price: 0,
          name: 'Produit sans nom',
          ...data, 
          id: doc.id, 
          dataId: data.id || doc.id,
          _source: 'produits'
        } as unknown as Product;
      });
      notify();
    }, (err) => {
      console.warn("[productService] Notice: 'produits' collection error/missing:", err.message);
      notify();
    });
    
    return () => {
      unsub1();
      unsub2();
    };
  },

  // Admin: Add a new product
  addProduct: async (productData: Omit<Product, 'id'>) => {
    console.log("[productService] Robust AddProduct initiated for:", productData.name);
    
    const cleanedData = { ...productData } as any;
    
    // Generate a robust slug from name if no ID provided
    let slug = cleanedData.id;
    if (!slug || slug === '') {
      slug = productData.name
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      // Add random suffix to avoid collisions
      slug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
    }

    cleanedData.id = slug;
    
    console.log(`[productService] Saving to Firestore with ID: ${slug}`);
    
    try {
      const { setDoc } = await import('firebase/firestore');
      await setDoc(doc(db, 'products', slug), {
        ...cleanedData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log("[productService] Product saved successfully!");
      return { id: slug };
    } catch (err) {
      console.error("[productService] FAILED to save product:", err);
      throw err;
    }
  },

  // Admin: Update a product
  updateProduct: async (id: string, updates: Partial<Product>) => {
    console.log("[productService] Updating product:", id);
    const cleanedUpdates = { ...updates };
    if ('id' in cleanedUpdates) delete (cleanedUpdates as any).id;

    // Try updating in 'products'
    const productRef = doc(db, 'products', id);
    try {
      await updateDoc(productRef, {
        ...cleanedUpdates,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.warn("[productService] Failed to update in 'products', trying 'produits'...");
      const produitRef = doc(db, 'produits', id);
      await updateDoc(produitRef, {
        ...cleanedUpdates,
        updatedAt: serverTimestamp()
      });
    }
  },

  // Admin: Delete a product
  deleteProduct: async (id: string) => {
    console.log("[productService] Deleting product:", id);
    // Try deleting from both to be sure
    try {
      await deleteDoc(doc(db, 'products', id));
      await deleteDoc(doc(db, 'produits', id));
    } catch (err) {
      console.error("[productService] Delete error:", err);
      throw err;
    }
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
