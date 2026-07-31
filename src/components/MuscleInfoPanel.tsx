import { useStore } from '../store/useStore';
import { exercises } from '../data/exercises';

export function MuscleInfoPanel() {
  const { selectedMuscle, setShowMuscleInfo, toggleExercise, selectedExercises } = useStore();

  if (!selectedMuscle) return null;

  const relatedExercises = exercises.filter(e =>
    e.muscles.primary.includes(selectedMuscle.id) ||
    e.muscles.secondary.includes(selectedMuscle.id) ||
    e.muscles.stabilizer.includes(selectedMuscle.id)
  );

  return (
    <div className="fixed right-0 top-14 bottom-10 w-80 bg-slate-800 border-l border-slate-700 p-4 overflow-y-auto shadow-2xl z-50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">{selectedMuscle.name}</h3>
        <button
          onClick={() => setShowMuscleInfo(false)}
          className="p-1 hover:bg-slate-700 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="text-sm text-slate-400 mb-4">{selectedMuscle.nameEn}</div>

      <div className="mb-6">
        <h4 className="text-sm font-semibold text-slate-300 mb-2">功能简述</h4>
        <p className="text-sm text-slate-400">{selectedMuscle.description}</p>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-slate-300 mb-3">相关训练动作</h4>
        <div className="space-y-2">
          {relatedExercises.map((exercise) => {
            const isSelected = selectedExercises.includes(exercise.id);
            const muscleLevel = exercise.muscles.primary.includes(selectedMuscle.id)
              ? 'primary'
              : exercise.muscles.secondary.includes(selectedMuscle.id)
              ? 'secondary'
              : 'stabilizer';

            return (
              <button
                key={exercise.id}
                onClick={() => toggleExercise(exercise.id)}
                className={`w-full p-3 rounded-lg text-left transition-all ${
                  isSelected
                    ? 'bg-slate-700 border border-blue-500/50'
                    : 'bg-slate-700/50 hover:bg-slate-700 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{exercise.icon}</span>
                  <span className="font-medium">{exercise.name}</span>
                </div>
                <div className="mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    muscleLevel === 'primary' ? 'bg-red-600/20 text-red-400' :
                    muscleLevel === 'secondary' ? 'bg-orange-600/20 text-orange-400' :
                    'bg-orange-400/20 text-orange-300'
                  }`}>
                    {muscleLevel === 'primary' ? '主要发力' : muscleLevel === 'secondary' ? '次要发力' : '辅助稳定'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
