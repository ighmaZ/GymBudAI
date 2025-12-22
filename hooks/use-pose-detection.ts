"use client";

import { useState, useCallback, useRef } from "react";
import {
  PoseLandmarker,
  FilesetResolver,
  DrawingUtils,
} from "@mediapipe/tasks-vision";
import type { PoseLandmark, PoseMetrics } from "@/types";
import { calculatePoseMetrics } from "@/lib/pose-utils";

interface UsePoseDetectionReturn {
  isLoading: boolean;
  isProcessing: boolean;
  error: string | null;
  processVideo: (
    video: HTMLVideoElement,
    canvas: HTMLCanvasElement
  ) => Promise<PoseMetrics[]>;
}

export function usePoseDetection(): UsePoseDetectionReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);

  // Initialize MediaPipe PoseLandmarker
  const initializePoseLandmarker = useCallback(async () => {
    if (poseLandmarkerRef.current) return poseLandmarkerRef.current;

    setIsLoading(true);
    setError(null);

    try {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );

      const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numPoses: 1,
      });

      poseLandmarkerRef.current = poseLandmarker;
      return poseLandmarker;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to initialize pose detection";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Process video and extract pose metrics from frames
  const processVideo = useCallback(
    async (
      video: HTMLVideoElement,
      canvas: HTMLCanvasElement
    ): Promise<PoseMetrics[]> => {
      setIsProcessing(true);
      setError(null);

      try {
        const poseLandmarker = await initializePoseLandmarker();
        if (!poseLandmarker) throw new Error("Failed to initialize");

        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Failed to get canvas context");

        // Set canvas size to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const drawingUtils = new DrawingUtils(ctx);
        const allMetrics: PoseMetrics[] = [];

        // Sample frames throughout the video (every 0.5 seconds)
        const duration = video.duration;
        const frameInterval = 0.5;
        const frameCount = Math.min(Math.floor(duration / frameInterval), 20); // Max 20 frames

        for (let i = 0; i <= frameCount; i++) {
          const time = i * frameInterval;
          video.currentTime = time;

          // Wait for video to seek to the frame
          await new Promise<void>((resolve) => {
            video.onseeked = () => resolve();
          });

          // Detect pose at current frame
          const result = poseLandmarker.detectForVideo(
            video,
            performance.now()
          );

          if (result.landmarks && result.landmarks.length > 0) {
            // Convert MediaPipe landmarks to our format
            const landmarks: PoseLandmark[] = result.landmarks[0].map((lm) => ({
              x: lm.x,
              y: lm.y,
              z: lm.z,
              visibility: lm.visibility ?? 1,
            }));

            // Calculate metrics for this frame
            const metrics = calculatePoseMetrics(landmarks);
            allMetrics.push(metrics);

            // Draw skeleton on canvas (last frame stays visible)
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(video, 0, 0);

            // Draw pose landmarks
            drawingUtils.drawLandmarks(result.landmarks[0], {
              radius: 3,
              color: "#00FF00",
            });
            drawingUtils.drawConnectors(
              result.landmarks[0],
              PoseLandmarker.POSE_CONNECTIONS,
              { color: "#00FF00", lineWidth: 2 }
            );
          }
        }

        return allMetrics;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to process video";
        setError(message);
        throw err;
      } finally {
        setIsProcessing(false);
      }
    },
    [initializePoseLandmarker]
  );

  return {
    isLoading,
    isProcessing,
    error,
    processVideo,
  };
}
