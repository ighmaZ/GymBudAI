"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WorkoutFormProps {
  onSubmit: (data: {
    age: number;
    weight: number;
    height: number;
    goal: string;
    frequency: number;
  }) => void;
  isLoading: boolean;
}

export function WorkoutForm({ onSubmit, isLoading }: WorkoutFormProps) {
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [goal, setGoal] = useState("muscle_gain");
  const [frequency, setFrequency] = useState("3");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      age: parseInt(age),
      weight: parseInt(weight),
      height: parseInt(height),
      goal,
      frequency: parseInt(frequency),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
            Age
          </label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="25"
            min="10"
            max="100"
            required
            className="w-full px-4 py-3 bg-gray-50 hover:bg-white rounded-2xl border-2 border-transparent focus:border-black focus:bg-white outline-none transition-all duration-300 font-bold text-lg shadow-sm hover:shadow-md"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
            Weight (kg)
          </label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="70"
            min="30"
            max="300"
            required
            className="w-full px-4 py-3 bg-gray-50 hover:bg-white rounded-2xl border-2 border-transparent focus:border-black focus:bg-white outline-none transition-all duration-300 font-bold text-lg shadow-sm hover:shadow-md"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
            Height (cm)
          </label>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder="175"
            min="100"
            max="250"
            required
            className="w-full px-4 py-3 bg-gray-50 hover:bg-white rounded-2xl border-2 border-transparent focus:border-black focus:bg-white outline-none transition-all duration-300 font-bold text-lg shadow-sm hover:shadow-md"
          />
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
          Fitness Goal
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: "muscle_gain", label: "Muscle Gain", emoji: "💪" },
            { value: "fat_loss", label: "Fat Loss", emoji: "🔥" },
            { value: "endurance", label: "Endurance", emoji: "⚡" },
          ].map((option) => (
            <motion.button
              key={option.value}
              type="button"
              onClick={() => setGoal(option.value)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative py-4 px-3 rounded-2xl font-bold text-sm uppercase tracking-wide transition-all duration-300 ${
                goal === option.value
                  ? "bg-gradient-to-br from-black to-gray-800 text-white shadow-xl"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100 shadow-sm hover:shadow-md"
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-lg">{option.emoji}</span>
                <span>{option.label}</span>
              </div>
              {goal === option.value && (
                <motion.div
                  layoutId="selectedGoal"
                  className="absolute inset-0 rounded-2xl bg-gradient-to-br from-black to-gray-800 -z-10"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
          Days per Week
        </label>
        <div className="flex gap-2 justify-between">
          {["1", "2", "3", "4", "5", "6", "7"].map((days) => (
            <motion.button
              key={days}
              type="button"
              onClick={() => setFrequency(days)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`w-12 h-12 rounded-2xl font-bold text-base transition-all duration-300 ${
                frequency === days
                  ? "bg-gradient-to-br from-black to-gray-800 text-white shadow-xl"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100 shadow-sm hover:shadow-md"
              }`}
            >
              {days}
            </motion.button>
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-16 bg-gradient-to-r from-black via-gray-800 to-black text-white hover:via-gray-900 disabled:opacity-50 disabled:cursor-not-allowed rounded-3xl transition-all duration-300 font-bold font-oswald uppercase tracking-wider text-lg flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl hover:-translate-y-1"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            <>Generate Plan</>
          )}
        </Button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-center text-xs text-gray-400 font-medium"
      >
        AI will create a personalized plan based on your profile
      </motion.p>
    </form>
  );
}
