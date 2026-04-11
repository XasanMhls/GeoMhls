import { Router, type Response } from 'express';
import { z } from 'zod';
import { Geofence } from '../models/Geofence.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();
router.use(requireAuth);

const createGeofenceSchema = z.object({
  groupId: z.string().min(1),
  name: z.string().min(1).max(50).trim(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  radiusMeters: z.number().min(50).max(50_000).default(500),
});

router.get('/', async (req: AuthRequest, res: Response) => {
  const geofences = await Geofence.find({ owner: req.userId }).sort({ createdAt: -1 }).lean();
  res.json({ geofences });
});

router.post('/', validateBody(createGeofenceSchema), async (req: AuthRequest, res: Response) => {
  const { groupId, name, lat, lng, radiusMeters } = req.body;
  const geofence = await Geofence.create({ owner: req.userId, groupId, name, lat, lng, radiusMeters });
  res.json({ geofence });
});

router.patch('/:id', async (req: AuthRequest, res: Response) => {
  const geofence = await Geofence.findOne({ _id: req.params.id, owner: req.userId });
  if (!geofence) return res.status(404).json({ error: 'Geofence not found' });

  const allowed = ['name', 'lat', 'lng', 'radiusMeters', 'active'] as const;
  for (const key of allowed) {
    if (req.body[key] !== undefined) (geofence as any)[key] = req.body[key];
  }
  await geofence.save();
  res.json({ geofence });
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const geofence = await Geofence.findOneAndDelete({ _id: req.params.id, owner: req.userId });
  if (!geofence) return res.status(404).json({ error: 'Geofence not found' });
  res.json({ ok: true });
});

export default router;
