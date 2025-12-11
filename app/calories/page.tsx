"use client";

import { useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

import { ImageUpload } from "@/components/calories/image-upload";
import { FoodResults } from "@/components/calories/food-results";
import { CalorieRing } from "@/components/calories/calorie-ring";
import { MealCard } from "@/components/calories/meal-card";
import { Button } from "@/components/ui/button";
import { useCalorieStore } from "@/stores/calorie-store";
import type { FoodAnalysisResult } from "@/lib/openai";

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

// For now, use a mock user ID (you'll replace with real auth later)
const MOCK_USER_ID = "demo-user-123";
const DAILY_GOAL = 2000;

export default function CaloriesPage() {
  const queryClient = useQueryClient();
  const [showUpload, setShowUpload] = useState(false);
  const [analysisResult, setAnalysisResult] =
    useState<FoodAnalysisResult | null>(null);
  const [, setCurrentImageBase64] = useState<string | null>(null);

  const { isAnalyzing, setIsAnalyzing } = useCalorieStore();

  // Fetch today's meals
  const today = format(new Date(), "yyyy-MM-dd");
  const { data: meals = [], isLoading: mealsLoading } = useQuery({
    queryKey: ["meals", MOCK_USER_ID, today],
    queryFn: async () => {
      const res = await fetch(
        `/api/meals?userId=${MOCK_USER_ID}&date=${today}`
      );
      if (!res.ok) throw new Error("Failed to fetch meals");
      return res.json();
    },
  });

  // Calculate daily totals
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

  // Analyze food mutation
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
      alert("Failed to analyze food. Please try again.");
    },
  });

  // Save meal mutation
  const saveMealMutation = useMutation({
    mutationFn: async () => {
      if (!analysisResult) return;

      const res = await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: MOCK_USER_ID,
          name: analysisResult.mealSuggestion,
          imageUrl: null, // We'll add image upload later
          foods: analysisResult.foods,
        }),
      });
      if (!res.ok) throw new Error("Failed to save meal");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meals"] });
      setAnalysisResult(null);
      setCurrentImageBase64(null);
      setShowUpload(false);
    },
  });

  // Handle image selection
  const handleImageSelect = (base64: string) => {
    setCurrentImageBase64(base64);
    setIsAnalyzing(true);
    analyzeMutation.mutate(base64);
  };

  // Handle cancel
  const handleCancel = () => {
    setAnalysisResult(null);
    setCurrentImageBase64(null);
    setShowUpload(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold font-oswald uppercase">
            Count Calories
          </h1>
          <div className="w-10" /> {/* Spacer */}
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-8">
        {/* Show upload or results */}
        {showUpload ? (
          <div className="space-y-6">
            {!analysisResult ? (
              <ImageUpload
                onImageSelect={handleImageSelect}
                isLoading={isAnalyzing}
              />
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
          </div>
        ) : (
          <>
            {/* Daily Progress */}
            <section className="text-center">
              <p className="text-sm text-gray-500 mb-4">
                {format(new Date(), "EEEE, MMMM d")}
              </p>
              <CalorieRing
                consumed={dailyTotals.calories}
                goal={DAILY_GOAL}
                className="mx-auto"
              />
              <p className="mt-4 text-sm text-gray-500">
                Goal: <span className="font-medium">{DAILY_GOAL} kcal</span>
              </p>
            </section>

            {/* Add Meal Button */}
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => setShowUpload(true)}
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Meal
            </Button>

            {/* Today's Meals */}
            <section>
              <h2 className="text-lg font-bold font-oswald uppercase mb-4">
                Today&apos;s Meals
              </h2>

              {mealsLoading ? (
                <div className="text-center py-8 text-gray-400">Loading...</div>
              ) : meals.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p>No meals logged yet today.</p>
                  <p className="text-sm mt-1">
                    Tap &quot;Add Meal&quot; to get started!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(meals as MealData[]).map((meal) => (
                    <MealCard key={meal.id} {...meal} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
