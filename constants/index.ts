import { Activity, Camera, Dumbbell } from "lucide-react";
import type { NavLink, Feature } from "@/types";

export const NAV_LINKS: NavLink[] = [
  { label: "About", href: "#about" },
  { label: "Trainings", href: "#trainings" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Contacts", href: "#contacts" },
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
  heroDescription:
    "We are dedicated to helping you achieve your fitness goals and improve your overall health and well-being through AI-powered coaching.",
  heroImage:
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2940&auto=format&fit=crop",
  videoDuration: "3 min",
} as const;
