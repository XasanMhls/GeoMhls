import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const tripSchema = new Schema(
  {
    groupId: { type: Schema.Types.ObjectId, ref: 'Group', required: true, index: true },
    memberIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    headingDeg: { type: Number },
    speedMps: { type: Number },
    active: { type: Boolean, default: true },
    endedAt: { type: Date },
  },
  { timestamps: true },
);

export type TripDoc = InferSchemaType<typeof tripSchema> & { _id: mongoose.Types.ObjectId };
export const Trip = mongoose.model('Trip', tripSchema);
