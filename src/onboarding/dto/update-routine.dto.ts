import { IsIn, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { RoutineData } from '../onboarding-types';

export class RoutineDataDto implements RoutineData {
  @IsOptional()
  @IsString()
  wakeTime?: string; // "06:30"

  @IsOptional()
  @IsString()
  sleepTime?: string; // "23:30"

  @IsOptional()
  @IsString()
  workSchedule?: string;

  @IsOptional()
  @IsString()
  typicalTrainingTimes?: string; // keep simple for now: ["morning", "evening"], "variable"

  @IsOptional()
  @IsString()
  mealPattern?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(600)
  commuteMinutesPerDay?: number;

  @IsOptional()
  @IsIn(['rare', 'sometimes', 'frequent'])
  travelFrequency?: 'rare' | 'sometimes' | 'frequent';

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateRoutineDto {
  routineData!: RoutineDataDto;
}
