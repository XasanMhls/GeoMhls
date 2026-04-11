import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const geofenceSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    groupId: { type: Schema.Types.ObjectId, ref: 'Group', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 50 },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    radiusMeters: { type: Number, required: true, min: 50, max: 50_000, default: 500 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type GeofenceDoc = InferSchemaType<typeof geofenceSchema> & {
  _id: mongoose.Types.ObjectId;
};
export const Geofence = mongoose.model('Geofence', geofenceSchema);
