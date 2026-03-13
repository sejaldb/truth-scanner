import { Shield } from "lucide-react";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-card border-t-0 border-x-0 rounded-none">
      <div className="container mx-auto px-4 py-4 flex items-center gap-3">
        <div className="relative">
          <Shield className="w-8 h-8 text-primary" />
          <div className="absolute inset-0 blur-lg bg-primary/30" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-foreground">
            DeepGuard
          </h1>
          <p className="text-xs text-muted-foreground font-mono">
            AI Media Forensics
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-safe animate-pulse" />
          <span className="text-xs text-muted-foreground font-mono">System Active</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
