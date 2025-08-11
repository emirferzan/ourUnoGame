import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import healthRouter from './routes/health';
import roomsRouter from './routes/rooms';

dotenv.config();

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

app.use('/health', healthRouter);
app.use('/rooms', roomsRouter);

export default app;
