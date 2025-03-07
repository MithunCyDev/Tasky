import mongoose, { Schema, type Document } from "mongoose"

// Define the User interface
export interface IUser extends Document {
  name: string
  email: string
  password: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

// Define the User schema
const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

// Create and export the User model
export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema)

