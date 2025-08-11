import { Card, Color, Game, Player } from './types';
import { buildDeck } from './deck';
import { isLegalMove, nextIndex, ensureDrawCards, reshuffle, topDiscard } from './rules';

export function createGame(id: string, players: Player[]): Game {
  const deck = buildDeck();
  const drawPile = deck.slice();
  const discardPile: Card[] = [];

  // deal 7 each
  players.forEach((p) => (p.hand = []));
  for (let r = 0; r < 7; r++) {
    for (const p of players) {
      const c = drawPile.pop();
      if (c) p.hand.push(c);
    }
  }

  // flip first card
  while (drawPile.length) {
    const top = drawPile.pop()!;
    discardPile.push(top);
    break;
  }

  const currentColor: Color =
    discardPile[discardPile.length - 1]?.color === 'Wild'
      ? 'Wild'
      : (discardPile[discardPile.length - 1]?.color ?? 'Red');

  const game: Game = {
    id,
    players,
    currentIndex: 0,
    direction: 1,
    drawPile,
    discardPile,
    currentColor,
    pendingDraw: 0,
    mustChooseColor: discardPile[discardPile.length - 1]?.color === 'Wild',
    status: 'InProgress',
    unoPendingId: undefined
  };

  return game;
}

export function getLegalMoves(game: Game, playerId: string): Card[] {
  const player = game.players.find((p) => p.id === playerId);
  if (!player) return [];
  return player.hand.filter((c) => isLegalMove(game, player, c));
}

// NEW: apply UNO penalty if previous player didn't call by the time the next player acts
function maybeApplyUnoPenalty(game: Game) {
  if (!game.unoPendingId) return;
  const p = game.players.find((x) => x.id === game.unoPendingId);
  if (p && !p.hasCalledUno) {
    ensureDrawCards(game, 2, p);
  }
  game.unoPendingId = undefined;
}

export function applyPlay(game: Game, playerId: string, cardId: string, chosenColor?: Color): Game {
  if (game.status !== 'InProgress') throw new Error('Game not in progress');

  // Before current player acts, settle any pending UNO from the previous player
  maybeApplyUnoPenalty(game);

  const player = game.players[game.currentIndex];
  if (!player || player.id !== playerId) throw new Error('Not your turn');

  const idx = player.hand.findIndex((c) => c.id === cardId);
  if (idx === -1) throw new Error('Card not in hand');
  const card = player.hand[idx];

  if ((card.rank === 'Wild' || card.rank === 'WildDraw4') && !chosenColor) {
    throw new Error('Choose a color for Wild');
  }

  if (!getLegalMoves(game, playerId).some((c) => c.id === cardId)) {
    throw new Error('Illegal move');
  }

  const [played] = player.hand.splice(idx, 1);
  game.discardPile.push(played);

  // update color
  if (played.rank === 'Wild' || played.rank === 'WildDraw4') {
    game.currentColor = chosenColor!;
    game.mustChooseColor = false;
  } else {
    game.currentColor = played.color;
  }

  // effects
  let advance = 1;
  if (played.rank === 'Skip') advance = 2;
  if (played.rank === 'Reverse') {
    game.direction = (game.direction * -1) as 1 | -1;
    // in 2-player UNO, reverse acts like skip; our 1-step advance still passes turn
  }
  if (played.rank === 'Draw2') game.pendingDraw += 2;
  if (played.rank === 'WildDraw4') game.pendingDraw += 4;

  // win check
  if (player.hand.length === 0) {
    game.status = 'Completed';
    game.winnerId = player.id;
    return game;
  }

  // If the player now has exactly 1 card, start the UNO window
  // UNO handling: bots auto-call; humans must call before next player acts
    if (player.hand.length === 1) {
        if (player.isBot) {
        // Bots immediately "press" UNO: no penalty window for them
        player.hasCalledUno = true;
        game.unoPendingId = undefined;
    } else {
        // Humans: start the UNO window
        player.hasCalledUno = false;
        game.unoPendingId = player.id;
    }
    } else {
        // Not at 1 card: clear any pending UNO and reset flag
        player.hasCalledUno = false;
        game.unoPendingId = undefined;
    }


  // advance turn
  for (let i = 0; i < advance; i++) {
    game.currentIndex = nextIndex(game);
  }

  return game;
}

export function applyDraw(game: Game, playerId: string): Game {
  if (game.status !== 'InProgress') throw new Error('Game not in progress');

  // Next player is about to act → settle pending UNO if any
  maybeApplyUnoPenalty(game);

  const player = game.players[game.currentIndex];
  if (!player || player.id !== playerId) throw new Error('Not your turn');

  const count = Math.max(1, game.pendingDraw);
  ensureDrawCards(game, count, player);
  game.pendingDraw = 0;

  game.currentIndex = nextIndex(game);
  return game;
}

export function applyPass(game: Game, playerId: string): Game {
  if (game.status !== 'InProgress') throw new Error('Game not in progress');

  // Next player is about to act → settle pending UNO if any
  maybeApplyUnoPenalty(game);

  const player = game.players[game.currentIndex];
  if (!player || player.id !== playerId) throw new Error('Not your turn');

  const legal = getLegalMoves(game, playerId);
  if (legal.length > 0 && game.pendingDraw === 0) {
    throw new Error('Cannot pass with legal moves');
  }
  game.currentIndex = nextIndex(game);
  return game;
}

export function callUno(game: Game, playerId: string): Game {
  const player = game.players.find((p) => p.id === playerId);
  if (!player) throw new Error('Player not found');
  if (player.hand.length === 1) player.hasCalledUno = true;
  return game;
}

export function ensureCanDraw(game: Game) {
  if (game.drawPile.length === 0) reshuffle(game);
}

export function publicize(game: Game, viewerId?: string): Game {
  return {
    ...game,
    players: game.players.map((p) =>
      p.id === viewerId ? p : { ...p, hand: new Array(p.hand.length).fill({ id: 'hidden', color: 'Wild', rank: '0' as any }) }
    )
  };
}

export function playerById(game: Game, id: string): Player | undefined {
  return game.players.find((p) => p.id === id);
}

export function topCard(game: Game): Card | undefined {
  return topDiscard(game);
}
