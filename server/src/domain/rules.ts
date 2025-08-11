import { Card, Color, Game, Player } from './types';
import { shuffle } from './deck';

export function topDiscard(game: Game): Card | undefined {
  return game.discardPile[game.discardPile.length - 1];
}

export function isLegalMove(game: Game, player: Player, card: Card): boolean {
  const top = topDiscard(game);
  if (!top) return true;
  if (game.mustChooseColor && (card.rank === 'Wild' || card.rank === 'WildDraw4')) {
    // must choose color before playing wild — block until chosen is set by client + server validation on apply
    return false;
  }
  if (game.pendingDraw > 0) {
    // Only another Draw2/WildDraw4 can be stacked (optional rule simplified)
    if (card.rank === 'Draw2' || card.rank === 'WildDraw4') return true;
    return false;
  }
  if (card.rank === 'Wild' || card.rank === 'WildDraw4') return true;
  return card.color === game.currentColor || card.rank === top.rank;
}

export function nextIndex(game: Game, from?: number): number {
  const start = typeof from === 'number' ? from : game.currentIndex;
  const n = game.players.length;
  return (start + game.direction + n) % n;
}

export function ensureDrawCards(game: Game, count: number, target: Player) {
  for (let i = 0; i < count; i++) {
    if (game.drawPile.length === 0) reshuffle(game);
    const c = game.drawPile.pop();
    if (c) target.hand.push(c);
  }
}

export function reshuffle(game: Game) {
  // move all but top discard back to draw pile
  const top = game.discardPile.pop();
  const toDraw = game.discardPile.splice(0);
  game.drawPile = shuffle(toDraw);
  if (top) game.discardPile.push(top);
}
