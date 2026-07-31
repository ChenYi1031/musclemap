export interface Muscle {
  id: string;
  name: string;
  nameEn: string;
  region: 'chest' | 'back' | 'shoulder' | 'arm' | 'core' | 'leg';
  meshId: string;
  description: string;
  defaultColor: string;
}

export interface Exercise {
  id: string;
  name: string;
  category: 'back-biceps' | 'chest-triceps' | 'legs-core';
  icon: string;
  muscles: {
    primary: string[];
    secondary: string[];
    stabilizer: string[];
  };
  tips: string[];
  mistakes: string[];
}

export interface TrainingDay {
  id: 'back-biceps' | 'chest-triceps' | 'legs-core';
  name: string;
  color: string;
  exercises: string[];
}

export type HighlightLevel = 'primary' | 'secondary' | 'stabilizer' | 'none';

export interface MuscleHighlight {
  muscleId: string;
  level: HighlightLevel;
}

export type ViewMode = 'front' | 'back';
