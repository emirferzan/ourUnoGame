export type Color = 'Red' | 'Yellow' | 'Green' | 'Blue' | 'Wild';
export type Rank =
  | '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
  | 'Skip' | 'Reverse' | 'Draw2' | 'Wild' | 'WildDraw4';

export interface Card { id: string; color: Color; rank: Rank; }

export interface Player {
  id: string;
  name: string;
  hand: Card[];
  hasCalledUno: boolean;
  isBot?: boolean;
}

export type TurnDirection = 1 | -1;
export type Status = 'Lobby' | 'InProgress' | 'Completed';

export interface Game {
  id: string;
  players: Player[];
  currentIndex: number;
  direction: TurnDirection;
  drawPile: Card[];
  discardPile: Card[];
  currentColor: Color;
  pendingDraw: number;
  mustChooseColor: boolean;
  status: Status;
  winnerId?: string;

  // NEW: who must have called UNO by the time the next player acts
  unoPendingId?: string;
}
