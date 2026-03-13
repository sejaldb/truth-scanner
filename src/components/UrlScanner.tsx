import { useState } from "react";
import { Link, Search } from "lucide-react";
import { motion } from "framer-motion";

interface UrlScannerProps {
  onAnalyze: (url: string) => void;
  isScanning: boolean;
}

const UrlScanner = ({ onAnalyze, isScanning }: UrlScannerProps) => {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) onAnalyze(url.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="glass-card p-4 space-y-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Link className="w-4 h-4 text-primary" />
          <span className="text-xs font-mono">Enter image URL to analyze</span>
        </div>
        <input
          type="url"
          placeholder="https://example.com/image.jpg"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-3 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
        />
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={!url.trim() || isScanning}
          className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Search className="w-4 h-4" />
          {isScanning ? "Scanning..." : "Analyze URL"}
        </motion.button>
      </div>
    </form>
  );
};

export default UrlScanner;
