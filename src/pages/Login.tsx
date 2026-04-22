import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { Mail, Lock, LogIn, ShieldCheck, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { ADMIN_EMAILS } from '../constants/admins';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Check if user exists in Firestore, if not create (for regular users)
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const isAdminEmail = ADMIN_EMAILS.includes(user.email || '');

      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          role: isAdminEmail ? 'admin' : 'customer',
          createdAt: serverTimestamp()
        });
      } else if (isAdminEmail && userDoc.data().role !== 'admin') {
        // Upgrade existing user to admin if email matches
        await updateDoc(doc(db, 'users', user.uid), {
          role: 'admin',
          updatedAt: serverTimestamp()
        });
      }

      const updatedUserDoc = !userDoc.exists() || (isAdminEmail && userDoc.data().role !== 'admin') 
        ? await getDoc(doc(db, 'users', user.uid)) 
        : userDoc;

      const role = updatedUserDoc.data()?.role || (isAdminEmail ? 'admin' : 'customer');
      
      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError('Identifiants invalides ou erreur de connexion.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (loading) return;
    setLoading(true);
    setError('');
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const isAdminEmail = ADMIN_EMAILS.includes(user.email || '');
      
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: isAdminEmail ? 'admin' : 'customer',
          createdAt: serverTimestamp()
        });
      } else if (isAdminEmail && userDoc.data().role !== 'admin') {
        // Upgrade existing user to admin if email matches
        await updateDoc(doc(db, 'users', user.uid), {
          role: 'admin',
          updatedAt: serverTimestamp()
        });
      }
      
      const updatedUserDoc = !userDoc.exists() || (isAdminEmail && userDoc.data().role !== 'admin') 
        ? await getDoc(doc(db, 'users', user.uid)) 
        : userDoc;
      
      const role = updatedUserDoc.data()?.role || (isAdminEmail ? 'admin' : 'customer');
      
      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      if (err.code === 'auth/cancelled-popup-request') {
        setError('Une demande de connexion est déjà en cours ou a été annulée.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('La fenêtre de connexion a été fermée avant la fin de l\'opération.');
      } else {
        setError('Échec de la connexion avec Google.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-app-background">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 space-y-8"
      >
        <div className="text-center space-y-2">
          <div className="bg-brand-blue/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="h-8 w-8 text-brand-blue" />
          </div>
          <h1 className="text-3xl font-black text-slate-900">Espace Privé</h1>
          <p className="text-gray-500 font-medium">Connectez-vous pour accéder à CKDO</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-medium animate-shake">
            <AlertCircle className="h-5 w-5 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@ckdo.ga"
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all placeholder:text-gray-300 font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all placeholder:text-gray-300 font-medium"
                  required
                />
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full btn-primary h-14 rounded-2xl flex items-center justify-center gap-3 font-bold text-lg disabled:opacity-50"
          >
            {loading ? 'Connexion...' : <><LogIn className="h-5 w-5" /> Se connecter</>}
          </button>
        </form>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase font-black tracking-widest text-gray-300 px-2 bg-white">
            Ou
          </div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-white border-2 border-gray-100 h-14 rounded-2xl flex items-center justify-center gap-3 font-bold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
          {loading ? 'Chargement...' : 'Continuer avec Google'}
        </button>

        <p className="text-center text-xs text-gray-400 font-medium">
          Note: L'accès administrateur est réservé au personnel autorisé.
        </p>
      </motion.div>
    </div>
  );
}
