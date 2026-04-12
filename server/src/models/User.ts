import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const userSettingsSchema = new Schema(
  {
    theme: { type: String, enum: ['dark', 'light'], default: 'dark' },
    language: { type: String, enum: ['uz', 'ru', 'en'], default: 'en' },
    shareLocation: { type: Boolean, default: true },
    notifications: { type: Boolean, default: true },
    freezeLocation: { type: Boolean, default: false },
  },
  { _id: false },
);

const userLocationSchema = new Schema(
  {
    lat: Number,
    lng: Number,
    accuracy: Number,
    updatedAt: Date,
  },
  { _id: false },
);

const pushSubscriptionSchema = new Schema(
  {
    endpoint: { type: String, required: true },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
  },
  { _id: false },
);

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    name: { type: String, required: true, trim: true },
    passwordHash: { type: String, default: null },
    googleId: { type: String, default: null, index: true },
    avatar: { type: String, default: null },
    status: { type: String, default: '', maxlength: 50 },
    location: { type: userLocationSchema, default: null },
    settings: { type: userSettingsSchema, default: () => ({}) },
    friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    friendRequests: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    lastSeen: { type: Date, default: Date.now },
    isOnline: { type: Boolean, default: false },
    pushSubscriptions: { type: [pushSubscriptionSchema], default: [] },
  },
  { timestamps: true },
);

export type UserDoc = InferSchemaType<typeof userSchema> & { _id: mongoose.Types.ObjectId };
export const User = mongoose.model('User', userSchema);
