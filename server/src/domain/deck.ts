import { Card, Color, Rank } from './types';
import { newId } from '../utils/id';

const COLORS: Color[] = ['Red', 'Yellow', 'Green', 'Blue'];

export function buildDeck(): Card[] {
  const deck: Card[] = [];

  for (const color of COLORS) {
    // One zero
    deck.push({ id: newId(), color, rank: '0' });

    // Two each of 1-9, Skip, Reverse, Draw2
    const ranks: Rank[] = ['1','2','3','4','5','6','7','8','9','Skip','Reverse','Draw2'];
    for (const r of ranks) {
      deck.push({ id: newId(), color, rank: r });
      deck.push({ id: newId(), color, rank: r });
    }
  }

  // Wilds (color 'Wild')
  for (let i = 0; i < 4; i++) deck.push({ id: newId(), color: 'Wild', rank: 'Wild' });
  for (let i = 0; i < 4; i++) deck.push({ id: newId(), color: 'Wild', rank: 'WildDraw4' });

  return shuffle(deck);
}

export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
