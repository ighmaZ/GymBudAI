"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
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
  createdAt,
  food,
  onClick,
}: MealCardProps) {
  const mealEmoji = {
    Breakfast: "🍳",
    Lunch: "🥗",
    Dinner: "🍽️",
    Snack: "🍎",
  }[name] || "🍴";

  const time = format(new Date(createdAt), "h:mm a");

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "group p-4 rounded-3xl bg-white border border-gray-100",
        "flex items-center gap-5 cursor-pointer",
        "hover:border-gray-200 hover:shadow-xl hover:shadow-gray-100/50",
        "transition-all duration-300"
      )}
    >
      {/* Image or Emoji */}
      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0 relative">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl">
            {mealEmoji}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 py-1">
        <div className="flex justify-between items-start mb-1">
          <div>
            <h4 className="font-bold font-oswald uppercase text-lg leading-none mb-1">{name}</h4>
            <p className="text-xs font-medium text-gray-400">{time}</p>
          </div>
          <div className="text-right">
            <span className="text-lg font-bold block leading-none">{totalCalories}</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">kcal</span>
          </div>
        </div>
        
        <p className="text-sm text-gray-500 truncate font-medium">
          {food.map((f) => f.name).join(", ")}
        </p>
      </div>

      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-black group-hover:text-white transition-colors duration-300">
        <ChevronRight className="w-4 h-4" />
      </div>
    </motion.div>
  );
}
