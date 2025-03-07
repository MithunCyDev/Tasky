import mongoose, { Schema, type Document } from "mongoose"

// Define the Platform interface
export interface IPlatform extends Document {
  name: string
  createdAt: Date
  updatedAt: Date
}

// Define the Platform schema
const PlatformSchema = new Schema<IPlatform>({
  name: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

// Create and export the Platform model
export default mongoose.models.Platform || mongoose.model<IPlatform>("Platform", PlatformSchema)

