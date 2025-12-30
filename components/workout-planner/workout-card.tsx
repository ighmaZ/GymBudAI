"use client";

import { motion } from "framer-motion";
import { Calendar, Dumbbell, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface WorkoutCardProps {
  id: string;
  date: string;
  notes: string;
}

export function WorkoutCard({ id, date, notes }: WorkoutCardProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/workouts/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete workout");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
    },
  });

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this workout?")) {
      deleteMutation.mutate();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-50 rounded-3xl p-6 hover:bg-gray-100 transition-colors group relative overflow-hidden"
    >
      <button
        onClick={handleDelete}
        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
        disabled={deleteMutation.isPending}
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center flex-shrink-0">
          <Dumbbell className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-3 h-3 text-gray-400" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              {format(new Date(date), "EEEE, MMM d, yyyy")}
            </span>
          </div>
          <h3 className="text-lg font-bold font-oswald uppercase tracking-tight">
            Workout Log
          </h3>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-gray-100">
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
          {notes}
        </p>
      </div>
    </motion.div>
  );
}
