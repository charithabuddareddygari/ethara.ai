import { readFile } from "node:fs/promises";

const initialData = {
  projects: [],
  tasks: [],
  members: [],
  notifications: [],
  verifiedAdmins: [],
  adminVerifications: [],
  memberVerifications: [],
};

let state = null;

async function ensureState() {
  if (state) return;
  try {
    const raw = await readFile(new URL("../../backend/db.json", import.meta.url), "utf-8");
    state = { ...initialData, ...JSON.parse(raw) };
  } catch {
    state = structuredClone(initialData);
  }
}

function json(statusCode, payload) {
  return {
    statusCode,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  };
}

function getPath(event) {
  const full = event.path || "";
  const idx = full.indexOf("/api/");
  if (idx < 0) return "";
  return full.slice(idx + 5);
}

function recalculateProjectStatus(projectName) {
  const project = state.projects.find((p) => p.name === projectName);
  if (!project) return;
  const taskList = state.tasks.filter((t) => t.project === projectName);
  const uniqueAssignees = new Set(
    taskList
      .map((t) => String(t.assignee ?? "").trim().toLowerCase())
      .filter((a) => a && a !== "unassigned@ethara.ai"),
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
  state.members = state.members.map((m) => {
    const email = String(m.email ?? "").toLowerCase();
    const activeTasks = state.tasks.filter(
      (t) => String(t.assignee ?? "").toLowerCase() === email && (t.status === "pending" || t.status === "in-progress"),
    ).length;
    return { ...m, tasksAssigned: activeTasks };
  });
}

function pushNotification(title, message, type) {
  state.notifications.unshift({
    id: `n${Date.now()}`,
    title,
    message,
    time: "just now",
    type,
  });
}

function getAdminEmail(event) {
  return String(event.headers?.["x-admin-email"] ?? event.headers?.["X-Admin-Email"] ?? "").trim().toLowerCase();
}

function getMemberEmail(event) {
  return String(event.headers?.["x-member-email"] ?? event.headers?.["X-Member-Email"] ?? "").trim().toLowerCase();
}

function parseBody(event) {
  try {
    return event.body ? JSON.parse(event.body) : {};
  } catch {
    return {};
  }
}

export async function handler(event) {
  await ensureState();
  const method = event.httpMethod || "GET";
  const path = getPath(event);

  if (method === "GET" && path === "health") return json(200, { ok: true, service: "ethara-netlify-functions" });
  if (method === "GET" && path === "workspace") return json(200, state);

  if (method === "GET" && path === "member/status") {
    const email = String(event.queryStringParameters?.email ?? "").trim().toLowerCase();
    if (!email) return json(400, { error: "Email is required" });
    const member = state.members.find((m) => m.email?.toLowerCase() === email);
    return json(200, { email, exists: Boolean(member), verified: Boolean(member?.verified) });
  }

  if (method === "POST" && path === "member/send-verification") {
    const body = parseBody(event);
    const email = String(body.email ?? "").trim().toLowerCase();
    if (!email) return json(400, { error: "Email is required" });
    const member = state.members.find((m) => m.email?.toLowerCase() === email);
    if (!member) return json(404, { error: "Member not found" });
    const code = `${Math.floor(100000 + Math.random() * 900000)}`;
    state.memberVerifications = state.memberVerifications.filter((v) => v.email !== email);
    state.memberVerifications.push({ email, code, createdAt: Date.now(), expiresAt: Date.now() + 24 * 60 * 60 * 1000 });
    pushNotification("Member verification code", `Verification code for ${email}: ${code} (simulated email).`, "team");
    return json(200, { ok: true });
  }

  if (method === "POST" && path === "member/verify") {
    const body = parseBody(event);
    const email = String(body.email ?? "").trim().toLowerCase();
    const code = String(body.code ?? "").trim();
    const rec = state.memberVerifications.find((v) => v.email === email && v.code === code);
    if (!rec) return json(400, { error: "Invalid verification code" });
    if (Date.now() > Number(rec.expiresAt ?? 0)) return json(400, { error: "Verification code expired. Please request a new code." });
    const idx = state.members.findIndex((m) => m.email?.toLowerCase() === email);
    if (idx < 0) return json(404, { error: "Member not found" });
    state.members[idx] = { ...state.members[idx], verified: true };
    state.memberVerifications = state.memberVerifications.filter((v) => v.email !== email);
    return json(200, { ok: true, verified: true });
  }

  if (method === "POST" && path === "projects") {
    if (!getAdminEmail(event)) return json(401, { error: "Admin email header missing" });
    const body = parseBody(event);
    if (!String(body.name ?? "").trim()) return json(400, { error: "Project name is required" });
    const project = {
      id: `p${Date.now()}`,
      name: String(body.name).trim(),
      description: String(body.description ?? "").trim(),
      dueDate: body.dueDate ?? new Date().toISOString().slice(0, 10),
      members: 0,
      progress: 0,
      status: "active",
    };
    state.projects.unshift(project);
    pushNotification("Project created", `${project.name} has been created.`, "team");
    return json(201, project);
  }

  if (method === "POST" && path === "tasks") {
    if (!getAdminEmail(event)) return json(401, { error: "Admin email header missing" });
    const body = parseBody(event);
    if (!String(body.title ?? "").trim()) return json(400, { error: "Task title is required" });
    const task = {
      id: `t${Date.now()}`,
      title: String(body.title).trim(),
      project: body.project ?? "General",
      assignee: String(body.assignee ?? "unassigned@ethara.ai").toLowerCase(),
      priority: body.priority ?? "medium",
      dueDate: body.dueDate ?? new Date().toISOString().slice(0, 10),
      status: "pending",
    };
    state.tasks.unshift(task);
    recalculateProjectStatus(task.project);
    recalculateMemberTaskStats();
    pushNotification("Task assigned", `${task.assignee} assigned: ${task.title}`, "task");
    return json(201, task);
  }

  if (method === "PATCH" && /^tasks\/[^/]+\/status$/.test(path)) {
    if (!getAdminEmail(event)) return json(401, { error: "Admin email header missing" });
    const id = path.split("/")[1];
    const idx = state.tasks.findIndex((t) => t.id === id);
    if (idx < 0) return json(404, { error: "Task not found" });
    const body = parseBody(event);
    state.tasks[idx] = { ...state.tasks[idx], status: body.status ?? state.tasks[idx].status };
    recalculateProjectStatus(state.tasks[idx].project);
    recalculateMemberTaskStats();
    return json(200, state.tasks[idx]);
  }

  if (method === "PATCH" && /^my\/tasks\/[^/]+\/status$/.test(path)) {
    const memberEmail = getMemberEmail(event);
    if (!memberEmail) return json(401, { error: "Member email header missing" });
    const id = path.split("/")[2];
    const idx = state.tasks.findIndex((t) => t.id === id);
    if (idx < 0) return json(404, { error: "Task not found" });
    if (String(state.tasks[idx].assignee ?? "").toLowerCase() !== memberEmail) return json(403, { error: "You are not assigned to this task" });
    const body = parseBody(event);
    state.tasks[idx] = { ...state.tasks[idx], status: body.status ?? state.tasks[idx].status };
    recalculateProjectStatus(state.tasks[idx].project);
    recalculateMemberTaskStats();
    pushNotification("Task status updated", `${memberEmail} marked "${state.tasks[idx].title}" as ${state.tasks[idx].status}.`, "task");
    return json(200, state.tasks[idx]);
  }

  if (method === "POST" && path === "members") {
    if (!getAdminEmail(event)) return json(401, { error: "Admin email header missing" });
    const body = parseBody(event);
    if (!String(body.name ?? "").trim() || !String(body.email ?? "").trim()) return json(400, { error: "Name and email are required" });
    const member = {
      id: `m${Date.now()}`,
      name: String(body.name).trim(),
      email: String(body.email).trim().toLowerCase(),
      role: "member",
      tasksAssigned: 0,
      verified: false,
    };
    state.members.unshift(member);
    return json(201, member);
  }

  if (method === "DELETE" && /^notifications\/[^/]+$/.test(path)) {
    const id = path.split("/")[1];
    state.notifications = state.notifications.filter((n) => n.id !== id);
    return { statusCode: 204, body: "" };
  }

  if (method === "OPTIONS") return { statusCode: 204, body: "" };
  return json(404, { error: `Route not found: ${method} /api/${path}` });
}
