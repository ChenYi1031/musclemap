/**
 * Bone pose library for the Mixamo-style rigged character (Xbot).
 *
 * The character is driven procedurally: each exercise defines ABSOLUTE Euler
 * rotations (radians) applied on top of the T-pose bind quaternion, per bone.
 * Verified empirically with the Xbot skeleton:
 *   - elbow flexion   = ForeArm rotation.z  (left -, right +)
 *   - arm raise       = Arm rotation.z
 *   - thigh flexion   = UpLeg rotation.z    (left +, right -)
 *   - knee bend       = Leg rotation.z      (left -, right +)
 *   - spine hinge     = Spine rotation.x    (positive = forward curl)
 *   - torso twist     = Spine rotation.z
 *   - hips translation: local 1 unit = 0.01 world units (root scale 0.01)
 *
 * The rep cycle applies an amplitude wave (0 -> 1 -> 0 during the active
 * phase) to every rotation. Poses marked `swing` oscillate -1..1 instead.
 */

export const H2 = Math.PI / 2;

export interface BoneDelta {
  x?: number;
  y?: number;
  z?: number;
}

export interface ExercisePose {
  bones: Record<string, BoneDelta>;
  /** hips vertical offset in LOCAL skeleton units (1 local = 0.01 world) */
  hipsY?: number;
  /** oscillate -1..1 instead of 0..1 wave (for twisting / alternating) */
  swing?: boolean;
}

/** Arms relaxed at the sides. All other bones stay at T-pose (standing). */
export const STANDING_POSE: ExercisePose = {
  bones: {
    'mixamorigLeftArm': { z: -H2 },
    'mixamorigRightArm': { z: H2 },
  },
};

const ARM_DOWN = {
  'mixamorigLeftArm': { z: -H2 },
  'mixamorigRightArm': { z: H2 },
};

export const EXERCISE_POSES: Record<string, ExercisePose> = {
  // ===== 背 + 二头肌日 =====
  'pull-up': {
    bones: {
      'mixamorigLeftArm': { z: 2.6 },
      'mixamorigRightArm': { z: -2.6 },
      'mixamorigLeftForeArm': { z: -1.4 },
      'mixamorigRightForeArm': { z: 1.4 },
    },
    hipsY: 2.5,
  },
  'chin-up': {
    bones: {
      'mixamorigLeftArm': { z: 2.2 },
      'mixamorigRightArm': { z: -2.2 },
      'mixamorigLeftForeArm': { z: -1.4 },
      'mixamorigRightForeArm': { z: 1.4 },
    },
    hipsY: 2.5,
  },
  'barbell-row': {
    bones: {
      'mixamorigSpine': { x: 0.7 },
      'mixamorigSpine1': { x: 0.35 },
      'mixamorigLeftUpLeg': { z: 0.5 },
      'mixamorigRightUpLeg': { z: -0.5 },
      'mixamorigLeftForeArm': { z: -1.0 },
      'mixamorigRightForeArm': { z: 1.0 },
    },
  },
  'dumbbell-row': {
    bones: {
      'mixamorigSpine': { x: 0.6 },
      'mixamorigLeftUpLeg': { z: 0.45 },
      'mixamorigRightUpLeg': { z: -0.45 },
      'mixamorigLeftForeArm': { z: -1.0 },
      'mixamorigRightForeArm': { z: 1.0 },
    },
    swing: true,
  },
  'cable-curl': { bones: { ...ARM_DOWN, 'mixamorigLeftForeArm': { z: -1.3 }, 'mixamorigRightForeArm': { z: 1.3 } } },
  'hammer-curl': { bones: { ...ARM_DOWN, 'mixamorigLeftForeArm': { z: -1.3 }, 'mixamorigRightForeArm': { z: 1.3 } } },
  'preacher-curl': { bones: { ...ARM_DOWN, 'mixamorigLeftForeArm': { z: -1.3 }, 'mixamorigRightForeArm': { z: 1.3 } } },

  // ===== 胸 + 三头肌日 =====
  'bench-press': {
    bones: {
      'mixamorigLeftArm': { z: 1.2 },
      'mixamorigRightArm': { z: -1.2 },
      'mixamorigLeftForeArm': { z: -1.2 },
      'mixamorigRightForeArm': { z: 1.2 },
    },
  },
  'incline-press': {
    bones: {
      'mixamorigLeftArm': { z: 1.4 },
      'mixamorigRightArm': { z: -1.4 },
      'mixamorigLeftForeArm': { z: -1.2 },
      'mixamorigRightForeArm': { z: 1.2 },
    },
  },
  'chest-fly': {
    bones: {
      'mixamorigLeftArm': { z: 1.6 },
      'mixamorigRightArm': { z: -1.6 },
    },
  },
  'dips': {
    bones: {
      'mixamorigLeftArm': { z: 1.0 },
      'mixamorigRightArm': { z: -1.0 },
      'mixamorigLeftForeArm': { z: -1.0 },
      'mixamorigRightForeArm': { z: 1.0 },
    },
    hipsY: -15,
  },
  'tricep-pushdown': {
    bones: { ...ARM_DOWN, 'mixamorigLeftForeArm': { z: -0.9 }, 'mixamorigRightForeArm': { z: 0.9 } },
  },
  'skull-crusher': {
    bones: {
      'mixamorigLeftArm': { z: 0.8 },
      'mixamorigRightArm': { z: -0.8 },
      'mixamorigLeftForeArm': { z: -1.2 },
      'mixamorigRightForeArm': { z: 1.2 },
    },
  },
  'y-raise': {
    bones: {
      'mixamorigLeftArm': { z: 2.36 },
      'mixamorigRightArm': { z: -2.36 },
    },
  },

  // ===== 腿 + 核心日 =====
  'squat': {
    bones: {
      'mixamorigLeftUpLeg': { z: 0.9 },
      'mixamorigRightUpLeg': { z: -0.9 },
      'mixamorigLeftLeg': { z: -1.2 },
      'mixamorigRightLeg': { z: 1.2 },
      'mixamorigSpine': { x: 0.25 },
    },
    hipsY: -19,
  },
  'leg-press': {
    bones: {
      'mixamorigLeftUpLeg': { z: 0.8 },
      'mixamorigRightUpLeg': { z: -0.8 },
      'mixamorigLeftLeg': { z: -1.1 },
      'mixamorigRightLeg': { z: 1.1 },
    },
    hipsY: -10,
  },
  'lunges': {
    bones: {
      'mixamorigLeftUpLeg': { z: 0.7 },
      'mixamorigRightUpLeg': { z: -0.7 },
      'mixamorigLeftLeg': { z: -1.2 },
      'mixamorigRightLeg': { z: 1.2 },
    },
    hipsY: -15,
    swing: true,
  },
  'romanian-deadlift': {
    bones: {
      'mixamorigSpine': { x: 0.85 },
      'mixamorigSpine1': { x: 0.4 },
      'mixamorigLeftUpLeg': { z: 0.5 },
      'mixamorigRightUpLeg': { z: -0.5 },
      'mixamorigLeftLeg': { z: -0.15 },
      'mixamorigRightLeg': { z: 0.15 },
    },
  },
  'calf-raise': {
    bones: {
      ...ARM_DOWN,
      'mixamorigLeftFoot': { x: 0.35 },
      'mixamorigRightFoot': { x: 0.35 },
    },
    hipsY: 15,
  },
  'hanging-leg-raise': {
    bones: {
      ...ARM_DOWN,
      'mixamorigLeftUpLeg': { z: 1.1 },
      'mixamorigRightUpLeg': { z: -1.1 },
      'mixamorigLeftLeg': { z: 0.5 },
      'mixamorigRightLeg': { z: -0.5 },
    },
  },
  'plank': {
    bones: {
      'mixamorigLeftArm': { z: -0.4 },
      'mixamorigRightArm': { z: 0.4 },
      'mixamorigSpine': { x: -0.3 },
    },
  },
  'russian-twist': {
    bones: {
      'mixamorigSpine': { z: 0.5 },
      'mixamorigSpine1': { z: 0.4 },
      ...ARM_DOWN,
    },
    swing: true,
  },
  'crunch': {
    bones: {
      'mixamorigSpine': { x: 0.45 },
      'mixamorigSpine1': { x: 0.4 },
      'mixamorigSpine2': { x: 0.35 },
      'mixamorigNeck': { x: 0.2 },
      ...ARM_DOWN,
    },
  },
};

export function getExercisePose(exerciseId: string | undefined): ExercisePose {
  if (exerciseId && EXERCISE_POSES[exerciseId]) {
    return EXERCISE_POSES[exerciseId];
  }
  return STANDING_POSE;
}
