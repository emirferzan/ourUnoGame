import { Card } from '../store/useGameStore';
import CardView from './Card';

export default function DiscardPile({ top }: { top?: Card }) {
  return (
    <div className="grid place-items-center">
      <div className="text-sm opacity-70 mb-2">Discard</div>
      {top ? <CardView card={top} /> : <div className="h-28 w-20 rounded-lg bg-slate-700" />}
    </div>
  );
}
