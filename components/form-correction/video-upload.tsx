"use client";

import { useCallback, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Video, Upload, X, Play, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoUploadProps {
  onVideoSelect: (videoBase64: string, mimeType: string) => void;
  isLoading?: boolean;
}

export function VideoUpload({ onVideoSelect, isLoading }: VideoUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setPreview(url);
    setVideoFile(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "video/*": [".mp4", ".mov", ".webm", ".avi"],
    },
    maxFiles: 1,
    onDrop: (files) => {
      if (files[0]) processFile(files[0]);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleAnalyze = useCallback(async () => {
    if (!videoFile) return;

    setIsConverting(true);

    try {
      // Convert video file to base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        // Remove the data URL prefix (e.g., "data:video/mp4;base64,")
        const base64 = result.split(",")[1];
        const mimeType = videoFile.type || "video/mp4";
        onVideoSelect(base64, mimeType);
        setIsConverting(false);
      };
      reader.onerror = () => {
        console.error("Failed to read video file");
        setIsConverting(false);
      };
      reader.readAsDataURL(videoFile);
    } catch (error) {
      console.error("Error converting video:", error);
      setIsConverting(false);
    }
  }, [videoFile, onVideoSelect]);

  const clearPreview = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    setVideoFile(null);
  };

  const showLoading = isLoading || isConverting;

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-4"
          >
            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl shadow-black/10 aspect-video bg-black">
              <video
                ref={videoRef}
                src={preview}
                className="w-full h-full object-contain"
                controls
                playsInline
              />

              {!showLoading && (
                <button
                  onClick={clearPreview}
                  className="absolute top-4 right-4 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white backdrop-blur-md transition-all hover:scale-105 active:scale-95"
                >
                  <X className="w-5 h-5" />
                </button>
              )}

              {/* Loading overlay */}
              {showLoading && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-10 backdrop-blur-sm">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="mb-4"
                  >
                    <Loader2 className="w-12 h-12 text-white" />
                  </motion.div>
                  <p className="text-white font-bold font-oswald uppercase tracking-wider">
                    {isConverting ? "Preparing Video..." : "Analyzing Form..."}
                  </p>
                  <p className="text-white/60 text-sm mt-2">
                    This may take a few seconds
                  </p>
                </div>
              )}
            </div>

            {!showLoading && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAnalyze}
                className="w-full py-4 bg-black text-white rounded-2xl font-bold font-oswald uppercase tracking-wider flex items-center justify-center gap-3 hover:bg-gray-900 transition-colors"
              >
                <Play className="w-5 h-5" />
                Analyze My Form
              </motion.button>
            )}
          </motion.div>
        ) : (
          <div
            {...getRootProps()}
            className={cn(
              "group relative aspect-video rounded-[2.5rem] border-2 border-dashed transition-all duration-300 overflow-hidden cursor-pointer",
              isDragActive
                ? "border-black bg-gray-50 scale-[1.02]"
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
            )}
          >
            <input {...getInputProps()} />

            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
              <div className="flex gap-6 mb-8">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-20 h-20 bg-white rounded-3xl shadow-lg shadow-gray-200/50 flex items-center justify-center border border-gray-100"
                >
                  <Upload className="w-8 h-8 text-gray-900" />
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-20 h-20 bg-black text-white rounded-3xl shadow-lg shadow-black/20 flex items-center justify-center"
                >
                  <Video className="w-8 h-8" />
                </motion.div>
              </div>

              <div className="text-center space-y-2">
                <p className="text-xl font-bold font-oswald uppercase tracking-wide">
                  Upload Your Workout Video
                </p>
                <p className="text-sm text-gray-400 font-medium">
                  Supports MP4, MOV, WebM
                </p>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
