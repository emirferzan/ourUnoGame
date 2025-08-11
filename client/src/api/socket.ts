import { io, Socket } from 'socket.io-client';
import { useGameStore } from '../store/useGameStore';

let socket: Socket | null = null;

export function connectSocket() {
  if (socket) return socket;

  // Use explicit URL in dev, same-origin in prod
  const base =
    (import.meta.env.VITE_SERVER_URL as string | undefined) || window.location.origin;

  socket = io(`${base}/game`, { transports: ['websocket'] });

  socket.on('state', (payload) => {
    useGameStore.getState().setState(payload);
  });
  socket.on('error', (err) => {
    console.error('server error', err);
    alert(err?.message ?? 'Server error');
  });
  return socket;
}

export function emit(event: string, data: unknown) {
  if (!socket) connectSocket();
  socket!.emit(event, data);
}

export function disconnectSocket() {
  if (!socket) return;
  try {
    socket.removeAllListeners();
    socket.disconnect();
  } finally {
    socket = null;
  }
}
