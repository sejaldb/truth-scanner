import { useRef, useState, useEffect, useCallback } from "react";
import { Camera, StopCircle } from "lucide-react";
import { motion } from "framer-motion";

interface CameraScannerProps {
  onAnalyze: (blob: Blob) => void;
  isScanning: boolean;
}

const CameraScanner = ({ onAnalyze, isScanning }: CameraScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraOn(true);
    } catch {
      setError("Camera access denied or not available.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOn(false);
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
        // Stop camera after detection starts
        stopCamera();
      }
    }, "image/jpeg");
  };

  return (
    <div className="space-y-4">
      <div className="relative glass-card overflow-hidden rounded-xl aspect-video flex items-center justify-center bg-secondary/30">
        {cameraOn ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {isScanning && (
              <div className="absolute inset-0">
                <div className="scan-line absolute inset-x-0 h-1/3" />
              </div>
            )}
            {/* Scanning overlay corners */}
            <div className="absolute inset-4 pointer-events-none">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary" />
            </div>
          </>
        ) : (
          <div className="text-center p-8">
            <video ref={videoRef} className="hidden" />
            <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Camera is off</p>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-destructive font-mono">{error}</p>}

      <div className="flex gap-3">
        {!cameraOn ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={startCamera}
            className="flex-1 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm"
          >
            Start Camera
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
              onClick={stopCamera}
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

export default CameraScanner;
