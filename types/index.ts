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

export interface MovementAnalysis {
  // Which body parts moved the most (sorted by movement amount)
  primaryMovement: string; // e.g., "elbows", "knees", "hips"
  secondaryMovement: string;
  primaryRange: number; // degrees of movement
  secondaryRange: number;

  // Range of motion for key joints (max - min angle during exercise)
  elbowRangeLeft: number;
  elbowRangeRight: number;
  kneeRangeLeft: number;
  kneeRangeRight: number;
  hipRangeLeft: number;
  hipRangeRight: number;
  shoulderRangeLeft: number;
  shoulderRangeRight: number;

  // Body orientation and context
  bodyOrientation: "upright" | "horizontal" | "inclined" | "prone";
  armSymmetry: boolean; // both arms moving together (true) or alternating (false)
  elbowShoulderRatio: number; // elbow movement / shoulder movement (high = isolation, low = compound)
  isCompoundMovement: boolean; // multiple joints moving significantly

  // Additional movement patterns
  shoulderElevationRange: number; // For traps/shrugs (vertical shoulder movement)
  hipAbductionRange: number; // Lateral hip movement (for hip abduction exercises)
  ankleFlexionRange: number; // Ankle plantarflexion (for calf raises)
  movementPlane: "sagittal" | "frontal" | "transverse"; // Movement direction
  equipmentType: "barbell" | "dumbbell" | "bodyweight" | "cable"; // Equipment detection
}
