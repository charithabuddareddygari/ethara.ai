import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ListTodo, CheckCircle2, Clock, Calendar, Brain } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { useWorkspaceData } from "@/lib/workspace-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/member/")({
  component: MemberDashboard,
});

function MemberDashboard() {
  const { user } = useAuth();
  const { tasks } = useWorkspaceData();
  const [memberVerified, setMemberVerified] = useState<boolean | null>(null);
  const [memberExists, setMemberExists] = useState<boolean | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyStep, setVerifyStep] = useState<"idle" | "email" | "code">("idle");
  const [verifyEmail, setVerifyEmail] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const apiBase = useMemo(() => import.meta.env.VITE_BACKEND_URL ?? "", []);

  useEffect(() => {
    if (!user?.email) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${apiBase}/api/member/status?email=${encodeURIComponent(user.email)}`);
        const json = (await res.json()) as { exists?: boolean; verified?: boolean };
        if (!cancelled) {
          setMemberExists(Boolean(json.exists));
          setMemberVerified(Boolean(json.verified));
        }
      } catch {
        if (!cancelled) setMemberVerified(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [apiBase, user?.email]);

  const startVerify = () => {
    setVerifyEmail(user?.email ?? "");
    setVerifyCode("");
    setVerifyStep("email");
  };

  const submitVerifyEmail = async () => {
    if (!user?.email) return;
    const normalized = verifyEmail.trim().toLowerCase();
    if (!normalized) return toast.error("Email is required.");
    if (normalized !== user.email.trim().toLowerCase()) {
      return toast.error("Please enter the same email you used to login.");
    }
    setVerifying(true);
    try {
      const res = await fetch(`${apiBase}/api/member/send-verification`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: normalized }),
      });
      if (!res.ok) {
        const json = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(json?.error ?? "Unable to send verification code.");
      }
      toast.success("Verification code sent (simulated). Valid for 24 hours.");
      setVerifyStep("code");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setVerifying(false);
    }
  };

  const submitVerifyCode = async () => {
    if (!user?.email) return;
    const normalized = verifyEmail.trim().toLowerCase();
    const code = verifyCode.trim();
    if (!code) return toast.error("Verification code is required.");
    setVerifying(true);
    try {
      const verifyRes = await fetch(`${apiBase}/api/member/verify`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: normalized, code }),
      });
      if (!verifyRes.ok) {
        const json = (await verifyRes.json().catch(() => null)) as { error?: string } | null;
        throw new Error(json?.error ?? "Invalid verification code.");
      }
      setMemberVerified(true);
      setMemberExists(true);
      setVerifyStep("idle");
      toast.success("Verified successfully!");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setVerifying(false);
    }
  };
  const mine = tasks.filter((t) => t.assignee.toLowerCase() === (user?.email ?? "").toLowerCase());
  const displayTasks = mine.slice(0, 5);
  const completed = displayTasks.filter((t) => t.status === "completed").length;
  const pending = displayTasks.filter((t) => t.status !== "completed").length;
  const upcoming = displayTasks.filter((t) => new Date(t.dueDate) > new Date()).length;
  const productivityScore = Math.round((completed / Math.max(displayTasks.length, 1)) * 100);

  if (memberExists !== true || memberVerified !== true) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold">Hello, {user?.name} 👋</h1>
          <p className="text-muted-foreground mt-1">
            {memberExists === true
              ? "Verify your account to access tasks, projects, analytics and reports."
              : "Ask Admin to add your email in Team Members first."}
          </p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-border/70">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-display font-semibold text-lg">
                {memberExists === true ? "Verification Pending" : "Access Restricted"}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {memberExists === true
                  ? "Your account was added by Admin. Verify your email within 24 hours to appear in the team and receive assigned tasks/projects."
                  : "Your member account is not mapped in Team Members yet. After Admin adds your email, use Verify to continue."}
              </p>
              {memberExists === true && verifyStep !== "idle" && (
                <div className="mt-4 space-y-3 max-w-md">
                  <div>
                    <Label htmlFor="verifyEmail">Email</Label>
                    <Input
                      id="verifyEmail"
                      type="email"
                      value={verifyEmail}
                      onChange={(e) => setVerifyEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="mt-1.5"
                      disabled={verifyStep === "code"}
                    />
                  </div>

                  {verifyStep === "code" && (
                    <div>
                      <Label htmlFor="verifyCode">Verification Code</Label>
                      <Input
                        id="verifyCode"
                        value={verifyCode}
                        onChange={(e) => setVerifyCode(e.target.value)}
                        placeholder="Enter code"
                        className="mt-1.5"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
            {memberExists === true ? (
              verifyStep === "idle" ? (
                <Button onClick={startVerify} disabled={verifying} className="bg-aurora text-primary-foreground">
                  Verify
                </Button>
              ) : verifyStep === "email" ? (
                <Button onClick={submitVerifyEmail} disabled={verifying} className="bg-aurora text-primary-foreground">
                  {verifying ? "Sending..." : "Submit Email"}
                </Button>
              ) : (
                <Button onClick={submitVerifyCode} disabled={verifying} className="bg-aurora text-primary-foreground">
                  {verifying ? "Verifying..." : "Submit Code"}
                </Button>
              )
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Hello, {user?.name} 👋</h1>
        <p className="text-muted-foreground mt-1">Here's what's on your plate today.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Assigned Tasks" value={displayTasks.length} icon={ListTodo} accent="primary" />
        <StatCard title="Completed Tasks" value={completed} icon={CheckCircle2} accent="accent" />
        <StatCard title="Pending Tasks" value={pending} icon={Clock} accent="chart-4" />
        <StatCard title="Upcoming Deadlines" value={upcoming} icon={Calendar} accent="chart-3" />
        <StatCard title="Productivity Score" value={`${productivityScore}%`} icon={Brain} accent="chart-5" />
      </div>

      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold">My Tasks</h3>
          <Link to="/member/tasks" className="text-sm text-primary hover:underline">View all</Link>
        </div>
        <div className="space-y-2">
          {displayTasks.map((t) => (
            <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/30 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="font-medium">{t.title}</div>
                <div className="text-xs text-muted-foreground">{t.project} • Due {t.dueDate}</div>
              </div>
              <Badge variant={t.priority === "high" ? "destructive" : "secondary"} className="capitalize">{t.priority}</Badge>
              <Badge variant="outline" className="capitalize">{t.status}</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
