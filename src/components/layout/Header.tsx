import React, { useState, useEffect } from 'react';
import { ShoppingCart, User, Search, MapPin, Menu, Moon, Sun, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { UserProfile } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
];

export default function Header({ 
  cartCount, 
  user, 
  onOpenSidebar 
}: { 
  cartCount: number; 
  user: UserProfile | null;
  onOpenSidebar: () => void;
}) {
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showLangMenu, setShowLangMenu] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setShowLangMenu(false);
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <header className="sticky top-0 z-[55] w-full bg-card-bg border-b border-border-subtle transition-colors duration-300">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={onOpenSidebar}
            className="p-2 -ml-2 hover:bg-app-background rounded-xl lg:hidden text-app-text transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <Link to="/" className="text-2xl font-black text-brand-blue tracking-tighter">
            CKDO
          </Link>
          
          {/* Real-time Clock */}
          <div className="hidden xl:flex items-center gap-2 ml-4 px-3 py-1 bg-app-background rounded-full border border-border-subtle group">
            <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
            <span className="text-[11px] font-mono font-bold text-gray-500">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
        </div>

        <div className="hidden md:flex flex-1 max-w-md relative">
          <input
            type="text"
            placeholder={t('header.search')}
            className="w-full bg-app-background border border-border-subtle rounded-full py-2 px-10 focus:ring-2 focus:ring-brand-blue transition-all text-sm outline-none text-app-text"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        </div>

        <div className="flex items-center gap-4 lg:gap-6">
          {/* Language Switcher */}
          <div className="relative">
            <button 
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-1.5 p-1.5 hover:bg-app-background rounded-lg transition-all text-gray-500 hover:text-brand-blue"
            >
              <span className="text-lg">{currentLanguage.flag}</span>
              <Globe className="h-4 w-4 hidden sm:block" />
            </button>

            {showLangMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowLangMenu(false)} />
                <div className="absolute right-0 mt-2 w-40 bg-card-bg border border-border-subtle rounded-xl shadow-2xl overflow-hidden z-20 animate-in fade-in zoom-in duration-200">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                        i18n.language === lang.code 
                          ? 'bg-brand-blue text-white' 
                          : 'text-app-text hover:bg-app-background'
                      }`}
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <span className="font-bold">{lang.name}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <button 
            onClick={toggleTheme}
            className="p-2 hover:bg-app-background rounded-full transition-all text-gray-500 hover:text-brand-blue"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          <div className="hidden lg:flex items-center gap-2 text-sm text-gray-500 hover:text-brand-green cursor-pointer transition-colors">
            <MapPin className="h-4 w-4" />
            <span>CKDO Libreville</span>
          </div>
          
          <Link to="/profile" className="flex items-center gap-2 hover:bg-app-background p-1 pr-3 rounded-full transition-colors">
            {user?.photoURL ? (
              <img 
                src={user.photoURL} 
                alt="Account" 
                className="h-8 w-8 rounded-full border border-border-subtle" 
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="p-1.5 bg-app-background rounded-full">
                <User className="h-5 w-5 text-gray-400" />
              </div>
            )}
            <span className="hidden sm:inline text-sm font-bold text-gray-500">
              {user ? (user.displayName?.split(' ')[0] || 'Compte') : 'Connexion'}
            </span>
          </Link>

          {user?.role === 'admin' && (
            <Link to="/admin" className="hidden lg:flex items-center gap-2 bg-brand-blue/10 text-brand-blue px-4 py-2 rounded-xl text-sm font-bold hover:bg-brand-blue/20 transition-colors">
              Tableau de bord
            </Link>
          )}

          <Link to="/cart" className="p-2 hover:bg-app-background rounded-full transition-colors relative">
            <ShoppingCart className="h-6 w-6 text-gray-500" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-red text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
