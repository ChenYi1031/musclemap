import { useStore } from '../store/useStore';
import { trainingDays } from '../data/trainingDays';

export function TrainingTabs() {
  const { selectedDay, setSelectedDay } = useStore();

  const dayIcons: Record<string, string> = {
    'back-biceps': '🟦',
    'chest-triceps': '🟥',
    'legs-core': '🟩',
  };

  return (
    <div className="h-12 px-6 flex items-center gap-2 border-b border-slate-700 bg-slate-800/30">
      {trainingDays.map((day) => (
        <button
          key={day.id}
          onClick={() => setSelectedDay(day.id)}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            selectedDay === day.id
              ? 'bg-slate-700 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
          style={selectedDay === day.id ? { backgroundColor: day.color + '33' } : {}}
        >
          <span className="mr-2">{dayIcons[day.id]}</span>
          {day.name}
        </button>
      ))}
    </div>
  );
}
