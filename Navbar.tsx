import { Link, useRouterState } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/lib/auth";
import logoWhiteText from "@/assets/logo-white-text.png";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/features", label: "Features" },
  { to: "/contact", label: "Contact" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { isAuthenticated, user } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-background/60 border-b border-border/50">
      <div className="container mx-auto px-14 md:px-24 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center group mb-2">
          <div className="rounded-md px-2 py-1 bg-slate-900 dark:bg-transparent">
            <img src={logoWhiteText} alt="Ethara.AI" className="h-10 w-auto" />
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`px-4 py-2 rounded-lg text-lg font-medium transition-all hover:bg-primary/10 hover:text-primary ${
                path === l.to ? "text-primary bg-primary/5" : "text-muted-foreground"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isAuthenticated ? (
            <Link to={user?.role === "admin" ? "/admin" : "/member"} className="mb-1 mr-2">
              <Button className="hidden sm:inline-flex bg-aurora text-primary-foreground hover:opacity-90 shadow-glow">
                Dashboard
              </Button>
            </Link>
          ) : (
            <Link to="/login" className="mb-1 mr-2">
              <Button className="hidden sm:inline-flex bg-aurora text-primary-foreground hover:opacity-90 shadow-glow">
                Login / Sign Up
              </Button>
            </Link>
          )}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="flex flex-col gap-2 mt-8">
                {links.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className="px-4 py-3 rounded-lg hover:bg-primary/10 font-medium"
                  >
                    {l.label}
                  </Link>
                ))}
                <Link to={isAuthenticated ? (user?.role === "admin" ? "/admin" : "/member") : "/login"} onClick={() => setOpen(false)}>
                  <Button className="w-full mt-4 bg-aurora text-primary-foreground">
                    {isAuthenticated ? "Dashboard" : "Login / Sign Up"}
                  </Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
