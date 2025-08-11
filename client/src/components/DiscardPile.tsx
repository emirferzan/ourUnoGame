import { Card } from '../store/useGameStore';
import { getCardImage } from '../lib/cardImages';
import CardView from './Card';

export default function DiscardPile({ top }: { top?: Card }) {
  const img = top ? getCardImage(top.color, top.rank) : undefined;

  return (
    <div className="grid place-items-center">
      <div className="text-sm opacity-70 mb-2">Discard</div>
      {top ? (
        img ? (
          <div className="h-28 w-20 rounded-[var(--card-radius)] overflow-hidden border-2 border-white/20">
            <img src={img} alt={`${top.color} ${top.rank}`} className="h-full w-full object-cover" />
          </div>
        ) : (
          <CardView card={top} />
        )
      ) : (
        <div className="h-28 w-20 rounded-lg bg-slate-700" />
      )}
    </div>
  );
}
