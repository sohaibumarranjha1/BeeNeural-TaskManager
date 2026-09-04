"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, CheckCircle2, Circle, ClipboardList, Command, CornerDownLeft, Loader2, Pencil, Plus, Search, Sparkles, Trash2 } from "lucide-react";

type Task = { _id: string; title: string; completed: boolean; createdAt: string; updatedAt: string };

const fallbackTasks: Task[] = [
  { _id: "sample-1", title: "Shape the week with intention", completed: false, createdAt: "", updatedAt: "" },
  { _id: "sample-2", title: "Send the project kickoff note", completed: false, createdAt: "", updatedAt: "" },
  { _id: "sample-3", title: "Make room for a proper lunch", completed: true, createdAt: "", updatedAt: "" },
];

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [filter, setFilter] = useState<"all" | "open" | "done">("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    fetch("/api/tasks").then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to load tasks");
      setTasks(data.tasks ?? []);
    }).catch(() => {
      setTasks(fallbackTasks);
      setNotice("Preview mode: add your MongoDB connection to sync tasks.");
    }).finally(() => setLoading(false));
  }, []);

  async function createTask(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try { const response = await fetch("/api/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error ?? "Unable to create task"); setTasks((current) => [data.task, ...current]); setTitle(""); setNotice(""); }
    catch (error) { setNotice(error instanceof Error && error.message.includes("MONGODB_URI") ? "MongoDB is not connected yet. Add MONGODB_URI to .env.local, then restart the server." : error instanceof Error && error.message.includes("MongoDB") ? error.message : "Could not save this task yet. Check MongoDB Atlas Network Access and your credentials."); }
    finally { setSaving(false); }
  }

  async function updateTask(id: string, changes: Partial<Task>) {
    if (id.startsWith("sample")) { setTasks((current) => current.map((task) => task._id === id ? { ...task, ...changes } : task)); return; }
    const response = await fetch(`/api/tasks/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(changes) });
    const data = await response.json(); setTasks((current) => current.map((task) => task._id === id ? data.task : task));
  }

  async function deleteTask(id: string) {
    if (!id.startsWith("sample")) await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    setTasks((current) => current.filter((task) => task._id !== id));
  }

  const visibleTasks = useMemo(() => tasks.filter((task) => (filter === "all" || (filter === "open" ? !task.completed : task.completed)) && task.title.toLowerCase().includes(query.toLowerCase())), [tasks, filter, query]);
  const openCount = tasks.filter((task) => !task.completed).length;
  const completion = tasks.length ? Math.round(((tasks.length - openCount) / tasks.length) * 100) : 0;

  return (
    <main className="app-shell"><aside className="sidebar"><div className="brand"><span className="brand-mark"><Sparkles size={16} /></span><span>daymark</span></div><div className="side-label">Workspace</div><button className="side-item active"><ClipboardList size={17} /> My tasks <span className="count">{openCount}</span></button><div className="side-label later">Your rhythm</div><div className="rhythm"><div className="ring"><strong>{completion}%</strong></div><div><b>Nice momentum</b><small>Small steps count.</small></div></div><div className="sidebar-foot"><span className="avatar">SB</span><div><b>Sohaib</b><small>BeeNeural studio</small></div><button className="icon-button" aria-label="Workspace command"><Command size={16} /></button></div></aside><section className="content"><header className="topbar"><div><span className="eyebrow">Thursday, 04 September 2026</span><h1>A little lighter today.</h1></div><button className="shortcut"><Command size={14} /> K</button></header><div className="hero-line"><p>Turn the important things into done things.</p><div className="status-dot"><span /> Synced workspace</div></div><section className="composer"><div className="composer-accent" /><form onSubmit={createTask}><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="What needs your attention?" aria-label="New task title" /><button className="add-button" disabled={saving}>{saving ? <Loader2 className="spin" size={18} /> : <Plus size={18} />} Add task <CornerDownLeft size={14} /></button></form></section>{notice && <div className="notice">{notice}</div>}<div className="toolbar"><div className="tabs">{(["all", "open", "done"] as const).map((item) => <button key={item} className={filter === item ? "tab active" : "tab"} onClick={() => setFilter(item)}>{item === "all" ? "Everything" : item === "open" ? "In progress" : "Completed"}</button>)}</div><label className="search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a task" aria-label="Find a task" /></label></div><div className="task-list">{loading ? <div className="empty"><Loader2 className="spin" size={24} /><span>Gathering your day...</span></div> : visibleTasks.length ? visibleTasks.map((task, index) => <article className={task.completed ? "task completed" : "task"} key={task._id} style={{ animationDelay: `${index * 70}ms` }}><button className="check-button" onClick={() => updateTask(task._id, { completed: !task.completed })} aria-label={task.completed ? "Mark task open" : "Mark task complete"}>{task.completed ? <CheckCircle2 size={23} /> : <Circle size={23} />}</button>{editingId === task._id ? <input autoFocus className="edit-input" value={editingTitle} onChange={(event) => setEditingTitle(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { updateTask(task._id, { title: editingTitle }); setEditingId(null); } if (event.key === "Escape") setEditingId(null); }} /> : <div className="task-copy"><span>{task.title}</span><small>{task.completed ? "Completed" : "Ready when you are"}</small></div>}<div className="task-actions">{editingId === task._id ? <button className="icon-button" onClick={() => { updateTask(task._id, { title: editingTitle }); setEditingId(null); }} aria-label="Save task"><Check size={16} /></button> : <button className="icon-button" onClick={() => { setEditingId(task._id); setEditingTitle(task.title); }} aria-label="Edit task"><Pencil size={16} /></button>}<button className="icon-button danger" onClick={() => deleteTask(task._id)} aria-label="Delete task"><Trash2 size={16} /></button></div></article>) : <div className="empty"><CheckCircle2 size={28} /><strong>Nothing here yet</strong><span>Give your attention somewhere beautiful.</span></div>}</div><footer>Sohaib/BeeNeural@2026 <span>Made for focused work</span></footer></section></main>
  );
}
