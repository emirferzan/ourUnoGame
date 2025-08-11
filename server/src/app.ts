import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import healthRouter from './routes/health';
import roomsRouter from './routes/rooms';

dotenv.config();

const app = express();
const isProd = process.env.NODE_ENV === 'production';

// In dev, allow Vite origin; in prod (same-origin) you don't need CORS
if (!isProd) {
  app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
}

app.use(express.json());

// API routes
app.use('/health', healthRouter);
app.use('/rooms', roomsRouter);

// --- serve React build in prod ---
if (isProd) {
  const clientDist = path.resolve(__dirname, '../../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

export default app;
