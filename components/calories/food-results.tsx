"use client";

import { motion } from "framer-motion";
import { Check, Flame, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { AnalyzedFood } from "@/lib/groqai";

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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="text-center space-y-1">
       
        <h3 className="text-3xl font-bold font-oswald uppercase tracking-tight">
          {mealSuggestion} Detected
        </h3>
      </div>

      {/* Summary Card */}
      <div className="p-8 rounded-[2rem] bg-black text-white shadow-xl shadow-black/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Flame className="w-40 h-40" />
        </div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-end mb-8">
            <div>
              <p className="text-gray-400 uppercase text-xs font-bold tracking-widest mb-1">Total Energy</p>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-bold font-oswald tracking-tight">{total.calories}</span>
                <span className="text-lg font-medium text-gray-400">kcal</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-2xl p-4 text-center backdrop-blur-sm">
              <p className="text-2xl font-bold mb-1">{total.protein}g</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Protein</p>
            </div>
            <div className="bg-white/10 rounded-2xl p-4 text-center backdrop-blur-sm">
              <p className="text-2xl font-bold mb-1">{total.carbs}g</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Carbs</p>
            </div>
            <div className="bg-white/10 rounded-2xl p-4 text-center backdrop-blur-sm">
              <p className="text-2xl font-bold mb-1">{total.fat}g</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fat</p>
            </div>
          </div>
        </div>
      </div>

      {/* Food Items List */}
      <div className="space-y-3">
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest px-2">Breakdown</p>
        {foods.map((food, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group p-5 rounded-3xl bg-white border border-gray-100 hover:border-gray-200 hover:shadow-lg hover:shadow-gray-100/50 transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-bold text-lg leading-none mb-1">{food.name}</h4>
                <p className="text-sm text-gray-500 font-medium">{food.portion}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">{food.calories}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">kcal</p>
              </div>
            </div>
            
            <div className="flex gap-3 mt-3 pt-3 border-t border-gray-50">
              <div className="text-xs font-medium text-gray-500">
                <span className="text-gray-300 mr-1">P</span>{food.protein}g
              </div>
              <div className="text-xs font-medium text-gray-500">
                <span className="text-gray-300 mr-1">C</span>{food.carbs}g
              </div>
              <div className="text-xs font-medium text-gray-500">
                <span className="text-gray-300 mr-1">F</span>{food.fat}g
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-4 pt-4">
        <Button
          variant="ghost"
          size="lg"
          className="h-14 rounded-2xl text-gray-500 hover:bg-gray-100 hover:text-black font-bold"
          onClick={onCancel}
          disabled={isLoading}
        >
          Discard
        </Button>
        <Button
          size="lg"
          className="h-14 rounded-2xl bg-black text-white hover:bg-gray-900 shadow-xl shadow-black/10 font-bold flex items-center justify-center gap-2"
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Check className="w-5 h-5" />
              SAVE LOG
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}
