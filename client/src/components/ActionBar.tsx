export default function ActionBar({
  canPass,
  onPass,
  onUNO,
  showUNO,
  colorNeeded,
  chosenColor,
  onChooseColor
}: {
  canPass: boolean;
  onPass: () => void;
  onUNO: () => void;
  showUNO: boolean;
  colorNeeded: boolean;
  chosenColor?: 'Red' | 'Yellow' | 'Green' | 'Blue';
  onChooseColor: (c: 'Red' | 'Yellow' | 'Green' | 'Blue') => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        className="rounded-lg bg-slate-700 hover:bg-slate-600 px-3 py-2"
        onClick={onPass}
        disabled={!canPass}
      >
        Pass
      </button>
      <button
        className={`rounded-lg px-3 py-2 ${showUNO ? 'bg-amber-500 hover:bg-amber-400' : 'bg-slate-700 opacity-70'}`}
        onClick={onUNO}
        disabled={!showUNO}
      >
        Call UNO
      </button>

      {colorNeeded && (
        <div className="ml-auto flex items-center gap-2">
          {(['Red', 'Yellow', 'Green', 'Blue'] as const).map((c) => (
            <button
              key={c}
              className={`px-3 py-2 rounded-lg border ${chosenColor === c ? 'border-white' : 'border-transparent'}`}
              onClick={() => onChooseColor(c)}
            >
              {c}
            </button>
          ))}
          <span className="text-xs opacity-70">Select color, then play a Wild</span>
        </div>
      )}
    </div>
  );
}
