import mongoose, { Schema, type Document } from "mongoose"

// Define the Event interface
export interface IEvent extends Document {
  title: string
  description: string
  date: Date
  location: string
  imageUrl?: string
  createdBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

// Define the Event schema
const EventSchema = new Schema<IEvent>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  imageUrl: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: "Admin", required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

// Create and export the Event model
export default mongoose.models.Event || mongoose.model<IEvent>("Event", EventSchema)

