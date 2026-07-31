import { Exercise } from '../types';
import { muscles } from '../data/muscles';
import { useStore } from '../store/useStore';

interface ExerciseCardProps {
  exercise: Exercise;
  isSelected: boolean;
}

export function ExerciseCard({ exercise, isSelected }: ExerciseCardProps) {
  const { toggleExercise } = useStore();

  const getMuscleNames = (ids: string[]) => {
    return ids.map(id => muscles.find(m => m.id === id)?.name).filter(Boolean).join('、');
  };

  return (
    <div
      onClick={() => toggleExercise(exercise.id)}
      className={`exercise-card p-4 rounded-xl cursor-pointer transition-colors border-2 ${
        isSelected
          ? 'bg-slate-700/80 border-blue-500/50 shadow-lg'
          : 'bg-slate-800/50 border-transparent hover:bg-slate-700/50 hover:border-slate-600'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${
          isSelected ? 'bg-blue-500 border-blue-500' : 'border-slate-500'
        }`}>
          {isSelected && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-lg">{exercise.icon}</span>
            <h3 className="font-semibold">{exercise.name}</h3>
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            {exercise.muscles.primary.length > 0 && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-red-600/20 text-red-400">
                主要: {getMuscleNames(exercise.muscles.primary)}
              </span>
            )}
            {exercise.muscles.secondary.length > 0 && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-orange-600/20 text-orange-400">
                次要: {getMuscleNames(exercise.muscles.secondary)}
              </span>
            )}
            {exercise.muscles.stabilizer.length > 0 && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-orange-400/20 text-orange-300">
                辅助: {getMuscleNames(exercise.muscles.stabilizer)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
