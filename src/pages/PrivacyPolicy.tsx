import React from 'react';
import { Shield, Lock, Eye, Bell } from 'lucide-react';
import { motion } from 'motion/react';

export default function PrivacyPolicy() {
  return (
    <div className="bg-app-background min-h-screen py-20 transition-colors duration-300">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card-bg rounded-[2.5rem] border border-border-subtle p-8 md:p-16 shadow-xl"
        >
          <div className="flex items-center gap-4 mb-12">
            <div className="p-4 bg-brand-blue/10 rounded-2xl text-brand-blue">
              <Shield size={32} />
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-black text-app-text tracking-tighter uppercase italic">
                Politique de Confidentialité
              </h1>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-2">Dernière mise à jour : 24 Avril 2026</p>
            </div>
          </div>

          <div className="space-y-12 pro-text">
            <section className="space-y-4">
              <h2 className="flex items-center gap-3 text-2xl font-black text-app-text uppercase tracking-tight">
                <Lock size={20} className="text-brand-blue" />
                1. Collecte des données
              </h2>
              <p className="text-gray-500 font-medium leading-relaxed">
                Chez CKDO (Ludo_Consulting), nous collectons les informations nécessaires pour traiter vos commandes et améliorer votre expérience. Cela inclut votre nom, adresse e-mail, numéro de téléphone (Airtel/Moov Money pour les transactions) et votre adresse de livraison au Gabon.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="flex items-center gap-3 text-2xl font-black text-app-text uppercase tracking-tight">
                <Eye size={20} className="text-brand-blue" />
                2. Utilisation de vos informations
              </h2>
              <p className="text-gray-500 font-medium leading-relaxed">
                Vos données sont utilisées exclusivement pour :
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-500 font-medium pl-4">
                <li>La gestion de vos commandes et livraisons.</li>
                <li>Le traitement sécurisé de vos paiements mobiles.</li>
                <li>L'envoi de notifications par e-mail ou SMS concernant l'état de votre commande.</li>
                <li>L'amélioration technique du site internet par Ludovic Dev.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="flex items-center gap-3 text-2xl font-black text-app-text uppercase tracking-tight">
                <Shield size={20} className="text-brand-blue" />
                3. Confidentialité des paiements
              </h2>
              <p className="text-gray-500 font-medium leading-relaxed">
                Toutes les transactions financières sont gérées via des passerelles de paiement sécurisées agréées au Gabon. Nous ne stockons jamais vos codes secrets de Mobile Money sur nos serveurs.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="flex items-center gap-3 text-2xl font-black text-app-text uppercase tracking-tight">
                <Bell size={20} className="text-brand-blue" />
                4. Vos droits
              </h2>
              <p className="text-gray-500 font-medium leading-relaxed">
                Conformément à la législation gabonaise sur la protection des données personnelles, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Contactez-nous à l'adresse <strong>ludo.consulting3@gmail.com</strong> pour toute demande.
              </p>
            </section>
          </div>

          <div className="mt-16 pt-8 border-t border-border-subtle">
            <p className="text-sm text-center text-gray-400 font-bold uppercase tracking-widest italic">
              Merci de faire confiance à Ludo_Consulting.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
