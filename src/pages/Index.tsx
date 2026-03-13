import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import ScanModeSelector, { type ScanMode } from "@/components/ScanModeSelector";
import UploadScanner from "@/components/UploadScanner";
import CameraScanner from "@/components/CameraScanner";
import UrlScanner from "@/components/UrlScanner";
import ScreenScanner from "@/components/ScreenScanner";
import ResultsDashboard from "@/components/ResultsDashboard";
import ScanningOverlay from "@/components/ScanningOverlay";
import { analyzeImage, analyzeVideo, type AnalysisResult } from "@/lib/analyzeMedia";
import { Shield, Zap, Eye, Lock } from "lucide-react";

const Index = () => {
  const [mode, setMode] = useState<ScanMode>("upload");
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  const handleModeChange = (newMode: ScanMode) => {
    setMode(newMode);
    handleReset();
  };

  const runAnalysis = useCallback(async (analyze: () => Promise<AnalysisResult>) => {
    setIsScanning(true);
    setResult(null);
    setError(null);
    try {
      const res = await analyze();
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed.");
    } finally {
      setIsScanning(false);
    }
  }, []);

  const handleFileAnalyze = (file: File) => {
    if (file.type.startsWith("video/")) {
      runAnalysis(() => analyzeVideo(file));
    } else {
      runAnalysis(() => analyzeImage(file));
    }
  };

  const handleBlobAnalyze = (blob: Blob) => {
    runAnalysis(() => analyzeImage(blob));
  };

  const handleUrlAnalyze = (url: string) => {
    runAnalysis(() => analyzeImage(url));
  };

  return (
    <div className="min-h-screen bg-background bg-grid">
      <Header />

      <main className="container mx-auto px-4 pt-24 pb-16 max-w-2xl">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-mono text-primary mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            AI-Powered Detection
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3 tracking-tight">
            Deepfake Detection
          </h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Upload images, videos, or use live camera to detect AI-generated media manipulation in real-time.
          </p>
        </motion.div>

        {/* Features row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-3 mb-8"
        >
          {[
            { icon: Zap, label: "Instant Analysis" },
            { icon: Eye, label: "Artifact Detection" },
            { icon: Lock, label: "Private & Secure" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 glass-card p-3 rounded-lg">
              <Icon className="w-4 h-4 text-primary shrink-0" />
              <span className="text-xs font-medium text-muted-foreground">{label}</span>
            </div>
          ))}
        </motion.div>

        {/* Mode Selector */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <ScanModeSelector mode={mode} onChange={handleModeChange} />
        </motion.div>

        {/* Scanner Area */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <AnimatePresence mode="wait">
            {isScanning && !result ? (
              <motion.div
                key="scanning"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ScanningOverlay />
              </motion.div>
            ) : (
              <motion.div
                key={mode}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                {mode === "upload" && (
                  <UploadScanner onAnalyze={handleFileAnalyze} isScanning={isScanning} />
                )}
                {mode === "camera" && (
                  <CameraScanner onResult={(r) => { setResult(r); }} isScanning={isScanning} setIsScanning={setIsScanning} />
                )}
                {mode === "url" && (
                  <UrlScanner onAnalyze={handleUrlAnalyze} isScanning={isScanning} />
                )}
                {mode === "screen" && (
                  <ScreenScanner onAnalyze={handleBlobAnalyze} isScanning={isScanning} />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-4 border border-destructive/30 bg-destructive/5 mb-6"
          >
            <p className="text-sm text-destructive font-mono">{error}</p>
          </motion.div>
        )}

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <ResultsDashboard result={result} />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleReset}
                className="w-full mt-4 py-3 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all font-medium"
              >
                Scan Another
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Index;
