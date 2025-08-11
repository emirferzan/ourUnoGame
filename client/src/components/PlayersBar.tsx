import { Game } from '../store/useGameStore';

export default function PlayersBar({ game, youId }: { game: Game; youId?: string }) {
  return (
    <div className="flex gap-2 overflow-x-auto p-2 rounded-xl bg-slate-900/70">
      {game.players.map((p, idx) => {
        const active = idx === game.currentIndex;
        const isYou = p.id === youId;
        return (
          <div
            key={p.id}
            className={`px-3 py-2 rounded-lg border ${
              active ? 'border-emerald-400' : 'border-slate-700'
            } ${isYou ? 'bg-slate-800' : 'bg-slate-900'}`}
          >
            <div className="text-sm font-semibold">
              {p.name} {isYou ? '(You)' : ''}
            </div>
            <div className="text-xs opacity-70">Cards: {p.hand.length}</div>
          </div>
        );
      })}
    </div>
  );
}
