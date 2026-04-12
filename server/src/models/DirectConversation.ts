import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const directConversationSchema = new Schema(
  {
    // user1 always has lexicographically smaller _id string — ensures unique pair
    user1: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    user2: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

directConversationSchema.index({ user1: 1, user2: 1 }, { unique: true });

export type DirectConversationDoc = InferSchemaType<typeof directConversationSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const DirectConversation = mongoose.model('DirectConversation', directConversationSchema);

/** Returns the sorted [user1Id, user2Id] pair for a given two user id strings */
export function sortedPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}
