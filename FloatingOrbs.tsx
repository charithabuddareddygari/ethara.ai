export function FloatingOrbs() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/30 blur-3xl animate-float" />
      <div className="absolute top-1/3 -right-40 h-[28rem] w-[28rem] rounded-full bg-accent/25 blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-chart-3/25 blur-3xl animate-float" style={{ animationDelay: "4s" }} />
    </div>
  );
}
