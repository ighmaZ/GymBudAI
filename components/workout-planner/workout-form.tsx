"use client";

import { useState } from "react";
import { motion } from "framer-motion";
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

  const inputClasses = "w-full px-4 py-3 bg-white/50 backdrop-blur-sm hover:bg-white rounded-2xl border-2 border-transparent focus:border-black focus:bg-white outline-none transition-all duration-300 font-bold text-lg shadow-sm hover:shadow-md placeholder:font-normal placeholder:text-gray-300";
  const labelClasses = "block text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 mb-4";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-4">
          <label className={labelClasses}>
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
            className={inputClasses}
          />
        </div>

        <div className="space-y-3">
          <label className={labelClasses}>
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
            className={inputClasses}
          />
        </div>

        <div className="space-y-3">
          <label className={labelClasses}>
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
            className={inputClasses}
          />
        </div>
      </div>

      <div className="space-y-3">
        <label className={labelClasses}>
          Fitness Goal
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { value: "muscle_gain", label: "Muscle Gain", desc: "Build strength" },
            { value: "fat_loss", label: "Fat Loss", desc: "Burn calories" },
            { value: "endurance", label: "Endurance", desc: "Stamina" },
          ].map((option) => (
            <motion.button
              key={option.value}
              type="button"
              onClick={() => setGoal(option.value)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative py-4 px-3 rounded-2xl text-left transition-all duration-300 border-2 overflow-hidden ${
                goal === option.value
                  ? "border-black bg-black text-white shadow-xl"
                  : "border-transparent bg-white/50 text-gray-600 hover:bg-white hover:border-gray-100/50 shadow-sm"
              }`}
            >
              <div className="relative z-10 flex flex-col items-center gap-1.5">
                <span className="font-bold text-sm uppercase tracking-wide">{option.label}</span>
                <span className={`text-[10px] font-medium tracking-wider uppercase ${goal === option.value ? "text-gray-400" : "text-gray-400"}`}>
                  {option.desc}
                </span>
              </div>
              {goal === option.value && (
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-20" />
              )}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <label className={labelClasses}>
          Days per Week
        </label>
        <div className="flex gap-2 justify-between bg-white/30 p-2 rounded-3xl">
          {["1", "2", "3", "4", "5", "6", "7"].map((days) => (
            <motion.button
              key={days}
              type="button"
              onClick={() => setFrequency(days)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full font-bold text-base transition-all duration-300 flex items-center justify-center ${
                frequency === days
                  ? "bg-black text-white shadow-lg ring-4 ring-black/10"
                  : "bg-white text-gray-400 hover:text-black hover:bg-white hover:shadow-md"
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
        transition={{ delay: 0.4 }}
        className="pt-4"
      >
        <Button
          type="submit"
          disabled={isLoading}
          className="relative w-full h-16 bg-black text-white overflow-hidden rounded-3xl group shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-black to-gray-900 transition-opacity" />
          <div className="relative flex items-center justify-center gap-3">
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span className="font-bold font-oswald uppercase tracking-wider">Designing Plan...</span>
              </>
            ) : (
              <>
                <span className="font-bold font-oswald uppercase tracking-wider text-lg">Generate Workout</span>
              </>
            )}
          </div>
        </Button>
      </motion.div>

            
    </form>
  );
}
