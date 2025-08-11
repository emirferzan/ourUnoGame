import { useEffect, useRef, useState } from 'react';
import type { Color, TurnDirection } from '../store/useGameStore';

const textColor: Record<Color, string> = {
  Red: 'text-red-400',
  Yellow: 'text-yellow-300',
  Green: 'text-green-400',
  Blue: 'text-blue-400',
  Wild: 'text-fuchsia-400' // pick any accent you like for Wild
};

const dotBg: Record<Color, string> = {
  Red: 'bg-red-500',
  Yellow: 'bg-yellow-400',
  Green: 'bg-green-500',
  Blue: 'bg-blue-500',
  Wild: 'bg-fuchsia-400'
};

export default function CurrentColor({
  color,
  direction
}: {
  color: Color;
  direction: TurnDirection;
}) {
  const prev = useRef<Color>(color);
  const [flash, setFlash] = useState(false);

  // When the color changes, briefly animate to draw attention
  useEffect(() => {
    if (prev.current !== color) {
      setFlash(true);
      prev.current = color;
      const t = setTimeout(() => setFlash(false), 450);
      return () => clearTimeout(t);
    }
  }, [color]);

  return (
    <div className="flex items-center justify-end gap-2">
      <span className="text-sm opacity-70">Current color:</span>
      <span className={`inline-flex items-center gap-2 text-sm font-semibold ${textColor[color]}`}>
        <span className={`h-3 w-3 rounded-full ${dotBg[color]} ${flash ? 'animate-pop' : ''}`} />
        <span className={flash ? 'animate-pop' : ''}>{color}</span>
      </span>
      <span className="text-sm opacity-70">
        • Direction: {direction === 1 ? '↪' : '↩'}
      </span>
    </div>
  );
}
