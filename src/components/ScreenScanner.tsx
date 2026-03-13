import { useRef, useState, useCallback, useEffect } from "react";
import { Monitor, StopCircle } from "lucide-react";
import { motion } from "framer-motion";

interface ScreenScannerProps {
  onAnalyze: (blob: Blob) => void;
  isScanning: boolean;
}

const ScreenScanner = ({ onAnalyze, isScanning }: ScreenScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startShare = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setSharing(true);

      stream.getVideoTracks()[0].onended = () => {
        setSharing(false);
        streamRef.current = null;
      };
    } catch {
      setError("Screen share cancelled or not supported.");
    }
  }, []);

  const stopShare = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setSharing(false);
  }, []);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const captureAndAnalyze = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(videoRef.current, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) {
        onAnalyze(blob);
        stopShare();
      }
    }, "image/jpeg");
  };

  return (
    <div className="space-y-4">
      <div className="relative glass-card overflow-hidden rounded-xl aspect-video flex items-center justify-center bg-secondary/30">
        {sharing ? (
          <>
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-contain" />
            {isScanning && (
              <div className="absolute inset-0">
                <div className="scan-line absolute inset-x-0 h-1/3" />
              </div>
            )}
          </>
        ) : (
          <div className="text-center p-8">
            <video ref={videoRef} className="hidden" />
            <Monitor className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No screen shared</p>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-destructive font-mono">{error}</p>}

      <div className="flex gap-3">
        {!sharing ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={startShare}
            className="flex-1 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm"
          >
            Share Screen
          </motion.button>
        ) : (
          <>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={captureAndAnalyze}
              disabled={isScanning}
              className="flex-1 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-50"
            >
              {isScanning ? "Scanning..." : "Capture & Analyze"}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={stopShare}
              disabled={isScanning}
              className="py-3 px-4 rounded-lg bg-destructive text-destructive-foreground font-semibold text-sm disabled:opacity-50"
            >
              <StopCircle className="w-4 h-4" />
            </motion.button>
          </>
        )}
      </div>
    </div>
  );
};

export default ScreenScanner;
