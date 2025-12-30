"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, X, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { WorkoutPlanResponse } from "@/lib/gemini-workout-planner";

interface WorkoutResultsProps {
  result: WorkoutPlanResponse;
  onSave: (notes: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function WorkoutResults({
  result,
  onSave,
  onCancel,
  isLoading,
}: WorkoutResultsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(result.workoutNotes);

  const handleSave = () => {
    onSave(notes);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-gray-50 to-white rounded-[2rem] p-8 border-2 border-gray-100"
      >
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">💪</span>
          </div>
          <div>
            <h3 className="text-xl font-bold font-oswald uppercase tracking-tight mb-2">
              Your Personalized Plan
            </h3>
            <p className="text-gray-600 leading-relaxed">{result.summary}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
              Warm-up
            </p>
            <p className="text-sm text-gray-700">{result.warmup}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
              Cool-down
            </p>
            <p className="text-sm text-gray-700">{result.cooldown}</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-[2rem] p-8 border-2 border-gray-100"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold font-oswald uppercase tracking-tight">
            Workout Plan
          </h3>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 transition-all"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {result.exercises.map((exercise, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all"
            >
              <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-sm">
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-black">{exercise.name}</h4>
                  <span className="text-xs font-bold text-black bg-white px-3 py-1 rounded-full">
                    {exercise.sets} × {exercise.reps}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{exercise.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block">
            Full Workout Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={!isEditing}
            className={`w-full px-4 py-3 rounded-xl border-2 ${
              isEditing
                ? "border-black bg-white focus:outline-none focus:ring-2 focus:ring-black/20"
                : "border-transparent bg-gray-50"
            } transition-all text-sm leading-relaxed min-h-[150px] resize-none`}
          />
        </div>
      </motion.div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex-1 h-14 border-2 border-gray-200 hover:border-black hover:bg-black hover:text-white transition-all font-bold font-oswald uppercase tracking-wider text-base"
        >
          <X className="w-5 h-5 mr-2" />
          Discard
        </Button>
        <Button
          onClick={handleSave}
          disabled={isLoading}
          className="flex-1 h-14 bg-black text-white hover:bg-gray-900 hover:scale-105 transition-all font-bold font-oswald uppercase tracking-wider text-base flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check className="w-5 h-5" />
              Save Workout
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
