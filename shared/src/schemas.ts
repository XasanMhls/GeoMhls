import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(100),
  name: z.string().min(1).max(50).trim(),
  username: z.string().min(3).max(20).regex(/^[a-z0-9_]+$/, 'Only a-z, 0-9, _').toLowerCase(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(50).trim().optional(),
  status: z.string().max(50).optional(),
  avatar: z.string().url().optional(),
  settings: z
    .object({
      shareLocation: z.boolean().optional(),
      ghostMode: z.boolean().optional(),
      notifications: z.boolean().optional(),
      theme: z.enum(['dark', 'light', 'system']).optional(),
      language: z.enum(['en', 'ru', 'uz']).optional(),
    })
    .optional(),
});

export const createGroupSchema = z.object({
  name: z.string().min(1).max(30).trim(),
  emoji: z.string().min(1).max(8),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
});

export const updateGroupSchema = z.object({
  name: z.string().min(1).max(30).trim().optional(),
  emoji: z.string().min(1).max(8).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

export const joinGroupSchema = z.object({
  inviteCode: z.string().length(6),
});

export const sendMessageSchema = z.object({
  groupId: z.string().min(1),
  text: z.string().min(1).max(1000),
});

export const sendDmSchema = z.object({
  friendId: z.string().min(1),
  text: z.string().min(1).max(1000),
  type: z.enum(['text', 'blast']).default('text'),
});

export const locationUpdateSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  accuracy: z.number().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateGroupInput = z.infer<typeof createGroupSchema>;
