import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Task } from "@/models/Task";

type Context = { params: Promise<{ id: string }> };
export async function PATCH(request: Request, context: Context) { try { const { id } = await context.params; const body = await request.json(); await connectToDatabase(); const task = await Task.findByIdAndUpdate(id, { $set: { title: body.title, completed: body.completed } }, { new: true, runValidators: true }); if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 }); return NextResponse.json({ task }); } catch (error) { return NextResponse.json({ error: "Unable to update task", details: String(error) }, { status: 500 }); } }
export async function DELETE(_request: Request, context: Context) { try { const { id } = await context.params; await connectToDatabase(); const task = await Task.findByIdAndDelete(id); if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 }); return NextResponse.json({ message: "Task deleted" }); } catch (error) { return NextResponse.json({ error: "Unable to delete task", details: String(error) }, { status: 500 }); } }