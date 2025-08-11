import type { Server, Socket } from 'socket.io';
import { z } from 'zod';
import { gameHub } from '../services/gameHub';

const joinSchema = z.object({ roomId: z.string(), playerId: z.string() });
const pidSchema = z.object({ roomId: z.string(), playerId: z.string() });
const playSchema = z.object({
  roomId: z.string(),
  playerId: z.string(),
  cardId: z.string(),
  chosenColor: z.enum(['Red', 'Yellow', 'Green', 'Blue']).optional()
});

export function wireGameSocket(io: Server) {
  const nsp = io.of('/game');

  nsp.on('connection', (socket: Socket) => {
    socket.on('join_room', (raw) => {
      const parsed = joinSchema.safeParse(raw);
      if (!parsed.success) return socket.emit('error', { message: 'Invalid join payload' });
      const { roomId, playerId } = parsed.data;

      try {
        (socket as any).playerId = playerId; // <— remember who you are
        gameHub.attachSocket(roomId, socket, playerId);
      } catch (e: any) {
        return socket.emit('error', { message: e?.message ?? 'Join failed' });
      }
    });

    socket.on('play_card', (raw) => {
      const parsed = playSchema.safeParse(raw);
      if (!parsed.success) return socket.emit('error', { message: 'Invalid play payload' });
      const { roomId, playerId, cardId, chosenColor } = parsed.data;
      try {
        gameHub.play(roomId, playerId, cardId, chosenColor);
      } catch (e: any) {
        socket.emit('error', { message: e?.message ?? 'Play failed' });
      }
    });

    socket.on('draw_card', (raw) => {
      const parsed = pidSchema.safeParse(raw);
      if (!parsed.success) return socket.emit('error', { message: 'Invalid draw payload' });
      const { roomId, playerId } = parsed.data;
      try {
        gameHub.draw(roomId, playerId);
      } catch (e: any) {
        socket.emit('error', { message: e?.message ?? 'Draw failed' });
      }
    });

    socket.on('pass_turn', (raw) => {
      const parsed = pidSchema.safeParse(raw);
      if (!parsed.success) return socket.emit('error', { message: 'Invalid pass payload' });
      const { roomId, playerId } = parsed.data;
      try {
        gameHub.pass(roomId, playerId);
      } catch (e: any) {
        socket.emit('error', { message: e?.message ?? 'Pass failed' });
      }
    });

    socket.on('call_uno', (raw) => {
      const parsed = pidSchema.safeParse(raw);
      if (!parsed.success) return socket.emit('error', { message: 'Invalid UNO payload' });
      const { roomId, playerId } = parsed.data;
      try {
        gameHub.callUno(roomId, playerId);
      } catch (e: any) {
        socket.emit('error', { message: e?.message ?? 'UNO failed' });
      }
    });
  });
}
