import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Printer, Download, ShoppingBag, MapPin, Phone, Mail, Globe } from 'lucide-react';
import { Order, UserProfile } from '../../types';
import { formatPrice } from '../../lib/utils';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  customer: UserProfile | any; // Can be full Profile or just parts from order
}

export default function InvoiceModal({ isOpen, onClose, order, customer }: InvoiceModalProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return;
    
    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          const elements = clonedDoc.querySelectorAll('*');
          elements.forEach((el) => {
            const castEl = el as HTMLElement;
            const style = window.getComputedStyle(el);
            
            // html2canvas struggles with oklch/oklab even in styles.
            // Force common problematic styles to standard values
            if (style.color.includes('okl') || style.color.includes('var')) {
              castEl.style.color = '#1e293b'; // Default text color
            }
            if (style.backgroundColor.includes('okl') || style.backgroundColor.includes('var')) {
              // If it's the blue header, use blue hex
              if (castEl.classList.contains('bg-brand-blue')) {
                castEl.style.backgroundColor = '#0D52D6';
              } else if (castEl.classList.contains('bg-slate-900')) {
                castEl.style.backgroundColor = '#0f172a';
              } else if (castEl.classList.contains('bg-gray-50')) {
                castEl.style.backgroundColor = '#f9fafb';
              } else {
                // Keep the computed bg if it's not oklch, otherwise fallback
                const bg = style.backgroundColor;
                if (bg.includes('okl')) castEl.style.backgroundColor = 'transparent';
              }
            }
          });
        }
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: 'a4'
      });
      
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Facture_CKDO_${order.id.slice(0, 8)}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Erreur lors de la génération du PDF');
    }
  };

  const calculateSubtotal = () => {
    return order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative"
          >
            {/* Header / Actions */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-4">
                <div className="bg-brand-blue p-2 rounded-xl text-white">
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Détails de la Facture</h3>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Commande #{order.id.slice(0, 8)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={handlePrint}
                  className="p-3 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
                  title="Imprimer"
                >
                  <Printer size={16} />
                  <span className="hidden sm:inline">Imprimer</span>
                </button>
                <button 
                  onClick={handleDownloadPDF}
                  className="p-3 bg-brand-blue text-white rounded-xl hover:bg-brand-blue-dark transition-colors shadow-lg shadow-brand-blue/20 flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
                  title="Télécharger PDF"
                >
                  <Download size={16} />
                  <span className="hidden sm:inline">PDF</span>
                </button>
                <button 
                  onClick={onClose}
                  className="p-3 bg-white border border-gray-200 text-gray-400 rounded-xl hover:text-brand-red transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Scrollable Content (Invoice View) */}
            <div className="flex-1 overflow-y-auto p-1 py-10 bg-gray-100/30">
              <div 
                ref={invoiceRef}
                className="bg-white w-full max-w-[800px] mx-auto shadow-sm p-12 text-slate-800 font-sans print:shadow-none print:p-0"
              >
                {/* Invoice Header */}
                <div className="flex flex-col md:flex-row justify-between gap-10 mb-16">
                  <div className="space-y-6 max-w-sm">
                    <div className="flex items-center gap-3">
                       <div className="bg-brand-blue w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xl">
                         CK
                       </div>
                       <span className="text-3xl font-black tracking-tighter text-slate-900">CKDO.</span>
                    </div>
                    <div className="space-y-2 text-sm text-gray-500 font-medium">
                      <div className="flex items-start gap-3">
                        <MapPin size={16} className="text-brand-blue shrink-0 mt-0.5" />
                        <p>Libreville, Gabon<br />Boulevard Triomphal, Face à l'Hôtel de Ville</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone size={16} className="text-brand-blue shrink-0" />
                        <p>+241 01 76 00 00</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail size={16} className="text-brand-blue shrink-0" />
                        <p>contact@ckdo-gabon.com</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Globe size={16} className="text-brand-blue shrink-0" />
                        <p>www.ckdo-gabon.com</p>
                      </div>
                    </div>
                  </div>

                  <div className="text-right space-y-2">
                    <h1 className="text-5xl font-black text-slate-900 uppercase tracking-tighter opacity-10">FACTURE</h1>
                    <div className="space-y-1">
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest">N° de Facture</p>
                      <p className="font-bold text-slate-900 text-lg">INV-{order.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Date d'émission</p>
                      <p className="font-bold text-slate-900">
                        {order.createdAt && (order.createdAt as any).seconds 
                          ? new Date((order.createdAt as any).seconds * 1000).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
                          : new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Billing Info */}
                <div className="grid md:grid-cols-2 gap-10 mb-16">
                  <div className="space-y-3 p-6 bg-gray-50 rounded-3xl">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Facturé à</p>
                    <div className="space-y-1">
                      <p className="text-lg font-black text-slate-900 tracking-tight">{customer?.displayName || 'Client CKDO'}</p>
                      <p className="text-sm text-gray-500 font-medium">{customer?.email}</p>
                      {customer?.phoneNumber && <p className="text-sm text-gray-500 font-medium">{customer.phoneNumber}</p>}
                    </div>
                  </div>
                  <div className="space-y-3 p-6 border border-gray-100 rounded-3xl">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Détails du paiement</p>
                    <div className="space-y-1 text-right md:text-left">
                      <p className="text-sm font-bold text-slate-900">Mode: <span className="text-brand-blue uppercase">{order.paymentMethod === 'mobile_money' ? 'Airtel Money / Moov Money' : order.paymentMethod === 'card' ? 'Carte Bancaire' : 'Paiement en magasin'}</span></p>
                      <p className="text-sm font-bold text-slate-900">Statut: <span className={`uppercase ${order.status === 'paid' ? 'text-green-500' : 'text-amber-500'}`}>{order.status === 'paid' ? 'Payée' : 'En attente'}</span></p>
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="mb-16">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b-2 border-slate-900">
                        <th className="py-4 text-[10px] font-black text-slate-900 uppercase tracking-widest">Description</th>
                        <th className="py-4 px-4 text-[10px] font-black text-slate-900 uppercase tracking-widest text-center">Qté</th>
                        <th className="py-4 px-4 text-[10px] font-black text-slate-900 uppercase tracking-widest text-right">Prix Unitaire</th>
                        <th className="py-4 text-[10px] font-black text-slate-900 uppercase tracking-widest text-right">Montant</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {order.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-6">
                            <p className="font-bold text-slate-900">{item.name}</p>
                          </td>
                          <td className="py-6 px-4 text-center font-bold text-slate-900">{item.quantity}</td>
                          <td className="py-6 px-4 text-right font-medium text-slate-600">{formatPrice(item.price)}</td>
                          <td className="py-6 text-right font-black text-slate-900">{formatPrice(item.price * item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Footer / Total */}
                <div className="flex flex-col md:flex-row justify-between gap-10">
                  <div className="max-w-xs space-y-4">
                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Notes & Conditions</p>
                    <p className="text-xs text-gray-400 leading-relaxed font-medium">
                      Cette facture tient lieu de preuve d'achat. Toute réclamation doit être faite dans les 24h suivant le retrait de la marchandise. Merci d'avoir choisi CKDO pour vos courses.
                    </p>
                  </div>
                  
                  <div className="w-full md:w-72 space-y-4">
                    <div className="bg-slate-900 text-white p-8 rounded-3xl space-y-6">
                      <div className="space-y-3">
                        <div className="flex justify-between text-xs font-bold text-white/60 uppercase tracking-widest">
                          <span>Sous-total</span>
                          <span>{formatPrice(calculateSubtotal())}</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold text-white/60 uppercase tracking-widest">
                          <span>Click & Collect</span>
                          <span className="text-emerald-400">Gratuit</span>
                        </div>
                      </div>
                      <div className="h-px bg-white/10" />
                      <div className="flex justify-between items-end">
                        <p className="text-sm font-black uppercase tracking-tighter">Total à payer</p>
                        <p className="text-3xl font-black tracking-tighter">{formatPrice(order.totalAmount)}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Legal / Bottom */}
                <div className="mt-20 pt-10 border-t border-gray-100 text-center">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">CKDO GABON - SA au capital de 100.000.000 CFA - RCCM 000000 - NIF 000000</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
