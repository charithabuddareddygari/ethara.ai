import { createFileRoute } from "@tanstack/react-router";
import { FileSpreadsheet, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useWorkspaceData } from "@/lib/workspace-store";
import jsPDF from "jspdf";

export const Route = createFileRoute("/_authenticated/admin/reports")({
  component: AdminReports,
});

function AdminReports() {
  const { projects, tasks, members } = useWorkspaceData();

  const exportPdf = (label: string) => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();

    doc.setFillColor(18, 28, 51);
    doc.rect(0, 0, pageW, 92, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text(`Ethara.AI — ${label}`, 40, 54);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(new Date().toLocaleString(), 40, 74);

    doc.setTextColor(20, 20, 20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Workspace Summary", 40, 130);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Total Projects: ${projects.length}`, 40, 154);
    doc.text(`Total Tasks: ${tasks.length}`, 40, 174);
    doc.text(`Verified Members: ${members.filter((m) => m.verified === true).length}`, 40, 194);
    doc.text(`Pending Members: ${members.filter((m) => m.verified !== true).length}`, 40, 214);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Top Projects", 40, 260);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    const rows = projects.slice(0, 10).map((p) => `• ${p.name} — ${p.progress}% (${p.status})`);
    const startY = 284;
    const lineH = 16;
    rows.forEach((line, i) => doc.text(line, 40, startY + i * lineH));

    doc.save(`ethara-admin-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.pdf`);
  };

  const exportExcel = () => {
    toast.success("Exported Excel report (demo)");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground mt-1">Generate weekly, monthly, productivity, and team performance reports.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {[
          "Weekly Reports",
          "Monthly Reports",
          "Productivity Reports",
          "Team Performance Reports",
        ].map((label) => (
          <div key={label} className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-aurora flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <div className="font-display font-semibold">{label}</div>
                <div className="text-xs text-muted-foreground">Auto-generated with dashboard analytics</div>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button size="sm" onClick={() => exportPdf(label)} className="bg-aurora text-primary-foreground">
                <Download className="h-3.5 w-3.5 mr-1" /> Export PDF
              </Button>
              <Button size="sm" variant="outline" onClick={exportExcel}>
                <FileSpreadsheet className="h-3.5 w-3.5 mr-1" /> Export Excel
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
