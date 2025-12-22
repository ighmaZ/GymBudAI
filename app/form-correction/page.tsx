"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Activity, Sparkles, Eye } from "lucide-react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";

import { VideoUpload } from "@/components/form-correction/video-upload";
import { FormResults } from "@/components/form-correction/form-results";
import { Button } from "@/components/ui/button";
import type { FormAnalysisResult } from "@/types";

type PageState = "upload" | "analyzing" | "results";

export default function FormCorrectionPage() {
  const [pageState, setPageState] = useState<PageState>("upload");
  const [analysisResult, setAnalysisResult] =
    useState<FormAnalysisResult | null>(null);

  // Mutation to send video to Gemini for analysis
  const analyzeMutation = useMutation({
    mutationFn: async ({
      videoBase64,
      mimeType,
    }: {
      videoBase64: string;
      mimeType: string;
    }) => {
      const res = await fetch("/api/analyze-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoBase64, mimeType }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to analyze form");
      }
      return res.json() as Promise<FormAnalysisResult>;
    },
    onSuccess: (data) => {
      setAnalysisResult(data);
      setPageState("results");
    },
    onError: (err) => {
      console.error("Analysis error:", err);
      alert("Failed to analyze your form. Please try again.");
      setPageState("upload");
    },
  });

  // Handle video selection - now receives base64 directly
  const handleVideoSelect = useCallback(
    (videoBase64: string, mimeType: string) => {
      setPageState("analyzing");
      analyzeMutation.mutate({ videoBase64, mimeType });
    },
    [analyzeMutation]
  );

  // Reset everything
  const handleAnalyzeAnother = () => {
    setAnalysisResult(null);
    setPageState("upload");
  };

  // Get page title based on state
  const getPageTitle = () => {
    switch (pageState) {
      case "upload":
        return "Form Correction";
      case "analyzing":
        return "Analyzing...";
      case "results":
        return "Your Results";
      default:
        return "Form Correction";
    }
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="p-2 -ml-2 text-gray-500 hover:text-black hover:bg-gray-50 rounded-full transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-bold font-oswald uppercase tracking-wide">
            {getPageTitle()}
          </h1>
          <div className="w-9" />
        </div>
      </header>

      <main className="max-w-xl mx-auto px-6 py-8 pb-32">
        <AnimatePresence mode="wait">
          {/* Upload State */}
          {pageState === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold font-oswald uppercase tracking-tight">
                  Check Your Form
                </h2>
                <p className="text-gray-500 font-medium">
                  Upload a video of your exercise
                </p>
              </div>

              <VideoUpload
                onVideoSelect={handleVideoSelect}
                isLoading={false}
              />

              {/* Feature highlights */}
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-2">
                    <Eye className="w-5 h-5 text-gray-600" />
                  </div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    AI Vision
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-2">
                    <Activity className="w-5 h-5 text-gray-600" />
                  </div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Form Score
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-2">
                    <Sparkles className="w-5 h-5 text-gray-600" />
                  </div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Pro Tips
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Analyzing State */}
          {pageState === "analyzing" && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex flex-col items-center justify-center py-20">
                {/* Animated AI icon */}
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="w-24 h-24 bg-black rounded-full flex items-center justify-center mb-8"
                >
                  <Eye className="w-12 h-12 text-white" />
                </motion.div>

                <h2 className="text-2xl font-bold font-oswald uppercase tracking-tight text-center">
                  AI Analyzing
                </h2>
                <p className="text-gray-500 font-medium text-center mt-2">
                  Watching your video and analyzing form...
                </p>

                {/* Progress dots */}
                <div className="flex gap-2 mt-8">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-3 h-3 bg-black rounded-full"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.3, 1, 0.3],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    />
                  ))}
                </div>
              </div>

              <Button
                variant="ghost"
                onClick={handleAnalyzeAnother}
                className="w-full text-gray-500 hover:text-black hover:bg-gray-50 uppercase tracking-wide font-bold"
                disabled={analyzeMutation.isPending}
              >
                Cancel
              </Button>
            </motion.div>
          )}

          {/* Results State */}
          {pageState === "results" && analysisResult && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <FormResults
                result={analysisResult}
                onAnalyzeAnother={handleAnalyzeAnother}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
