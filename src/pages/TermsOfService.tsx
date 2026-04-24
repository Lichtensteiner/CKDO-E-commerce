import React from 'react';
import { FileText, CheckCircle, AlertTriangle, Scale } from 'lucide-react';
import { motion } from 'motion/react';

export default function TermsOfService() {
  return (
    <div className="bg-app-background min-h-screen py-20 transition-colors duration-300">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card-bg rounded-[2.5rem] border border-border-subtle p-8 md:p-16 shadow-xl"
        >
          <div className="flex items-center gap-4 mb-12">
            <div className="p-4 bg-brand-red/10 rounded-2xl text-brand-red">
              <FileText size={32} />
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-black text-app-text tracking-tighter uppercase italic">
                Conditions Générales
              </h1>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-2 text-brand-red">Veuillez lire attentivement</p>
            </div>
          </div>

          <div className="space-y-12 pro-text">
            <section className="space-y-4">
              <h2 className="flex items-center gap-3 text-2xl font-black text-app-text uppercase tracking-tight">
                <CheckCircle size={20} className="text-brand-red" />
                1. Acceptation des conditions
              </h2>
              <p className="text-gray-500 font-medium leading-relaxed">
                En utilisant le site CKDO, vous acceptez sans réserve les présentes conditions d'utilisation. Ces conditions peuvent être modifiées à tout moment par Ludo_Consulting.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="flex items-center gap-3 text-2xl font-black text-app-text uppercase tracking-tight">
                <AlertTriangle size={20} className="text-brand-red" />
                2. Commandes et Disponibilité
              </h2>
              <p className="text-gray-500 font-medium leading-relaxed">
                Les prix affichés sont en Francs CFA (FCFA/XAF). Bien que nous fassions de notre mieux pour maintenir les stocks à jour, CKDO se réserve le droit d'annuler une commande en cas de rupture de stock exceptionnelle, avec remboursement immédiat.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="flex items-center gap-3 text-2xl font-black text-app-text uppercase tracking-tight">
                <Scale size={20} className="text-brand-red" />
                3. Responsabilité de l'utilisateur
              </h2>
              <p className="text-gray-500 font-medium leading-relaxed">
                L'utilisateur est responsable de la véracité des informations fournies (nom, téléphone, adresse). En cas d'erreur dans l'adresse de livraison, Ludo_Consulting ne pourra être tenu responsable des délais ou échecs de livraison.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="flex items-center gap-3 text-2xl font-black text-app-text uppercase tracking-tight">
                <FileText size={20} className="text-brand-red" />
                4. Propriété Intellectuelle
              </h2>
              <p className="text-gray-500 font-medium leading-relaxed">
                L'interface, le logo CKDO, et le code source développé par Ludovic Dev sont la propriété exclusive de Ludo_Consulting. Toute reproduction est interdite sans autorisation préalable.
              </p>
            </section>
          </div>

          <div className="mt-16 pt-8 border-t border-border-subtle">
            <p className="text-sm text-center text-gray-400 font-bold uppercase tracking-widest italic">
              Ludo_Consulting - Engagement et Intégrité.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
