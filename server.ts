import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Mock Payment Webhook (Simulation for Mobile Money)
  app.post('/api/webhooks/payment', (req, res) => {
    const { orderId, status, transactionId, provider } = req.body;
    console.log(`[Payment Webhook] Order: ${orderId}, Status: ${status}, Provider: ${provider}`);
    
    // In a real app, we would update Firestore here using firebase-admin
    // For this prototype, we'll assume the client handles status polling or real-time listeners work
    
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
