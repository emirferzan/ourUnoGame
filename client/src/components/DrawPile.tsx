import { backImage } from '../lib/cardImages';

export default function DrawPile({ onDraw, disabled, count }: { onDraw: () => void; disabled: boolean; count: number }) {
  return (
    <div className="grid place-items-center">
      <div className="text-sm opacity-70 mb-2">Draw ({count})</div>
      <button
        className="h-28 w-20 rounded-[var(--card-radius)] border-2 border-white/20 overflow-hidden"
        onClick={onDraw}
        disabled={disabled}
        title="Draw"
      >
        {backImage ? (
          <img src={backImage} alt="Card back" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-slate-700" />
        )}
      </button>
    </div>
  );
}
