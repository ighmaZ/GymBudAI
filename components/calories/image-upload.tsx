"use client";

import { useCallback, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import { Camera, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ImageUploadProps {
  onImageSelect: (base64: string) => void;
  isLoading?: boolean;
}

export function ImageUpload({ onImageSelect, isLoading }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Convert file to base64
  const processFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setPreview(base64);
        // Remove the data:image/...;base64, prefix
        const base64Data = base64.split(",")[1];
        onImageSelect(base64Data);
      };
      reader.readAsDataURL(file);
    },
    [onImageSelect]
  );

  // Dropzone setup
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    maxFiles: 1,
    onDrop: (files) => {
      if (files[0]) processFile(files[0]);
    },
  });

  // Camera capture (mobile)
  const handleCameraCapture = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  // Clear preview
  const clearPreview = () => {
    setPreview(null);
  };

  return (
    <div className="w-full">
      {preview ? (
        // Preview mode
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative rounded-3xl overflow-hidden"
        >
          <Image
            src={preview}
            alt="Food preview"
            width={400}
            height={256}
            className="w-full h-64 object-cover"
            unoptimized
          />
          {!isLoading && (
            <button
              onClick={clearPreview}
              className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          {isLoading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-white text-center">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-sm">Analyzing food...</p>
              </div>
            </div>
          )}
        </motion.div>
      ) : (
        // Upload mode
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all",
            "hover:border-gray-400 hover:bg-gray-50",
            isDragActive && "border-black bg-gray-100"
          )}
        >
          <input {...getInputProps()} />

          {/* Hidden camera input for mobile */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex flex-col items-center gap-4">
            <div className="flex gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center"
              >
                <Upload className="w-6 h-6" />
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCameraCapture();
                }}
                className="w-16 h-16 bg-gray-100 text-black rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <Camera className="w-6 h-6" />
              </motion.button>
            </div>

            <div>
              <p className="text-lg font-bold font-oswald uppercase">
                {isDragActive ? "Drop it here!" : "Upload Food Photo"}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Drag & drop or tap to capture
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
