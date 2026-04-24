import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, ShieldCheck, Truck, RefreshCw, ChevronRight, Heart } from 'lucide-react';
import { formatPrice } from '../lib/utils';
import { motion } from 'motion/react';
import { MOCK_PRODUCTS } from '../constants/products';
import { db } from '../lib/firebase';
import { doc, getDoc, collection, getDocs, query, where, arrayUnion, arrayRemove, updateDoc } from 'firebase/firestore';
import { UserProfile } from '../types';

import AIAssistant from '../components/AIAssistant';
import AIRecommendations from '../components/AIRecommendations';

export default function ProductDetail({ 
  onAddToCart, 
  user, 
  catalog 
}: { 
  onAddToCart: (p: any) => void; 
  user: UserProfile | null;
  catalog: any[];
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (user && id) {
      setIsFavorite(user.favorites?.includes(id) || false);
    }
  }, [user, id]);

  const toggleFavorite = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!id) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      if (isFavorite) {
        await updateDoc(userRef, {
          favorites: arrayRemove(id)
        });
      } else {
        await updateDoc(userRef, {
          favorites: arrayUnion(id)
        });
      }
      setIsFavorite(!isFavorite);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      window.scrollTo(0, 0);
      try {
        // Try Firestore first
        const docRef = doc(db, 'produits', id || '');
        const docSnap = await getDoc(docRef);

        let currentProduct = null;
        if (docSnap.exists()) {
          currentProduct = { id: docSnap.id, ...docSnap.data() };
        } else {
          // Try Mock
          currentProduct = MOCK_PRODUCTS.find(p => p.id === id);
        }

        if (currentProduct) {
          setProduct(currentProduct);
          // Fetch related
          const q = query(
            collection(db, 'produits'), 
            where('category', '==', currentProduct.category)
          );
          const relatedSnap = await getDocs(q);
          const relatedDocs = relatedSnap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .filter(p => p.id !== currentProduct.id);
          
          if (relatedDocs.length > 0) {
            setRelatedProducts(relatedDocs);
          } else {
            setRelatedProducts(MOCK_PRODUCTS.filter(p => p.category === currentProduct.category && p.id !== currentProduct.id));
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  if (loading) return <div className="py-20 text-center text-gray-500">Chargement...</div>;
  if (!product) return <div className="py-20 text-center text-app-text text-xl font-bold">Produit non trouvé</div>;

  return (
    <div className="container mx-auto px-4 py-8 lg:py-12 space-y-16 bg-app-background min-h-screen">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-gray-500 hover:text-brand-blue font-bold transition-colors group"
      >
        <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
        Retour au catalogue
      </button>

      <div className="grid lg:grid-cols-2 gap-12 xl:gap-20">
        {/* Gallery */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card-bg rounded-3xl overflow-hidden border border-border-subtle shadow-xl"
        >
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="w-full aspect-square object-cover"
            referrerPolicy="no-referrer"
          />
        </motion.div>

        {/* Info */}
        <div className="space-y-10">
          <div className="space-y-4">
            <span className="px-4 py-1.5 bg-brand-blue/10 text-brand-blue rounded-full text-xs font-black uppercase tracking-widest border border-brand-blue/20">
              {product.category}
            </span>
            <h1 className="text-4xl lg:text-5xl font-black text-app-text leading-tight uppercase tracking-tighter">
              {product.name}
            </h1>
            <div className="flex items-baseline gap-4">
               {product.isPromo ? (
                 <>
                   <span className="text-4xl font-black text-brand-red">{formatPrice(product.promoPrice)}</span>
                   <span className="text-xl text-gray-500 line-through">{formatPrice(product.price)}</span>
                 </>
               ) : (
                 <span className="text-4xl font-black text-app-text">{formatPrice(product.price)}</span>
               )}
            </div>
          </div>

          <p className="text-gray-400 text-lg leading-relaxed font-medium">
            {product.description || "Découvrez la qualité CKDO avec ce produit sélectionné avec soin pour répondre à vos besoins quotidiens. Frais, authentique et au meilleur prix au Gabon."}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button 
              onClick={() => onAddToCart(product)}
              className="flex-1 btn-primary h-16 rounded-2xl flex items-center justify-center gap-3 font-bold text-lg shadow-xl shadow-brand-blue/20"
            >
              <ShoppingCart className="h-6 w-6" />
              Ajouter au panier
            </button>
            <button 
              onClick={toggleFavorite}
              className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center transition-all ${
                isFavorite 
                ? 'bg-brand-red/10 border-brand-red text-brand-red' 
                : 'bg-card-bg border-border-subtle text-gray-400 hover:border-brand-red hover:text-brand-red'
              }`}
            >
              <Heart className={`h-6 w-6 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-10 border-t border-border-subtle">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-10 w-10 text-brand-green shrink-0" />
              <div>
                <p className="font-bold text-sm text-app-text">Qualité Garantie</p>
                <p className="text-xs text-gray-500">Sélection strict</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Truck className="h-10 w-10 text-brand-blue shrink-0" />
              <div>
                <p className="font-bold text-sm text-app-text">Click & Collect</p>
                <p className="text-xs text-gray-500">Rapide et gratuit</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <RefreshCw className="h-10 w-10 text-brand-red shrink-0" />
              <div>
                <p className="font-bold text-sm text-app-text">Retour facile</p>
                <p className="text-xs text-gray-500">Sous 24h</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Same Rayon Section */}
      {relatedProducts.length > 0 && (
        <section className="space-y-8 pt-12 border-t border-border-subtle">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-black text-app-text">Dans le même rayon</h2>
              <p className="text-gray-500">Découvrez d'autres marques et formats disponibles</p>
            </div>
            <Link to="/products" className="text-brand-blue font-bold flex items-center gap-1 hover:underline">
              Tout voir <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.slice(0, 4).map((rp) => (
              <Link 
                key={rp.id} 
                to={`/product/${rp.id}`}
                className="group space-y-4"
              >
                <div className="bg-card-bg rounded-3xl overflow-hidden border border-border-subtle shadow-sm aspect-square group-hover:shadow-lg transition-all">
                  <img 
                    src={rp.imageUrl} 
                    alt={rp.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-app-text line-clamp-2 min-h-[40px]">{rp.name}</h3>
                  <p className="font-black text-brand-blue">{formatPrice(rp.isPromo ? rp.promoPrice : rp.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* AI Recommendations */}
      <AIRecommendations 
        currentCart={[]} 
        userId={user?.uid} 
        catalog={catalog} 
        onAddToCart={onAddToCart}
        title="Vous pourriez aussi aimer..."
      />
    </div>
  );
}
