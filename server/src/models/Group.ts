import mongoose, { Schema, type InferSchemaType } from 'mongoose';
import { GROUP_COLORS, GROUP_EMOJIS, LIMITS } from '@geomhls/shared';

const groupMemberSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['admin', 'member'], default: 'member' },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const groupSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: LIMITS.GROUP_NAME_MAX },
    emoji: { type: String, default: GROUP_EMOJIS[0] },
    color: { type: String, default: GROUP_COLORS[0] },
    inviteCode: { type: String, required: true, unique: true, uppercase: true, index: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: { type: [groupMemberSchema], default: [] },
  },
  { timestamps: true },
);

groupSchema.index({ 'members.user': 1 });

export type GroupDoc = InferSchemaType<typeof groupSchema> & { _id: mongoose.Types.ObjectId };
export const Group = mongoose.model('Group', groupSchema);
