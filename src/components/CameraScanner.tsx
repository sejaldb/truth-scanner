import { useRef, useState, useEffect, useCallback } from "react";
import { Camera, StopCircle } from "lucide-react";
import { motion } from "framer-motion";
import { analyzeImage, type AnalysisResult } from "@/lib/analyzeMedia";

interface CameraScannerProps {
  onResult: (result: AnalysisResult) => void;
  isScanning: boolean;
  setIsScanning: (v: boolean) => void;
}

const CameraScanner = ({ onResult, isScanning, setIsScanning }: CameraScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanningRef = useRef(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [frameCount, setFrameCount] = useState(0);

  const stopCamera = useCallback(() => {
    scanningRef.current = false;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOn(false);
    setIsScanning(false);
    setFrameCount(0);
  }, [setIsScanning]);

  const captureFrame = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!videoRef.current || !videoRef.current.videoWidth) {
        resolve(null);
        return;
      }
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(videoRef.current, 0, 0);
      canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.8);
    });
  }, []);

  const startLiveScan = useCallback(async () => {
    scanningRef.current = true;
    setIsScanning(true);
    let frame = 0;

    while (scanningRef.current) {
      const blob = await captureFrame();
      if (!blob || !scanningRef.current) break;

      frame++;
      setFrameCount(frame);

      try {
        const result = await analyzeImage(blob);

        // Stop scanning once a result is obtained
        if (scanningRef.current) {
          scanningRef.current = false;
          setIsScanning(false);
          onResult(result);
          stopCamera();
          return;
        }
      } catch (err) {
        console.error("Frame analysis error:", err);
        // Continue scanning on transient errors, wait before retry
        await new Promise((r) => setTimeout(r, 2000));
      }
    }

    setIsScanning(false);
  }, [captureFrame, onResult, setIsScanning, stopCamera]);

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

  useEffect(() => {
    return () => {
      scanningRef.current = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

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
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <span className="text-xs font-mono text-primary bg-background/70 px-2 py-1 rounded">
                    Analyzing frame {frameCount}...
                  </span>
                  <span className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.25 }}
                        className="w-1.5 h-1.5 rounded-full bg-primary"
                      />
                    ))}
                  </span>
                </div>
              </div>
            )}
            {/* Scanning corners */}
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
        ) : !isScanning ? (
          <>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={startLiveScan}
              className="flex-1 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm"
            >
              Start Live Scan
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={stopCamera}
              className="py-3 px-4 rounded-lg bg-destructive text-destructive-foreground font-semibold text-sm"
            >
              <StopCircle className="w-4 h-4" />
            </motion.button>
          </>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={stopCamera}
            className="flex-1 py-3 rounded-lg bg-destructive text-destructive-foreground font-semibold text-sm flex items-center justify-center gap-2"
          >
            <StopCircle className="w-4 h-4" />
            Stop Scanning
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default CameraScanner;
