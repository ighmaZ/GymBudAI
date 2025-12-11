"use client";

import { motion } from "framer-motion";
import { Clock, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import Image from "next/image";

interface FoodItem {
  id: string;
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface MealCardProps {
  id: string;
  name: string;
  imageUrl?: string | null;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  createdAt: Date | string;
  food: FoodItem[];
  onClick?: () => void;
}

export function MealCard({
  name,
  imageUrl,
  totalCalories,
  totalProtein,
  totalCarbs,
  totalFat,
  createdAt,
  food,
  onClick,
}: MealCardProps) {
  const mealEmoji =
    {
      Breakfast: "🍳",
      Lunch: "🥗",
      Dinner: "🍽️",
      Snack: "🍎",
    }[name] || "🍴";

  const time = format(new Date(createdAt), "h:mm a");

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={cn(
        "p-4 rounded-2xl bg-gray-50",
        "flex items-center gap-4",
        "border border-transparent hover:border-gray-200",
        "cursor-pointer transition-all"
      )}
    >
      {/* Image or Emoji */}
      <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            width={64}
            height={64}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">
            {mealEmoji}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-bold font-oswald uppercase">{name}</h4>
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {time}
          </span>
        </div>
        <p className="text-sm text-gray-500 truncate">
          {food.map((f) => f.name).join(", ")}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          P: {totalProtein}g • C: {totalCarbs}g • F: {totalFat}g
        </p>
      </div>

      {/* Calories */}
      <div className="text-right flex-shrink-0">
        <p className="text-xl font-bold">{totalCalories}</p>
        <p className="text-xs text-gray-400">kcal</p>
      </div>

      <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0" />
    </motion.div>
  );
}
