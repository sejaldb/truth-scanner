import { motion } from "framer-motion";
import { Shield } from "lucide-react";

const ScanningOverlay = () => {
  return (
    <div className="glass-card p-8 flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-20 h-20 rounded-full border-2 border-transparent border-t-primary border-r-primary/50"
        />
        <Shield className="w-8 h-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-foreground">Analyzing Media</p>
        <p className="text-xs text-muted-foreground font-mono mt-1">
          Scanning for deepfake artifacts...
        </p>
      </div>
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
            className="w-2 h-2 rounded-full bg-primary"
          />
        ))}
      </div>
    </div>
  );
};

export default ScanningOverlay;
