import type { PoseLandmark, PoseMetrics, MovementAnalysis } from "@/types";

// MediaPipe landmark indices (33 total points)
// Reference: https://developers.google.com/mediapipe/solutions/vision/pose_landmarker
export const POSE_LANDMARKS = {
  // Face
  NOSE: 0,
  LEFT_EYE: 2,
  RIGHT_EYE: 5,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,

  // Upper body
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,

  // Lower body
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_FOOT: 31,
  RIGHT_FOOT: 32,
} as const;

/**
 * Calculate angle between three points (in degrees)
 * Point B is the vertex (middle point)
 */
export function calculateAngle(
  a: PoseLandmark,
  b: PoseLandmark,
  c: PoseLandmark
): number {
  const radians =
    Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs(radians * (180 / Math.PI));
  if (angle > 180) {
    angle = 360 - angle;
  }
  return Math.round(angle);
}

/**
 * Calculate all pose metrics from landmarks array
 */
export function calculatePoseMetrics(landmarks: PoseLandmark[]): PoseMetrics {
  const L = POSE_LANDMARKS;

  // Lower body angles
  const kneeAngleLeft = calculateAngle(
    landmarks[L.LEFT_HIP],
    landmarks[L.LEFT_KNEE],
    landmarks[L.LEFT_ANKLE]
  );
  const kneeAngleRight = calculateAngle(
    landmarks[L.RIGHT_HIP],
    landmarks[L.RIGHT_KNEE],
    landmarks[L.RIGHT_ANKLE]
  );
  const hipAngleLeft = calculateAngle(
    landmarks[L.LEFT_SHOULDER],
    landmarks[L.LEFT_HIP],
    landmarks[L.LEFT_KNEE]
  );
  const hipAngleRight = calculateAngle(
    landmarks[L.RIGHT_SHOULDER],
    landmarks[L.RIGHT_HIP],
    landmarks[L.RIGHT_KNEE]
  );
  const ankleAngleLeft = calculateAngle(
    landmarks[L.LEFT_KNEE],
    landmarks[L.LEFT_ANKLE],
    landmarks[L.LEFT_FOOT]
  );
  const ankleAngleRight = calculateAngle(
    landmarks[L.RIGHT_KNEE],
    landmarks[L.RIGHT_ANKLE],
    landmarks[L.RIGHT_FOOT]
  );

  // Upper body angles
  const elbowAngleLeft = calculateAngle(
    landmarks[L.LEFT_SHOULDER],
    landmarks[L.LEFT_ELBOW],
    landmarks[L.LEFT_WRIST]
  );
  const elbowAngleRight = calculateAngle(
    landmarks[L.RIGHT_SHOULDER],
    landmarks[L.RIGHT_ELBOW],
    landmarks[L.RIGHT_WRIST]
  );
  const shoulderAngleLeft = calculateAngle(
    landmarks[L.LEFT_ELBOW],
    landmarks[L.LEFT_SHOULDER],
    landmarks[L.LEFT_HIP]
  );
  const shoulderAngleRight = calculateAngle(
    landmarks[L.RIGHT_ELBOW],
    landmarks[L.RIGHT_SHOULDER],
    landmarks[L.RIGHT_HIP]
  );

  // Core/Alignment
  const backAngle = calculateAngle(
    landmarks[L.LEFT_SHOULDER],
    landmarks[L.LEFT_HIP],
    landmarks[L.LEFT_KNEE]
  );

  // Torso angle (vertical alignment)
  const midShoulder = {
    x: (landmarks[L.LEFT_SHOULDER].x + landmarks[L.RIGHT_SHOULDER].x) / 2,
    y: (landmarks[L.LEFT_SHOULDER].y + landmarks[L.RIGHT_SHOULDER].y) / 2,
    z: 0,
    visibility: 1,
  };
  const midHip = {
    x: (landmarks[L.LEFT_HIP].x + landmarks[L.RIGHT_HIP].x) / 2,
    y: (landmarks[L.LEFT_HIP].y + landmarks[L.RIGHT_HIP].y) / 2,
    z: 0,
    visibility: 1,
  };
  const verticalRef = { ...midHip, y: midHip.y - 1 };
  const torsoAngle = calculateAngle(midShoulder, midHip, verticalRef);

  // Level differences (0 = perfectly level)
  const hipLevel = Math.abs(landmarks[L.LEFT_HIP].y - landmarks[L.RIGHT_HIP].y);
  const shoulderLevel = Math.abs(
    landmarks[L.LEFT_SHOULDER].y - landmarks[L.RIGHT_SHOULDER].y
  );

  // Squat depth (percentage based on hip-knee-ankle relationship)
  const avgKneeAngle = (kneeAngleLeft + kneeAngleRight) / 2;
  const squatDepth = Math.max(
    0,
    Math.min(100, ((180 - avgKneeAngle) / 90) * 100)
  );

  // Knee over toe check
  const kneeOverToe =
    landmarks[L.LEFT_KNEE].x > landmarks[L.LEFT_ANKLE].x + 0.05 ||
    landmarks[L.RIGHT_KNEE].x > landmarks[L.RIGHT_ANKLE].x + 0.05;

  return {
    kneeAngleLeft,
    kneeAngleRight,
    hipAngleLeft,
    hipAngleRight,
    ankleAngleLeft,
    ankleAngleRight,
    elbowAngleLeft,
    elbowAngleRight,
    shoulderAngleLeft,
    shoulderAngleRight,
    backAngle,
    torsoAngle,
    hipLevel,
    shoulderLevel,
    squatDepth,
    kneeOverToe,
  };
}

/**
 * Analyze movement patterns across all frames to determine which body parts moved the most
 * This helps identify the exercise type (arm exercise vs leg exercise vs core, etc.)
 */
export function analyzeMovement(
  allFrameMetrics: PoseMetrics[]
): MovementAnalysis {
  if (allFrameMetrics.length === 0) {
    throw new Error("No metrics to analyze");
  }

  // Find min and max for each joint angle across all frames
  const getRange = (metrics: PoseMetrics[], key: keyof PoseMetrics): number => {
    const values = metrics.map((m) => m[key] as number);
    const min = Math.min(...values);
    const max = Math.max(...values);
    return Math.round(max - min);
  };

  // Calculate range of motion for each joint
  const elbowRangeLeft = getRange(allFrameMetrics, "elbowAngleLeft");
  const elbowRangeRight = getRange(allFrameMetrics, "elbowAngleRight");
  const kneeRangeLeft = getRange(allFrameMetrics, "kneeAngleLeft");
  const kneeRangeRight = getRange(allFrameMetrics, "kneeAngleRight");
  const hipRangeLeft = getRange(allFrameMetrics, "hipAngleLeft");
  const hipRangeRight = getRange(allFrameMetrics, "hipAngleRight");
  const shoulderRangeLeft = getRange(allFrameMetrics, "shoulderAngleLeft");
  const shoulderRangeRight = getRange(allFrameMetrics, "shoulderAngleRight");

  // Calculate combined ranges for body part groups
  const movementGroups = [
    {
      name: "elbows",
      range: Math.max(elbowRangeLeft, elbowRangeRight),
      avgRange: (elbowRangeLeft + elbowRangeRight) / 2,
    },
    {
      name: "knees",
      range: Math.max(kneeRangeLeft, kneeRangeRight),
      avgRange: (kneeRangeLeft + kneeRangeRight) / 2,
    },
    {
      name: "hips",
      range: Math.max(hipRangeLeft, hipRangeRight),
      avgRange: (hipRangeLeft + hipRangeRight) / 2,
    },
    {
      name: "shoulders",
      range: Math.max(shoulderRangeLeft, shoulderRangeRight),
      avgRange: (shoulderRangeLeft + shoulderRangeRight) / 2,
    },
  ];

  // Sort by range (highest movement first)
  movementGroups.sort((a, b) => b.range - a.range);

  const primaryMovement = movementGroups[0];
  const secondaryMovement = movementGroups[1];

  // Calculate body orientation based on average torso angle
  const avgTorsoAngle =
    allFrameMetrics.reduce((sum, m) => sum + m.torsoAngle, 0) /
    allFrameMetrics.length;

  let bodyOrientation: "upright" | "horizontal" | "inclined" | "prone";
  if (avgTorsoAngle < 20) {
    bodyOrientation = "upright"; // Standing, sitting upright
  } else if (avgTorsoAngle > 70) {
    bodyOrientation = "horizontal"; // Lying down (bench press, etc.)
  } else if (avgTorsoAngle > 45) {
    bodyOrientation = "inclined"; // Incline bench, bent over rows
  } else {
    bodyOrientation = "prone"; // Push-ups, planks (face down)
  }

  // Check arm symmetry - are both arms moving together?
  const elbowDiffRange = Math.abs(elbowRangeLeft - elbowRangeRight);
  const shoulderDiffRange = Math.abs(shoulderRangeLeft - shoulderRangeRight);
  const armSymmetry = elbowDiffRange < 15 && shoulderDiffRange < 15;

  // Calculate elbow-to-shoulder ratio
  // High ratio = isolation (bicep curl: elbows move, shoulders don't)
  // Low ratio = compound (bench press: both move together)
  const totalElbowRange = (elbowRangeLeft + elbowRangeRight) / 2;
  const totalShoulderRange = (shoulderRangeLeft + shoulderRangeRight) / 2;
  const elbowShoulderRatio =
    totalShoulderRange > 5
      ? Math.round((totalElbowRange / totalShoulderRange) * 10) / 10
      : 99; // If shoulders barely move, it's highly isolated

  // Is this a compound movement? (multiple joints moving significantly)
  const significantMovementThreshold = 15; // degrees
  const significantMovers = movementGroups.filter(
    (g) => g.range >= significantMovementThreshold
  );
  const isCompoundMovement = significantMovers.length >= 2;

  // Calculate ankle flexion range (for calf raises)
  const ankleFlexionRange =
    getRange(allFrameMetrics, "ankleAngleLeft") +
    getRange(allFrameMetrics, "ankleAngleRight") / 2;

  // Detect shoulder elevation (for traps/shrugs)
  // Track shoulder level changes - if shoulders move vertically together, it's elevation
  const shoulderLevelRange = getRange(allFrameMetrics, "shoulderLevel");
  // If shoulder level stays consistent (low range) but shoulders move, it's elevation
  // If primary movement is shoulders with minimal elbow movement, likely shrugs
  const shoulderElevationRange =
    primaryMovement.name === "shoulders" &&
    elbowRangeLeft + elbowRangeRight < 20 &&
    shoulderLevelRange < 0.05
      ? Math.max(shoulderRangeLeft, shoulderRangeRight)
      : 0;

  // Detect hip abduction (lateral hip movement)
  // Hip abduction shows as hip level changes (one hip higher than other)
  // Combined with minimal knee movement
  const hipLevelRange = getRange(allFrameMetrics, "hipLevel");
  const hipAbductionRange =
    primaryMovement.name === "hips" &&
    kneeRangeLeft + kneeRangeRight < 20 &&
    hipLevelRange > 0.02
      ? Math.round(hipLevelRange * 1000) // Convert to meaningful scale
      : 0;

  // Determine movement plane
  // Sagittal = forward/back (most exercises)
  // Frontal = side-to-side (lateral raises, hip abduction)
  // Transverse = rotation (rare, hard to detect)
  let movementPlane: "sagittal" | "frontal" | "transverse";
  if (hipAbductionRange > 0 || shoulderElevationRange > 0) {
    movementPlane = "frontal"; // Lateral movement
  } else if (
    primaryMovement.name === "shoulders" &&
    bodyOrientation === "upright"
  ) {
    // Lateral raises are frontal plane
    movementPlane = "frontal";
  } else {
    movementPlane = "sagittal"; // Most exercises are forward/back
  }

  // Determine equipment type based on arm symmetry and movement patterns
  // Perfect symmetry (< 5° difference) = barbell
  // Slight asymmetry (5-20° difference) = dumbbell
  // No arm movement or bodyweight pattern = bodyweight
  let equipmentType: "barbell" | "dumbbell" | "bodyweight" | "cable";
  const elbowSymmetryDiff = Math.abs(elbowRangeLeft - elbowRangeRight);
  const shoulderSymmetryDiff = Math.abs(shoulderRangeLeft - shoulderRangeRight);

  if (
    primaryMovement.name === "elbows" ||
    primaryMovement.name === "shoulders"
  ) {
    if (elbowSymmetryDiff < 5 && shoulderSymmetryDiff < 5 && armSymmetry) {
      equipmentType = "barbell"; // Perfect symmetry
    } else if (elbowSymmetryDiff < 20 && shoulderSymmetryDiff < 20) {
      equipmentType = "dumbbell"; // Slight asymmetry allowed
    } else {
      equipmentType = "bodyweight"; // Asymmetric or single arm
    }
  } else if (
    primaryMovement.name === "knees" ||
    primaryMovement.name === "hips"
  ) {
    equipmentType = "bodyweight"; // Leg exercises are usually bodyweight or machine
  } else {
    equipmentType = "bodyweight"; // Default
  }

  return {
    primaryMovement: primaryMovement.name,
    secondaryMovement: secondaryMovement.name,
    primaryRange: Math.round(primaryMovement.avgRange),
    secondaryRange: Math.round(secondaryMovement.avgRange),
    elbowRangeLeft,
    elbowRangeRight,
    kneeRangeLeft,
    kneeRangeRight,
    hipRangeLeft,
    hipRangeRight,
    shoulderRangeLeft,
    shoulderRangeRight,
    bodyOrientation,
    armSymmetry,
    elbowShoulderRatio,
    isCompoundMovement,
    shoulderElevationRange: Math.round(shoulderElevationRange),
    hipAbductionRange: Math.round(hipAbductionRange),
    ankleFlexionRange: Math.round(ankleFlexionRange),
    movementPlane,
    equipmentType,
  };
}
