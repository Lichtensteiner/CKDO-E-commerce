import React from 'react';
import { Info, MapPin, Mail, Phone, User, Building } from 'lucide-react';
import { motion } from 'motion/react';

export default function LegalNotice() {
  return (
    <div className="bg-app-background min-h-screen py-20 transition-colors duration-300">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card-bg rounded-[2.5rem] border border-border-subtle p-8 md:p-16 shadow-xl"
        >
          <div className="flex items-center gap-4 mb-12">
            <div className="p-4 bg-app-text/10 rounded-2xl text-app-text">
              <Info size={32} />
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-black text-app-text tracking-tighter uppercase italic">
                Mentions Légales
              </h1>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-2">Informations obligatoires</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="p-8 bg-app-background rounded-[2rem] border border-border-subtle space-y-4">
              <div className="flex items-center gap-3 text-brand-blue">
                <Building size={20} />
                <h2 className="text-lg font-black uppercase tracking-tight">Éditeur</h2>
              </div>
              <div className="space-y-1 text-sm font-medium text-gray-500">
                <p className="font-bold text-app-text">Entreprise : Ludo_Consulting</p>
                <p>Fondateur : M. Mve Zogo</p>
                <p>Adresse : 529 Avenue Félix HOUPHOUËT-BOIGNY</p>
                <p>Trois Quartier, Libreville, GABON</p>
              </div>
            </section>

            <section className="p-8 bg-app-background rounded-[2rem] border border-border-subtle space-y-4">
              <div className="flex items-center gap-3 text-brand-red">
                <User size={20} />
                <h2 className="text-lg font-black uppercase tracking-tight">Développeur</h2>
              </div>
              <div className="space-y-1 text-sm font-medium text-gray-500">
                <p className="font-bold text-app-text">Nom : Ludovic Dev</p>
                <p>Spécialité : Développeur Logiciel & Web</p>
                <p>E-mail : ludo.consulting3@gmail.com</p>
              </div>
            </section>

            <section className="p-8 bg-app-background rounded-[2rem] border border-border-subtle space-y-4 md:col-span-2">
              <div className="flex items-center gap-3 text-brand-green">
                <Phone size={20} />
                <h2 className="text-lg font-black uppercase tracking-tight">Contact Direct</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-medium text-gray-500">
                <div className="flex items-center gap-2">
                  <span className="text-brand-blue font-black">Tél :</span>
                  <p>077022306 / 062641120</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-brand-blue font-black">E-mail :</span>
                  <p>ludo.consulting3@gmail.com</p>
                </div>
              </div>
            </section>

            <section className="p-8 bg-app-background rounded-[2rem] border border-border-subtle space-y-4 md:col-span-2">
              <div className="flex items-center gap-3 text-gray-400">
                <MapPin size={20} />
                <h2 className="text-lg font-black uppercase tracking-tight">Hébergement</h2>
              </div>
              <p className="text-sm text-gray-500 font-medium">
                Cette application est hébergée sur les serveurs de Google Cloud Platform (GCP), garantissant une disponibilité et une sécurité de niveau mondial pour les utilisateurs gabonais de CKDO.
              </p>
            </section>
          </div>

          <div className="mt-16 pt-8 border-t border-border-subtle">
            <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest italic">
              Conformité ANINF GABON - 2026
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
