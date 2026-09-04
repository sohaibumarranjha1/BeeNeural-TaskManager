import mongoose, { Schema } from "mongoose";

export type TaskDocument = { title: string; completed: boolean; createdAt: Date; updatedAt: Date };
const taskSchema = new Schema<TaskDocument>({ title: { type: String, required: true, trim: true, maxlength: 140 }, completed: { type: Boolean, default: false } }, { timestamps: true });
export const Task = mongoose.models.Task || mongoose.model<TaskDocument>("Task", taskSchema);