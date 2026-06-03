import mongoose, { Schema, type Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone?: string;
  country?: string;
  state?: string;
  city?: string;
  role: "ADMIN" | "USER";
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    phone: { type: String },
    country: { type: String },
    state: { type: String },
    city: { type: String },
    role: { type: String, enum: ["ADMIN", "USER"], default: "USER" },
    refreshToken: { type: String },
  },
  { timestamps: true },
);

export const User = mongoose.model<IUser>("User", userSchema);
