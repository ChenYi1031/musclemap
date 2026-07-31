import { useStore } from '../store/useStore';
import { exercises } from '../data/exercises';
import { ExerciseCard } from './ExerciseCard';

export function ExerciseList() {
  const { selectedDay, selectedExercises, selectAllExercises, clearExercises } = useStore();

  const dayExercises = exercises.filter(e => e.category === selectedDay);
  const allSelected = dayExercises.every(e => selectedExercises.includes(e.id));

  return (
    <div className="space-y-3">
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => selectAllExercises(dayExercises.map(e => e.id))}
          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
            allSelected
              ? 'bg-slate-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          全选该日动作
        </button>
        <button
          onClick={clearExercises}
          className="px-3 py-1.5 text-sm rounded-md bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
        >
          清空选择
        </button>
      </div>

      {dayExercises.map((exercise) => (
        <ExerciseCard
          key={exercise.id}
          exercise={exercise}
          isSelected={selectedExercises.includes(exercise.id)}
        />
      ))}
    </div>
  );
}
