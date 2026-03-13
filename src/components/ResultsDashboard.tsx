import { motion } from "framer-motion";
import { ShieldCheck, ShieldAlert, AlertTriangle, Info } from "lucide-react";
import type { AnalysisResult } from "@/lib/analyzeMedia";

interface ResultsDashboardProps {
  result: AnalysisResult;
}

const ResultsDashboard = ({ result }: ResultsDashboardProps) => {
  const { score, confidence, details, suspiciousAreas, frameResults } = result;

  const isReal = score < 35;
  const isSuspicious = score >= 35 && score < 65;
  const isFake = score >= 65;

  const statusColor = isReal
    ? "text-safe"
    : isSuspicious
    ? "text-warning"
    : "text-destructive";

  const statusBg = isReal
    ? "bg-safe/10 border-safe/30"
    : isSuspicious
    ? "bg-warning/10 border-warning/30"
    : "bg-destructive/10 border-destructive/30";

  const StatusIcon = isReal ? ShieldCheck : isSuspicious ? AlertTriangle : ShieldAlert;
  const statusLabel = isReal ? "Likely Authentic" : isSuspicious ? "Suspicious" : "Likely Manipulated";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      {/* Main Score */}
      <div className={`glass-card p-6 border ${statusBg} text-center`}>
        <StatusIcon className={`w-10 h-10 mx-auto mb-3 ${statusColor}`} />
        <p className={`text-sm font-semibold ${statusColor} mb-1`}>{statusLabel}</p>
        <div className="flex items-baseline justify-center gap-1">
          <span className={`text-5xl font-bold font-mono ${statusColor}`}>{score}</span>
          <span className={`text-xl font-mono ${statusColor}`}>%</span>
        </div>
        <p className="text-xs text-muted-foreground mt-2 font-mono">
          Deepfake Probability · Confidence: {confidence}
        </p>

        {/* Progress bar */}
        <div className="mt-4 h-2 rounded-full bg-secondary overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full rounded-full ${
              isReal ? "bg-safe" : isSuspicious ? "bg-warning" : "bg-destructive"
            }`}
          />
        </div>
      </div>

      {/* Details */}
      <div className="glass-card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Analysis Details</span>
        </div>
        <p className="text-sm text-muted-foreground">{details}</p>
      </div>

      {/* Suspicious Areas */}
      {suspiciousAreas.length > 0 && (
        <div className="glass-card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <span className="text-sm font-semibold text-foreground">Suspicious Areas</span>
          </div>
          <ul className="space-y-1.5">
            {suspiciousAreas.map((area, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-2 text-sm text-muted-foreground font-mono"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-warning" />
                {area}
              </motion.li>
            ))}
          </ul>
        </div>
      )}

      {/* Frame Results (video) */}
      {frameResults && frameResults.length > 0 && (
        <div className="glass-card p-4 space-y-3">
          <span className="text-sm font-semibold text-foreground">Frame Analysis</span>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {frameResults.map((f) => (
              <div
                key={f.frame}
                className={`text-center p-2 rounded-lg border text-xs font-mono ${
                  f.score > 60
                    ? "border-destructive/40 bg-destructive/10 text-destructive"
                    : f.score > 35
                    ? "border-warning/40 bg-warning/10 text-warning"
                    : "border-safe/40 bg-safe/10 text-safe"
                }`}
              >
                <div className="text-[10px] text-muted-foreground">F{f.frame}</div>
                <div className="font-bold">{f.score}%</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ResultsDashboard;
