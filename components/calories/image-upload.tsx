"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, X, Scan } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useCamera } from "@/hooks/use-camera";

interface ImageUploadProps {
  onImageSelect: (base64: string) => void;
  isLoading?: boolean;
}

// Detect if user is on a mobile device
const isMobileDevice = () => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

export function ImageUpload({ onImageSelect, isLoading }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Detect mobile on mount
  useEffect(() => {
    setIsMobile(isMobileDevice());
  }, []);

  const {
    isCameraMode,
    cameraError,
    liveVideoRef,
    startCamera,
    stopCamera,
  } = useCamera({
    width: 1280,
    height: 960,
    audio: false,
  });

  const processFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setPreview(base64);
        const base64Data = base64.split(",")[1];
        onImageSelect(base64Data);
      };
      reader.readAsDataURL(file);
    },
    [onImageSelect]
  );

  const { getRootProps, getInputProps, isDragActive, open: openFilePicker } = useDropzone({
    accept: { "image/*": [] },
    maxFiles: 1,
    noClick: true,
    onDrop: (files) => {
      if (files[0]) processFile(files[0]);
    },
  });

  // Take photo
  const takePhoto = useCallback(() => {
    if (!liveVideoRef.current || !canvasRef.current) return;

    const video = liveVideoRef.current;
    const canvas = canvasRef.current;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the current video frame to canvas
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Get base64 data from canvas
      const base64 = canvas.toDataURL("image/jpeg", 0.9);
      setPreview(base64);

      // Extract base64 data without prefix and send to parent
      const base64Data = base64.split(",")[1];
      onImageSelect(base64Data);

      // Stop camera after taking photo
      stopCamera();
    }
  }, [liveVideoRef, onImageSelect, stopCamera]);

  const handleCameraClick = (e: React.MouseEvent | React.TouchEvent | React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // On mobile, use native camera input instead of getUserMedia
    if (isMobile && cameraInputRef.current) {
      cameraInputRef.current.click();
    } else {
      startCamera();
    }
  };

  // Handle file from native camera input (mobile)
  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // Reset input so the same file can be selected again
    e.target.value = '';
  };

  const handleUploadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openFilePicker();
  };

  const clearPreview = () => {
    setPreview(null);
  };

  return (
    <div className="w-full">
      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />

      <AnimatePresence mode="wait">
        {/* Camera Mode */}
        {isCameraMode ? (
          <motion.div
            key="camera"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-4"
          >
            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl shadow-black/10 aspect-[4/3] bg-black">
              <video
                ref={liveVideoRef}
                className="w-full h-full object-cover"
                autoPlay
                muted
                playsInline
              />

              {/* Close button */}
              <button
                onClick={stopCamera}
                className="absolute top-4 right-4 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white backdrop-blur-md transition-all hover:scale-105 active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Camera error message */}
              {cameraError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-6">
                  <div className="text-center">
                    <p className="text-red-400 font-medium mb-4">{cameraError}</p>
                    <button
                      onClick={stopCamera}
                      className="px-6 py-2 bg-white text-black rounded-xl font-bold"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Capture button */}
            {!cameraError && (
              <div className="flex justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={takePhoto}
                  className="w-20 h-20 bg-white rounded-full shadow-lg shadow-black/20 flex items-center justify-center border-4 border-black cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="w-14 h-14 bg-black rounded-full" />
                </motion.button>
              </div>
            )}
          </motion.div>
        ) : preview ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative rounded-[2rem] overflow-hidden shadow-2xl shadow-black/10 aspect-square"
          >
            <Image
              src={preview}
              alt="Food preview"
              fill
              className="object-cover"
              unoptimized
            />

            {/* Scanning Overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-10 backdrop-blur-sm">
                <motion.div
                  initial={{ height: "0%" }}
                  animate={{ height: "100%" }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "linear",
                  }}
                  className="absolute top-0 w-full bg-gradient-to-b from-transparent via-white/20 to-transparent pointer-events-none"
                />
                <div className="relative z-20 bg-white/10 p-4 rounded-full mb-4 backdrop-blur-md">
                  <Scan className="w-8 h-8 text-white animate-pulse" />
                </div>
                <p className="text-white font-medium tracking-wide text-sm animate-pulse">
                  Analyzing nutrition...
                </p>
              </div>
            )}

            {!isLoading && (
              <button
                onClick={clearPreview}
                className="absolute top-4 right-4 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white backdrop-blur-md transition-all hover:scale-105 active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </motion.div>
        ) : (
          <div
            key="upload"
            {...getRootProps()}
            className={cn(
              "group relative aspect-[4/3] rounded-[2.5rem] border-2 border-dashed transition-all duration-300 overflow-hidden",
              isDragActive
                ? "border-black bg-gray-50 scale-[1.02]"
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
            )}
          >
            <input {...getInputProps()} />
            {/* Hidden input for mobile native camera capture */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleCameraCapture}
              className="absolute opacity-0 w-0 h-0"
            />

            <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
              <div className="flex gap-6 mb-8">
                <motion.button
                  type="button"
                  onClick={handleUploadClick}
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-20 h-20 bg-white rounded-3xl shadow-lg shadow-gray-200/50 flex items-center justify-center border border-gray-100 cursor-pointer"
                >
                  <Upload className="w-8 h-8 text-gray-900" />
                </motion.button>

                <motion.button
                  type="button"
                  onClick={handleCameraClick}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-20 h-20 bg-black text-white rounded-3xl shadow-lg shadow-black/20 flex items-center justify-center cursor-pointer hover:bg-gray-900 transition-colors"
                  style={{ touchAction: 'manipulation' }}
                >
                  <Camera className="w-8 h-8" />
                </motion.button>
              </div>

              <div className="text-center space-y-2">
                <p className="text-xl font-bold font-oswald uppercase tracking-wide">
                  Upload or Capture
                </p>
                <p className="text-sm text-gray-400 font-medium">
                  Supports JPG, PNG, WEBP
                </p>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
