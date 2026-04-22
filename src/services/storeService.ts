import { 
  collection, 
  onSnapshot, 
  query, 
  where,
  getDocs,
  doc,
  addDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Store } from '../types';

export const storeService = {
  // Listen to active stores
  subscribeToStores: (callback: (stores: Store[]) => void) => {
    const q = query(collection(db, 'stores'), where('isActive', '==', true));
    
    return onSnapshot(q, (snapshot) => {
      const stores = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Store[];
      callback(stores);
    });
  },

  // Helper to seed some stores if none exist
  seedStores: async () => {
    const q = query(collection(db, 'stores'));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      const initialStores = [
        { name: 'CKDO Mbolo', city: 'Libreville', address: 'Boulevard Triomphal', location: { lat: 0.4000, lng: 9.4500 }, isActive: true },
        { name: 'CKDO SNI', city: 'Libreville', address: 'Owendo', location: { lat: 0.3000, lng: 9.5000 }, isActive: true },
        { name: 'CKDO Port-Gentil', city: 'Port-Gentil', address: 'Centre Ville', location: { lat: -0.7200, lng: 8.7800 }, isActive: true }
      ];
      
      for (const s of initialStores) {
        await addDoc(collection(db, 'stores'), s);
      }
    }
  }
};
