"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { signIn, signUp } from "@/lib/auth-client";
import { X, Mail, Loader2 } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = mode === "signup"
        ? await signUp.email({
            email,
            password,
            name,
          })
        : await signIn.email({
            email,
            password,
          });

      if (res.error) {
        setError(res.error.message || "Authentication failed");
        return;
      }

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await signIn.social({
        provider: "google",
        callbackURL: "/",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in with Google");
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setName("");
    setError(null);
  };

  const toggleMode = () => {
    setMode(mode === "signin" ? "signup" : "signin");
    resetForm();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn(
              "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50",
              "w-[90%] md:w-full max-w-md bg-white rounded-2xl shadow-2xl",
              "p-6 md:p-8"
            )}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold font-oswald uppercase tracking-tight">
                {mode === "signin" ? "Welcome Back" : "Join GymBud AI"}
              </h2>
              <p className="text-gray-600 mt-2">
                {mode === "signin"
                  ? "Sign in to continue your fitness journey"
                  : "Start your transformation today"}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Google Sign In */}
            <button
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className={cn(
                "w-full flex items-center justify-center gap-3",
                "px-4 py-3 border border-gray-300 rounded-full",
                "hover:bg-gray-50 transition-colors",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="font-medium">Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-sm text-gray-500">or</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    required
                    className={cn(
                      "w-full px-4 py-3 border border-gray-300 rounded-full",
                      "focus:ring-2 focus:ring-black focus:border-transparent",
                      "outline-none transition-all"
                    )}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className={cn(
                    "w-full px-4 py-3 border border-gray-300 rounded-full",
                    "focus:ring-2 focus:ring-black focus:border-transparent",
                    "outline-none transition-all"
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  className={cn(
                    "w-full px-4 py-3 border border-gray-300 rounded-full",
                    "focus:ring-2 focus:ring-black focus:border-transparent",
                    "outline-none transition-all"
                  )}
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                rounded
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Mail className="w-5 h-5" />
                )}
                {mode === "signin" ? "Sign In" : "Create Account"}
              </Button>
            </form>

            {/* Toggle Mode */}
            <p className="text-center text-sm text-gray-600 mt-6">
              {mode === "signin" ? (
                <>
                  Don&apos;t have an account?{" "}
                  <button
                    onClick={toggleMode}
                    className="font-semibold text-black hover:underline"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={toggleMode}
                    className="font-semibold text-black hover:underline"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
