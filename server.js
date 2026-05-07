import cors from "cors";
import express from "express";
import { createServer } from "node:http";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Server } from "socket.io";
import { JSONFilePreset } from "lowdb/node";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = resolve(__dirname, "db.json");
const PORT = Number(process.env.BACKEND_PORT ?? 4000);

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

const initialData = {
  projects: [],
  tasks: [],
  members: [],
  notifications: [],
  verifiedAdmins: [],
  adminVerifications: [],
  memberVerifications: [],
};

const db = await JSONFilePreset(DB_PATH, initialData);

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST", "PUT", "PATCH", "DELETE"] },
});

const notifyAll = () => {
  io.emit("workspace:update", db.data);
};

const pushNotification = (title, message, type) => {
  db.data.notifications.unshift({
    id: `n${Date.now()}`,
    title,
    message,
    time: "just now",
    type,
  });
};

const getAdminEmail = (req) => String(req.headers["x-admin-email"] ?? "").trim().toLowerCase();
const getMemberEmail = (req) => String(req.headers["x-member-email"] ?? "").trim().toLowerCase();
const isAdminVerified = (email) => db.data.verifiedAdmins.includes(email);
const isMemberVerified = (email) =>
  db.data.members.some((m) => m.email?.toLowerCase() === email.toLowerCase() && m.verified === true);
const getMember = (email) =>
  db.data.members.find((m) => m.email?.toLowerCase() === email.toLowerCase());

const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const getRecordExpiresAt = (record) => (record?.expiresAt ? Number(record.expiresAt) : Number(record?.createdAt ?? 0) + VERIFICATION_TTL_MS);
const isExpired = (record) => Date.now() > getRecordExpiresAt(record);

function requireVerifiedAdmin(req, res) {
  const adminEmail = getAdminEmail(req);
  if (!adminEmail) {
    res.status(401).json({ error: "Admin email header missing" });
    return null;
  }
  return adminEmail;
}

function recalculateProjectStatus(projectName) {
  const project = db.data.projects.find((p) => p.name === projectName);
  if (!project) return;
  const taskList = db.data.tasks.filter((t) => t.project === projectName);
  const uniqueAssignees = new Set(
    taskList
      .map((t) => String(t.assignee ?? "").trim().toLowerCase())
      .filter((assignee) => assignee && assignee !== "unassigned@ethara.ai"),
  );
  project.members = uniqueAssignees.size;
  if (taskList.length === 0) {
    project.progress = 0;
    project.status = "active";
    return;
  }
  const completed = taskList.filter((t) => t.status === "completed").length;
  const inProgress = taskList.filter((t) => t.status === "in-progress").length;
  project.progress = Math.round((completed / taskList.length) * 100);
  if (project.progress >= 100) project.status = "completed";
  else if (inProgress > 0) project.status = "active";
  else project.status = "pending";
}

function recalculateMemberTaskStats() {
  db.data.members = db.data.members.map((member) => {
    const email = String(member.email ?? "").trim().toLowerCase();
    const activeTasks = db.data.tasks.filter(
      (t) =>
        String(t.assignee ?? "").trim().toLowerCase() === email &&
        (t.status === "pending" || t.status === "in-progress"),
    ).length;
    return { ...member, tasksAssigned: activeTasks };
  });
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "ethara-realtime-backend" });
});

app.get("/api/workspace", (_req, res) => {
  res.json(db.data);
});

app.get("/api/admin/verified", (req, res) => {
  const email = String(req.query.email ?? "").trim().toLowerCase();
  if (!email) return res.status(400).json({ error: "Email is required" });
  res.json({ email, verified: isAdminVerified(email) });
});

app.post("/api/admin/send-verification", async (req, res) => {
  const email = String(req.body?.email ?? "").trim().toLowerCase();
  if (!email) return res.status(400).json({ error: "Email is required" });
  const code = `${Math.floor(100000 + Math.random() * 900000)}`;
  const createdAt = Date.now();
  const expiresAt = createdAt + VERIFICATION_TTL_MS;
  db.data.adminVerifications = db.data.adminVerifications.filter((v) => v.email !== email);
  db.data.adminVerifications.push({ email, code, createdAt, expiresAt });
  pushNotification(
    "Admin verification code",
    `Verification code for ${email}: ${code} (simulated email). Valid for 24 hours.`,
    "team",
  );
  await db.write();
  notifyAll();
  res.json({ ok: true, message: "Verification code sent (simulated)" });
});

app.post("/api/admin/verify", async (req, res) => {
  const email = String(req.body?.email ?? "").trim().toLowerCase();
  const code = String(req.body?.code ?? "").trim();
  if (!email || !code) return res.status(400).json({ error: "Email and code are required" });
  const record = db.data.adminVerifications.find((v) => v.email === email && v.code === code);
  if (!record) return res.status(400).json({ error: "Invalid verification code" });
  if (isExpired(record)) return res.status(400).json({ error: "Verification code expired. Please request a new code." });
  if (!db.data.verifiedAdmins.includes(email)) db.data.verifiedAdmins.push(email);
  db.data.adminVerifications = db.data.adminVerifications.filter((v) => v.email !== email);
  pushNotification("Admin verified", `${email} is now a verified admin.`, "team");
  await db.write();
  notifyAll();
  res.json({ ok: true, verified: true });
});

app.get("/api/member/verified", (req, res) => {
  const email = String(req.query.email ?? "").trim().toLowerCase();
  if (!email) return res.status(400).json({ error: "Email is required" });
  res.json({ email, verified: isMemberVerified(email) });
});

app.get("/api/member/status", (req, res) => {
  const email = String(req.query.email ?? "").trim().toLowerCase();
  if (!email) return res.status(400).json({ error: "Email is required" });
  const member = getMember(email);
  res.json({ email, exists: Boolean(member), verified: Boolean(member?.verified) });
});

app.post("/api/member/send-verification", async (req, res) => {
  const email = String(req.body?.email ?? "").trim().toLowerCase();
  if (!email) return res.status(400).json({ error: "Email is required" });
  const member = getMember(email);
  if (!member) return res.status(404).json({ error: "Member not found" });
  const code = `${Math.floor(100000 + Math.random() * 900000)}`;
  const createdAt = Date.now();
  const expiresAt = createdAt + VERIFICATION_TTL_MS;
  db.data.memberVerifications = db.data.memberVerifications.filter((v) => v.email !== email);
  db.data.memberVerifications.push({ email, code, createdAt, expiresAt });
  pushNotification(
    "Member verification code",
    `Verification code for ${email}: ${code} (simulated email). Valid for 24 hours.`,
    "team",
  );
  await db.write();
  notifyAll();
  res.json({ ok: true, message: "Verification code sent (simulated)" });
});

app.post("/api/member/verify", async (req, res) => {
  const email = String(req.body?.email ?? "").trim().toLowerCase();
  const code = String(req.body?.code ?? "").trim();
  if (!email || !code) return res.status(400).json({ error: "Email and code are required" });
  const record = db.data.memberVerifications.find((v) => v.email === email && v.code === code);
  if (!record) return res.status(400).json({ error: "Invalid verification code" });
  if (isExpired(record)) return res.status(400).json({ error: "Verification code expired. Please request a new code." });
  const idx = db.data.members.findIndex((m) => m.email?.toLowerCase() === email);
  if (idx < 0) return res.status(404).json({ error: "Member not found" });
  db.data.members[idx] = { ...db.data.members[idx], verified: true };
  db.data.memberVerifications = db.data.memberVerifications.filter((v) => v.email !== email);
  pushNotification("Member verified", `${email} is now a verified member.`, "team");
  await db.write();
  notifyAll();
  res.json({ ok: true, verified: true });
});

app.post("/api/projects", async (req, res) => {
  if (!requireVerifiedAdmin(req, res)) return;
  const { name, description, dueDate } = req.body ?? {};
  if (!name?.trim()) return res.status(400).json({ error: "Project name is required" });
  const project = {
    id: `p${Date.now()}`,
    name: name.trim(),
    description: description?.trim() ?? "",
    dueDate: dueDate ?? new Date().toISOString().slice(0, 10),
    members: 1,
    progress: 0,
    status: "active",
  };
  db.data.projects.unshift(project);
  pushNotification("Project created", `${project.name} has been created.`, "team");
  await db.write();
  notifyAll();
  res.status(201).json(project);
});

app.put("/api/projects/:id", async (req, res) => {
  if (!requireVerifiedAdmin(req, res)) return;
  const idx = db.data.projects.findIndex((p) => p.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: "Project not found" });
  db.data.projects[idx] = { ...db.data.projects[idx], ...req.body };
  await db.write();
  notifyAll();
  res.json(db.data.projects[idx]);
});

app.delete("/api/projects/:id", async (req, res) => {
  if (!requireVerifiedAdmin(req, res)) return;
  db.data.projects = db.data.projects.filter((p) => p.id !== req.params.id);
  pushNotification("Project deleted", "A project was removed by admin.", "team");
  await db.write();
  notifyAll();
  res.status(204).send();
});

app.post("/api/tasks", async (req, res) => {
  if (!requireVerifiedAdmin(req, res)) return;
  const { title, project, assignee, priority, dueDate } = req.body ?? {};
  if (!title?.trim()) return res.status(400).json({ error: "Task title is required" });
  const task = {
    id: `t${Date.now()}`,
    title: title.trim(),
    project: project ?? "General",
    assignee: assignee ?? "Unassigned",
    priority: priority ?? "medium",
    dueDate: dueDate ?? new Date().toISOString().slice(0, 10),
    status: "pending",
  };
  db.data.tasks.unshift(task);
  recalculateProjectStatus(task.project);
  recalculateMemberTaskStats();
  pushNotification("Task assigned", `${task.assignee} assigned: ${task.title}`, "task");
  await db.write();
  notifyAll();
  res.status(201).json(task);
});

app.patch("/api/tasks/:id/status", async (req, res) => {
  if (!requireVerifiedAdmin(req, res)) return;
  const idx = db.data.tasks.findIndex((t) => t.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: "Task not found" });
  db.data.tasks[idx] = { ...db.data.tasks[idx], status: req.body?.status ?? db.data.tasks[idx].status };
  recalculateProjectStatus(db.data.tasks[idx].project);
  recalculateMemberTaskStats();
  await db.write();
  notifyAll();
  res.json(db.data.tasks[idx]);
});

// Member can update ONLY their assigned task status (must be verified)
app.patch("/api/my/tasks/:id/status", async (req, res) => {
  const memberEmail = getMemberEmail(req);
  if (!memberEmail) return res.status(401).json({ error: "Member email header missing" });
  if (!isMemberVerified(memberEmail)) return res.status(403).json({ error: "Member email is not verified" });
  const idx = db.data.tasks.findIndex((t) => t.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: "Task not found" });
  const task = db.data.tasks[idx];
  if (String(task.assignee ?? "").trim().toLowerCase() !== memberEmail) {
    return res.status(403).json({ error: "You are not assigned to this task" });
  }
  const nextStatus = req.body?.status ?? task.status;
  db.data.tasks[idx] = { ...task, status: nextStatus };
  recalculateProjectStatus(task.project);
  recalculateMemberTaskStats();
  pushNotification("Task status updated", `${memberEmail} marked "${task.title}" as ${nextStatus}.`, "task");
  await db.write();
  notifyAll();
  res.json(db.data.tasks[idx]);
});

app.post("/api/members", async (req, res) => {
  if (!requireVerifiedAdmin(req, res)) return;
  const { name, email } = req.body ?? {};
  if (!name?.trim() || !email?.trim()) {
    return res.status(400).json({ error: "Name and email are required" });
  }
  const member = {
    id: `m${Date.now()}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    role: "member",
    tasksAssigned: 0,
    verified: false,
  };
  db.data.members.unshift(member);
  const code = `${Math.floor(100000 + Math.random() * 900000)}`;
  const createdAt = Date.now();
  const expiresAt = createdAt + VERIFICATION_TTL_MS;
  db.data.memberVerifications = db.data.memberVerifications.filter((v) => v.email !== member.email);
  db.data.memberVerifications.push({ email: member.email, code, createdAt, expiresAt });
  pushNotification(
    "Member added (verification required)",
    `${member.name} added. Verification code sent to ${member.email}: ${code} (simulated email). Valid for 24 hours.`,
    "team",
  );
  await db.write();
  notifyAll();
  res.status(201).json(member);
});

app.delete("/api/notifications/:id", async (req, res) => {
  const adminEmail = getAdminEmail(req);
  const memberEmail = getMemberEmail(req);
  if (!adminEmail && !memberEmail) return res.status(401).json({ error: "Not authenticated" });
  const id = String(req.params.id ?? "");
  const before = db.data.notifications.length;
  db.data.notifications = db.data.notifications.filter((n) => n.id !== id);
  if (db.data.notifications.length === before) return res.status(404).json({ error: "Notification not found" });
  await db.write();
  notifyAll();
  res.status(204).send();
});

app.delete("/api/members/:id", async (req, res) => {
  if (!requireVerifiedAdmin(req, res)) return;
  db.data.members = db.data.members.filter((m) => m.id !== req.params.id);
  await db.write();
  notifyAll();
  res.status(204).send();
});

io.on("connection", (socket) => {
  socket.emit("workspace:update", db.data);
});

httpServer.listen(PORT, () => {
  console.log(`Ethara backend running on http://localhost:${PORT}`);
});
