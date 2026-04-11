import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const locationHistorySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    accuracy: { type: Number },
    recordedAt: { type: Date, default: Date.now, index: true },
  },
  { versionKey: false },
);

locationHistorySchema.index({ userId: 1, recordedAt: -1 });

export type LocationHistoryDoc = InferSchemaType<typeof locationHistorySchema> & {
  _id: mongoose.Types.ObjectId;
};
export const LocationHistory = mongoose.model('LocationHistory', locationHistorySchema);
