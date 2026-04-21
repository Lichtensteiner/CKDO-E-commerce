import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Test connection as per requirement
async function testConnection() {
  console.log(`Testing Firestore connection for project: ${firebaseConfig.projectId}`);
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firestore connection successful");
  } catch (error) {
    console.error("Firestore Error:", error);
    if (error instanceof Error) {
      if (error.message.includes('the client is offline')) {
        console.error("Please check your Firebase configuration. Ensure Firestore is enabled in your project.");
      } else if (error.message.includes('PERMISSION_DENIED')) {
        console.error("Permission denied. check your Firestore rules.");
      }
    }
  }
}

testConnection();
