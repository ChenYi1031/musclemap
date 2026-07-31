import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { useStore } from '../store/useStore';
import { exercises } from '../data/exercises';
import { ExerciseCard } from './ExerciseCard';

gsap.registerPlugin(useGSAP);

export function ExerciseList() {
  const { selectedDay, selectedExercises, selectAllExercises, clearExercises } = useStore();
  const containerRef = useRef<HTMLDivElement>(null);

  // Stagger entrance when the training day changes
  useGSAP(() => {
    if (!containerRef.current) return;
    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: reduce)', () => {
      gsap.set('.exercise-card', { y: 0, autoAlpha: 1 });
    });

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo(
        '.exercise-card',
        { y: 20, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.35, stagger: 0.06, ease: 'power2.out' }
      );
    });

    return () => mm.revert();
  }, { scope: containerRef, dependencies: [selectedDay] });

  const dayExercises = exercises.filter(e => e.category === selectedDay);
  const allSelected = dayExercises.every(e => selectedExercises.includes(e.id));

  return (
    <div ref={containerRef} className="space-y-3">
      <div className="flex gap-2 mb-4">
        <button
          type="button"
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
          type="button"
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
