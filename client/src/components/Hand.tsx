import { Card as TCard } from '../store/useGameStore';
import Card from './Card';

export default function Hand({ cards, onPlay }: { cards: TCard[]; onPlay: (card: TCard) => void }) {
  return (
    <div className="mt-2 p-3 rounded-xl bg-slate-900/70">
      <div className="text-sm opacity-70 mb-2">Your hand ({cards.length})</div>
      <div className="flex flex-wrap gap-2">
        {cards.map((c) => (
          <Card key={c.id} card={c} onClick={() => onPlay(c)} />
        ))}
      </div>
    </div>
  );
}
