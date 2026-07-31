import { create } from 'zustand';
import { ViewMode, MuscleHighlight, Muscle, TrainingDay } from '../types';

type TrainingDayId = TrainingDay['id'];

interface AppState {
  selectedDay: TrainingDayId;
  setSelectedDay: (day: TrainingDayId) => void;

  selectedExercises: string[];
  toggleExercise: (exerciseId: string) => void;
  selectAllExercises: (exerciseIds: string[]) => void;
  clearExercises: () => void;

  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  toggleViewMode: () => void;

  previewMode: boolean;
  setPreviewMode: (enabled: boolean) => void;
  togglePreviewMode: () => void;

  highlights: MuscleHighlight[];
  setHighlights: (highlights: MuscleHighlight[]) => void;

  selectedMuscle: Muscle | null;
  setSelectedMuscle: (muscle: Muscle | null) => void;

  showMuscleInfo: boolean;
  setShowMuscleInfo: (show: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  selectedDay: 'back-biceps',
  setSelectedDay: (day) => set({ selectedDay: day, selectedExercises: [], highlights: [], selectedMuscle: null, showMuscleInfo: false }),

  selectedExercises: [],
  toggleExercise: (exerciseId) => set((state) => ({
    selectedExercises: state.selectedExercises.includes(exerciseId)
      ? state.selectedExercises.filter(id => id !== exerciseId)
      : [...state.selectedExercises, exerciseId],
  })),
  selectAllExercises: (exerciseIds) => set({ selectedExercises: exerciseIds }),
  clearExercises: () => set({ selectedExercises: [], highlights: [], selectedMuscle: null, showMuscleInfo: false }),

  viewMode: 'front',
  setViewMode: (mode) => set({ viewMode: mode }),
  toggleViewMode: () => set((state) => ({ viewMode: state.viewMode === 'front' ? 'back' : 'front' })),

  previewMode: false,
  setPreviewMode: (enabled) => set({ previewMode: enabled }),
  togglePreviewMode: () => set((state) => ({ previewMode: !state.previewMode })),

  highlights: [],
  setHighlights: (highlights) => set({ highlights }),

  selectedMuscle: null,
  setSelectedMuscle: (muscle) => set({ selectedMuscle: muscle, showMuscleInfo: muscle !== null }),

  showMuscleInfo: false,
  setShowMuscleInfo: (show) => set({ showMuscleInfo: show, selectedMuscle: show ? undefined : null }),
}));
