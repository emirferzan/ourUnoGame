import { Card as TCard } from '../store/useGameStore';

export default function Card({ card, onClick }: { card: TCard; onClick?: () => void }) {
  const bg =
    card.color === 'Red' ? 'bg-red-600' :
    card.color === 'Yellow' ? 'bg-yellow-500' :
    card.color === 'Green' ? 'bg-green-600' :
    card.color === 'Blue' ? 'bg-blue-600' : 'bg-slate-500';

  return (
    <button
      className={`h-28 w-20 rounded-[var(--card-radius)] shadow-md border-2 border-white/20 grid place-items-center ${bg} hover:scale-105 transition`}
      onClick={onClick}
      title={`${card.color} ${card.rank}`}
    >
      <span className="text-xl font-bold text-white drop-shadow">{card.rank}</span>
    </button>
  );
}
