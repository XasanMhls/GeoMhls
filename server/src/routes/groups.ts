import { Router, type Response } from 'express';
import { createGroupSchema, joinGroupSchema, updateGroupSchema } from '@geomhls/shared';
import { Group } from '../models/Group.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { generateInviteCode } from '../utils/invite.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req: AuthRequest, res: Response) => {
  const groups = await Group.find({ 'members.user': req.userId })
    .populate('members.user', 'name email avatar status location isOnline lastSeen')
    .sort({ updatedAt: -1 });
  res.json({ groups });
});

router.post('/', validateBody(createGroupSchema), async (req: AuthRequest, res: Response) => {
  const { name, emoji, color } = req.body;

  let inviteCode = generateInviteCode();
  for (let i = 0; i < 5; i++) {
    const exists = await Group.exists({ inviteCode });
    if (!exists) break;
    inviteCode = generateInviteCode();
  }

  const group = await Group.create({
    name,
    emoji,
    color,
    inviteCode,
    owner: req.userId,
    members: [{ user: req.userId, role: 'admin' }],
  });

  const populated = await group.populate(
    'members.user',
    'name email avatar status location isOnline lastSeen',
  );
  res.json({ group: populated });
});

router.post('/join', validateBody(joinGroupSchema), async (req: AuthRequest, res: Response) => {
  const { inviteCode } = req.body;
  const group = await Group.findOne({ inviteCode: inviteCode.toUpperCase() });
  if (!group) return res.status(404).json({ error: 'Invalid invite code' });

  const already = group.members.some((m: any) => String(m.user) === req.userId);
  if (!already) {
    group.members.push({ user: req.userId as any, role: 'member', joinedAt: new Date() });
    await group.save();
  }

  const populated = await group.populate(
    'members.user',
    'name email avatar status location isOnline lastSeen',
  );
  res.json({ group: populated });
});

router.patch('/:id', validateBody(updateGroupSchema), async (req: AuthRequest, res: Response) => {
  const group = await Group.findOne({ _id: req.params.id, owner: req.userId });
  if (!group) return res.status(404).json({ error: 'Group not found' });

  if (req.body.name !== undefined) group.name = req.body.name;
  if (req.body.emoji !== undefined) group.emoji = req.body.emoji;
  if (req.body.color !== undefined) group.color = req.body.color;
  await group.save();

  const populated = await group.populate(
    'members.user',
    'name email avatar status location isOnline lastSeen',
  );
  res.json({ group: populated });
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const group = await Group.findOneAndDelete({ _id: req.params.id, owner: req.userId });
  if (!group) return res.status(404).json({ error: 'Group not found' });
  res.json({ ok: true });
});

router.post('/:id/leave', async (req: AuthRequest, res: Response) => {
  const group = await Group.findById(req.params.id);
  if (!group) return res.status(404).json({ error: 'Group not found' });

  if (String(group.owner) === req.userId) {
    return res.status(400).json({ error: 'Owner cannot leave, delete the group instead' });
  }

  group.members = group.members.filter((m: any) => String(m.user) !== req.userId) as any;
  await group.save();
  res.json({ ok: true });
});

export default router;
