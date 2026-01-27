"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Save } from "lucide-react";
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
    <div className="min-h-screen bg-[#F5F5F7] text-black font-sans selection:bg-black selection:text-white relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-gray-200/40 to-transparent rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-gradient-to-tl from-gray-200/40 to-transparent rounded-full blur-[100px]" />
      </div>

      <header className="sticky top-0 z-50 bg-[#F5F5F7]/80 backdrop-blur-md border-b border-white/20">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="p-2 -ml-2 text-gray-500 hover:text-black hover:bg-white/50 rounded-full transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex flex-col items-center">
             <h1 className="text-lg font-bold font-oswald uppercase tracking-wide bg-gradient-to-r from-black to-gray-600 bg-clip-text text-transparent flex items-center gap-2">
               Workout Planner
             </h1>
          </div>
          <div className="w-9" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8 pb-32 relative z-10">
        <AnimatePresence mode="wait">
          {pageState === "planner" && (
            <motion.div
              key="planner"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full flex flex-col gap-6"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center justify-between"
              >
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Weekly Plan</span>
                   <h2 className="text-3xl font-black font-oswald uppercase tracking-tighter">My Routine</h2>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleGenerateAI}
                    disabled={generateMutation.isPending}
                    className="group flex items-center gap-2 px-4 py-3 bg-white hover:bg-black hover:text-white border border-gray-100 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-lg"
                  >
                    <span className="text-xs font-bold font-oswald uppercase tracking-wider">
                      AI Build
                    </span>
                  </button>
                  <motion.button
                    onClick={handleSave}
                    disabled={!workoutNotes.trim() || saveMutation.isPending}
                    className="group flex items-center gap-2 px-5 py-3 bg-black text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Save className="w-4 h-4" />
                    <span className="text-xs font-bold font-oswald uppercase tracking-wider">
                      {saveMutation.isPending ? "..." : "Save"}
                    </span>
                  </motion.button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="relative group"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-[2rem] opacity-50 blur group-hover:opacity-75 transition-opacity duration-500" />
                <div className="relative bg-white rounded-[1.75rem] p-1 shadow-xl ring-1 ring-black/5">
                  <div className="bg-[#FDFDFD] rounded-3xl p-6 sm:p-8 min-h-[60vh] relative overflow-hidden">
                    {/* Notebook lines effect */}
                    <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                         style={{ backgroundImage: "linear-gradient(#000 1px, transparent 1px)", backgroundSize: "100% 2.5rem", marginTop: "2.5rem" }}
                    />
                    
                    <div className="relative z-10">


                      </div>
                      <textarea
                        value={workoutNotes}
                        onChange={(e) => setWorkoutNotes(e.target.value)}
                        placeholder="Start typing your workout plan here...&#10;&#10;Example:&#10;Monday - Chest & Triceps&#10;• Bench Press: 3 sets x 8-10 reps&#10;• Incline Dumbbell Press: 3 sets x 10-12 reps&#10;..."
                        className="w-full h-full min-h-[500px] bg-transparent outline-none text-base sm:text-lg leading-10 font-medium text-gray-700 placeholder:text-gray-300 resize-none font-mono"
                      />
                    </div>
                  </div>

              </motion.div>
            </motion.div>
          )}

          {pageState === "ai-form" && (
            <motion.div
              key="ai-form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-xl mx-auto"
            >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center space-y-4 mb-10"
                >
                  <motion.h2
                    className="text-4xl font-black font-oswald uppercase tracking-tighter text-black"
                  >
                    Design Your Plan
                  </motion.h2>
                  <p className="text-gray-500 font-medium tracking-wide text-sm max-w-xs mx-auto">
                    Let AI build a scientifically optimized workout routine tailored to your goals.
                  </p>
                </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/80 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] shadow-xl ring-1 ring-white/50"
              >
                <WorkoutForm
                  onSubmit={handleGenerate}
                  isLoading={generateMutation.isPending}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-6"
              >
                <Button
                  variant="ghost"
                  onClick={() => setPageState("planner")}
                  className="w-full text-gray-400 hover:text-black font-bold font-oswald uppercase tracking-wider text-xs"
                >
                  Cancel & Return
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
