import Groq from "groq-sdk";
import type {
  PoseMetrics,
  FormAnalysisResult,
  MovementAnalysis,
} from "@/types";
import { analyzeMovement } from "@/lib/pose-utils";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

interface AnalyzeFormInput {
  metrics: PoseMetrics[];
  exerciseHint?: string; // optional user hint about what exercise
}

export async function analyzeExerciseForm(
  input: AnalyzeFormInput
): Promise<FormAnalysisResult> {
  const { metrics, exerciseHint } = input;

  // Calculate averages across all frames
  const avgMetrics = calculateAverageMetrics(metrics);

  // Analyze movement patterns to detect which body parts moved the most
  const movement = analyzeMovement(metrics);

  // Build the prompt with comprehensive exercise database
  const prompt = `You are an expert fitness coach and biomechanics analyst. 
Analyze the following exercise form data extracted from a video using pose detection.

${
  exerciseHint
    ? `User indicated this might be: ${exerciseHint}`
    : "Identify the EXACT exercise name from the comprehensive analysis below."
}

=== EQUIPMENT DETECTION ===
- Equipment Type: ${movement.equipmentType.toUpperCase()}
  ${
    movement.equipmentType === "barbell"
      ? "(Perfect arm symmetry - both arms move identically)"
      : ""
  }
  ${
    movement.equipmentType === "dumbbell"
      ? "(Slight arm asymmetry allowed - independent arm movement)"
      : ""
  }
  ${
    movement.equipmentType === "bodyweight"
      ? "(No external weight - bodyweight exercises)"
      : ""
  }
- Arm Symmetry: ${
    movement.armSymmetry
      ? "PERFECT (barbell)"
      : movement.equipmentType === "dumbbell"
      ? "SLIGHT ASYMMETRY (dumbbell)"
      : "ASYMMETRIC (single arm or alternating)"
  }

=== BODY POSITION & CONTEXT ===
- Body Orientation: ${movement.bodyOrientation.toUpperCase()}
  ${
    movement.bodyOrientation === "upright"
      ? "(Standing or sitting upright)"
      : ""
  }
  ${movement.bodyOrientation === "horizontal" ? "(Lying down on back)" : ""}
  ${movement.bodyOrientation === "inclined" ? "(Leaning forward at angle)" : ""}
  ${movement.bodyOrientation === "prone" ? "(Face down or plank position)" : ""}
- Movement Plane: ${movement.movementPlane.toUpperCase()}
  ${
    movement.movementPlane === "sagittal"
      ? "(Forward/backward movement - most exercises)"
      : ""
  }
  ${
    movement.movementPlane === "frontal"
      ? "(Side-to-side movement - lateral raises, hip abduction)"
      : ""
  }
- Movement Type: ${movement.isCompoundMovement ? "COMPOUND" : "ISOLATION"}
- Elbow/Shoulder Ratio: ${movement.elbowShoulderRatio} ${
    movement.elbowShoulderRatio > 3
      ? "(HIGH = isolation)"
      : movement.elbowShoulderRatio < 2
      ? "(LOW = compound)"
      : "(MEDIUM)"
  }

=== MOVEMENT ANALYSIS ===
- PRIMARY MOVEMENT: ${movement.primaryMovement.toUpperCase()} (${
    movement.primaryRange
  }° range)
- Secondary Movement: ${movement.secondaryMovement} (${
    movement.secondaryRange
  }° range)

Joint Movement Ranges:
- Elbows: L ${movement.elbowRangeLeft}°, R ${movement.elbowRangeRight}°
- Shoulders: L ${movement.shoulderRangeLeft}°, R ${movement.shoulderRangeRight}°
- Knees: L ${movement.kneeRangeLeft}°, R ${movement.kneeRangeRight}°
- Hips: L ${movement.hipRangeLeft}°, R ${movement.hipRangeRight}°
- Ankle Flexion: ${movement.ankleFlexionRange}° ${
    movement.ankleFlexionRange > 20 ? "(Significant - likely calf raises)" : ""
  }
- Shoulder Elevation: ${movement.shoulderElevationRange}° ${
    movement.shoulderElevationRange > 15
      ? "(Significant - likely shrugs/traps)"
      : ""
  }
- Hip Abduction: ${movement.hipAbductionRange} ${
    movement.hipAbductionRange > 10
      ? "(Significant - lateral hip movement)"
      : ""
  }

=== COMPREHENSIVE EXERCISE DATABASE ===

CHEST EXERCISES:
- Barbell Bench Press: HORIZONTAL + BARBELL + Compound + Elbows/Shoulders moving together
- Dumbbell Bench Press: HORIZONTAL + DUMBBELL + Compound + Elbows/Shoulders moving together
- Barbell Floor Press: HORIZONTAL + BARBELL + Elbows/Shoulders (arms don't go full range)
- Dumbbell Floor Press: HORIZONTAL + DUMBBELL + Elbows/Shoulders (arms don't go full range)
- Push-up: PRONE + BODYWEIGHT + Compound + Elbows/Shoulders
- Chest Fly: HORIZONTAL + Compound + Arms moving laterally (frontal plane)

BACK EXERCISES:
- Barbell Row: INCLINED + BARBELL + Compound + Elbows/Shoulders
- Dumbbell Row: INCLINED + DUMBBELL + Compound + Elbows/Shoulders
- Pull-up: UPRIGHT + BODYWEIGHT + Compound + Elbows/Shoulders (vertical pull)
- Lat Pulldown: UPRIGHT + CABLE + Compound + Elbows/Shoulders (vertical pull)
- Barbell Shrug: UPRIGHT + BARBELL + Isolation + Shoulder Elevation > 15° (traps)
- Dumbbell Shrug: UPRIGHT + DUMBBELL + Isolation + Shoulder Elevation > 15° (traps)

SHOULDER EXERCISES:
- Barbell Overhead Press: UPRIGHT + BARBELL + Compound + Elbows/Shoulders (vertical press)
- Dumbbell Shoulder Press: UPRIGHT + DUMBBELL + Compound + Elbows/Shoulders (vertical press)
- Lateral Raise: UPRIGHT + FRONTAL PLANE + Isolation + Shoulders only (side-to-side)
- Front Raise: UPRIGHT + SAGITTAL PLANE + Isolation + Shoulders only (forward)
- Rear Delt Fly: INCLINED + FRONTAL PLANE + Isolation + Shoulders (backward)

ARM EXERCISES:
- Barbell Bicep Curl: UPRIGHT + BARBELL + Isolation + Elbows only (high ratio)
- Dumbbell Bicep Curl: UPRIGHT + DUMBBELL + Isolation + Elbows only (high ratio)
- Hammer Curl: UPRIGHT + DUMBBELL + Isolation + Elbows only (neutral grip)
- Tricep Extension: UPRIGHT + Isolation + Elbows only (extension movement)
- Tricep Pushdown: UPRIGHT + CABLE + Isolation + Elbows only

LEG EXERCISES:
- Barbell Back Squat: UPRIGHT + BARBELL + Compound + Knees/Hips moving together
- Bodyweight Squat: UPRIGHT + BODYWEIGHT + Compound + Knees/Hips moving together
- Barbell Front Squat: UPRIGHT + BARBELL + Compound + Knees/Hips (torso more upright)
- Lunges: UPRIGHT + BODYWEIGHT/DUMBBELL + Compound + Knees/Hips (asymmetric)
- Barbell Deadlift: INCLINED + BARBELL + Compound + Hips/Back moving
- Dumbbell Deadlift: INCLINED + DUMBBELL + Compound + Hips/Back moving
- Romanian Deadlift: INCLINED + Compound + Hips/Back (minimal knee movement)
- Hip Abduction: UPRIGHT/PRONE + FRONTAL PLANE + Isolation + Hip Abduction > 10 (lateral)
- Calf Raise: UPRIGHT + Isolation + Ankle Flexion > 20° (minimal knee/hip movement)
- Leg Press: HORIZONTAL + Compound + Knees/Hips (machine exercise)

CORE EXERCISES:
- Plank: PRONE + BODYWEIGHT + Static hold (minimal movement)
- Crunch: HORIZONTAL + BODYWEIGHT + Isolation + Torso flexion
- Leg Raise: HORIZONTAL + BODYWEIGHT + Isolation + Hips moving

=== EXERCISE IDENTIFICATION LOGIC ===

STEP 1: Check for unique patterns first:
- Shoulder Elevation > 15° + Upright → SHRUGS (Barbell or Dumbbell based on equipment)
- Hip Abduction > 10 + Frontal Plane → HIP ABDUCTION
- Ankle Flexion > 20° + Minimal knee movement → CALF RAISES
- Frontal Plane + Shoulders only → LATERAL RAISE or REAR DELT FLY

STEP 2: Check body orientation + equipment:
- HORIZONTAL + BARBELL + Compound → Barbell Bench Press (not Floor Press if full range)
- HORIZONTAL + DUMBBELL + Compound → Dumbbell Bench Press
- HORIZONTAL + BARBELL + Limited range → Barbell Floor Press
- HORIZONTAL + DUMBBELL + Limited range → Dumbbell Floor Press

STEP 3: Check movement type + primary joint:
- UPRIGHT + BARBELL + Isolation + Elbows → Barbell Bicep Curl
- UPRIGHT + DUMBBELL + Isolation + Elbows → Dumbbell Bicep Curl
- UPRIGHT + BARBELL + Compound + Elbows/Shoulders → Barbell Overhead Press
- UPRIGHT + DUMBBELL + Compound + Elbows/Shoulders → Dumbbell Shoulder Press

STEP 4: Check for leg exercises:
- UPRIGHT + BARBELL + Compound + Knees → Barbell Back Squat
- UPRIGHT + BODYWEIGHT + Compound + Knees → Bodyweight Squat
- INCLINED + BARBELL + Compound + Hips → Barbell Deadlift

=== POSE METRICS (averaged across ${metrics.length} frames) ===
- Elbow Angles: L ${avgMetrics.elbowAngleLeft}°, R ${
    avgMetrics.elbowAngleRight
  }°
- Shoulder Angles: L ${avgMetrics.shoulderAngleLeft}°, R ${
    avgMetrics.shoulderAngleRight
  }°
- Knee Angles: L ${avgMetrics.kneeAngleLeft}°, R ${avgMetrics.kneeAngleRight}°
- Hip Angles: L ${avgMetrics.hipAngleLeft}°, R ${avgMetrics.hipAngleRight}°
- Torso Angle: ${avgMetrics.torsoAngle}°

CRITICAL: Use the equipment type, body orientation, movement plane, and specific patterns (shoulder elevation, hip abduction, ankle flexion) to identify the EXACT exercise name. Be precise - "Barbell Bench Press" not "Bench Press", "Dumbbell Bicep Curl" not "Bicep Curl".

IMPORTANT: Return ONLY valid JSON with this exact structure, no markdown:
{
  "exercise": "Exact exercise name (e.g., 'Barbell Bench Press', 'Dumbbell Bicep Curl', 'Barbell Shrug', 'Hip Abduction', 'Standing Calf Raise')",
  "confidence": 85,
  "effectivenessScore": 75,
  "potentialScore": 95,
  "goodPoints": ["Point 1", "Point 2", "Point 3"],
  "improvementPoints": ["Issue 1", "Issue 2"],
  "tips": ["Specific tip 1", "Specific tip 2", "Specific tip 3"],
  "overallGrade": "B"
}`;

  const response = await groq.chat.completions.create({
    model: "meta-llama/llama-4-maverick-17b-128e-instruct",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    max_tokens: 1000,
    temperature: 0.3,
  });

  const content = response.choices[0]?.message?.content;

  if (!content) {
    throw new Error("No response from Groq");
  }

  // Parse JSON from response (handle potential markdown code blocks)
  let jsonString = content;
  if (content.includes("```json")) {
    jsonString = content.split("```json")[1].split("```")[0].trim();
  } else if (content.includes("```")) {
    jsonString = content.split("```")[1].split("```")[0].trim();
  }

  try {
    return JSON.parse(jsonString) as FormAnalysisResult;
  } catch {
    console.error("Failed to parse Groq response:", content);
    throw new Error("Failed to parse form analysis response");
  }
}

// Helper to average metrics across all frames
function calculateAverageMetrics(metrics: PoseMetrics[]): PoseMetrics {
  const count = metrics.length;
  if (count === 0) {
    throw new Error("No metrics to average");
  }

  const sum = metrics.reduce(
    (acc, m) => ({
      kneeAngleLeft: acc.kneeAngleLeft + m.kneeAngleLeft,
      kneeAngleRight: acc.kneeAngleRight + m.kneeAngleRight,
      hipAngleLeft: acc.hipAngleLeft + m.hipAngleLeft,
      hipAngleRight: acc.hipAngleRight + m.hipAngleRight,
      ankleAngleLeft: acc.ankleAngleLeft + m.ankleAngleLeft,
      ankleAngleRight: acc.ankleAngleRight + m.ankleAngleRight,
      elbowAngleLeft: acc.elbowAngleLeft + m.elbowAngleLeft,
      elbowAngleRight: acc.elbowAngleRight + m.elbowAngleRight,
      shoulderAngleLeft: acc.shoulderAngleLeft + m.shoulderAngleLeft,
      shoulderAngleRight: acc.shoulderAngleRight + m.shoulderAngleRight,
      backAngle: acc.backAngle + m.backAngle,
      torsoAngle: acc.torsoAngle + m.torsoAngle,
      hipLevel: acc.hipLevel + m.hipLevel,
      shoulderLevel: acc.shoulderLevel + m.shoulderLevel,
      squatDepth: acc.squatDepth + m.squatDepth,
      kneeOverToe: acc.kneeOverToe || m.kneeOverToe,
    }),
    {
      kneeAngleLeft: 0,
      kneeAngleRight: 0,
      hipAngleLeft: 0,
      hipAngleRight: 0,
      ankleAngleLeft: 0,
      ankleAngleRight: 0,
      elbowAngleLeft: 0,
      elbowAngleRight: 0,
      shoulderAngleLeft: 0,
      shoulderAngleRight: 0,
      backAngle: 0,
      torsoAngle: 0,
      hipLevel: 0,
      shoulderLevel: 0,
      squatDepth: 0,
      kneeOverToe: false,
    }
  );

  return {
    kneeAngleLeft: Math.round(sum.kneeAngleLeft / count),
    kneeAngleRight: Math.round(sum.kneeAngleRight / count),
    hipAngleLeft: Math.round(sum.hipAngleLeft / count),
    hipAngleRight: Math.round(sum.hipAngleRight / count),
    ankleAngleLeft: Math.round(sum.ankleAngleLeft / count),
    ankleAngleRight: Math.round(sum.ankleAngleRight / count),
    elbowAngleLeft: Math.round(sum.elbowAngleLeft / count),
    elbowAngleRight: Math.round(sum.elbowAngleRight / count),
    shoulderAngleLeft: Math.round(sum.shoulderAngleLeft / count),
    shoulderAngleRight: Math.round(sum.shoulderAngleRight / count),
    backAngle: Math.round(sum.backAngle / count),
    torsoAngle: Math.round(sum.torsoAngle / count),
    hipLevel: sum.hipLevel / count,
    shoulderLevel: sum.shoulderLevel / count,
    squatDepth: sum.squatDepth / count,
    kneeOverToe: sum.kneeOverToe, // true if ANY frame had knees over toes
  };
}



