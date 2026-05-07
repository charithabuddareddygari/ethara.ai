import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero-dashboard.jpg";
import { FloatingOrbs } from "./FloatingOrbs";

export function Hero() {
  return (
    <section className="relative bg-hero pt-20 pb-32 overflow-hidden">
      <FloatingOrbs />
      <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center relative">
        <div className="animate-fade-up lg:pl-10 xl:pl-16">
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight">
            Smart <span className="text-gradient">AI-Powered</span> Project & Task Management
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
            Ethara.AI orchestrates your projects, predicts bottlenecks, and keeps your team in flow.
            Plan smarter, automate the busywork, and ship faster — all from one beautiful workspace.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/signup">
              <Button size="lg" className="bg-aurora text-primary-foreground hover:opacity-90 shadow-glow group">
                Get Started
                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/features">
              <Button size="lg" variant="outline" className="glass-card hover:bg-primary/10">
                Explore Features
              </Button>
            </Link>
          </div>
        </div>
        <div className="relative animate-fade-up" style={{ animationDelay: "0.2s" }}>
          <div className="absolute -inset-6 bg-aurora rounded-3xl blur-3xl opacity-30" />
          <div className="relative glass-card rounded-3xl overflow-hidden shadow-glow">
            <img src={heroImg} alt="Ethara.AI dashboard preview" className="w-full h-auto" />
          </div>
        </div>
      </div>
    </section>
  );
}
