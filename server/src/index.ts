import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import { wireGameSocket } from './sockets/gameSocket';

const PORT = Number(process.env.PORT || 3001);
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

wireGameSocket(io);

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
