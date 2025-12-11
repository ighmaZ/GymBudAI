"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CalorieRingProps {
  consumed: number;
  goal: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function CalorieRing({
  consumed,
  goal,
  size = 200,
  strokeWidth = 12,
  className,
}: CalorieRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min((consumed / goal) * 100, 100);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const remaining = Math.max(goal - consumed, 0);

  // Color based on percentage
  const getColor = () => {
    if (percentage >= 100) return "#ef4444"; // Red - over limit
    if (percentage >= 80) return "#f59e0b"; // Orange - getting close
    return "#000000"; // Black - normal
  };

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center",
        className
      )}
    >
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#f3f4f6"
          strokeWidth={strokeWidth}
        />

        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="text-4xl font-bold font-oswald"
        >
          {consumed.toLocaleString()}
        </motion.span>
        <span className="text-sm text-gray-500">kcal eaten</span>
        <div className="mt-2 text-xs text-gray-400">
          {remaining > 0 ? (
            <span>{remaining.toLocaleString()} remaining</span>
          ) : (
            <span className="text-red-500">Over by {Math.abs(remaining)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
