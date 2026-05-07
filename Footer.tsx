import { Link } from "@tanstack/react-router";
import { Instagram, Linkedin, Mail, MapPin, Phone, Twitter } from "lucide-react";
import logoWhiteText from "@/assets/logo-white-text.png";

export function Footer() {
  return (
    <footer className="relative border-t border-border/50 mt-20">
      <div className="container mx-auto px-4 lg:px-16 py-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link to="/" className="flex items-center">
            <div className="rounded-md px-2 py-1 bg-slate-900 dark:bg-transparent">
              <img src={logoWhiteText} alt="Ethara.AI" className="h-10 w-auto" />
            </div>
          </Link>
          <p className="mt-4 text-sm text-muted-foreground max-w-md">
            AI-powered project & task management for modern teams. Plan smarter, ship faster, collaborate effortlessly.
          </p>
          <div className="flex gap-3 mt-5">
            {[Twitter, Instagram, Linkedin].map((Icon, i) => (
              <a key={i} href="#" className="h-10 w-10 rounded-full glass-card flex items-center justify-center hover:text-primary transition-colors">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
        <div className="lg:-mr-8">
          <h4 className="font-display font-semibold mb-3">Product</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/features" className="hover:text-primary">Features</Link></li>
            <li><Link to="/about" className="hover:text-primary">About</Link></li>
            <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
          </ul>
        </div>
        <div className="lg:-ml-8 lg:-mr-6">
          <h4 className="font-display font-semibold mb-3">Account</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/login" className="hover:text-primary">Login</Link></li>
            <li><Link to="/signup" className="hover:text-primary">Sign up</Link></li>
          </ul>
        </div>
        <div className="lg:-ml-6">
          <h4 className="font-display font-semibold mb-3">Contact Us</h4>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <Mail className="h-4 w-4 mt-0.5 text-primary" />
              <span>info@ethara.ai</span>
            </li>
            <li className="flex items-start gap-2">
              <Phone className="h-4 w-4 mt-0.5 text-primary" />
              <span>0124 433 3224</span>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 text-primary" />
              <span>
                5th Floor, Quattro Iconic, Plot No. 273, Phase II, Udyog Vihar, Sector 20,
                Gurugram, Haryana 122016, India
              </span>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/50 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Ethara.AI — All rights reserved.
      </div>
    </footer>
  );
}
