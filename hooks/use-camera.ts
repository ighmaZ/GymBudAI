"use client";

import { useCallback, useRef, useState, useEffect } from "react";

export interface UseCameraOptions {
  /** Whether to include audio in the stream (for video recording) */
  audio?: boolean;
  /** Ideal video width */
  width?: number;
  /** Ideal video height */
  height?: number;
  /** Preferred facing mode */
  facingMode?: "user" | "environment";
}

export interface UseCameraReturn {
  /** Whether camera mode is active */
  isCameraMode: boolean;
  /** Error message if camera failed to start */
  cameraError: string | null;
  /** Ref to attach to the live video element */
  liveVideoRef: React.RefObject<HTMLVideoElement | null>;
  /** Ref to access the media stream directly */
  mediaStreamRef: React.RefObject<MediaStream | null>;
  /** Start the camera stream */
  startCamera: () => Promise<void>;
  /** Stop the camera stream and cleanup */
  stopCamera: () => void;
}

const DEFAULT_OPTIONS: Required<UseCameraOptions> = {
  audio: false,
  width: 1280,
  height: 720,
  facingMode: "environment",
};

/**
 * Custom hook for managing camera stream access.
 * Handles camera initialization, cleanup, and error handling.
 */
export function useCamera(options: UseCameraOptions = {}): UseCameraReturn {
  const [isCameraMode, setIsCameraMode] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const liveVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  const startCamera = useCallback(async () => {
    setCameraError(null);
    setIsCameraMode(true); // Set camera mode first to render the video element
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mergedOptions.facingMode,
          width: { ideal: mergedOptions.width },
          height: { ideal: mergedOptions.height },
        },
        audio: mergedOptions.audio,
      });

      mediaStreamRef.current = stream;

      // Use requestAnimationFrame to wait for the video element to be rendered
      // This is more reliable on mobile than setTimeout
      const attachStream = () => {
        if (liveVideoRef.current) {
          const video = liveVideoRef.current;
          video.srcObject = stream;
          // Set attributes for mobile compatibility
          video.setAttribute('playsinline', 'true');
          video.setAttribute('webkit-playsinline', 'true');
          video.muted = true;
          video.play().catch((playError) => {
            console.error("Video play error:", playError);
          });
        } else {
          // Video element not yet available, try again on next frame
          requestAnimationFrame(attachStream);
        }
      };
      
      requestAnimationFrame(attachStream);
    } catch (error) {
      console.error("Camera access error:", error);
      setIsCameraMode(false); // Reset on error
      
      let errorMessage = "Unable to access camera. Please make sure you have a camera connected.";
      
      if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
          errorMessage = "Camera access denied. Please allow camera access in your browser settings.";
        } else if (error.name === "NotFoundError") {
          errorMessage = "No camera found. Please make sure you have a camera connected.";
        } else if (error.name === "NotReadableError") {
          errorMessage = "Camera is in use by another application. Please close other apps using the camera.";
        } else if (error.name === "OverconstrainedError") {
          errorMessage = "Camera doesn't support the requested settings. Trying with default settings.";
        }
      }
      
      setCameraError(errorMessage);
    }
  }, [mergedOptions.facingMode, mergedOptions.width, mergedOptions.height, mergedOptions.audio]);

  const stopCamera = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (liveVideoRef.current) {
      liveVideoRef.current.srcObject = null;
    }
    setIsCameraMode(false);
    setCameraError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
    };
  }, []);

  return {
    isCameraMode,
    cameraError,
    liveVideoRef,
    mediaStreamRef,
    startCamera,
    stopCamera,
  };
}
