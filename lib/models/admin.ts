import mongoose, { Schema, type Document } from "mongoose"

// Define the Admin interface
export interface IAdmin extends Document {
  email: string
  password: string
  name: string
  role: string
  createdAt: Date
  updatedAt: Date
}

// Define the Admin schema
const AdminSchema = new Schema<IAdmin>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, default: "admin" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

// Create and export the Admin model
export default mongoose.models.Admin || mongoose.model<IAdmin>("Admin", AdminSchema)

