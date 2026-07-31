import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { useStore } from '../store/useStore';
import { trainingDays } from '../data/trainingDays';

gsap.registerPlugin(useGSAP);

export function TrainingTabs() {
  const { selectedDay, setSelectedDay } = useStore();
  const containerRef = useRef<HTMLDivElement>(null);

  // Scale-in the active tab when the day changes
  useGSAP(() => {
    if (!containerRef.current) return;
    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: reduce)', () => {
      gsap.set('.training-tab.active', { scale: 1 });
    });

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo(
        '.training-tab.active',
        { scale: 0.92 },
        { scale: 1, duration: 0.3, ease: 'back.out(1.7)' }
      );
    });

    return () => mm.revert();
  }, { scope: containerRef, dependencies: [selectedDay] });

  const dayIcons: Record<string, string> = {
    'back-biceps': '🟦',
    'chest-triceps': '🟥',
    'legs-core': '🟩',
  };

  return (
    <div ref={containerRef} className="h-12 px-6 flex items-center gap-2 border-b border-slate-700 bg-slate-800/30">
      {trainingDays.map((day) => (
        <button
          key={day.id}
          type="button"
          onClick={() => setSelectedDay(day.id)}
          className={`training-tab px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedDay === day.id
              ? 'active bg-slate-700 text-white shadow-lg'
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
