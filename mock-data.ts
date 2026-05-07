export interface Project {
  id: string;
  name: string;
  description: string;
  progress: number;
  members: number;
  status: "active" | "pending" | "completed" | "on-hold";
  dueDate: string;
}
export interface Task {
  id: string;
  title: string;
  project: string;
  assignee: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "in-progress" | "completed";
  dueDate: string;
}
export interface Member {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member";
  tasksAssigned: number;
  verified?: boolean;
  avatar?: string;
}
export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "task" | "deadline" | "team";
}

export const projects: Project[] = [
  { id: "p1", name: "AI Engine v2", description: "Next-gen recommendation core", progress: 72, members: 6, status: "active", dueDate: "2026-06-15" },
  { id: "p2", name: "Mobile App Redesign", description: "iOS/Android refresh", progress: 45, members: 4, status: "active", dueDate: "2026-07-01" },
  { id: "p3", name: "Marketing Site", description: "Q3 launch campaign", progress: 100, members: 3, status: "completed", dueDate: "2026-04-20" },
  { id: "p4", name: "Data Pipeline", description: "Realtime analytics", progress: 30, members: 5, status: "active", dueDate: "2026-08-10" },
  { id: "p5", name: "Security Audit", description: "Pentest + remediation", progress: 60, members: 2, status: "on-hold", dueDate: "2026-06-30" },
];

export const tasks: Task[] = [
  { id: "t1", title: "Design onboarding flow", project: "Mobile App Redesign", assignee: "alex@ethara.ai", priority: "high", status: "in-progress", dueDate: "2026-05-12" },
  { id: "t2", title: "Optimize embedding model", project: "AI Engine v2", assignee: "priya@ethara.ai", priority: "high", status: "pending", dueDate: "2026-05-20" },
  { id: "t3", title: "Write API docs", project: "AI Engine v2", assignee: "marco@ethara.ai", priority: "medium", status: "completed", dueDate: "2026-05-05" },
  { id: "t4", title: "Set up Kafka cluster", project: "Data Pipeline", assignee: "lin@ethara.ai", priority: "high", status: "in-progress", dueDate: "2026-05-18" },
  { id: "t5", title: "Run pentest scenarios", project: "Security Audit", assignee: "sam@ethara.ai", priority: "medium", status: "pending", dueDate: "2026-05-25" },
  { id: "t6", title: "Hero section copy", project: "Marketing Site", assignee: "alex@ethara.ai", priority: "low", status: "completed", dueDate: "2026-04-15" },
  { id: "t7", title: "Setup CI/CD", project: "AI Engine v2", assignee: "priya@ethara.ai", priority: "medium", status: "completed", dueDate: "2026-05-02" },
  { id: "t8", title: "User research interviews", project: "Mobile App Redesign", assignee: "alex@ethara.ai", priority: "medium", status: "in-progress", dueDate: "2026-05-22" },
];

export const members: Member[] = [
  { id: "m1", name: "Alex Chen", email: "alex@ethara.ai", role: "member", tasksAssigned: 3 },
  { id: "m2", name: "Priya Patel", email: "priya@ethara.ai", role: "member", tasksAssigned: 3 },
  { id: "m3", name: "Marco Rossi", email: "marco@ethara.ai", role: "member", tasksAssigned: 1 },
  { id: "m4", name: "Lin Wei", email: "lin@ethara.ai", role: "member", tasksAssigned: 1 },
  { id: "m5", name: "Sam Okafor", email: "sam@ethara.ai", role: "admin", tasksAssigned: 1 },
];

export const notifications: Notification[] = [
  { id: "n1", title: "Task assigned", message: "You have a new task: Design onboarding flow", time: "2m ago", type: "task" },
  { id: "n2", title: "Deadline approaching", message: "Optimize embedding model due in 3 days", time: "1h ago", type: "deadline" },
  { id: "n3", title: "Team update", message: "Marco completed Write API docs", time: "3h ago", type: "team" },
  { id: "n4", title: "Project milestone", message: "AI Engine v2 reached 72% progress", time: "1d ago", type: "team" },
];

export const taskProgressData = [
  { day: "Mon", completed: 12, pending: 8 },
  { day: "Tue", completed: 18, pending: 6 },
  { day: "Wed", completed: 15, pending: 10 },
  { day: "Thu", completed: 22, pending: 5 },
  { day: "Fri", completed: 28, pending: 4 },
  { day: "Sat", completed: 10, pending: 2 },
  { day: "Sun", completed: 8, pending: 3 },
];

export const projectAnalyticsData = projects.map((p) => ({ name: p.name.split(" ")[0], progress: p.progress }));

export const productivityData = [
  { week: "W1", productivity: 65 },
  { week: "W2", productivity: 72 },
  { week: "W3", productivity: 68 },
  { week: "W4", productivity: 85 },
  { week: "W5", productivity: 78 },
  { week: "W6", productivity: 92 },
];
