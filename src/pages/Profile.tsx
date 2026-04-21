import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { signOut, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { User, LogOut, Package, Settings, ChevronRight, LogIn, MapPin, CreditCard } from 'lucide-react';
import { UserProfile } from '../types';

export default function Profile({ user }: { user: UserProfile | null }) {
  const navigate = useNavigate();

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // After successful login, we can redirect to home or stay here
      // Let's redirect to home to encourage shopping
      navigate('/');
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = () => signOut(auth);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center space-y-8">
        <div className="bg-gray-100 h-24 w-24 rounded-full flex items-center justify-center mx-auto">
          <User className="h-12 w-12 text-gray-300" />
        </div>
        <div className="space-y-4">
          <h1 className="text-3xl font-black">Mon Compte CKDO</h1>
          <p className="text-gray-500 max-w-sm mx-auto">Connectez-vous pour suivre vos commandes, enregistrer vos magasins favoris et bien plus encore.</p>
        </div>
        <button 
          onClick={handleLogin}
          className="btn-secondary flex items-center gap-3 px-12 py-4 mx-auto"
        >
          <LogIn className="h-5 w-5" />
          Se connecter avec Google
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl space-y-10">
      <div className="flex items-center gap-6 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        {user.photoURL ? (
          <img 
            src={user.photoURL} 
            alt={user.displayName} 
            className="h-20 w-20 rounded-full object-cover border-4 border-brand-blue/10 shadow-sm"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="h-20 w-20 rounded-full bg-slate-50 text-brand-blue flex items-center justify-center text-3xl font-bold uppercase shadow-inner border border-brand-green/30">
            {user.email.charAt(0)}
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-2xl font-black text-slate-900">{user.displayName || 'Client CKDO'}</h1>
          <p className="text-gray-500 text-sm">{user.email}</p>
          <div className="flex gap-2 mt-2">
            <span className="px-3 py-1 bg-brand-green/10 text-brand-green-dark rounded-full text-[10px] font-black uppercase tracking-widest border border-brand-green/20">{user.role}</span>
            {user.phoneNumber && (
              <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-[10px] font-bold uppercase tracking-widest border border-gray-200">{user.phoneNumber}</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        <h2 className="text-lg font-bold px-2">Mon activité</h2>
        <button className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors group">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-blue/10 text-brand-blue rounded-xl group-hover:bg-brand-blue group-hover:text-white transition-colors">
              <Package className="h-6 w-6" />
            </div>
            <div className="text-left">
              <p className="font-bold">Mes Commandes</p>
              <p className="text-sm text-gray-400">Historique des achats et factures</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-300" />
        </button>

        <h2 className="text-lg font-bold px-2 pt-4">Paramètres du compte</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <button className="bg-white p-6 rounded-2xl border border-gray-100 flex flex-col gap-3 hover:bg-gray-50 transition-colors group">
            <div className="p-3 bg-gray-50 text-gray-600 rounded-xl group-hover:bg-brand-blue group-hover:text-white transition-colors self-start">
              <MapPin className="h-6 w-6" />
            </div>
            <div className="text-left">
              <p className="font-bold">Adresses</p>
              <p className="text-xs text-gray-400">Gérer mes lieux de livraison</p>
            </div>
          </button>

          <button className="bg-white p-6 rounded-2xl border border-gray-100 flex flex-col gap-3 hover:bg-gray-50 transition-colors group">
            <div className="p-3 bg-gray-50 text-gray-600 rounded-xl group-hover:bg-brand-red group-hover:text-white transition-colors self-start">
              <CreditCard className="h-6 w-6" />
            </div>
            <div className="text-left">
              <p className="font-bold">Paiements</p>
              <p className="text-xs text-gray-400">Mes cartes et Mobile Money</p>
            </div>
          </button>
        </div>

        <button className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors group">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gray-50 text-gray-600 rounded-xl group-hover:bg-slate-900 group-hover:text-white transition-colors">
              <Settings className="h-6 w-6" />
            </div>
            <div className="text-left">
              <p className="font-bold">Préférences</p>
              <p className="text-sm text-gray-400">Notifications et confidentialité</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-300" />
        </button>

        <button 
          onClick={handleLogout}
          className="mt-6 bg-red-50 p-6 rounded-2xl border border-red-100 flex items-center justify-between hover:bg-red-500 hover:text-white transition-all group text-red-600"
        >
          <div className="flex items-center gap-4">
            <LogOut className="h-6 w-6" />
            <p className="font-bold">Déconnexion</p>
          </div>
        </button>
      </div>

      {user.role === 'admin' && (
        <div className="p-6 bg-gray-900 rounded-3xl text-white space-y-4">
          <h3 className="font-bold">Accès Administrateur</h3>
          <p className="text-gray-400 text-sm">Vous avez accès à l'interface de gestion des commandes et du catalogue.</p>
          <a 
            href="/admin" 
            className="inline-block w-full bg-white text-gray-900 text-center py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors"
          >
            Aller au Dashboard Admin
          </a>
        </div>
      )}
    </div>
  );
}
