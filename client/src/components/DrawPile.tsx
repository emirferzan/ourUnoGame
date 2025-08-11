export default function DrawPile({ onDraw, disabled, count }: { onDraw: () => void; disabled: boolean; count: number }) {
  return (
    <div className="grid place-items-center">
      <div className="text-sm opacity-70 mb-2">Draw ({count})</div>
      <button
        className="h-28 w-20 rounded-[var(--card-radius)] bg-slate-700 hover:bg-slate-600 border-2 border-white/20"
        onClick={onDraw}
        disabled={disabled}
      />
    </div>
  );
}
