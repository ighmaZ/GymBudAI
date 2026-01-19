"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, X, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface GoalSettingsProps {
  userId: string;
  currentGoal: number;
}

export function GoalSettings({ userId, currentGoal }: GoalSettingsProps) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [goal, setGoal] = useState(currentGoal);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updateGoalMutation = useMutation({
    mutationFn: async (newGoal: number) => {
      const res = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, dailyCaloriesGoal: newGoal }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to update goal");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userSettings"] });
      toast.success("Calorie goal updated!");
      setIsOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSave = () => {
    if (goal < 500 || goal > 10000) {
      toast.error("Goal must be between 500 and 10,000 calories");
      return;
    }
    updateGoalMutation.mutate(goal);
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 z-[100]"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none"
          >
            <div 
              className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold font-oswald uppercase tracking-tight text-gray-700">
                  Daily Goal
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 -mr-2 text-gray-400 hover:text-black hover:bg-gray-50 rounded-full transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                    Calorie Target
                  </label>
                  <input
                    type="number"
                    value={goal}
                    onChange={(e) => setGoal(Number(e.target.value))}
                    min={500}
                    max={10000}
                    step={50}
                    className="w-full px-4 py-3 text-2xl font-bold text-center border-2 border-gray-200 rounded-2xl focus:border-black focus:outline-none transition-colors text-gray-400"
                  />
                  <p className="text-xs text-gray-400 text-center mt-2">
                    500 – 10,000 calories
                  </p>
                </div>

                <button
                  onClick={handleSave}
                  disabled={updateGoalMutation.isPending}
                  className="w-full py-4 bg-black text-white font-bold uppercase tracking-wider rounded-2xl hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {updateGoalMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Goal"
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button
        onClick={() => {
          setGoal(currentGoal);
          setIsOpen(true);
        }}
        className="p-2 -mr-2 text-gray-500 hover:text-black hover:bg-gray-50 rounded-full transition-all"
        aria-label="Settings"
      >
        <Settings className="w-5 h-5" />
      </button>

      {mounted && createPortal(modalContent, document.body)}
    </>
  );
}
