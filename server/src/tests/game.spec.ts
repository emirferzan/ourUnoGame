import { createGame, getLegalMoves, applyPlay } from '../domain/game';
import { Player } from '../domain/types';

function mkPlayers(): Player[] {
  return [
    { id: 'A', name: 'A', hand: [], hasCalledUno: false },
    { id: 'B', name: 'B', hand: [], hasCalledUno: false }
  ];
}

test('game creates with players and a discard', () => {
  const g = createGame('room', mkPlayers());
  expect(g.players.length).toBe(2);
  expect(g.discardPile.length).toBe(1);
  expect(['Red', 'Yellow', 'Green', 'Blue', 'Wild']).toContain(g.currentColor);
});

test('legal moves exist for current player', () => {
  const g = createGame('room', mkPlayers());
  const pid = g.players[g.currentIndex].id;
  const legal = getLegalMoves(g, pid);
  expect(Array.isArray(legal)).toBe(true);
});

test('playing a legal card advances turn', () => {
  let g = createGame('room', mkPlayers());
  const player = g.players[g.currentIndex];
  const legal = getLegalMoves(g, player.id);
  const card = legal[0];
  const chosen = card.rank === 'Wild' || card.rank === 'WildDraw4' ? 'Red' : undefined;
  g = applyPlay(g, player.id, card.id, chosen);
  expect(g.players[g.currentIndex].id).not.toBe(player.id);
});
