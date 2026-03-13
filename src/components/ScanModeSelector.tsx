import { Upload, Camera, Link, Monitor } from "lucide-react";
import { motion } from "framer-motion";

export type ScanMode = "upload" | "camera" | "url" | "screen";

interface ScanModeSelectorProps {
  mode: ScanMode;
  onChange: (mode: ScanMode) => void;
}

const modes = [
  { id: "upload" as ScanMode, label: "Upload", icon: Upload, desc: "Image / Video" },
  { id: "camera" as ScanMode, label: "Camera", icon: Camera, desc: "Live Feed" },
  { id: "url" as ScanMode, label: "URL", icon: Link, desc: "Web Link" },
  { id: "screen" as ScanMode, label: "Screen", icon: Monitor, desc: "Screen Share" },
];

const ScanModeSelector = ({ mode, onChange }: ScanModeSelectorProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {modes.map((m) => {
        const active = mode === m.id;
        return (
          <motion.button
            key={m.id}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onChange(m.id)}
            className={`relative glass-card p-4 text-center transition-all duration-300 cursor-pointer ${
              active ? "glow-border" : "hover:border-primary/20"
            }`}
          >
            {active && (
              <motion.div
                layoutId="activeMode"
                className="absolute inset-0 rounded-xl bg-primary/5 border border-primary/30"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <div className="relative z-10">
              <m.icon
                className={`w-6 h-6 mx-auto mb-2 transition-colors ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              />
              <p className={`text-sm font-semibold ${active ? "text-primary" : "text-foreground"}`}>
                {m.label}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{m.desc}</p>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
};

export default ScanModeSelector;
