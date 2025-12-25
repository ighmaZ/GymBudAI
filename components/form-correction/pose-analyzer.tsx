"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Scan, Activity } from "lucide-react";

interface PoseAnalyzerProps {
  videoSrc: string;
  isProcessing: boolean;
  progress?: number;
  onVideoReady: (video: HTMLVideoElement, canvas: HTMLCanvasElement) => void;
}

export function PoseAnalyzer({
  videoSrc,
  isProcessing,
  progress = 0,
  onVideoReady,
}: PoseAnalyzerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;

      video.onloadedmetadata = () => {
        if (canvasRef.current) {
          canvasRef.current.width = video.videoWidth;
          canvasRef.current.height = video.videoHeight;
          onVideoReady(video, canvasRef.current);
        }
      };
    }
  }, [videoSrc, onVideoReady]);

  return (
    <div className="space-y-6">
      <div className="relative rounded-[2rem] overflow-hidden shadow-2xl shadow-black/10 aspect-video bg-black">
        {/* Hidden video for processing */}
        <video
          ref={videoRef}
          src={videoSrc}
          className="absolute inset-0 w-full h-full object-contain opacity-0"
          playsInline
          muted
        />

        {/* Canvas for skeleton overlay */}
        <canvas ref={canvasRef} className="w-full h-full object-contain" />

        {/* Processing Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-10 backdrop-blur-sm">
            {/* Scanning Animation */}
            <motion.div
              initial={{ top: "0%" }}
              animate={{ top: "100%" }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "linear",
              }}
              className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent"
            />

            <div className="relative z-20 bg-white/10 p-6 rounded-full mb-6 backdrop-blur-md">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Activity className="w-10 h-10 text-white" />
              </motion.div>
            </div>

            <div className="text-center space-y-3">
              <p className="text-white font-bold font-oswald uppercase tracking-wider text-lg">
                Analyzing Your Form
              </p>
              <p className="text-white/70 text-sm">
                Detecting pose landmarks...
              </p>

              {/* Progress Bar */}
              <div className="w-48 h-2 bg-white/20 rounded-full overflow-hidden mx-auto mt-4">
                <motion.div
                  className="h-full bg-green-400 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-white/50 text-xs">{Math.round(progress)}%</p>
            </div>
          </div>
        )}

        {/* Skeleton detected indicator */}
        {!isProcessing && (
          <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-white text-sm font-medium">
              Pose Detected
            </span>
          </div>
        )}
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-2xl p-4 text-center">
          <Scan className="w-6 h-6 mx-auto mb-2 text-gray-400" />
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Landmarks
          </p>
          <p className="text-2xl font-bold font-oswald">33</p>
        </div>
        <div className="bg-gray-50 rounded-2xl p-4 text-center">
          <Activity className="w-6 h-6 mx-auto mb-2 text-gray-400" />
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Frames
          </p>
          <p className="text-2xl font-bold font-oswald">
            {isProcessing ? "..." : "Ready"}
          </p>
        </div>
      </div>
    </div>
  );
}


