"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Sparkles,
  Save,
} from "lucide-react";
import Link from "next/link";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { WorkoutForm } from "@/components/workout-planner/workout-form";
import { Button } from "@/components/ui/button";
import type { WorkoutPlanResponse } from "@/lib/gemini-workout-planner";
import { useSession } from "@/lib/auth-client";

type PageState = "planner" | "ai-form";

export default function WorkoutPlannerPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [pageState, setPageState] = useState<PageState>("planner");
  const [workoutNotes, setWorkoutNotes] = useState("");

  const { data: session, isPending: sessionLoading } = useSession();
  const user = session?.user;
  const userId = user?.id;

  const { data: savedWorkouts = [] } = useQuery({
    queryKey: ["workouts", userId],
    queryFn: async () => {
      if (!userId) return [];
      const res = await fetch("/api/workouts");
      if (!res.ok) throw new Error("Failed to fetch workouts");
      return res.json();
    },
    enabled: !!userId,
  });

  useEffect(() => {
    if (savedWorkouts.length > 0) {
      setWorkoutNotes(savedWorkouts[0]?.notes || "");
    }
  }, [savedWorkouts]);

  const generateMutation = useMutation({
    mutationFn: async (data: {
      age: number;
      weight: number;
      height: number;
      goal: string;
      frequency: number;
    }) => {
      const res = await fetch("/api/generate-workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to generate workout");
      return res.json() as Promise<WorkoutPlanResponse>;
    },
    onSuccess: (data) => {
      setWorkoutNotes(data.workoutNotes);
      setPageState("planner");
    },
    onError: () => {
      alert("Failed to generate workout. Please try again.");
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (notes: string) => {
      if (!userId) throw new Error("User not authenticated");
      const res = await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: new Date().toISOString(),
          notes,
        }),
      });
      if (!res.ok) throw new Error("Failed to save workout");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
      alert("Workout saved successfully!");
    },
    onError: () => {
      alert("Failed to save workout. Please try again.");
    },
  });

  const handleGenerate = (data: {
    age: number;
    weight: number;
    height: number;
    goal: string;
    frequency: number;
  }) => {
    generateMutation.mutate(data);
  };

  const handleSave = () => {
    if (workoutNotes.trim()) {
      saveMutation.mutate(workoutNotes);
    }
  };

  const handleGenerateAI = () => {
    setPageState("ai-form");
  };

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-white text-black font-sans flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  if (!userId) {
    router.push("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white text-black font-sans selection:bg-black selection:text-white">
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-gray-100/50">
        <div className="max-w-xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="p-2 -ml-2 text-gray-500 hover:text-black hover:bg-gray-100/80 rounded-full transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-bold font-oswald uppercase tracking-wide bg-gradient-to-r from-black to-gray-700 bg-clip-text text-transparent">
            Workout Plan
          </h1>
          <div className="w-9" />
        </div>
      </header>

      <main className="max-w-xl mx-auto px-6 py-8 pb-32">
        <AnimatePresence mode="wait">
          {pageState === "planner" && (
            <motion.div
              key="planner"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center justify-between mb-6"
              >
                <button
                  onClick={handleGenerateAI}
                  disabled={generateMutation.isPending}
                  className="group flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-black hover:to-gray-900 text-gray-700 hover:text-white rounded-2xl transition-all duration-300 shadow-sm hover:shadow-lg"
                >
                  <Sparkles className="w-4 h-4 group-hover:animate-pulse" />
                  <span className="text-sm font-bold font-oswald uppercase tracking-wider">
                    AI Generate
                  </span>
                </button>
                <motion.button
                  onClick={handleSave}
                  disabled={!workoutNotes.trim() || saveMutation.isPending}
                  className="group px-6 py-2.5 bg-black text-white hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-sm font-bold font-oswald uppercase tracking-wider">
                    {saveMutation.isPending ? "Saving..." : "Save"}
                  </span>
                </motion.button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="relative"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-black via-gray-600 to-black rounded-3xl opacity-20 blur-sm" />
                <div className="relative bg-white rounded-3xl p-6 shadow-xl ring-1 ring-gray-200/50">
                  <textarea
                    value={workoutNotes}
                    onChange={(e) => setWorkoutNotes(e.target.value)}
                    placeholder="Start typing your workout plan...&#10;&#10;Monday - Push Day&#10;Bench press: 3 × 8&#10;Overhead press: 3 × 10&#10;Tricep dips: 3 × 12&#10;&#10;Tuesday - Pull Day&#10;Pull-ups: 4 × 8&#10;Rows: 3 × 12&#10;Face pulls: 3 × 15&#10;&#10;Wednesday - Rest&#10;Light walk or yoga"
                    className="w-full h-[calc(100vh-320px)] px-0 py-0 bg-transparent outline-none text-base leading-relaxed resize-none placeholder:text-gray-300/70"
                    autoFocus
                    style={{ minHeight: "400px" }}
                  />
                </div>
              </motion.div>

              {workoutNotes.trim() && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 flex items-center gap-2 px-4 py-3 bg-green-50/80 backdrop-blur-sm rounded-2xl border border-green-200/50"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs font-bold text-green-700 font-oswald uppercase tracking-wider">
                    {workoutNotes.trim().split(/\r\n|\r|\n/).filter(line => line.trim()).length} lines ready to save
                  </span>
                </motion.div>
              )}
            </motion.div>
          )}

          {pageState === "ai-form" && (
            <motion.div
              key="ai-form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-4"
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                  className="w-20 h-20 bg-gradient-to-br from-black to-gray-800 text-white rounded-3xl flex items-center justify-center mx-auto shadow-2xl"
                >
                  <Sparkles className="w-10 h-10" />
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl font-bold font-oswald uppercase tracking-tight bg-gradient-to-r from-black to-gray-700 bg-clip-text text-transparent"
                >
                  AI Workout Planner
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-gray-500 font-medium"
                >
                  Create your personalized weekly workout plan
                </motion.p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <WorkoutForm
                  onSubmit={handleGenerate}
                  isLoading={generateMutation.isPending}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  variant="ghost"
                  onClick={() => setPageState("planner")}
                  className="w-full h-12 text-gray-500 hover:text-black hover:bg-gray-50 font-bold font-oswald uppercase tracking-wider rounded-2xl"
                >
                  Cancel
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
