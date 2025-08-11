import { useEffect, useMemo, useState } from 'react';
import { connectSocket, emit, disconnectSocket } from '../api/socket';
import { useGameStore, Card as TCard } from '../store/useGameStore';
import PlayersBar from '../components/PlayersBar';
import DiscardPile from '../components/DiscardPile';
import DrawPile from '../components/DrawPile';
import Hand from '../components/Hand';
import ActionBar from '../components/ActionBar';
import unoLogo from '../assets/uno-logo-2.png';
import CurrentColor from '../components/CurrentColor';

const SERVER = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';


export default function GameRoom({ roomId, playerId }: { roomId: string; playerId: string }) {
  const game = useGameStore((s) => s.game);
  const you = useGameStore((s) => s.you);
  const setIds = useGameStore((s) => s.setIds);

  const [chosenColor, setChosenColor] = useState<'Red'|'Yellow'|'Green'|'Blue'>();
  const [pendingWild, setPendingWild] = useState<string | null>(null); // cardId waiting for color

  useEffect(() => {
    setIds(roomId, playerId);
    const sock = connectSocket();
    sock.emit('join_room', { roomId, playerId });
  }, [roomId, playerId, setIds]);

  const yourTurn = useMemo(() => {
    if (!game || !you) return false;
    return game.players[game.currentIndex]?.id === you.id;
  }, [game, you]);

  const humanCount = game ? game.players.filter(p => !p.isBot).length : 0;
  const startLabel = humanCount < 2 ? 'Start vs Bot' : 'Start Game';

  function playCard(card: TCard) {
    if (!game || !you) return;
    const isWild = card.rank === 'Wild' || card.rank === 'WildDraw4';
    if (isWild && !chosenColor) {
      setPendingWild(card.id);
      return;
    }
    emit('play_card', { roomId: game.id, playerId: you.id, cardId: card.id, chosenColor });
    setChosenColor(undefined);
    setPendingWild(null);
  }
  
  async function startGame() {
    await fetch(`${SERVER}/rooms/${roomId}/start`, { method: 'POST' });
}
  
  useEffect(() => {
    if (!game || game.status !== 'Lobby') return;

    function onKey(e: KeyboardEvent) {
      if (e.key === 's' || e.key === 'S' || e.key === 'Enter') {
        e.preventDefault();
        startGame();
      }
    }

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [game?.status]);

  useEffect(() => {
    if (!game || !you) return;
    if (pendingWild && chosenColor) {
      emit('play_card', { roomId: game.id, playerId: you.id, cardId: pendingWild, chosenColor });
      setChosenColor(undefined);
      setPendingWild(null);
    }
  }, [chosenColor, pendingWild, game, you]);

  function drawCard() {
    if (!game || !you) return;
    emit('draw_card', { roomId: game.id, playerId: you.id });
  }
  function passTurn() {
    if (!game || !you) return;
    emit('pass_turn', { roomId: game.id, playerId: you.id });
  }
  function callUno() {
    if (!game || !you) return;
    emit('call_uno', { roomId: game.id, playerId: you.id });
  }

  function copyRoomId() {
    if (!game) return;
    navigator.clipboard?.writeText(game.id);
    alert('Room ID copied');
  }

  function leaveRoom() {
    disconnectSocket();              // close socket
    location.hash = '';              // triggers App to route to lobby
  }

  if (!game) return <div className="p-6">Joining room…</div>;

  return (
    <div className="bg-emerald-800 min-h-screen">
      <div className="p-4 max-w-5xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-center gap-3">
            <img
              src={unoLogo}
              alt="UNO"
              className="h-16 w-auto drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
            />
          </div>
          <div className="flex items-center gap-2 text-sm">
            <button
              className="rounded-lg bg-slate-700 hover:bg-slate-600 px-3 py-2"
              onClick={copyRoomId}
              title="Copy Room ID to share"
            >
              Copy Room ID
            </button>
            <button
              className="rounded-lg bg-slate-700 hover:bg-slate-600 px-3 py-2"
              onClick={leaveRoom}
              title="Leave this room and return to lobby"
            >
              Leave Room
            </button>
          </div>
        </div>

        <CurrentColor color={game.currentColor} direction={game.direction} />
        
        {game.status === 'Lobby' && (
          <div className="p-3 rounded-lg bg-slate-900 flex items-center justify-between" aria-live="polite">
            <div className="text-sm opacity-80">
              Waiting to start. Players joined: {humanCount}
              <span className="ml-2 text-xs opacity-70">(Press <kbd>Enter</kbd> to start)</span>
            </div>
            <button
              onClick={startGame}
              autoFocus
              className={`rounded-lg px-4 py-2 font-semibold text-white focus:outline-none focus:ring-4 ring-emerald-400
                bg-emerald-600 hover:bg-emerald-500 ${humanCount < 2 ? 'animate-glow' : ''}`}
              title={startLabel}
            >
              <span className="hidden sm:inline mr-2 animate-bounce">👉</span>
              {startLabel}
            </button>
          </div>
    )}
        <PlayersBar game={game} youId={you?.id} />

        <div className="grid grid-cols-3 gap-4 items-center">
          <DrawPile onDraw={drawCard} disabled={!yourTurn} count={game.drawPile.length} />
          <DiscardPile top={game.discardPile[game.discardPile.length - 1]} />
          <div className="text-right">
            {game.status === 'Completed' ? (
              <div className="text-emerald-400 font-semibold">Winner: {game.players.find(p => p.id === game.winnerId)?.name}</div>
            ) : (
              <div className="opacity-70 text-sm font-bold">Pending Draw: {game.pendingDraw}</div>
            )}
          </div>
        </div>

        {you && (
          <>
            <Hand cards={you.hand} onPlay={playCard} />
            <ActionBar
              canPass={false}
              onPass={passTurn}
              onUNO={callUno}
              showUNO={you.hand.length === 1 && !you.hasCalledUno}
              colorNeeded={game.mustChooseColor || !!pendingWild}
              chosenColor={chosenColor}
              onChooseColor={setChosenColor}
            />
          </>
        )}
      </div>
    </div>
  );
}
