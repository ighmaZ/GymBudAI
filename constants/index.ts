import { Activity, Camera, Dumbbell } from "lucide-react";
import type { NavLink, Feature } from "@/types";

export const NAV_LINKS: NavLink[] = [
  { label: "Count Calories", href: "/calories" },
  { label: "Form Correction", href: "/form-correction" },
  { label: "Workout Planner", href: "/workout-planner" },
];

export const FEATURES: (Feature & { href?: string })[] = [
  {
    icon: Activity,
    title: "Count Calories",
    description:
      "Track your daily intake with precision using our advanced AI food recognition system.",
    href: "/calories",
  },
  {
    icon: Camera,
    title: "AI Form Correction",
    description:
      "Get real-time feedback on your exercise form to prevent injury and maximize results.",
    href: "/form-correction",
  },
  {
    icon: Dumbbell,
    title: "Workout Planner",
    description:
      "Plan, track, and customize your workout routines with manual entry or AI-powered personalized plans.",
    href: "/workout-planner",
  },
];

export const SITE_CONFIG = {
  name: "GYMBUD AI",
  tagline: "Achieve Your Fitness Goals",
  heroTitle: ["Find Your", "Strength"],

  heroImage:
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2940&auto=format&fit=crop",
  videoDuration: "3 min",
} as const;
