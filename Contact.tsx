import { useState } from "react";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(1, "Name required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  message: z.string().trim().min(1, "Message required").max(1000),
});

export function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse(form);
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setForm({ name: "", email: "", message: "" });
      toast.success("Message sent! We'll be in touch.");
    }, 800);
  };

  return (
    <section id="contact" className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-sm font-medium text-accent mb-3">Contact</div>
          <h2 className="font-display text-3xl md:text-4xl font-bold leading-tight">
            Let's build <span className="text-gradient">something great</span>
          </h2>
          <p className="mt-4 text-muted-foreground">Have a question or partnership idea? We reply within 24h.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 lg:px-20">
          <form
            onSubmit={submit}
            className="glass-card rounded-3xl p-8 space-y-5 border border-border/70 bg-background/30"
          >
            <h3 className="font-display text-3xl font-bold">Send a Message</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="your.email@example.com"
                  className="mt-1.5 h-12 rounded-xl bg-background/40 border-border/70"
                />
              </div>
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your full name"
                  className="mt-1.5 h-12 rounded-xl bg-background/40 border-border/70"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                rows={8}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Tell me about your project or just say hello..."
                className="mt-1.5 rounded-xl bg-background/40 border-border/70"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-aurora text-primary-foreground hover:opacity-90 shadow-glow text-base"
            >
              {loading ? "Sending..." : <>Send message <Send className="ml-2 h-4 w-4" /></>}
            </Button>
          </form>

          <div className="space-y-4">
            <div className="glass-card rounded-3xl p-6 space-y-4 border border-border/70 bg-background/30">
              <h3 className="font-display text-3xl font-bold">Contact Information</h3>

              <div className="rounded-2xl border border-border/70 p-4 bg-background/30 flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-sky-500/20 flex items-center justify-center">
                  <Mail className="h-4 w-4 text-sky-400" />
                </div>
                <div>
                  <div className="text-lg font-semibold">Email</div>
                  <div className="text-sm text-muted-foreground">info@ethara.ai</div>
                </div>
              </div>

              <div className="rounded-2xl border border-border/70 p-4 bg-background/30 flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Phone className="h-4 w-4 text-emerald-400" />
                </div>
                <div>
                  <div className="text-lg font-semibold">Phone</div>
                  <div className="text-sm text-muted-foreground">0124 433 3224</div>
                </div>
              </div>

              <div className="rounded-2xl border border-border/70 p-4 bg-background/30 flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-fuchsia-500/20 flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-fuchsia-400" />
                </div>
                <div>
                  <div className="text-lg font-semibold">Location</div>
                  <div className="text-sm text-muted-foreground">
                    5th Floor, Quattro Iconic, Plot No. 273, Phase II, Udyog Vihar, Sector 20, Gurugram, Haryana 122016, India
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-3xl overflow-hidden h-64 relative border border-border/70 bg-background/30">
              <iframe
                title="Ethara.AI Office Location"
                src="https://www.google.com/maps?cid=10685533800269638320&g_mp=CiVnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLkdldFBsYWNlEAMYASAF&hl=en&gl=IN&source=embed&output=embed"
                className="absolute inset-0 h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
