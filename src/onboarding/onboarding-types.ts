export type GoalType = 'fat_loss' | 'muscle_gain' | 'performance' | 'recomp' | 'health';

export interface GoalData {
  primaryGoal: GoalType;
  targetWeightKg?: number;
  targetBodyFatPercent?: number;
  timelineWeeks?: number;
  mainWhy?: string;
  priorityAreas?: string[]; // e.g. ["consistency", "sleep", "nutrition"]
  hardConstraints?: string[]; // e.g. ["no gym access", "knee pain", "no dairy"]
}

export interface CurrentStateData {
  trainingExperience: 'beginner' | 'intermediate' | 'advanced';
  trainingFrequencyPerWeek?: number;
  averageStepsPerDay?: number;
  sleepHoursPerNight?: number;
  stressLevel?: 1 | 2 | 3 | 4 | 5;
  injuries?: string[];
  medicalConditions?: string[];
  medications?: string[];
  dietHistoryNotes?: string;
  mentalBlockers?: string; // "binge eating at night", "low motivation", etc.
}

export interface RoutineData {
  wakeTime?: string; // "06:30"
  sleepTime?: string; // "23:30"
  workSchedule?: string; // "9-5 office", "remote flexible", etc.
  typicalTrainingTimes?: string; // ["morning", "evening"]
  mealPattern?: string; // "3 meals", "2 meals + snacks", etc.
  commuteMinutesPerDay?: number;
  travelFrequency?: 'rare' | 'sometimes' | 'frequent';
  notes?: string;
}
