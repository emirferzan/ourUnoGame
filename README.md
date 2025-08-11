# UNO MVP (React + Node + Socket.IO)

Minimal, production-shaped UNO web app. In-memory state, hot-seat multiplayer (open multiple tabs), and a simple bot. Clean TypeScript throughout.

## Features
- Lobby: create/join room, copy room ID
- Core UNO rules: colors, 0–9, Skip, Reverse, Draw2, Wild, WildDraw4
- Legal move enforcement, Wild color choose, +2/+4 stacking, reshuffle
- Call **UNO** (press **U**); humans get a short grace window, bots auto-UNO
- Realtime via Socket.IO; other players’ card identities are hidden

## Tech
- **Client:** React + Vite + TS, Zustand, Tailwind
- **Server:** Node + Express + TS, Socket.IO, Zod
- **Tests:** Jest (server domain)

## Quick Start
```bash
npm install
npm run dev


## Provenance

This repository was ported from an earlier local prototype and a scratch repo. The code was cleaned up, file-separated, and restructured into a minimal monorepo here, so the history starts fresh and focuses on the final MVP shape.
