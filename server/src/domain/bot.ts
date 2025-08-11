import { Game, Player } from './types';
import { getLegalMoves, applyPlay, applyDraw } from './game';

export function isBot(p: Player) {
  return !!p.isBot;
}

export function botStep(game: Game): Game {
  const player = game.players[game.currentIndex];
  if (!player || !player.isBot) return game;

  const legal = getLegalMoves(game, player.id);
  if (legal.length > 0) {
    const first = legal[0];
    const chosenColor =
      first.rank === 'Wild' || first.rank === 'WildDraw4'
        ? pickColorHeuristic(player)
        : undefined;
    return applyPlay(game, player.id, first.id, chosenColor);
  }
  return applyDraw(game, player.id);
}

function pickColorHeuristic(player: Player): 'Red' | 'Yellow' | 'Green' | 'Blue' {
  const counts = { Red: 0, Yellow: 0, Green: 0, Blue: 0 } as Record<'Red'|'Yellow'|'Green'|'Blue', number>;
  for (const c of player.hand) {
    if (c.color === 'Red' || c.color === 'Yellow' || c.color === 'Green' || c.color === 'Blue') counts[c.color]++;
  }
  return (Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]) as any;
}
