import type { PoseLandmark, PoseMetrics } from "@/types";

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
