import type { LucideIcon } from "lucide-react";

export interface NavLink {
  label: string;
  href: string;
}

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface FormAnalysisResult {
  exercise: string;
  confidence: number; // 0-100 how sure AI is about exercise
  effectivenessScore: number; // 0-100 how good the form is
  potentialScore: number; // 0-100 how good it COULD be
  goodPoints: string[]; // what user is doing well
  improvementPoints: string[]; // what needs work
  tips: string[]; // actionable advice
  overallGrade: "A" | "B" | "C" | "D" | "F";
}


