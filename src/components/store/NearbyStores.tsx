import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Info } from 'lucide-react';
import { motion } from 'motion/react';
import { Store } from '../../types';
import { storeService } from '../../services/storeService';

// Haversine formula to calculate distance in km
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function NearbyStores() {
  const [stores, setStores] = useState<Store[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Get User Location
    if (!navigator.geolocation) {
      setError("La géolocalisation n'est pas supportée par votre navigateur.");
      setLoading(false);
      return;
    }

    const geoId = navigator.geolocation.watchPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLoading(false);
      },
      (err) => {
        setError("Impossible de récupérer votre position. Vérifiez vos autorisations.");
        setLoading(false);
      },
      { enableHighAccuracy: true }
    );

    // 2. Subscribe to Stores
    const unsubscribe = storeService.subscribeToStores((data) => {
      setStores(data);
    });

    return () => {
      navigator.geolocation.clearWatch(geoId);
      unsubscribe();
    };
  }, []);

  const storesWithDistance = stores
    .filter(s => s.location)
    .map(s => ({
      ...s,
      distance: userLocation ? calculateDistance(userLocation.lat, userLocation.lng, s.location!.lat, s.location!.lng) : Infinity
    }))
    .sort((a, b) => (a.distance || 0) - (b.distance || 0));

  if (loading) return (
    <div className="bg-card-bg p-6 rounded-3xl border border-border-subtle animate-pulse space-y-4">
      <div className="h-6 w-1/2 bg-app-background rounded-lg" />
      <div className="h-20 w-full bg-app-background rounded-2xl" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black flex items-center gap-2">
          <MapPin className="h-5 w-5 text-brand-blue" /> Magasins à proximité
        </h3>
        {userLocation && (
          <span className="text-[10px] font-black uppercase text-brand-green bg-brand-green/10 px-2 py-1 rounded-lg flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
            Position Live
          </span>
        )}
      </div>

      {error ? (
        <div className="bg-red-50 p-4 rounded-2xl border border-red-100 flex items-start gap-3">
          <Info className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-600 font-bold">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {storesWithDistance.length === 0 && (
            <p className="text-gray-400 text-sm italic py-4">Aucun magasin CKDO trouvé pour le moment.</p>
          )}
          {storesWithDistance.map((s) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={s.id} 
              className="bg-card-bg p-5 rounded-[2rem] border border-border-subtle hover:border-brand-blue/30 transition-all shadow-sm group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-app-text group-hover:text-brand-blue transition-colors">{s.name}</h4>
                  <p className="text-xs text-gray-500 mt-1">{s.address}, {s.city}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-brand-blue">
                    {s.distance === Infinity ? '--' : `${s.distance.toFixed(1)} km`}
                  </p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Distance</p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-border-subtle flex justify-between items-center">
                <span className="text-[10px] font-bold text-gray-400 truncate max-w-[150px]">Ouvert 08:00 - 20:00</span>
                <button className="bg-brand-blue/5 text-brand-blue p-2 rounded-xl hover:bg-brand-blue hover:text-white transition-all">
                  <Navigation className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
