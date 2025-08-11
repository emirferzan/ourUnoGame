import type { Socket, Server } from 'socket.io';
import { Game, Player } from '../domain/types';
import { createGame, applyPlay, applyDraw, applyPass, callUno, publicize } from '../domain/game';
import { newId } from '../utils/id';
import { botStep, isBot } from '../domain/bot';

const BOT_DELAY_MS = 1000;     // normal bot think time
const UNO_GRACE_MS = 1300; 

type Room = {
  game?: Game;
  sockets: Set<Socket>;
  humans: Map<string, Player>; // playerId -> Player
  bots: Map<string, Player>;
};

class GameHub {
  rooms = new Map<string, Room>();

  ensureRoom(roomId: string) {
    if (!this.rooms.has(roomId)) this.rooms.set(roomId, { sockets: new Set(), humans: new Map(), bots: new Map() });
    return this.rooms.get(roomId)!;
  }

  createRoom(): string {
    const roomId = newId();
    this.ensureRoom(roomId);
    return roomId;
  }

  joinRoom(roomId: string, name: string): { roomId: string; playerId: string } {
    const room = this.ensureRoom(roomId);
    const playerId = newId();
    const player: Player = { id: playerId, name, hand: [], hasCalledUno: false };
    room.humans.set(playerId, player);
    return { roomId, playerId };
  }

  start(roomId: string) {
    const room = this.ensureRoom(roomId);
    // auto-add a bot if fewer than 2 players
    if (room.humans.size < 2) {
      const bot: Player = { id: newId(), name: 'Bot', hand: [], hasCalledUno: false, isBot: true };
      room.bots.set(bot.id, bot);
    }
    const players = [...room.humans.values(), ...room.bots.values()];
    if (players.length < 2) throw new Error('Need at least 2 players to start');
    room.game = createGame(roomId, players);
    this.broadcast(roomId);
    // if bot starts, step
    this.maybeBot(roomId);
  }

  attachSocket(roomId: string, socket: Socket, playerId: string) {
    const room = this.ensureRoom(roomId);
    room.sockets.add(socket);
    socket.join(roomId);

    socket.on('disconnect', () => {
      room.sockets.delete(socket);
    });

    // send current state to this socket
    if (room.game) {
      const you = room.game.players.find((p) => p.id === playerId);
      socket.emit('state', { game: publicize(room.game, playerId), you });
    } else {
      // no game yet — still lobby
      socket.emit('state', {
        game: {
          id: roomId,
          players: [...room.humans.values(), ...room.bots.values()],
          currentIndex: 0,
          direction: 1,
          drawPile: [],
          discardPile: [],
          currentColor: 'Red',
          pendingDraw: 0,
          mustChooseColor: false,
          status: 'Lobby'
        }
      });
    }
  }

  play(roomId: string, playerId: string, cardId: string, chosenColor?: 'Red'|'Yellow'|'Green'|'Blue') {
    const room = this.ensureRoom(roomId);
    if (!room.game) throw new Error('Game not started');
    room.game = applyPlay(room.game, playerId, cardId, chosenColor);
    this.broadcast(roomId);
    this.maybeBot(roomId);
  }

  draw(roomId: string, playerId: string) {
    const room = this.ensureRoom(roomId);
    if (!room.game) throw new Error('Game not started');
    room.game = applyDraw(room.game, playerId);
    this.broadcast(roomId);
    this.maybeBot(roomId);
  }

  pass(roomId: string, playerId: string) {
    const room = this.ensureRoom(roomId);
    if (!room.game) throw new Error('Game not started');
    room.game = applyPass(room.game, playerId);
    this.broadcast(roomId);
    this.maybeBot(roomId);
  }

  callUno(roomId: string, playerId: string) {
    const room = this.ensureRoom(roomId);
    if (!room.game) throw new Error('Game not started');
    room.game = callUno(room.game, playerId);
    this.broadcast(roomId);
  }

  broadcast(roomId: string) {
    const room = this.ensureRoom(roomId);
    if (!room.game) return;
    for (const s of room.sockets) {
      const pid = this.socketPlayerId(room, s);
      const you = room.game.players.find((p) => p.id === pid);
      s.emit('state', { game: publicize(room.game, pid), you });
    }
  }

  socketPlayerId(room: Room, socket: Socket): string | undefined {
    // In this minimal build, we infer from last join payload stored on socket.
    // For simplicity, attach a field when attaching socket (outside scope). If not found, undefined.
    return (socket as any).playerId;
  }

  maybeBot(roomId: string) {
    const room = this.ensureRoom(roomId);
    if (!room.game || room.game.status !== 'InProgress') return;

    const current = room.game.players[room.game.currentIndex];
    if (!current || !isBot(current)) return;

    // If someone is at 1 card and hasn't called UNO yet, and that someone is a HUMAN,
    // give extra time before the bot acts so the human can click "UNO".
    let delay = BOT_DELAY_MS;
    const pending = room.game.unoPendingId;
    if (pending && room.humans.has(pending)) {
      delay = Math.max(delay, UNO_GRACE_MS);
    }

    setTimeout(() => {
      if (!room.game) return;
      // Still bot's turn?
      if (!isBot(room.game.players[room.game.currentIndex])) return;

      room.game = botStep(room.game);
      this.broadcast(roomId);
      this.maybeBot(roomId);
    }, delay);
  }
}

export const gameHub = new GameHub();

// Patch: store playerId on socket when joining (hooked from socket layer)
declare module 'socket.io' {
  interface Socket {
    playerId?: string;
  }
}
