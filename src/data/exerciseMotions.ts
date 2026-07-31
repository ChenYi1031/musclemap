/**
 * Exercise motion profiles.
 *
 * The GLB model has no skeleton/rig, so we simulate exercise motion procedurally:
 * - bob: whole-body vertical bob amplitude (rep rhythm) — e.g. squat dips down
 * - lean: whole-body forward lean amplitude (radians) — e.g. deadlift hinges at hips
 * - rock: whole-body side-to-side twist amplitude (radians) — e.g. russian twist
 * - speed: rep frequency multiplier
 *
 * Activated muscles additionally "pump" (thicken) in sync with the rep rhythm
 * (handled in HumanModel.tsx).
 */

export interface MotionProfile {
  bob: number;
  lean: number;
  rock: number;
  speed: number;
}

export const DEFAULT_MOTION: MotionProfile = {
  bob: 0,      // completely static when nothing is selected
  lean: 0,
  rock: 0,
  speed: 0.5,
};

export const EXERCISE_MOTIONS: Record<string, MotionProfile> = {
  // ===== 背 + 二头肌日 =====
  'pull-up': { bob: 0.10, lean: 0.04, rock: 0, speed: 1.0 },
  'chin-up': { bob: 0.10, lean: 0.04, rock: 0, speed: 1.0 },
  'barbell-row': { bob: 0.06, lean: 0.25, rock: 0, speed: 0.9 },
  'dumbbell-row': { bob: 0.06, lean: 0.20, rock: 0.06, speed: 0.9 },
  'cable-curl': { bob: 0.02, lean: 0.04, rock: 0, speed: 1.1 },
  'hammer-curl': { bob: 0.02, lean: 0.04, rock: 0, speed: 1.1 },
  'preacher-curl': { bob: 0.02, lean: 0.07, rock: 0, speed: 1.1 },

  // ===== 胸 + 三头肌日 =====
  'bench-press': { bob: 0.08, lean: 0.02, rock: 0, speed: 1.0 },
  'incline-press': { bob: 0.08, lean: 0.04, rock: 0, speed: 1.0 },
  'chest-fly': { bob: 0.06, lean: 0.02, rock: 0, speed: 0.9 },
  'dips': { bob: 0.16, lean: 0.05, rock: 0, speed: 1.0 },
  'tricep-pushdown': { bob: 0.03, lean: 0.05, rock: 0, speed: 1.1 },
  'skull-crusher': { bob: 0.04, lean: 0.02, rock: 0, speed: 1.0 },
  'y-raise': { bob: 0.04, lean: 0.02, rock: 0, speed: 1.0 },

  // ===== 腿 + 核心日 =====
  'squat': { bob: 0.38, lean: 0.08, rock: 0, speed: 0.8 },
  'leg-press': { bob: 0.16, lean: 0.05, rock: 0, speed: 0.9 },
  'lunges': { bob: 0.25, lean: 0.06, rock: 0.05, speed: 0.8 },
  'romanian-deadlift': { bob: 0.10, lean: 0.32, rock: 0, speed: 0.7 },
  'calf-raise': { bob: 0.25, lean: 0.02, rock: 0, speed: 1.0 },
  'hanging-leg-raise': { bob: 0.05, lean: 0.04, rock: 0.12, speed: 0.9 },
  'plank': { bob: 0.02, lean: 0.02, rock: 0, speed: 0.5 },
  'russian-twist': { bob: 0.02, lean: 0.04, rock: 0.22, speed: 1.2 },
  'crunch': { bob: 0.10, lean: 0.08, rock: 0, speed: 1.0 },
};

export function getExerciseMotion(exerciseId: string | undefined): MotionProfile {
  if (exerciseId && EXERCISE_MOTIONS[exerciseId]) {
    return EXERCISE_MOTIONS[exerciseId];
  }
  return DEFAULT_MOTION;
}
