import mongoose, { Schema, type Document } from "mongoose"

// Define the Task interface
export interface ITask extends Document {
  title: string
  description: string
  platform: string
  subPlatform?: string
  status: string
  assignee: string
  dueDate: Date
  userId: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

// Define the Task schema
const TaskSchema = new Schema<ITask>({
  title: { type: String, required: true },
  description: { type: String },
  platform: { type: String, required: true },
  subPlatform: { type: String },
  status: { type: String, required: true, enum: ["todo", "in-progress", "done"] },
  assignee: { type: String, required: true },
  dueDate: { type: Date, required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

// Create and export the Task model
export default mongoose.models.Task || mongoose.model<ITask>("Task", TaskSchema)

