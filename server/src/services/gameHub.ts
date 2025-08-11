import type { Socket } from 'socket.io';
import { Game, Player } from '../domain/types';
import {
  createGame,
  applyPlay,
  applyDraw,
  applyPass,
  callUno,
  publicize
} from '../domain/game';
import { newId } from '../utils/id';
import { botStep, isBot } from '../domain/bot';

const BOT_DELAY_MS = 1300;
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
    if (!this.rooms.has(roomId))
      this.rooms.set(roomId, {
        sockets: new Set(),
        humans: new Map(),
        bots: new Map()
      });
    return this.rooms.get(roomId)!;
  }

  createRoom(): string {
    const roomId = newId();
    this.ensureRoom(roomId);
    return roomId;
  }

  // 🔹 A: when someone joins via REST, add them and broadcast the Lobby
  joinRoom(roomId: string, name: string): { roomId: string; playerId: string } {
    const room = this.ensureRoom(roomId);

    // (optional) block late joins once game started
    if (room.game && room.game.status === 'InProgress') {
      throw new Error('Game already started. Create a new room or wait for next round.');
    }

    const playerId = newId();
    const player: Player = { id: playerId, name, hand: [], hasCalledUno: false };
    room.humans.set(playerId, player);

    // broadcast Lobby to existing sockets (so Player 1 sees Player 2 immediately)
    this.broadcast(roomId);

    return { roomId, playerId };
  }

  start(roomId: string) {
    const room = this.ensureRoom(roomId);
    // auto-add a bot if fewer than 2 players
    if (room.humans.size < 2) {
      const bot: Player = {
        id: newId(),
        name: 'Bot',
        hand: [],
        hasCalledUno: false,
        isBot: true
      };
      room.bots.set(bot.id, bot);
    }
    const players = [...room.humans.values(), ...room.bots.values()];
    if (players.length < 2) throw new Error('Need at least 2 players to start');
    room.game = createGame(roomId, players);
    this.broadcast(roomId);
    this.maybeBot(roomId);
  }

  attachSocket(roomId: string, socket: Socket, playerId: string) {
    const room = this.ensureRoom(roomId);
    room.sockets.add(socket);
    socket.join(roomId);

    // 🔹 B: remember who this socket is (so broadcasts can personalize "you")
    (socket as any).playerId = playerId;

    socket.on('disconnect', () => {
      room.sockets.delete(socket);
    });

    // Send current snapshot to just this socket
    if (room.game) {
      const you = room.game.players.find((p) => p.id === playerId);
      socket.emit('state', { game: publicize(room.game, playerId), you });
    } else {
      socket.emit('state', {
        game: this.makeLobbyGame(roomId),
        you: room.humans.get(playerId)
      });
    }
  }

  play(
    roomId: string,
    playerId: string,
    cardId: string,
    chosenColor?: 'Red' | 'Yellow' | 'Green' | 'Blue'
  ) {
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

  // 🔹 C: make a Lobby snapshot when there is no game yet
  private makeLobbyGame(roomId: string): Game {
    const room = this.ensureRoom(roomId);
    return {
      id: roomId,
      players: [...room.humans.values(), ...room.bots.values()],
      currentIndex: 0,
      direction: 1,
      drawPile: [],
      discardPile: [],
      currentColor: 'Red',
      pendingDraw: 0,
      mustChooseColor: false,
      status: 'Lobby',
      winnerId: undefined,
      unoPendingId: undefined
    };
  }

  // 🔹 D: always broadcast — if no game, send Lobby snapshot
  broadcast(roomId: string) {
    const room = this.ensureRoom(roomId);
    const game = room.game ?? this.makeLobbyGame(roomId);

    for (const s of room.sockets) {
      const pid = this.socketPlayerId(room, s);
      const you =
        game.status === 'InProgress'
          ? game.players.find((p) => p.id === pid)
          : room.humans.get(pid ?? ''); // in Lobby use humans map

      s.emit('state', { game: publicize(game, pid), you });
    }
  }

  socketPlayerId(_room: Room, socket: Socket): string | undefined {
    return (socket as any).playerId;
  }

  maybeBot(roomId: string) {
    const room = this.ensureRoom(roomId);
    if (!room.game || room.game.status !== 'InProgress') return;

    const current = room.game.players[room.game.currentIndex];
    if (!current || !isBot(current)) return;

    let delay = BOT_DELAY_MS;
    const pending = room.game.unoPendingId;
    if (pending && room.humans.has(pending)) {
      delay = Math.max(delay, UNO_GRACE_MS);
    }

    setTimeout(() => {
      if (!room.game) return;
      if (!isBot(room.game.players[room.game.currentIndex])) return;

      room.game = botStep(room.game);
      this.broadcast(roomId);
      this.maybeBot(roomId);
    }, delay);
  }
}

export const gameHub = new GameHub();

// keep this augmentation if you already had it
declare module 'socket.io' {
  interface Socket {
    playerId?: string;
  }
}
