import { create } from "zustand";
import type { AnalyzedFood } from "@/lib/openai";

interface CalorieState {
  // Upload state
  isAnalyzing: boolean;
  setIsAnalyzing: (value: boolean) => void;

  // Current analysis result
  analyzedFoods: AnalyzedFood[];
  setAnalyzedFoods: (foods: AnalyzedFood[]) => void;

  // Selected meal type
  selectedMealType: string;
  setSelectedMealType: (type: string) => void;

  // Reset state
  reset: () => void;
}

export const useCalorieStore = create<CalorieState>((set) => ({
  isAnalyzing: false,
  setIsAnalyzing: (value) => set({ isAnalyzing: value }),

  analyzedFoods: [],
  setAnalyzedFoods: (foods) => set({ analyzedFoods: foods }),

  selectedMealType: "Breakfast",
  setSelectedMealType: (type) => set({ selectedMealType: type }),

  reset: () =>
    set({
      isAnalyzing: false,
      analyzedFoods: [],
      selectedMealType: "Breakfast",
    }),
}));
