import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useWorkspaceData } from "@/lib/workspace-store";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/member/projects")({
  component: MemberProjects,
});

function MemberProjects() {
  const { user } = useAuth();
  const { projects } = useWorkspaceData();
  const [verified, setVerified] = useState<boolean | null>(null);
  const [exists, setExists] = useState<boolean | null>(null);
  const apiBase = useMemo(() => import.meta.env.VITE_BACKEND_URL ?? "", []);

  useEffect(() => {
    if (!user?.email) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${apiBase}/api/member/status?email=${encodeURIComponent(user.email)}`);
        const json = (await res.json()) as { exists?: boolean; verified?: boolean };
        if (!cancelled) {
          setExists(Boolean(json.exists));
          setVerified(Boolean(json.verified));
        }
      } catch {
        if (!cancelled) {
          setExists(null);
          setVerified(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [apiBase, user?.email]);

  if (exists !== true || verified !== true) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground mt-1">
            {exists === true ? "Verify your account to view projects." : "Ask Admin to add you as a team member first."}
          </p>
        </div>
        <div className="glass-card rounded-2xl p-5 border border-border/70">
          <div className="font-display font-semibold text-lg">{exists === true ? "Verification Pending" : "Access Restricted"}</div>
          <p className="text-sm text-muted-foreground mt-1">
            {exists === true
              ? "Please verify on the Member dashboard to start receiving assigned projects."
              : "Your member account is not mapped in Team Members yet. After Admin adds your email, verify and continue."}
          </p>
          <Link to="/member" className="text-primary font-medium hover:underline inline-block mt-3">
            Go to Dashboard to Verify
          </Link>
        </div>
      </div>
    );
  }
  return (
  <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Projects</h1>
        <p className="text-muted-foreground mt-1">Projects you're contributing to.</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((p) => (
          <div key={p.id} className="glass-card rounded-2xl p-5 hover:shadow-glow transition-all">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display font-semibold text-lg">{p.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{p.description}</p>
              </div>
              <Badge variant={p.status === "completed" ? "default" : "outline"} className="capitalize">{p.status}</Badge>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1.5"><span className="text-muted-foreground">Progress</span><span className="font-medium">{p.progress}%</span></div>
              <Progress value={p.progress} className="h-2" />
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {p.members} members</span>
              <span>Due {p.dueDate}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
