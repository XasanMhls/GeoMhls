import webpush from 'web-push';
import { env, vapidEnabled } from '../config/env.js';
import { User } from '../models/User.js';

if (vapidEnabled) {
  webpush.setVapidDetails(env.VAPID_SUBJECT, env.VAPID_PUBLIC_KEY, env.VAPID_PRIVATE_KEY);
}

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
}

export async function sendPushToUser(userId: string, payload: PushPayload) {
  if (!vapidEnabled) return;

  const user = await User.findById(userId).select('pushSubscriptions settings');
  if (!user || !user.settings?.notifications) return;
  if (!user.pushSubscriptions?.length) return;

  const notification = JSON.stringify(payload);
  const dead: string[] = [];

  await Promise.allSettled(
    user.pushSubscriptions.map(async (sub: any) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth } },
          notification,
        );
      } catch (err: any) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          dead.push(sub.endpoint);
        }
      }
    }),
  );

  if (dead.length) {
    await User.updateOne(
      { _id: userId },
      { $pull: { pushSubscriptions: { endpoint: { $in: dead } } } },
    );
  }
}

export async function sendPushToGroup(
  groupId: string,
  senderUserId: string,
  onlineUserIds: Set<string>,
  payload: PushPayload,
) {
  if (!vapidEnabled) return;
  const { Group } = await import('../models/Group.js');
  const group = await Group.findById(groupId).select('members');
  if (!group) return;

  const targets = group.members
    .map((m: any) => String(m.user))
    .filter((uid: string) => uid !== senderUserId && !onlineUserIds.has(uid));

  await Promise.allSettled(targets.map((uid: string) => sendPushToUser(uid, payload)));
}
