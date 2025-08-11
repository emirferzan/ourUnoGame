import { useState } from 'react';
import { useGameStore } from '../store/useGameStore';

const SERVER = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

export default function Lobby({ onJoined }: { onJoined: (r: { roomId: string; playerId: string }) => void }) {
  const [name, setName] = useState('');
  const [roomId, setRoomId] = useState('');
  const saveIds = useGameStore((s) => s.setIds);

  async function createRoom() {
    const res = await fetch(`${SERVER}/rooms`, { method: 'POST' });
    const { roomId } = await res.json();

    // join the room
    await joinRoom(roomId);

    // auto-start the game (adds a bot if <2 humans)
    await fetch(`${SERVER}/rooms/${roomId}/start`, { method: 'POST' });
}

  async function joinRoom(roomIdVal?: string) {
    const rid = roomIdVal ?? roomId;
    const res = await fetch(`${SERVER}/rooms/${rid}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name || 'Player' })
    });
    const data = await res.json();
    saveIds(data.roomId, data.playerId);
    onJoined(data);
  }

  async function startGame() {
    const rid = roomId.trim();
    if (!rid) return;
    await fetch(`${SERVER}/rooms/${rid}/start`, { method: 'POST' });
  }

  return (
    <div className="max-w-lg mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">UNO MVP</h1>
      <div className="space-y-2">
        <label className="block text-sm">Display name</label>
        <input
          className="w-full rounded-lg bg-slate-800 p-2 outline-none"
          placeholder="e.g., Emir"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="rounded-xl bg-slate-900 p-4 space-y-3">
        <button
          className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-500 p-2 font-medium"
          onClick={createRoom}
        >
          Create Room
        </button>
      </div>

      <div className="rounded-xl bg-slate-900 p-4 space-y-3">
        <label className="block text-sm">Join existing room</label>
        <input
          className="w-full rounded-lg bg-slate-800 p-2 outline-none"
          placeholder="Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />
        <div className="flex gap-2">
          <button
            className="flex-1 rounded-lg bg-blue-600 hover:bg-blue-500 p-2 font-medium"
            onClick={() => joinRoom()}
          >
            Join
          </button>
          <button
            className="rounded-lg bg-slate-700 hover:bg-slate-600 p-2"
            onClick={startGame}
            title="(Optional) Start if room already exists"
          >
            Start
          </button>
        </div>
      </div>

      <p className="text-xs opacity-70">
        Tip: open multiple tabs and join the same room ID to play hot-seat.
      </p>
    </div>
  );
}
