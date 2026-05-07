import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useWorkspaceData } from "@/lib/workspace-store";
import jsPDF from "jspdf";

export const Route = createFileRoute("/_authenticated/member/reports")({
  component: MemberReports,
});

function MemberReports() {
  const { user } = useAuth();
  const { tasks } = useWorkspaceData();
  const [verified, setVerified] = useState<boolean | null>(null);
  const [exists, setExists] = useState<boolean | null>(null);
  const apiBase = useMemo(() => import.meta.env.VITE_BACKEND_URL ?? "", []);

  const downloadPdf = () => {
    const email = (user?.email ?? "").toLowerCase();
    const myTasks = tasks.filter((t) => t.assignee.toLowerCase() === email);
    const completed = myTasks.filter((t) => t.status === "completed").length;
    const pending = myTasks.filter((t) => t.status !== "completed").length;

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();

    doc.setFillColor(18, 28, 51);
    doc.rect(0, 0, pageW, 92, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("Ethara.AI — Member Productivity Report", 40, 54);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(new Date().toLocaleString(), 40, 74);

    doc.setTextColor(20, 20, 20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Member", 40, 130);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Name: ${user?.name ?? "-"}`, 40, 154);
    doc.text(`Email: ${user?.email ?? "-"}`, 40, 174);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Summary", 40, 220);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Total assigned tasks: ${myTasks.length}`, 40, 244);
    doc.text(`Completed: ${completed}`, 40, 264);
    doc.text(`Pending / In progress: ${pending}`, 40, 284);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Recent Tasks", 40, 330);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    const rows = myTasks.slice(0, 12).map((t) => `• ${t.title} — ${t.status} (Due ${t.dueDate})`);
    const startY = 354;
    const lineH = 16;
    rows.forEach((line, i) => doc.text(line, 40, startY + i * lineH));

    const safeName = (user?.name ?? "member").toLowerCase().replace(/[^a-z0-9]+/g, "-");
    doc.save(`ethara-member-report-${safeName}.pdf`);
  };

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
          <h1 className="font-display text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground mt-1">
            {exists === true ? "Verify your account to access reports." : "Ask Admin to add you as a team member first."}
          </p>
        </div>
        <div className="glass-card rounded-2xl p-5 border border-border/70">
          <div className="font-display font-semibold text-lg">{exists === true ? "Verification Pending" : "Access Restricted"}</div>
          <p className="text-sm text-muted-foreground mt-1">
            {exists === true
              ? "Please verify on the Member dashboard to unlock reports."
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
        <h1 className="font-display text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground mt-1">View personal productivity and download task reports.</p>
      </div>

      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-aurora flex items-center justify-center">
            <FileText className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <div className="font-display font-semibold">Personal Productivity Report</div>
            <div className="text-xs text-muted-foreground">Includes completed vs pending tasks and deadlines</div>
          </div>
        </div>
        <Button
          className="mt-4 bg-aurora text-primary-foreground"
          onClick={downloadPdf}
        >
          <Download className="h-4 w-4 mr-2" /> Download Task Report
        </Button>
      </div>
    </div>
  );
}
