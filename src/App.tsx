import { useEffect } from 'react';
import { Scene3D } from './components/Scene3D';
import { TrainingTabs } from './components/TrainingTabs';
import { ExerciseList } from './components/ExerciseList';
import { MuscleInfoPanel } from './components/MuscleInfoPanel';
import { ViewToggle } from './components/ViewToggle';
import { useStore } from './store/useStore';
import { exercises } from './data/exercises';
import { calculateHighlights } from './utils/highlights';

function App() {
  const { selectedExercises, setHighlights, showMuscleInfo } = useStore();

  useEffect(() => {
    const highlights = calculateHighlights(selectedExercises, exercises);
    setHighlights(highlights);
  }, [selectedExercises, setHighlights]);

  return (
    <div className="w-full h-full flex flex-col">
      <header className="h-14 px-6 flex items-center justify-between border-b border-slate-700">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🦴</span>
          <h1 className="text-xl font-bold">MuscleMap</h1>
          <span className="text-sm text-slate-400">肌肉图谱</span>
        </div>
        <ViewToggle />
      </header>

      <TrainingTabs />

      <div className="flex-1 flex overflow-hidden">
        <div className="w-[60%] h-full relative">
          <Scene3D />
        </div>

        <div className="w-[40%] h-full bg-slate-800/50 border-l border-slate-700 flex flex-col">
          <div className="p-4 border-b border-slate-700">
            <h2 className="text-lg font-semibold">📋 今日动作列表</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <ExerciseList />
          </div>
        </div>
      </div>

      {showMuscleInfo && <MuscleInfoPanel />}

      <footer className="h-10 px-6 flex items-center gap-6 border-t border-slate-700 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-600"></span>
          <span className="text-slate-400">主要发力</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-orange-600"></span>
          <span className="text-slate-400">次要发力</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-orange-400"></span>
          <span className="text-slate-400">辅助稳定</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
