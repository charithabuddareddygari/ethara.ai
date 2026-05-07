import { useEffect, useState } from "react";
import {
  members as initialMembers,
  notifications as initialNotifications,
  projects as initialProjects,
  tasks as initialTasks,
  type Member,
  type Notification,
  type Project,
  type Task,
} from "@/lib/mock-data";

type WorkspaceState = {
  projects: Project[];
  tasks: Task[];
  members: Member[];
  notifications: Notification[];
};

const KEY = "ethara_workspace_state_v1";
const CHANNEL = "ethara-workspace-channel";
const API_BASE = import.meta.env.VITE_BACKEND_URL ?? "";

let state: WorkspaceState = {
  projects: initialProjects,
  tasks: initialTasks,
  members: initialMembers,
  notifications: initialNotifications,
};

const listeners = new Set<() => void>();
const bc = typeof window !== "undefined" && "BroadcastChannel" in window ? new BroadcastChannel(CHANNEL) : null;
let backendConnected = false;

function uniqueById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const item of items) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    result.push(item);
  }
  return result;
}

function normalizeWorkspace(next: WorkspaceState): WorkspaceState {
  const members = uniqueById(next.members);
  const memberEmailByName = new Map(
    members.map((m) => [m.name.trim().toLowerCase(), m.email.trim().toLowerCase()]),
  );

  const tasksBySignature = new Set<string>();
  const tasks: Task[] = [];
  for (const t of uniqueById(next.tasks)) {
    const rawAssignee = String(t.assignee ?? "").trim();
    const normalizedAssignee =
      memberEmailByName.get(rawAssignee.toLowerCase()) ?? rawAssignee.toLowerCase();
    const normalizedTask: Task = { ...t, assignee: normalizedAssignee };
    const signature = [
      normalizedTask.title.trim().toLowerCase(),
      normalizedTask.project.trim().toLowerCase(),
      normalizedTask.assignee,
      normalizedTask.dueDate,
    ].join("|");
    if (tasksBySignature.has(signature)) continue;
    tasksBySignature.add(signature);
    tasks.push(normalizedTask);
  }

  return {
    projects: uniqueById(next.projects),
    tasks,
    members,
    notifications: uniqueById(next.notifications),
  };
}

function applyLocalDerivedUpdates(next: WorkspaceState): WorkspaceState {
  const projectMap = new Map(next.projects.map((p) => [p.name, { ...p }]));
  for (const [projectName, project] of projectMap.entries()) {
    const taskList = next.tasks.filter((t) => t.project === projectName);
    const completed = taskList.filter((t) => t.status === "completed").length;
    const inProgress = taskList.filter((t) => t.status === "in-progress").length;
    const uniqueAssignees = new Set(
      taskList
        .map((t) => String(t.assignee ?? "").trim().toLowerCase())
        .filter((a) => a && a !== "unassigned@ethara.ai"),
    );
    project.members = uniqueAssignees.size;
    project.progress = taskList.length === 0 ? 0 : Math.round((completed / taskList.length) * 100);
    if (project.progress >= 100) project.status = "completed";
    else if (inProgress > 0) project.status = "active";
    else project.status = taskList.length === 0 ? "active" : "pending";
  }
  const members = next.members.map((m) => {
    const email = String(m.email ?? "").trim().toLowerCase();
    const activeTasks = next.tasks.filter(
      (t) =>
        String(t.assignee ?? "").trim().toLowerCase() === email &&
        (t.status === "pending" || t.status === "in-progress"),
    ).length;
    return { ...m, tasksAssigned: activeTasks };
  });
  return { ...next, projects: [...projectMap.values()], members };
}

function readAuthFromStorage(): { role: "admin" | "member" | ""; email: string } {
  const raw = (typeof window !== "undefined" && (localStorage.getItem("ethara_auth") ?? sessionStorage.getItem("ethara_auth_session"))) || null;
  if (!raw) return { role: "", email: "" };
  try {
    const parsed = JSON.parse(raw) as { email?: string; role?: string };
    const role = parsed?.role === "admin" || parsed?.role === "member" ? parsed.role : "";
    const email = String(parsed?.email ?? "").trim().toLowerCase();
    return { role, email };
  } catch {
    return { role: "", email: "" };
  }
}

function emit() {
  listeners.forEach((l) => l());
}

function readPersistedState(): WorkspaceState {
  if (typeof window === "undefined") return state;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as WorkspaceState) : state;
  } catch {
    return state;
  }
}

function writePersistedState(next: WorkspaceState) {
  state = normalizeWorkspace(next);
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent("ethara-workspace-updated"));
    bc?.postMessage({ type: "workspace-updated" });
  }
  emit();
}

function updateState(updater: (prev: WorkspaceState) => WorkspaceState) {
  writePersistedState(updater(state));
}

async function fetchWorkspaceFromApi() {
  if (typeof window === "undefined") return;
  try {
    const res = await fetch(`${API_BASE}/api/workspace`);
    if (!res.ok) return;
    const data = (await res.json()) as WorkspaceState;
    backendConnected = true;
    writePersistedState(data);
  } catch {
    // fallback to local storage mode
  }
}

async function apiRequest(path: string, init: RequestInit) {
  const auth = readAuthFromStorage();
  const adminEmail = auth.role === "admin" ? auth.email : "";
  const memberEmail = auth.role === "member" ? auth.email : "";
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        "content-type": "application/json",
        ...(adminEmail ? { "x-admin-email": adminEmail } : {}),
        ...(memberEmail ? { "x-member-email": memberEmail } : {}),
        ...(init.headers ?? {}),
      },
    });
    if (!res.ok) throw new Error(`API ${path} failed`);
    return true;
  } catch {
    return false;
  }
}

if (typeof window !== "undefined") {
  state = readPersistedState();
  fetchWorkspaceFromApi();
  window.setInterval(() => {
    void fetchWorkspaceFromApi();
  }, 5000);
  window.addEventListener("storage", (e) => {
    if (e.key !== KEY) return;
    state = readPersistedState();
    emit();
  });
  window.addEventListener("ethara-workspace-updated", () => {
    state = readPersistedState();
    emit();
  });
  bc?.addEventListener("message", () => {
    state = readPersistedState();
    emit();
  });
}

function makeNotification(title: string, message: string, type: Notification["type"]): Notification {
  return {
    id: `n${Date.now()}`,
    title,
    message,
    time: "just now",
    type,
  };
}

export function useWorkspaceData() {
  const [, forceRender] = useState(0);

  useEffect(() => {
    const listener = () => forceRender((n) => n + 1);
    listeners.add(listener);
    return () => listeners.delete(listener);
  }, []);

  return {
    ...state,
    async createProject(input: Pick<Project, "name" | "description" | "dueDate">) {
      const ok = await apiRequest("/api/projects", {
        method: "POST",
        body: JSON.stringify(input),
      });
      if (backendConnected) {
        if (ok) {
          await fetchWorkspaceFromApi();
          return true;
        }
      }
      updateState((prev) => ({
        ...prev,
        projects: [
          {
            id: `p${Date.now()}`,
            name: input.name,
            description: input.description,
            dueDate: input.dueDate,
            members: 1,
            progress: 0,
            status: "active",
          },
          ...prev.projects,
        ],
        notifications: [
          makeNotification("Project created", `${input.name} has been created.`, "team"),
          ...prev.notifications,
        ],
      }));
      return true;
    },
    updateProject(project: Project) {
      void apiRequest(`/api/projects/${project.id}`, {
        method: "PUT",
        body: JSON.stringify(project),
      });
      if (backendConnected) return;
      updateState((prev) => ({
        ...prev,
        projects: prev.projects.map((p) => (p.id === project.id ? project : p)),
      }));
    },
    deleteProject(id: string) {
      void apiRequest(`/api/projects/${id}`, { method: "DELETE" });
      if (backendConnected) return;
      updateState((prev) => ({
        ...prev,
        projects: prev.projects.filter((p) => p.id !== id),
        notifications: [
          makeNotification("Project deleted", "A project was removed by admin.", "team"),
          ...prev.notifications,
        ],
      }));
    },
    async createTask(input: Pick<Task, "title" | "project" | "assignee" | "priority" | "dueDate">) {
      const ok = await apiRequest("/api/tasks", {
        method: "POST",
        body: JSON.stringify(input),
      });
      if (backendConnected) {
        if (ok) {
          await fetchWorkspaceFromApi();
          return true;
        }
      }
      updateState((prev) => ({
        ...applyLocalDerivedUpdates({
          ...prev,
          tasks: [
          {
            id: `t${Date.now()}`,
            title: input.title,
            project: input.project,
            assignee: input.assignee,
            priority: input.priority,
            dueDate: input.dueDate,
            status: "pending",
          },
          ...prev.tasks,
          ],
          notifications: [
            makeNotification("Task assigned", `${input.assignee} assigned: ${input.title}`, "task"),
            ...prev.notifications,
          ],
        }),
      }));
      return true;
    },
    async updateTaskStatus(id: string, status: Task["status"]) {
      const auth = readAuthFromStorage();
      const path = auth.role === "member" ? `/api/my/tasks/${id}/status` : `/api/tasks/${id}/status`;
      const ok = await apiRequest(path, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      if (backendConnected) {
        if (ok) {
          await fetchWorkspaceFromApi();
          return true;
        }
      }
      updateState((prev) => ({
        ...applyLocalDerivedUpdates({
          ...prev,
          tasks: prev.tasks.map((t) => (t.id === id ? { ...t, status } : t)),
        }),
      }));
      return true;
    },
    addMember(input: Pick<Member, "name" | "email">) {
      void apiRequest("/api/members", {
        method: "POST",
        body: JSON.stringify(input),
      });
      if (backendConnected) return;
      updateState((prev) => ({
        ...prev,
        members: [
          {
            id: `m${Date.now()}`,
            name: input.name,
            email: input.email,
            role: "member",
            tasksAssigned: 0,
          },
          ...prev.members,
        ],
        notifications: [
          makeNotification("Team update", `${input.name} joined the workspace.`, "team"),
          ...prev.notifications,
        ],
      }));
    },
    removeMember(id: string) {
      void apiRequest(`/api/members/${id}`, { method: "DELETE" });
      if (backendConnected) return;
      updateState((prev) => ({
        ...prev,
        members: prev.members.filter((m) => m.id !== id),
      }));
    },
    async deleteNotification(id: string) {
      // Optimistic removal for immediate UX; socket/API sync will reconcile.
      updateState((prev) => ({
        ...prev,
        notifications: prev.notifications.filter((n) => n.id !== id),
      }));
      const ok = await apiRequest(`/api/notifications/${id}`, { method: "DELETE" });
      if (backendConnected && ok) await fetchWorkspaceFromApi();
      return true;
    },
  };
}
