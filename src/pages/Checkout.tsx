import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { orderService } from '../services/orderService';
import { CheckCircle2, ChevronRight, MapPin, Smartphone, CreditCard, Store as StoreIcon, Loader2 } from 'lucide-react';
import { formatPrice } from '../lib/utils';
import { simulateMobileMoneyPayment } from '../lib/payment';
import { motion, AnimatePresence } from 'motion/react';

const STORES = [
  { id: 'ckdo-libreville-centre', name: 'CKDO Libreville Centre', city: 'Libreville', address: 'Bord de Mer' },
  { id: 'ckdo-libreville-nord', name: 'CKDO Libreville Nord', city: 'Libreville', address: 'Aéroport' },
  { id: 'ckdo-port-gentil', name: 'CKDO Port-Gentil', city: 'Port-Gentil', address: 'Quartier Administratif' },
];

export default function Checkout({ cart, setCart, user }: { cart: any[]; setCart: (c: any[]) => void; user: any }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedStore, setSelectedStore] = useState(STORES[0]);
  const [paymentMethod, setPaymentMethod] = useState<'mobile_money' | 'card' | 'in_store'>('mobile_money');
  const [mobileProvider, setMobileProvider] = useState<'Airtel Money' | 'Moov Money'>('Airtel Money');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState<string | null>(null);

  const total = cart.reduce((acc, item) => acc + (item.isPromo ? item.promoPrice : item.price) * item.quantity, 0);

  const handleOrder = async () => {
    setIsProcessing(true);
    try {
      let transactionId = '';

      if (paymentMethod === 'mobile_money') {
        const result = await simulateMobileMoneyPayment(mobileProvider, phoneNumber, total);
        if (!result.success) {
          alert(result.message);
          setIsProcessing(false);
          return;
        }
        transactionId = result.transactionId;
      }

      const orderData: any = {
        customerId: user?.uid || 'anonymous',
        storeId: selectedStore.id,
        items: cart.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.isPromo ? (item.promoPrice || item.price) : item.price,
          quantity: item.quantity
        })),
        totalAmount: total,
        status: paymentMethod === 'in_store' ? 'pending' : 'paid',
        paymentMethod,
        paymentStatus: paymentMethod === 'in_store' ? 'pending' : 'completed',
        paymentTransactionId: transactionId,
        pickupSlot: 'Aujourd\'hui, 17h - 18h',
      };

      const docRef = await orderService.createOrder(orderData);
      setOrderComplete(docRef.id);
      setCart([]); // Automate: clear the cart after success
    } catch (error) {
      console.error("Order failed:", error);
      alert("Une erreur est survenue lors de la commande.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-lg text-center space-y-8 bg-app-background min-h-screen">
        <motion.div 
          initial={{ scale: 0 }} 
          animate={{ scale: 1 }}
          className="bg-green-500/10 h-24 w-24 rounded-full flex items-center justify-center mx-auto text-brand-green border border-green-500/20"
        >
          <CheckCircle2 className="h-14 w-14" />
        </motion.div>
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-app-text uppercase tracking-tighter">Commande confirmée !</h1>
          <p className="text-gray-500 font-medium">Référence: <span className="font-mono text-app-text font-black uppercase">{orderComplete.slice(0, 8)}</span></p>
        </div>
        <div className="bg-card-bg p-8 rounded-3xl border border-border-subtle text-left space-y-4 shadow-xl">
          <div className="flex gap-4">
            <MapPin className="h-6 w-6 text-brand-green shrink-0" />
            <div>
              <p className="font-black text-app-text uppercase text-sm tracking-tight">{selectedStore.name}</p>
              <p className="text-sm text-gray-500 font-medium">{selectedStore.address}, {selectedStore.city}</p>
            </div>
          </div>
          <p className="text-xs bg-brand-blue text-white p-4 rounded-2xl font-black uppercase tracking-widest leading-relaxed">
            Votre commande sera prête pour retrait à partir de <strong className="underline underline-offset-4 decoration-2">aujourd'hui, 17:00</strong>.
          </p>
        </div>
        <button 
          onClick={() => navigate('/')} 
          className="w-full btn-secondary h-16 rounded-2xl font-black uppercase tracking-widest text-sm"
        >
          Retour à l'accueil
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 lg:py-12 max-w-4xl bg-app-background min-h-screen">
      <div className="flex items-center gap-4 mb-12">
        <div className={`p-3 rounded-xl transition-all ${step >= 1 ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20' : 'bg-card-bg text-gray-500 border border-border-subtle'}`}>
          <MapPin className="h-6 w-6" />
        </div>
        <div className={`h-1 w-12 rounded-full transition-all ${step >= 2 ? 'bg-brand-blue' : 'bg-border-subtle'}`} />
        <div className={`p-3 rounded-xl transition-all ${step >= 2 ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20' : 'bg-card-bg text-gray-500 border border-border-subtle'}`}>
          <Smartphone className="h-6 w-6" />
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-12">
        <div className="lg:col-span-3 space-y-10">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-app-text uppercase tracking-tighter">Choisir un magasin</h2>
                  <p className="text-gray-500 font-medium tracking-tight">Où souhaitez-vous récupérer votre commande ?</p>
                </div>
                <div className="grid gap-4">
                  {STORES.map((store) => (
                    <button
                      key={store.id}
                      onClick={() => setSelectedStore(store)}
                      className={`p-6 rounded-3xl border-2 text-left transition-all ${
                        selectedStore.id === store.id 
                        ? 'border-brand-blue bg-brand-blue/5 shadow-lg shadow-brand-blue/5' 
                        : 'border-border-subtle bg-card-bg hover:border-gray-400'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="space-y-1">
                          <p className={`font-black text-lg uppercase tracking-tight ${selectedStore.id === store.id ? 'text-brand-blue' : 'text-app-text'}`}>{store.name}</p>
                          <p className="text-sm text-gray-500 font-medium">{store.address}, {store.city}</p>
                        </div>
                        <StoreIcon className={`h-8 w-8 ${selectedStore.id === store.id ? 'text-brand-blue' : 'text-gray-400 opacity-20'}`} />
                      </div>
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => setStep(2)}
                  className="w-full btn-primary h-16 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-sm shadow-xl shadow-brand-blue/20"
                >
                  Continuer vers le paiement
                  <ChevronRight className="h-5 w-5" />
                </button>
              </motion.div>
            ) : (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-10"
              >
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-3xl font-black text-app-text uppercase tracking-tighter">Mode de paiement</h2>
                    <p className="text-gray-500 font-medium tracking-tight">Choisissez votre méthode préférée.</p>
                  </div>
                  <div className="grid gap-4">
                    <button
                      onClick={() => setPaymentMethod('mobile_money')}
                      className={`p-6 rounded-3xl border-2 text-left flex gap-5 transition-all ${
                        paymentMethod === 'mobile_money' ? 'border-brand-blue bg-brand-blue/5' : 'border-border-subtle bg-card-bg'
                      }`}
                    >
                      <div className={`p-4 rounded-2xl shrink-0 ${paymentMethod === 'mobile_money' ? 'bg-brand-blue text-white' : 'bg-app-background text-gray-500'}`}>
                        <Smartphone className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-black text-app-text uppercase text-sm tracking-widest">Mobile Money</p>
                        <p className="text-sm text-gray-500 font-medium">Airtel Money ou Moov Money</p>
                      </div>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('in_store')}
                      className={`p-6 rounded-3xl border-2 text-left flex gap-5 transition-all ${
                        paymentMethod === 'in_store' ? 'border-brand-blue bg-brand-blue/5' : 'border-border-subtle bg-card-bg'
                      }`}
                    >
                      <div className={`p-4 rounded-2xl shrink-0 ${paymentMethod === 'in_store' ? 'bg-brand-blue text-white' : 'bg-app-background text-gray-500'}`}>
                        <StoreIcon className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-black text-app-text uppercase text-sm tracking-widest">Paiement en magasin</p>
                        <p className="text-sm text-gray-500 font-medium">Payez au moment du retrait</p>
                      </div>
                    </button>
                  </div>
                </div>

                {paymentMethod === 'mobile_money' && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="space-y-8 bg-card-bg p-8 rounded-3xl border border-border-subtle shadow-inner"
                  >
                    <div className="space-y-4">
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Opérateur</p>
                      <div className="flex gap-4">
                        {['Airtel Money', 'Moov Money'].map((op) => (
                          <button
                            key={op}
                            onClick={() => setMobileProvider(op as any)}
                            className={`flex-1 py-4 rounded-2xl border-2 font-black uppercase tracking-widest text-[10px] transition-all ${
                              mobileProvider === op ? 'border-app-text bg-app-text text-app-background' : 'border-border-subtle text-gray-400'
                            }`}
                          >
                            {op}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                       <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Numéro de téléphone (+241)</p>
                       <div className="relative">
                          <input 
                           type="tel"
                           value={phoneNumber}
                           onChange={(e) => setPhoneNumber(e.target.value)}
                           className="w-full bg-app-background border-2 border-border-subtle rounded-2xl py-5 px-6 focus:ring-4 focus:ring-brand-blue/5 focus:border-brand-blue transition-all font-mono font-black text-xl text-app-text"
                           placeholder="07..."
                         />
                       </div>
                       <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wide">Validation requise sur votre mobile après confirmation.</p>
                    </div>
                  </motion.div>
                )}

                <div className="flex gap-4 pt-6">
                  <button onClick={() => setStep(1)} className="flex-1 h-16 font-black uppercase tracking-widest text-xs text-gray-400 hover:text-app-text transition-colors">Retour</button>
                  <button 
                    disabled={isProcessing || (paymentMethod === 'mobile_money' && phoneNumber.length < 7)}
                    onClick={handleOrder}
                    className="flex-[2] btn-primary h-16 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-sm shadow-xl shadow-brand-blue/20"
                  >
                    {isProcessing ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      'Valider la commande'
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-card-bg p-8 rounded-3xl shadow-2xl border border-border-subtle space-y-8 lg:sticky lg:top-24">
            <h3 className="font-black text-xl text-app-text uppercase tracking-tighter">Votre Panier</h3>
            <div className="space-y-5 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-start gap-4">
                  <div className="space-y-1 overflow-hidden">
                    <p className="font-black text-app-text text-sm uppercase tracking-tight truncate leading-none">{item.name}</p>
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Quantité: {item.quantity}</p>
                  </div>
                  <span className="font-black text-app-text text-sm shrink-0">{formatPrice((item.isPromo ? item.promoPrice : item.price) * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="h-px bg-border-subtle" />
            <div className="space-y-4">
              <div className="flex justify-between text-gray-500 text-xs font-black uppercase tracking-widest">
                <span>Sous-total</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-2xl font-black text-app-text leading-none pt-2">
                <span className="uppercase tracking-tighter">Total</span>
                <span className="text-brand-blue">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
