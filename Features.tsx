import { Brain, FolderKanban, Users, Shield, BarChart3, Bell } from "lucide-react";

const features = [
  { icon: Brain, title: "AI Task Tracking", desc: "Smart prioritization that adapts to your team's velocity and surfaces blockers early." },
  { icon: FolderKanban, title: "Smart Project Management", desc: "Plans that auto-adjust as scope shifts. Predictive deadlines you can actually trust." },
  { icon: Users, title: "Team Collaboration", desc: "Real-time co-editing, threads, and AI-summarized standups. Async made effortless." },
  { icon: Shield, title: "Role-Based Access", desc: "Granular permissions for admins, leads and members. Enterprise-ready from day one." },
  { icon: BarChart3, title: "Analytics Dashboard", desc: "Beautiful charts that turn raw activity into actionable insight in real time." },
  { icon: Bell, title: "Smart Notifications", desc: "AI silences the noise and surfaces only what truly needs your attention." },
];

export function Features() {
  return (
    <section id="features" className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="text-sm font-medium text-accent mb-3">Features</div>
          <h2 className="font-display text-3xl md:text-4xl font-bold leading-tight">
            Everything you need, <span className="text-gradient">nothing you don't</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            A complete AI-native suite designed for the way modern product teams actually work.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:px-20">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="group glass-card rounded-3xl p-7 hover:shadow-glow hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-aurora opacity-0 group-hover:opacity-20 blur-2xl transition-opacity" />
              <div className="h-12 w-12 rounded-2xl bg-aurora flex items-center justify-center mb-4 shadow-glow">
                <f.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-display font-semibold text-xl">{f.title}</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
