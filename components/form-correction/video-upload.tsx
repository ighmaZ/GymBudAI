"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Video, Upload, X, Play, Loader2, Square, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCamera } from "@/hooks/use-camera";

interface VideoUploadProps {
  onVideoSelect: (videoBase64: string, mimeType: string) => void;
  isLoading?: boolean;
}

// Detect if user is on a mobile device
const isMobileDevice = () => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

export function VideoUpload({ onVideoSelect, isLoading }: VideoUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Detect mobile on mount
  useEffect(() => {
    setIsMobile(isMobileDevice());
  }, []);

  const {
    isCameraMode,
    cameraError,
    liveVideoRef,
    mediaStreamRef,
    startCamera,
    stopCamera: stopCameraBase,
  } = useCamera({
    width: 1280,
    height: 720,
    audio: true,
  });

  // Extended stopCamera to also handle recording cleanup
  const stopCamera = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
    setRecordingTime(0);
    stopCameraBase();
  }, [stopCameraBase]);

  const processFile = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setPreview(url);
    setVideoFile(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive, open: openFilePicker } = useDropzone({
    accept: {
      "video/*": [".mp4", ".mov", ".webm", ".avi"],
    },
    maxFiles: 1,
    noClick: true,
    onDrop: (files) => {
      if (files[0]) processFile(files[0]);
    },
  });

  // Start recording
  const startRecording = useCallback(() => {
    if (!mediaStreamRef.current) return;

    recordedChunksRef.current = [];

    // Try different mime types for browser compatibility
    const mimeTypes = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm",
      "video/mp4",
    ];

    let selectedMimeType = "";
    for (const mimeType of mimeTypes) {
      if (MediaRecorder.isTypeSupported(mimeType)) {
        selectedMimeType = mimeType;
        break;
      }
    }

    try {
      const mediaRecorder = new MediaRecorder(mediaStreamRef.current, {
        mimeType: selectedMimeType || undefined,
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, {
          type: selectedMimeType || "video/webm",
        });
        const file = new File([blob], "recorded-video.webm", {
          type: selectedMimeType || "video/webm",
        });
        processFile(file);
        stopCamera();
      };

      mediaRecorder.start(1000); // Collect data every second
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Recording error:", error);
    }
  }, [mediaStreamRef, processFile, stopCamera]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setIsRecording(false);
    }
  }, [isRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Format recording time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

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

  const handleAnalyze = useCallback(async () => {
    if (!videoFile) return;

    setIsConverting(true);

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
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
        {/* Camera Recording Mode */}
        {isCameraMode ? (
          <motion.div
            key="camera"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-4"
          >
            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl shadow-black/10 aspect-video bg-black">
              <video
                ref={liveVideoRef}
                className="w-full h-full object-cover"
                autoPlay
                muted
                playsInline
              />

              {/* Recording indicator */}
              {isRecording && (
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-full">
                  <motion.div
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-3 h-3 bg-white rounded-full"
                  />
                  <span className="font-bold font-oswald tracking-wider">
                    REC {formatTime(recordingTime)}
                  </span>
                </div>
              )}

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

            {/* Recording controls */}
            <div className="flex justify-center gap-4">
              {!isRecording ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startRecording}
                  className="flex items-center gap-3 px-8 py-4 bg-red-600 text-white rounded-2xl font-bold font-oswald uppercase tracking-wider hover:bg-red-700 transition-colors"
                >
                  <Circle className="w-5 h-5 fill-white" />
                  Start Recording
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={stopRecording}
                  className="flex items-center gap-3 px-8 py-4 bg-black text-white rounded-2xl font-bold font-oswald uppercase tracking-wider hover:bg-gray-900 transition-colors"
                >
                  <Square className="w-5 h-5 fill-white" />
                  Stop Recording
                </motion.button>
              )}
            </div>
          </motion.div>
        ) : preview ? (
          <motion.div
            key="preview"
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
            key="upload"
            {...getRootProps()}
            className={cn(
              "group relative aspect-video rounded-[2.5rem] border-2 border-dashed transition-all duration-300 overflow-hidden cursor-pointer",
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
              accept="video/*"
              capture="environment"
              onChange={handleCameraCapture}
              className="hidden"
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
                  onTouchEnd={handleCameraClick}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-20 h-20 bg-black text-white rounded-3xl shadow-lg shadow-black/20 flex items-center justify-center cursor-pointer"
                  style={{ touchAction: 'manipulation' }}
                >
                  <Video className="w-8 h-8" />
                </motion.button>
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
