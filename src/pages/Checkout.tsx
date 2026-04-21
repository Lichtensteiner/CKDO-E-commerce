import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { CheckCircle2, ChevronRight, MapPin, Smartphone, CreditCard, Store as StoreIcon, Loader2 } from 'lucide-react';
import { formatPrice } from '../lib/utils';
import { simulateMobileMoneyPayment } from '../lib/payment';
import { motion, AnimatePresence } from 'motion/react';

const STORES = [
  { id: 'ckdo-libreville-centre', name: 'CKDO Libreville Centre', city: 'Libreville', address: 'Bord de Mer' },
  { id: 'ckdo-libreville-nord', name: 'CKDO Libreville Nord', city: 'Libreville', address: 'Aéroport' },
  { id: 'ckdo-port-gentil', name: 'CKDO Port-Gentil', city: 'Port-Gentil', address: 'Quartier Administratif' },
];

export default function Checkout({ cart, user }: { cart: any[]; user: any }) {
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

      const orderData = {
        customerId: user?.uid || 'anonymous',
        storeId: selectedStore.id,
        items: cart.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.isPromo ? item.promoPrice : item.price,
          quantity: item.quantity
        })),
        totalAmount: total,
        status: paymentMethod === 'in_store' ? 'pending' : 'paid',
        paymentMethod,
        paymentStatus: paymentMethod === 'in_store' ? 'pending' : 'completed',
        paymentTransactionId: transactionId,
        pickupSlot: 'Aujourd\'hui, 17h - 18h',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'orders'), orderData);
      setOrderComplete(docRef.id);
    } catch (error) {
      console.error("Order failed:", error);
      alert("Une erreur est survenue lors de la commande.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-lg text-center space-y-8">
        <motion.div 
          initial={{ scale: 0 }} 
          animate={{ scale: 1 }}
          className="bg-green-100 h-24 w-24 rounded-full flex items-center justify-center mx-auto text-brand-green"
        >
          <CheckCircle2 className="h-14 w-14" />
        </motion.div>
        <div className="space-y-2">
          <h1 className="text-3xl font-black">Commande confirmée !</h1>
          <p className="text-gray-500">Référence: <span className="font-mono text-gray-900 font-bold uppercase">{orderComplete.slice(0, 8)}</span></p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 text-left space-y-4 shadow-sm">
          <div className="flex gap-4">
            <MapPin className="h-5 w-5 text-brand-green shrink-0" />
            <div>
              <p className="font-bold">{selectedStore.name}</p>
              <p className="text-sm text-gray-500">{selectedStore.address}, {selectedStore.city}</p>
            </div>
          </div>
          <p className="text-sm bg-brand-blue text-white p-3 rounded-xl font-medium">
            Votre commande sera prête pour retrait à partir de <strong>aujourd'hui, 17:00</strong>.
          </p>
        </div>
        <button 
          onClick={() => navigate('/')} 
          className="w-full btn-secondary"
        >
          Retour à l'accueil
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 lg:py-12 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <div className={`p-2 rounded-lg ${step >= 1 ? 'bg-brand-blue text-white' : 'bg-gray-200'}`}>
          <MapPin className="h-5 w-5" />
        </div>
        <div className="h-px w-8 bg-gray-200" />
        <div className={`p-2 rounded-lg ${step >= 2 ? 'bg-brand-blue text-white' : 'bg-gray-200'}`}>
          <Smartphone className="h-5 w-5" />
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-10">
        <div className="lg:col-span-3 space-y-8">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold">Choisir un magasin CKDO</h2>
                <div className="grid gap-4">
                  {STORES.map((store) => (
                    <button
                      key={store.id}
                      onClick={() => setSelectedStore(store)}
                      className={`p-5 rounded-2xl border-2 text-left transition-all ${
                        selectedStore.id === store.id 
                        ? 'border-brand-blue bg-slate-50' 
                        : 'border-gray-100 hover:border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="space-y-1">
                          <p className={`font-bold ${selectedStore.id === store.id ? 'text-brand-blue' : 'text-gray-900'}`}>{store.name}</p>
                          <p className="text-sm text-gray-500">{store.address}, {store.city}</p>
                        </div>
                        <StoreIcon className={`h-6 w-6 ${selectedStore.id === store.id ? 'text-brand-blue' : 'text-gray-300'}`} />
                      </div>
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => setStep(2)}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  Continuer vers le paiement
                  <ChevronRight className="h-5 w-5" />
                </button>
              </motion.div>
            ) : (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">Mode de paiement</h2>
                  <div className="grid gap-4">
                    <button
                      onClick={() => setPaymentMethod('mobile_money')}
                      className={`p-5 rounded-2xl border-2 text-left flex gap-4 ${
                        paymentMethod === 'mobile_money' ? 'border-brand-blue bg-slate-50' : 'border-gray-100 bg-white'
                      }`}
                    >
                      <Smartphone className={`h-6 w-6 shrink-0 ${paymentMethod === 'mobile_money' ? 'text-brand-blue' : 'text-gray-400'}`} />
                      <div>
                        <p className="font-bold">Mobile Money</p>
                        <p className="text-sm text-gray-500">Airtel Money ou Moov Money</p>
                      </div>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('in_store')}
                      className={`p-5 rounded-2xl border-2 text-left flex gap-4 ${
                        paymentMethod === 'in_store' ? 'border-brand-blue bg-slate-50' : 'border-gray-100 bg-white'
                      }`}
                    >
                      <StoreIcon className={`h-6 w-6 shrink-0 ${paymentMethod === 'in_store' ? 'text-brand-blue' : 'text-gray-400'}`} />
                      <div>
                        <p className="font-bold">Paiement en magasin</p>
                        <p className="text-sm text-gray-500">Payez au moment du retrait</p>
                      </div>
                    </button>
                  </div>
                </div>

                {paymentMethod === 'mobile_money' && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="space-y-6 bg-white p-6 rounded-3xl border border-gray-100"
                  >
                    <div className="space-y-3">
                      <p className="text-sm font-bold text-gray-600 uppercase tracking-wider">Opérateur</p>
                      <div className="flex gap-4">
                        {['Airtel Money', 'Moov Money'].map((op) => (
                          <button
                            key={op}
                            onClick={() => setMobileProvider(op as any)}
                            className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all ${
                              mobileProvider === op ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-100 text-gray-500'
                            }`}
                          >
                            {op}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                       <p className="text-sm font-bold text-gray-600 uppercase tracking-wider">Numéro de téléphone</p>
                       <div className="relative">
                         <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                           <span className="text-gray-400 font-bold">+241</span>
                         </div>
                          <input 
                           type="tel"
                           value={phoneNumber}
                           onChange={(e) => setPhoneNumber(e.target.value)}
                           className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl py-4 pl-16 pr-4 focus:ring-0 focus:border-brand-blue transition-all font-mono font-bold text-lg"
                           placeholder="07..."
                         />
                       </div>
                       <p className="text-xs text-gray-400 italic">Vous recevrez une demande de validation sur votre téléphone après avoir cliqué sur Valider.</p>
                    </div>
                  </motion.div>
                )}

                <div className="flex gap-4">
                  <button onClick={() => setStep(1)} className="flex-1 py-4 font-bold text-gray-500 hover:text-gray-900 transition-colors">Retour</button>
                  <button 
                    disabled={isProcessing || (paymentMethod === 'mobile_money' && phoneNumber.length < 7)}
                    onClick={handleOrder}
                    className="flex-[2] btn-primary flex items-center justify-center gap-3 h-16"
                  >
                    {isProcessing ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      'Valider ma commande'
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-6 lg:sticky lg:top-24">
            <h3 className="font-bold text-lg">Résumé de la commande</h3>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="text-sm">
                    <p className="font-bold text-gray-800 line-clamp-1">{item.name}</p>
                    <p className="text-gray-500 text-xs">x{item.quantity}</p>
                  </div>
                  <span className="font-bold text-gray-900">{formatPrice((item.isPromo ? item.promoPrice : item.price) * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="h-px bg-gray-100" />
            <div className="flex justify-between text-xl font-black">
              <span>Total</span>
              <span className="text-brand-red">{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
