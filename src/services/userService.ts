import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  updateDoc 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile } from '../types';

export const userService = {
  // Listen to all users (Admin only)
  subscribeToUsers: (callback: (users: UserProfile[]) => void) => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as unknown as UserProfile[];
      callback(users);
    });
  },

  // Listen to a specific user profile
  subscribeToUserProfile: (userId: string, callback: (user: UserProfile | null) => void) => {
    const userRef = doc(db, 'users', userId);
    return onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        callback({ id: snapshot.id, ...snapshot.data() } as unknown as UserProfile);
      } else {
        callback(null);
      }
    });
  },

  // Block/Unblock a user
  setUserBlockedState: async (userId: string, isBlocked: boolean) => {
    const userRef = doc(db, 'users', userId);
    return await updateDoc(userRef, { isBlocked });
  }
};
