import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import admin from 'firebase-admin';
import { generateInvoicePDF } from './server/pdfGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
// In this environment, we attempt to initialize with default credentials
// or skip if already initialized
if (admin.apps.length === 0) {
  admin.initializeApp({
    projectId: 'ckdo-e-commerce' 
  });
}

const db = admin.firestore();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // GET /api/invoices/:orderId/download
  app.get('/api/invoices/:orderId/download', async (req, res) => {
    try {
      const { orderId } = req.params;
      
      // 1. Fetch Order from Firestore
      const orderDoc = await db.collection('orders').doc(orderId).get();
      
      if (!orderDoc.exists) {
        return res.status(404).json({ error: 'Commande non trouvée' });
      }

      const orderData = orderDoc.data();
      
      // 2. Security Check (Simplified for prototype: in production use JWT verify)
      // Example: const user = await admin.auth().verifyIdToken(req.headers.authorization);
      // if (user.uid !== orderData.customerId) return res.status(403).send();

      // 3. Prepare Invoice Data
      // Generate unique number format: CKDO-YYYY-XXXXXX
      const date = new Date(orderData.createdAt);
      const year = date.getFullYear();
      const invoiceNumber = `CKDO-${year}-${orderId.slice(0, 6).toUpperCase()}`;

      const invoiceData = {
        invoiceNumber,
        date: date.toLocaleDateString('fr-FR'),
        customerName: orderData.customerName || 'Client CKDO',
        customerEmail: orderData.customerEmail || 'contact@ckdo.ga',
        items: orderData.items,
        totalAmount: orderData.totalAmount,
        paymentMethod: orderData.paymentMethod === 'mobile_money' ? 'Mobile Money' : 'Carte Bancaire'
      };

      // 4. Generate and Send PDF
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=Facture_${invoiceNumber}.pdf`);
      
      generateInvoicePDF(invoiceData, res);

    } catch (error) {
      console.error('Invoice generation error:', error);
      res.status(500).json({ error: 'Erreur lors de la génération de la facture' });
    }
  });

  // Mock Payment Webhook (Simulation for Mobile Money)
  app.post('/api/webhooks/payment', async (req, res) => {
    const { orderId, status, transactionId, provider } = req.body;
    console.log(`[Payment Webhook] Order: ${orderId}, Status: ${status}, Provider: ${provider}`);
    
    if (status === 'completed') {
       // Update Order Status in Firestore
       await db.collection('orders').doc(orderId).update({
         status: 'paid',
         paymentStatus: 'completed',
         updatedAt: new Date().toISOString()
       });

       // Trigger Invoice Record Creation (Optional: Store it in Firestore for history)
       const order = (await db.collection('orders').doc(orderId).get()).data();
       if (order) {
         const invoiceId = `inv_${orderId}`;
         await db.collection('invoices').doc(invoiceId).set({
           order_id: orderId,
           invoice_number: `CKDO-${new Date().getFullYear()}-${orderId.slice(0, 6).toUpperCase()}`,
           customer_name: order.customerName || 'Utilisateur',
           customer_email: order.customerEmail || '',
           total_amount: order.totalAmount,
           payment_method: order.paymentMethod,
           status: 'paid',
           created_at: new Date().toISOString()
         });
       }
    }
    
    res.json({ received: true });
  });

  // Example API to get stores (could be from Firestore, but useful for initial load)
  app.get('/api/config', (req, res) => {
    res.json({
      googleMapsApiKey: process.env.VITE_GOOGLE_MAPS_API_KEY || 'AIza...',
      mobileMoneyProviders: ['Airtel Money', 'Moov Money'],
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CKDO Backend running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
