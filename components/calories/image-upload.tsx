"use client";

import { useCallback, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, X, Image as ImageIcon, Scan } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ImageUploadProps {
  onImageSelect: (base64: string) => void;
  isLoading?: boolean;
}

export function ImageUpload({ onImageSelect, isLoading }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    maxFiles: 1,
    onDrop: (files) => {
      if (files[0]) processFile(files[0]);
    },
  });

  const handleCameraCapture = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const clearPreview = () => {
    setPreview(null);
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div
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
                    ease: "linear"
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
            {...getRootProps()}
            className={cn(
              "group relative aspect-[4/3] rounded-[2.5rem] border-2 border-dashed transition-all duration-300 overflow-hidden",
              isDragActive 
                ? "border-black bg-gray-50 scale-[1.02]" 
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
            )}
          >
            <input {...getInputProps()} />
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
              <div className="flex gap-6 mb-8">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-20 h-20 bg-white rounded-3xl shadow-lg shadow-gray-200/50 flex items-center justify-center border border-gray-100 cursor-pointer"
                >
                  <Upload className="w-8 h-8 text-gray-900" />
                </motion.div>
                
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCameraCapture();
                  }}
                  className="w-20 h-20 bg-black text-white rounded-3xl shadow-lg shadow-black/20 flex items-center justify-center cursor-pointer hover:bg-gray-900 transition-colors"
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
