import { MuscleHighlight, Exercise } from '../types';

/**
 * Calculate muscle highlights based on selected exercises.
 * Priority: primary > secondary > stabilizer
 */
export function calculateHighlights(
  selectedExerciseIds: string[],
  exercises: Exercise[]
): MuscleHighlight[] {
  const muscleLevels = new Map<string, 'primary' | 'secondary' | 'stabilizer'>();
  const priority = { primary: 3, secondary: 2, stabilizer: 1 };

  selectedExerciseIds.forEach(exerciseId => {
    const exercise = exercises.find(e => e.id === exerciseId);
    if (!exercise) return;

    exercise.muscles.primary.forEach(id => {
      if (!muscleLevels.has(id) || priority[muscleLevels.get(id)!] < priority.primary) {
        muscleLevels.set(id, 'primary');
      }
    });
    exercise.muscles.secondary.forEach(id => {
      if (!muscleLevels.has(id) || priority[muscleLevels.get(id)!] < priority.secondary) {
        muscleLevels.set(id, 'secondary');
      }
    });
    exercise.muscles.stabilizer.forEach(id => {
      if (!muscleLevels.has(id) || priority[muscleLevels.get(id)!] < priority.stabilizer) {
        muscleLevels.set(id, 'stabilizer');
      }
    });
  });

  const highlights: MuscleHighlight[] = [];
  muscleLevels.forEach((level, muscleId) => {
    highlights.push({ muscleId, level });
  });

  return highlights;
}
