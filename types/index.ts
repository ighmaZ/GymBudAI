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

export interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

export interface PoseMetrics {
  kneeAngleLeft: number;
  kneeAngleRight: number;
  hipAngleLeft: number;
  hipAngleRight: number;
  ankleAngleLeft: number;
  ankleAngleRight: number;

  // Upper body
  elbowAngleLeft: number;
  elbowAngleRight: number;
  shoulderAngleLeft: number;
  shoulderAngleRight: number;

  // Core/Alignment
  backAngle: number; // spine angle
  torsoAngle: number; // lean forward/back
  hipLevel: number; // hip alignment
  shoulderLevel: number; // shoulder alignment

  // Depth/Position
  squatDepth: number; // how low (0-100%)
  kneeOverToe: boolean; // knees past toes?
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
