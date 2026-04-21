import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Clock, ShieldCheck, PhoneCall } from 'lucide-react';
import { motion } from 'motion/react';
import { formatPrice } from '../lib/utils';

export default function Home({ onAddToCart }: { onAddToCart: (p: any) => void }) {
  const featuredCategories = [
    { name: 'Épicerie', icon: '🥫', id: 'epicerie' },
    { name: 'Frais', icon: '🥬', id: 'frais' },
    { name: 'Boissons', icon: '🥤', id: 'boissons' },
    { name: 'Boucherie', icon: '🥩', id: 'boucherie' },
  ];

  return (
    <div className="space-y-12 pb-20">
      {/* Hero Section */}
      <section className="relative h-[500px] flex items-center overflow-hidden bg-brand-blue">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://picsum.photos/seed/grocery/1600/900" 
            alt="Hero background" 
            className="w-full h-full object-cover grayscale"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-white">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl space-y-6"
          >
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1]">
              Faites vos courses, on s'occupe du reste.
            </h1>
            <p className="text-xl text-blue-100 max-w-lg">
              Le meilleur de CKDO directement sur votre mobile. Click & Collect rapide ou livraison à domicile.
            </p>
            <Link to="/products" className="btn-primary px-8 py-4 rounded-full font-bold text-lg flex items-center gap-2">
                Commander maintenant
                <ArrowRight className="h-5 w-5" />
              </Link>
              <button className="btn-secondary px-8 py-4 rounded-full font-bold text-lg">
                En savoir plus
              </button>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8">Rayons populaires</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {featuredCategories.map((cat, idx) => (
            <motion.div
              key={cat.id}
              whileHover={{ scale: 1.05 }}
              className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center gap-4 cursor-pointer"
            >
              <span className="text-5xl">{cat.icon}</span>
              <span className="font-bold text-gray-800">{cat.name}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="space-y-4">
              <div className="bg-white h-16 w-16 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                <Clock className="h-8 w-8 text-brand-green" />
              </div>
              <h3 className="font-bold text-lg">Click & Collect Rapide</h3>
              <p className="text-gray-600">Récupérez votre commande en moins de 2h dans votre magasin CKDO préféré.</p>
            </div>
            <div className="space-y-4">
              <div className="bg-white h-16 w-16 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                <ShieldCheck className="h-8 w-8 text-brand-green" />
              </div>
              <h3 className="font-bold text-lg">Paiement Sécurisé</h3>
              <p className="text-gray-600">Payez en Mobile Money (Airtel/Moov) ou par Carte Bancaire en toute confiance.</p>
            </div>
            <div className="space-y-4">
              <div className="bg-white h-16 w-16 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                <PhoneCall className="h-8 w-8 text-brand-green" />
              </div>
              <h3 className="font-bold text-lg">Service Client Local</h3>
              <p className="text-gray-600">Une équipe dédiée basée au Gabon pour vous accompagner dans vos achats.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
