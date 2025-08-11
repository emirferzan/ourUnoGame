import { Router } from 'express';
import { z } from 'zod';
import { gameHub } from '../services/gameHub';

const router = Router();

router.post('/', (_req, res) => {
  const roomId = gameHub.createRoom();
  res.json({ roomId });
});

router.post('/:roomId/join', (req, res) => {
  const schema = z.object({ name: z.string().min(1).max(30) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid name' });
  const { roomId } = req.params;
  const result = gameHub.joinRoom(roomId, parsed.data.name);
  res.json(result);
});

router.post('/:roomId/start', (req, res) => {
  const { roomId } = req.params;
  try {
    gameHub.start(roomId);
    res.json({ started: true });
  } catch (e: any) {
    res.status(400).json({ error: e?.message ?? 'Cannot start' });
  }
});

export default router;
