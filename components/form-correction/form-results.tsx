"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  RotateCcw,
  TrendingUp,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { FormAnalysisResult } from "@/types";

interface FormResultsProps {
  result: FormAnalysisResult;
  onAnalyzeAnother: () => void;
}

export function FormResults({ result, onAnalyzeAnother }: FormResultsProps) {
  const {
    exercise,
    confidence,
    effectivenessScore,
    potentialScore,
    goodPoints,
    improvementPoints,
    tips,
    overallGrade,
  } = result;

  // Grade colors
  const gradeColors: Record<string, string> = {
    A: "text-green-500 bg-green-50",
    B: "text-blue-500 bg-blue-50",
    C: "text-yellow-500 bg-yellow-50",
    D: "text-orange-500 bg-orange-50",
    F: "text-red-500 bg-red-50",
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header Card - Exercise & Score */}
      <motion.div
        variants={itemVariants}
        className="bg-gray-50 rounded-[2rem] p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-6 opacity-5">
          <Target className="w-32 h-32" />
        </div>

        <div className="relative z-10">
          {/* Exercise Name */}
          <div className="text-center mb-8">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">
              Exercise Detected
            </p>
            <h2 className="text-3xl font-bold font-oswald uppercase tracking-tight">
              {exercise}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {confidence}% confidence
            </p>
          </div>

          {/* Score Ring */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <svg className="w-40 h-40 transform -rotate-90">
                {/* Background circle */}
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="#e5e7eb"
                  strokeWidth="12"
                  fill="none"
                />
                {/* Progress circle */}
                <motion.circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="#000"
                  strokeWidth="12"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: "0 440" }}
                  animate={{
                    strokeDasharray: `${(effectivenessScore / 100) * 440} 440`,
                  }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold font-oswald">
                  {effectivenessScore}
                </span>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Score
                </span>
              </div>
            </div>
          </div>

          {/* Grade & Potential */}
          <div className="flex justify-center gap-8">
            <div className="text-center">
              <div
                className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-2",
                  gradeColors[overallGrade] || gradeColors.C
                )}
              >
                <span className="text-2xl font-bold font-oswald">
                  {overallGrade}
                </span>
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Grade
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="w-6 h-6 text-gray-600" />
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                +{potentialScore - effectivenessScore}% Potential
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Good Points */}
      <motion.div
        variants={itemVariants}
        className="bg-green-50 rounded-[2rem] p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-lg font-bold font-oswald uppercase tracking-wide text-green-900">
            What You&apos;re Doing Well
          </h3>
        </div>
        <ul className="space-y-3">
          {goodPoints.map((point, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="flex items-start gap-3"
            >
              <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-green-800">{point}</span>
            </motion.li>
          ))}
        </ul>
      </motion.div>

      {/* Improvement Points */}
      <motion.div
        variants={itemVariants}
        className="bg-orange-50 rounded-[2rem] p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-orange-600" />
          </div>
          <h3 className="text-lg font-bold font-oswald uppercase tracking-wide text-orange-900">
            Areas to Improve
          </h3>
        </div>
        <ul className="space-y-3">
          {improvementPoints.map((point, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
              <span className="text-orange-800">{point}</span>
            </motion.li>
          ))}
        </ul>
      </motion.div>

      {/* Pro Tips */}
      <motion.div
        variants={itemVariants}
        className="bg-blue-50 rounded-[2rem] p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-bold font-oswald uppercase tracking-wide text-blue-900">
            Pro Tips
          </h3>
        </div>
        <ul className="space-y-3">
          {tips.map((tip, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 + index * 0.1 }}
              className="flex items-start gap-3"
            >
              <Lightbulb className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <span className="text-blue-800">{tip}</span>
            </motion.li>
          ))}
        </ul>
      </motion.div>

      {/* Analyze Another Button */}
      <motion.button
        variants={itemVariants}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onAnalyzeAnother}
        className="w-full py-4 bg-black text-white rounded-2xl font-bold font-oswald uppercase tracking-wider flex items-center justify-center gap-3 hover:bg-gray-900 transition-colors"
      >
        <RotateCcw className="w-5 h-5" />
        Analyze Another Video
      </motion.button>
    </motion.div>
  );
}


