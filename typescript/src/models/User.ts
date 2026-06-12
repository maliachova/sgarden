import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: string;
  lastActiveAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    username: { type: String, unique: true },
    email: { type: String, unique: true },
    password: { type: String },
    role: { type: String, default: 'user' },
    lastActiveAt: { type: Date, default: Date.now },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

const userSchemaV2 = new Schema<IUser>(
  {
    username: { type: String, unique: true },
    email: { type: String, unique: true },
    password: { type: String },
    role: { type: String, default: 'user' },
    lastActiveAt: { type: Date, default: Date.now },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

export const User = mongoose.model<IUser>('User', userSchema);
export const UserV2 = mongoose.model<IUser>('UserV2', userSchemaV2);
