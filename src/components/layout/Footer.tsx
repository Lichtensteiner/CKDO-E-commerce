import React from 'react';
import { Mail, Phone, MapPin, Globe, Shield, FileText, Code } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card-bg border-t border-border-subtle pt-16 pb-8 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand & Developer */}
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-brand-blue tracking-tighter">CKDO</h3>
              <p className="text-sm text-gray-400 font-medium leading-relaxed">
                Reinventer l'experience de vos courses quotidiennes au Gabon avec simplicité et rapidité.
              </p>
            </div>
            <div className="p-4 bg-app-background rounded-2xl border border-border-subtle">
              <div className="flex items-center gap-3 mb-2">
                <Code size={18} className="text-brand-blue" />
                <span className="text-xs font-black uppercase tracking-widest text-app-text">Développement</span>
              </div>
              <p className="text-sm font-bold text-app-text">Ludovic Dev</p>
              <p className="text-[11px] text-gray-400 italic">M. Mve Zogo</p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h4 className="text-sm font-black uppercase tracking-widest text-app-text">Contact de l'entreprise</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Phone size={18} className="text-brand-blue shrink-0 mt-1" />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-app-text">Ludo_Consulting</p>
                  <p className="text-[13px] text-gray-500 font-medium">077022306 / 062641120</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail size={18} className="text-brand-blue shrink-0 mt-1" />
                <p className="text-[13px] text-gray-500 font-medium truncate">ludo.consulting3@gmail.com</p>
              </div>
            </div>
          </div>

          {/* Address & Geo */}
          <div className="space-y-6">
            <h4 className="text-sm font-black uppercase tracking-widest text-app-text">Localisation</h4>
            <div className="flex items-start gap-3 text-app-text">
              <MapPin size={18} className="text-brand-red shrink-0 mt-1" />
              <div className="space-y-2">
                <p className="text-[13px] text-gray-500 font-medium leading-relaxed">
                  529 Avenue Félix HOUPHOUËT-BOIGNY,<br />
                  Trois Quartier, Libreville GABON
                </p>
                <a 
                  href="https://www.google.com/maps/search/529+Avenue+Félix+HOUPHOUËT-BOIGNY,+Trois+Quartier,+Libreville" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-brand-blue hover:underline"
                >
                  <Globe size={12} />
                  Voir sur la carte
                </a>
              </div>
            </div>
          </div>

          {/* Legal Links */}
          <div className="space-y-6">
            <h4 className="text-sm font-black uppercase tracking-widest text-app-text">Informations</h4>
            <nav className="flex flex-col gap-3">
              <Link to="/confidentialite" className="flex items-center gap-2 text-[13px] text-gray-500 font-medium hover:text-brand-blue transition-colors">
                <Shield size={14} />
                Confidentialité
              </Link>
              <Link to="/conditions" className="flex items-center gap-2 text-[13px] text-gray-500 font-medium hover:text-brand-blue transition-colors">
                <FileText size={14} />
                Conditions d'utilisation
              </Link>
              <Link to="/mentions-legales" className="flex items-center gap-2 text-[13px] text-gray-500 font-medium hover:text-brand-blue transition-colors">
                <FileText size={14} />
                Mentions Légales
              </Link>
            </nav>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border-subtle flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
            © {currentYear} CKDO - Par Ludo_Consulting. Tous droits réservés.
          </p>
          <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 italic">
            <span>Propulsé par</span>
            <span className="text-brand-blue">Ludovic Dev</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
