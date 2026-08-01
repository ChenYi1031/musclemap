/**
 * Bone pose library for the Mixamo-style rigged character (Xbot).
 *
 * The character is driven procedurally: each exercise defines ABSOLUTE Euler
 * rotations (radians) applied on top of the T-pose bind quaternion, per bone.
 *
 * KINEMATIC CALIBRATION (measured from the Xbot skeleton, Left-side base;
 * Right side mirrors the sign of z):
 *   joint          | axis | range                    | forbidden
 *   ----------------|------|--------------------------|--------------------------
 *   shoulder (Arm)  | z    | -90° (hang) .. +90° (overhead) | ±135°+ = arm crosses body midline
 *   elbow (ForeArm) | z    | 0° (straight) .. -120° (flex) | positive = hyperextended elbow
 *   hip    (UpLeg)  | z    | 0° .. +90° (flex)       | -90° = leg behind body
 *   knee   (Leg)    | z    | 0° .. -120° (flex)      | positive = hyperextended knee
 *   spine          | x    | 0° .. +60° (forward curl) | >75° = hunched back
 *   spine          | z    | ±45° (twist)             | >45° = unsafe rotation
 *   ankle  (Foot)  | x    | +0.35 = plantar flexion (toes down)
 *
 * These limits were verified empirically with the Xbot skeleton via a
 * calibration script (bone world-position tracking) and cross-checked against
 * human movement ranges. Angles outside the ranges above produce poses a real
 * human cannot perform (arms crossing the body, hyperextended elbows/knees).
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
  // Pull-up: arms slightly wider than shoulder (~75°, not fully vertical —
  // fully overhead reads as "arms raised" rather than gripping a bar), elbows
  // pulling down, chest toward bar (spine lean).
  'pull-up': {
    bones: {
      'mixamorigLeftArm': { z: 1.3 },
      'mixamorigRightArm': { z: -1.3 },
      'mixamorigLeftForeArm': { z: -0.5 },
      'mixamorigRightForeArm': { z: 0.5 },
      'mixamorigSpine': { x: 0.35 },
    },
    hipsY: 2.5,
  },
  'chin-up': {
    bones: {
      'mixamorigLeftArm': { z: 1.13 },
      'mixamorigRightArm': { z: -1.13 },
      'mixamorigLeftForeArm': { z: -0.7 },
      'mixamorigRightForeArm': { z: 0.7 },
      'mixamorigSpine': { x: 0.26 },
    },
    hipsY: 2.5,
  },
  'barbell-row': {
    bones: {
      'mixamorigSpine': { x: 0.45 },
      'mixamorigSpine1': { x: 0.2 },
      'mixamorigLeftUpLeg': { z: 0.7 },
      'mixamorigRightUpLeg': { z: -0.7 },
      'mixamorigLeftForeArm': { z: -1.1 },
      'mixamorigRightForeArm': { z: 1.1 },
    },
  },
  'dumbbell-row': {
    bones: {
      'mixamorigSpine': { x: 0.5 },
      'mixamorigLeftUpLeg': { z: 0.7 },
      'mixamorigRightUpLeg': { z: -0.7 },
      'mixamorigLeftForeArm': { z: -1.2 },
      'mixamorigRightForeArm': { z: 1.2 },
    },
    swing: true,
  },
  'cable-curl': { bones: { ...ARM_DOWN, 'mixamorigLeftForeArm': { z: -1.2 }, 'mixamorigRightForeArm': { z: 1.2 } } },
  'hammer-curl': { bones: { ...ARM_DOWN, 'mixamorigLeftForeArm': { z: -1.2 }, 'mixamorigRightForeArm': { z: 1.2 } } },
  'preacher-curl': { bones: { ...ARM_DOWN, 'mixamorigLeftForeArm': { z: -1.2 }, 'mixamorigRightForeArm': { z: 1.2 } } },

  // ===== 胸 + 三头肌日 =====
  // Standing-press approximation: arms at ~46-57°, elbows flexed more so the
  // forearms are near-vertical (bar-grip look), elbow extends with the rep.
  'bench-press': {
    bones: {
      'mixamorigLeftArm': { z: 0.8 },
      'mixamorigRightArm': { z: -0.8 },
      'mixamorigLeftForeArm': { z: -1.2 },
      'mixamorigRightForeArm': { z: 1.2 },
    },
  },
  'incline-press': {
    bones: {
      'mixamorigLeftArm': { z: 1.0 },
      'mixamorigRightArm': { z: -1.0 },
      'mixamorigLeftForeArm': { z: -1.2 },
      'mixamorigRightForeArm': { z: 1.2 },
    },
  },
  // Chest fly: arms wide, elbows slightly bent (holding dumbbells)
  'chest-fly': {
    bones: {
      'mixamorigLeftArm': { z: 1.2 },
      'mixamorigRightArm': { z: -1.2 },
      'mixamorigLeftForeArm': { z: -0.26 },
      'mixamorigRightForeArm': { z: 0.26 },
    },
  },
  'dips': {
    bones: {
      'mixamorigLeftArm': { z: 0.8 },
      'mixamorigRightArm': { z: -0.8 },
      'mixamorigLeftForeArm': { z: -1.2 },
      'mixamorigRightForeArm': { z: 1.2 },
      'mixamorigSpine': { x: 0.26 },
    },
    hipsY: -15,
  },
  'tricep-pushdown': {
    bones: { ...ARM_DOWN, 'mixamorigLeftForeArm': { z: -1.1 }, 'mixamorigRightForeArm': { z: 1.1 } },
  },
  'skull-crusher': {
    bones: {
      'mixamorigLeftArm': { z: 0.8 },
      'mixamorigRightArm': { z: -0.8 },
      'mixamorigLeftForeArm': { z: -1.2 },
      'mixamorigRightForeArm': { z: 1.2 },
    },
  },
  // Y-raise: arms raised to ~45° above horizontal (Y shape)
  'y-raise': {
    bones: {
      'mixamorigLeftArm': { z: 0.79 },
      'mixamorigRightArm': { z: -0.79 },
    },
  },

  // ===== 腿 + 核心日 =====
  'squat': {
    bones: {
      'mixamorigLeftUpLeg': { z: 1.0 },
      'mixamorigRightUpLeg': { z: -1.0 },
      'mixamorigLeftLeg': { z: -1.4 },
      'mixamorigRightLeg': { z: 1.4 },
      'mixamorigSpine': { x: 0.44 },
    },
    hipsY: -19,
  },
  // Leg press: hips and knees fold deeply (~63°/86°)
  'leg-press': {
    bones: {
      'mixamorigLeftUpLeg': { z: 1.1 },
      'mixamorigRightUpLeg': { z: -1.1 },
      'mixamorigLeftLeg': { z: -1.5 },
      'mixamorigRightLeg': { z: 1.5 },
    },
    hipsY: -10,
  },
  'lunges': {
    bones: {
      'mixamorigLeftUpLeg': { z: 0.9 },
      'mixamorigRightUpLeg': { z: -0.9 },
      'mixamorigLeftLeg': { z: -1.4 },
      'mixamorigRightLeg': { z: 1.4 },
      'mixamorigSpine': { x: 0.26 },
    },
    hipsY: -15,
    swing: true,
  },
  // Romanian deadlift: big hip hinge (~57°), back kept straight (spine ~29°)
  'romanian-deadlift': {
    bones: {
      'mixamorigSpine': { x: 0.5 },
      'mixamorigSpine1': { x: 0.2 },
      'mixamorigLeftUpLeg': { z: 1.0 },
      'mixamorigRightUpLeg': { z: -1.0 },
      'mixamorigLeftLeg': { z: -0.26 },
      'mixamorigRightLeg': { z: 0.26 },
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
  // Hanging leg raise: hanging from arms (overhead), legs raised ~80° hip / 40° knee
  'hanging-leg-raise': {
    bones: {
      'mixamorigLeftArm': { z: 1.4 },
      'mixamorigRightArm': { z: -1.4 },
      'mixamorigLeftUpLeg': { z: 1.4 },
      'mixamorigRightUpLeg': { z: -1.4 },
      'mixamorigLeftLeg': { z: -0.7 },
      'mixamorigRightLeg': { z: 0.7 },
    },
  },
  // Plank: straight body (spine 0°), arms forward supporting (~34°), NOT leaning back
  'plank': {
    bones: {
      'mixamorigLeftArm': { z: -0.6 },
      'mixamorigRightArm': { z: 0.6 },
      'mixamorigLeftForeArm': { z: -0.9 },
      'mixamorigRightForeArm': { z: 0.9 },
      'mixamorigSpine': { x: 0 },
    },
  },
  // Russian twist: seated-ish (hips + knees flexed), torso twist ≤35°
  'russian-twist': {
    bones: {
      'mixamorigLeftUpLeg': { z: 1.1 },
      'mixamorigRightUpLeg': { z: -1.1 },
      'mixamorigLeftLeg': { z: -1.0 },
      'mixamorigRightLeg': { z: 1.0 },
      'mixamorigSpine': { z: 0.6 },
      'mixamorigSpine1': { z: 0.4 },
      ...ARM_DOWN,
    },
    swing: true,
  },
  // Crunch: seated-curl feel — hips/knees flexed (legs up), spine curls forward
  'crunch': {
    bones: {
      'mixamorigLeftUpLeg': { z: 0.8 },
      'mixamorigRightUpLeg': { z: -0.8 },
      'mixamorigLeftLeg': { z: -1.4 },
      'mixamorigRightLeg': { z: 1.4 },
      'mixamorigSpine': { x: 0.45 },
      'mixamorigSpine1': { x: 0.4 },
      'mixamorigSpine2': { x: 0.35 },
      'mixamorigNeck': { x: 0.2 },
      ...ARM_DOWN,
    },
    hipsY: -8,
  },
};

export function getExercisePose(exerciseId: string | undefined): ExercisePose {
  if (exerciseId && EXERCISE_POSES[exerciseId]) {
    return EXERCISE_POSES[exerciseId];
  }
  return STANDING_POSE;
}
