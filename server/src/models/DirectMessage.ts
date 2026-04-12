import mongoose, { Schema, type InferSchemaType } from 'mongoose';
import { LIMITS } from '@geomhls/shared';

const directMessageSchema = new Schema(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: 'DirectConversation',
      required: true,
      index: true,
    },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, maxlength: LIMITS.MESSAGE_MAX_LENGTH },
    type: { type: String, enum: ['text', 'blast'], default: 'text' },
  },
  { timestamps: true },
);

directMessageSchema.index({ conversation: 1, createdAt: -1 });

export type DirectMessageDoc = InferSchemaType<typeof directMessageSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const DirectMessage = mongoose.model('DirectMessage', directMessageSchema);
