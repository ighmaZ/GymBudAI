"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ChevronRight,
  Utensils,
  Flame,
  Camera,
} from "lucide-react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";

import { ImageUpload } from "@/components/calories/image-upload";
import { FoodResults } from "@/components/calories/food-results";
import { CalorieRing } from "@/components/calories/calorie-ring";
import { MealCard } from "@/components/calories/meal-card";
import { GoalSettings } from "@/components/calories/goal-settings";
import { Button } from "@/components/ui/button";
import { useCalorieStore } from "@/stores/calorie-store";
import { useSession } from "@/lib/auth-client";
import type { FoodAnalysisResult } from "@/lib/groqai";

// Types for meal data
interface MealData {
  id: string;
  name: string;
  imageUrl: string | null;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  createdAt: string;
  food: {
    id: string;
    name: string;
    portion: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }[];
}

const DEFAULT_DAILY_GOAL = 2000;

export default function CaloriesPage() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [showUpload, setShowUpload] = useState(false);
  const [analysisResult, setAnalysisResult] =
    useState<FoodAnalysisResult | null>(null);
  const [, setCurrentImageBase64] = useState<string | null>(null);

  const { isAnalyzing, setIsAnalyzing } = useCalorieStore();

  const today = format(new Date(), "yyyy-MM-dd");
  const displayDate = format(new Date(), "EEEE, MMM d");

  // Fetch user's calorie goal
  const { data: userSettings } = useQuery({
    queryKey: ["userSettings", userId],
    queryFn: async () => {
      if (!userId) throw new Error("Not authenticated");
      const res = await fetch(`/api/user/settings?userId=${userId}`);
      if (!res.ok) throw new Error("Failed to fetch settings");
      return res.json() as Promise<{ dailyCaloriesGoal: number }>;
    },
    enabled: !!userId,
  });

  const dailyGoal = userSettings?.dailyCaloriesGoal ?? DEFAULT_DAILY_GOAL;

  const { data: meals = [], isLoading: mealsLoading } = useQuery({
    queryKey: ["meals", userId, today],
    queryFn: async () => {
      if (!userId) throw new Error("Not authenticated");
      const res = await fetch(
        `/api/meals?userId=${userId}&date=${today}`
      );
      if (!res.ok) throw new Error("Failed to fetch meals");
      return res.json();
    },
    enabled: !!userId,
  });

  interface DailyTotals {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }

  const dailyTotals = (meals as MealData[]).reduce<DailyTotals>(
    (acc, meal) => ({
      calories: acc.calories + meal.totalCalories,
      protein: acc.protein + meal.totalProtein,
      carbs: acc.carbs + meal.totalCarbs,
      fat: acc.fat + meal.totalFat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const analyzeMutation = useMutation({
    mutationFn: async (imageBase64: string) => {
      const res = await fetch("/api/analyze-food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64 }),
      });
      if (!res.ok) throw new Error("Failed to analyze food");
      return res.json() as Promise<FoodAnalysisResult>;
    },
    onSuccess: (data) => {
      setAnalysisResult(data);
      setIsAnalyzing(false);
    },
    onError: () => {
      setIsAnalyzing(false);
      toast.error("Failed to analyze food. Please try again.");
    },
  });

  const saveMealMutation = useMutation({
    mutationFn: async () => {
      if (!analysisResult || !userId) return;

      const res = await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          name: analysisResult.mealSuggestion,
          imageUrl: null,
          foods: analysisResult.foods,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("Failed to save meal:", errorData);
        throw new Error(errorData.error || "Failed to save meal");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meals"] });
      setAnalysisResult(null);
      setCurrentImageBase64(null);
      setShowUpload(false);
    },
    onError: (error: Error) => {
      console.error("Save meal error:", error);
      toast.error(`Failed to save meal: ${error.message}`);
    },
  });

  const handleImageSelect = (base64: string) => {
    setCurrentImageBase64(base64);
    setIsAnalyzing(true);
    analyzeMutation.mutate(base64);
  };

  const handleCancel = () => {
    setAnalysisResult(null);
    setCurrentImageBase64(null);
    setShowUpload(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (!userId) {
    return (
      <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white flex items-center justify-center px-6">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <Utensils className="w-10 h-10 text-gray-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold font-oswald uppercase tracking-tight">
              Sign In Required
            </h2>
            <p className="text-gray-500 font-medium">
              Please sign in to track your calories and meals
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-full font-bold hover:bg-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="p-2 -ml-2 text-gray-500 hover:text-black hover:bg-gray-50 rounded-full transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-bold font-oswald uppercase tracking-wide">
            {showUpload ? "Add Meal" : "Dashboard"}
          </h1>
          {!showUpload && userId ? (
            <GoalSettings userId={userId} currentGoal={dailyGoal} />
          ) : (
            <div className="w-9" />
          )}
        </div>
      </header>

      <main className="max-w-xl mx-auto px-6 py-8 pb-32">
        <AnimatePresence mode="wait">
          {showUpload ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {!analysisResult ? (
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <h2 className="text-3xl font-bold font-oswald uppercase tracking-tight">
                      Snap Your Meal
                    </h2>
                    <p className="text-gray-500 font-medium">
                      Upload a photo to track calories instantly
                    </p>
                  </div>
                  <ImageUpload
                    onImageSelect={handleImageSelect}
                    isLoading={isAnalyzing}
                  />
                  <Button
                    variant="ghost"
                    onClick={() => setShowUpload(false)}
                    className="w-full text-gray-500 hover:text-black hover:bg-gray-50 uppercase tracking-wide font-bold"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <FoodResults
                  foods={analysisResult.foods}
                  mealSuggestion={analysisResult.mealSuggestion}
                  total={analysisResult.total}
                  onConfirm={() => saveMealMutation.mutate()}
                  onCancel={handleCancel}
                  isLoading={saveMealMutation.isPending}
                />
              )}
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-10"
            >
              {/* Daily Progress Card */}
              <motion.section variants={itemVariants}>
                <div className="bg-gray-50 rounded-[2.5rem] p-8 relative overflow-hidden group hover:bg-gray-100 transition-colors duration-500">
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                    <Flame className="w-32 h-32" />
                  </div>

                  <div className="relative z-10 flex flex-col items-center">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-8">
                      {displayDate}
                    </span>

                    <CalorieRing
                      consumed={dailyTotals.calories}
                      goal={dailyGoal}
                      size={220}
                      strokeWidth={12}
                      className="mb-8"
                    />

                    <div className="grid grid-cols-3 gap-8 w-full max-w-xs mt-2">
                      <div className="text-center group/stat">
                        <p className="text-2xl font-bold text-black group-hover/stat:scale-110 transition-transform">
                          {dailyTotals.protein}g
                        </p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                          Protein
                        </p>
                      </div>
                      <div className="text-center border-x border-gray-200 group/stat">
                        <p className="text-2xl font-bold text-black group-hover/stat:scale-110 transition-transform">
                          {dailyTotals.carbs}g
                        </p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                          Carbs
                        </p>
                      </div>
                      <div className="text-center group/stat">
                        <p className="text-2xl font-bold text-black group-hover/stat:scale-110 transition-transform">
                          {dailyTotals.fat}g
                        </p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                          Fat
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.section>

              {/* Action Bar */}
              <motion.div
                variants={itemVariants}
                className="flex items-center justify-between px-2"
              >
                <h2 className="text-2xl font-bold font-oswald uppercase tracking-tight flex items-center gap-3">
                  <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center">
                    <Utensils className="w-4 h-4" />
                  </div>
                  Today&apos;s Logs
                </h2>
                <Link
                  href="#"
                  className="text-xs font-bold text-gray-400 hover:text-black uppercase tracking-wider transition-colors flex items-center gap-1 group"
                >
                  View History{" "}
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>

              {/* Meals List */}
              <motion.section variants={itemVariants} className="space-y-4">
                {mealsLoading ? (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-300 space-y-4">
                    <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
                    <p className="text-xs font-bold uppercase tracking-widest">
                      Loading meals...
                    </p>
                  </div>
                ) : meals.length === 0 ? (
                  <div className="text-center py-16 px-6 rounded-[2.5rem] bg-gray-50 border-2 border-dashed border-gray-100">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300 shadow-sm">
                      <Utensils className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-lg text-black uppercase font-oswald tracking-wide">
                      No meals logged yet
                    </p>
                    <p className="text-sm text-gray-500 mt-2 font-medium">
                      Start tracking your nutrition today!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(meals as MealData[]).map((meal) => (
                      <MealCard key={meal.id} {...meal} />
                    ))}
                  </div>
                )}
              </motion.section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {!showUpload && (
        <motion.div
          initial={{ scale: 0, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40"
        >
          <Button
            size="lg"
            className="h-16 px-8 rounded-full shadow-2xl shadow-black/20 bg-black text-white hover:scale-105 hover:bg-gray-900 transition-all duration-300 border-4 border-white flex items-center gap-3"
            onClick={() => setShowUpload(true)}
          >
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <span className="font-bold font-oswald uppercase tracking-wider text-lg">
              Snap Meal
            </span>
          </Button>
        </motion.div>
      )}
    </div>
  );
}
