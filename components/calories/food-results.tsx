"use client";

import { motion } from "framer-motion";
import { Check, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { AnalyzedFood } from "@/lib/openai";

interface FoodResultsProps {
  foods: AnalyzedFood[];
  mealSuggestion: string;
  total: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function FoodResults({
  foods,
  mealSuggestion,
  total,
  onConfirm,
  onCancel,
  isLoading,
}: FoodResultsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="text-center">
        <h3 className="text-2xl font-bold font-oswald uppercase">
          Food Detected
        </h3>
        <p className="text-gray-500 text-sm mt-1">
          Suggested meal: <span className="font-medium">{mealSuggestion}</span>
        </p>
      </div>

      {/* Food Items */}
      <div className="space-y-3">
        {foods.map((food, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              "p-4 rounded-2xl bg-gray-50",
              "flex items-center justify-between",
              "border border-transparent hover:border-gray-200 transition-colors"
            )}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-bold">{food.name}</h4>
                <span className="text-xs text-gray-400">
                  {Math.round(food.confidence * 100)}% confident
                </span>
              </div>
              <p className="text-sm text-gray-500">{food.portion}</p>
            </div>

            <div className="text-right">
              <p className="font-bold text-lg">{food.calories} cal</p>
              <p className="text-xs text-gray-500">
                P: {food.protein}g • C: {food.carbs}g • F: {food.fat}g
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Totals */}
      <div className="p-6 rounded-3xl bg-black text-white">
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-400 uppercase text-sm tracking-wide">
            Total
          </span>
          <span className="text-3xl font-bold font-oswald">
            {total.calories} cal
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold">{total.protein}g</p>
            <p className="text-xs text-gray-400 uppercase">Protein</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{total.carbs}g</p>
            <p className="text-xs text-gray-400 uppercase">Carbs</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{total.fat}g</p>
            <p className="text-xs text-gray-400 uppercase">Fat</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          size="lg"
          className="flex-1"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          size="lg"
          className="flex-1"
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Check className="w-5 h-5 mr-2" />
              Save Meal
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}
