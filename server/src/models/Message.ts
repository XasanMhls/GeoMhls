import mongoose, { Schema, type InferSchemaType } from 'mongoose';
import { LIMITS } from '@geomhls/shared';

const messageSchema = new Schema(
  {
    group: { type: Schema.Types.ObjectId, ref: 'Group', required: true, index: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, maxlength: LIMITS.MESSAGE_MAX_LENGTH },
    readBy: { type: [{ type: Schema.Types.ObjectId, ref: 'User' }], default: [] },
  },
  { timestamps: true },
);

messageSchema.index({ group: 1, createdAt: -1 });

export type MessageDoc = InferSchemaType<typeof messageSchema> & { _id: mongoose.Types.ObjectId };
export const Message = mongoose.model('Message', messageSchema);
