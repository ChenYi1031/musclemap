/**
 * Shared rep-cycle rhythm used by both the muscle model (HumanModel) and the
 * rigged character (RiggedCharacter) so the two modes animate identically.
 *
 * A "rep" moves for the first ~55% of the cycle (concentric + eccentric),
 * then fully rests — preventing constant shaking and giving a natural
 * rep-then-rest feel. All values are driven by this single implementation.
 */

/** Fraction of the cycle spent actively moving (rest of it is a hold). */
export const REP_ACTIVE_RATIO = 0.55;

/** Base frequency multiplier for the rep cycle. */
export const REP_FREQ = 2.6;

export interface RepRhythm {
  /** 0..1 position within the full cycle */
  cycle01: number;
  /** 1 during the active phase, 0 during rest */
  active: number;
  /** 0..1 progress within the active phase */
  repT: number;
  /** 0 -> 1 -> 0 over one rep (smooth bell) */
  wave: number;
  /** active * wave — 0..1, fully 0 during rest */
  rhythm: number;
  /** sin(repT * 2π) — oscillates -1..1, for twisting/rocking */
  swingWave: number;
}

/**
 * Compute the rep rhythm at a given elapsed time and speed multiplier.
 * `swing` poses (twisting / alternating exercises) use `swingWave` as their
 * amplitude; normal poses use `rhythm` (0..1 with full rest between reps).
 */
export function getRepRhythm(time: number, speed: number): RepRhythm {
  const cycle01 = ((time * speed * REP_FREQ) % (Math.PI * 2)) / (Math.PI * 2);
  const active = cycle01 < REP_ACTIVE_RATIO ? 1 : 0;
  const repT = Math.min(cycle01 / REP_ACTIVE_RATIO, 1);
  const wave = Math.sin(repT * Math.PI);
  return {
    cycle01,
    active,
    repT,
    wave,
    rhythm: active * wave,
    swingWave: Math.sin(repT * Math.PI * 2),
  };
}

/** Smoothing factor used for color/pose transitions in useFrame loops. */
export const SMOOTH_FAST = 5;

/** Smoothing factor for muscle flex activation. */
export const SMOOTH_FLEX = 4;
