import { useCallback, useState } from "react";
import { Upload, FileImage, FileVideo, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface UploadScannerProps {
  onAnalyze: (file: File) => void;
  isScanning: boolean;
}

const UploadScanner = ({ onAnalyze, isScanning }: UploadScannerProps) => {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = useCallback((file: File) => {
    setSelectedFile(file);
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    } else {
      setPreview(null);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const clear = () => {
    setSelectedFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
  };

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {!selectedFile ? (
          <motion.label
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center gap-3 p-12 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${
              dragOver
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/40 hover:bg-card/80"
            }`}
          >
            <Upload className={`w-10 h-10 ${dragOver ? "text-primary" : "text-muted-foreground"}`} />
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Drop media here or click to upload</p>
              <p className="text-xs text-muted-foreground mt-1 font-mono">JPG, PNG, MP4 supported</p>
            </div>
            <input
              type="file"
              accept="image/jpeg,image/png,video/mp4"
              className="hidden"
              onChange={handleInput}
            />
          </motion.label>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-card p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {selectedFile.type.startsWith("image") ? (
                  <FileImage className="w-4 h-4 text-primary" />
                ) : (
                  <FileVideo className="w-4 h-4 text-primary" />
                )}
                <span className="text-sm font-mono text-foreground truncate max-w-[200px]">
                  {selectedFile.name}
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  ({(selectedFile.size / 1024 / 1024).toFixed(1)} MB)
                </span>
              </div>
              <button onClick={clear} className="p-1 hover:bg-secondary rounded-md transition-colors" disabled={isScanning}>
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            {preview && (
              <div className="relative rounded-lg overflow-hidden">
                <img src={preview} alt="Preview" className="w-full max-h-64 object-contain bg-secondary/50" />
                {isScanning && (
                  <div className="absolute inset-0">
                    <div className="scan-line absolute inset-x-0 h-1/3" />
                  </div>
                )}
              </div>
            )}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onAnalyze(selectedFile)}
              disabled={isScanning}
              className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isScanning ? "Scanning..." : "Analyze for Deepfakes"}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UploadScanner;
