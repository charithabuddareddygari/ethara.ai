import { Target, Eye } from "lucide-react";
import aboutImg from "@/assets/about-office.png";

export function About() {
  return (
    <section id="about" className="py-24 relative">
      <div className="container mx-auto px-4 lg:px-20 grid lg:grid-cols-2 gap-12 items-center">
        <div className="relative">
          <div className="absolute -inset-4 bg-aurora rounded-3xl blur-2xl opacity-20" />
          <div className="relative glass-card rounded-3xl overflow-hidden">
            <img src={aboutImg} alt="About Ethara.AI" className="w-full h-96 object-cover" />
          </div>
        </div>
        <div>
          <p className="mt-5 text-muted-foreground leading-relaxed">
            Ethara.AI is an Artificial Intelligence company that works on building smart and
            reliable AI solutions. The company helps train and improve AI models using human
            feedback, quality data, and advanced technologies. Ethara.AI focuses on creating safe,
            accurate, and intelligent systems that can solve real-world problems.
          </p>
          <div className="mt-8 grid sm:grid-cols-2 gap-4">
            <div className="glass-card rounded-2xl p-6 hover:shadow-glow transition-shadow">
              <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center mb-3">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg">Our Mission</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Our mission is to build smart, safe, and helpful AI systems that improve
                technology and make life easier for people. We aim to provide innovative AI
                solutions with quality and responsibility.
              </p>
            </div>
            <div className="glass-card rounded-2xl p-6 hover:shadow-glow transition-shadow">
              <div className="h-10 w-10 rounded-xl bg-accent/15 flex items-center justify-center mb-3">
                <Eye className="h-5 w-5 text-accent" />
              </div>
              <h3 className="font-display font-semibold text-lg">Our Vision</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Our vision is to become a leading AI company that creates intelligent
                technologies for a better and smarter future. We want AI to help people,
                businesses, and society grow together.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
