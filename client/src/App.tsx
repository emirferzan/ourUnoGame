import { useEffect } from 'react';
import { create } from 'zustand';
import Lobby from './pages/Lobby';
import GameRoom from './pages/GameRoom';

type Route = { name: 'lobby' } | { name: 'room'; roomId: string; playerId: string };

interface NavState {
  route: Route;
  goLobby(): void;
  goRoom(roomId: string, playerId: string): void;
}
const useNav = create<NavState>((set) => ({
  route: { name: 'lobby' },
  goLobby: () => set({ route: { name: 'lobby' } }),
  goRoom: (roomId, playerId) => set({ route: { name: 'room', roomId, playerId } })
}));

function parseHash(goRoom: (r: string, p: string) => void, goLobby: () => void) {
  const hash = location.hash.slice(1);
  const params = new URLSearchParams(hash);
  const roomId = params.get('roomId');
  const pid = params.get('playerId');
  if (roomId && pid) goRoom(roomId, pid);
  else goLobby();
}

export default function App() {
  const route = useNav((s) => s.route);
  const goRoom = useNav((s) => s.goRoom);
  const goLobby = useNav((s) => s.goLobby);

  // Parse on mount AND whenever the hash changes
  useEffect(() => {
    parseHash(goRoom, goLobby);
    const onHash = () => parseHash(goRoom, goLobby);
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [goRoom, goLobby]);

  if (route.name === 'lobby')
    return <Lobby onJoined={(r) => (location.hash = `roomId=${r.roomId}&playerId=${r.playerId}`)} />;

  return <GameRoom roomId={route.roomId} playerId={route.playerId} />;
}
