import { IsArray, IsIn, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { CurrentStateData } from '../onboarding-types';

export class CurrentStateDataDto implements CurrentStateData {
  @IsIn(['beginner', 'intermediate', 'advanced'])
  trainingExperience!: 'beginner' | 'intermediate' | 'advanced';

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(14)
  trainingFrequencyPerWeek?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(50000)
  averageStepsPerDay?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(24)
  sleepHoursPerNight?: number;

  @IsOptional()
  @IsIn([1, 2, 3, 4, 5])
  stressLevel?: 1 | 2 | 3 | 4 | 5;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  injuries?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  medicalConditions?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  medications?: string[];

  @IsOptional()
  @IsString()
  dietHistoryNotes?: string;

  @IsOptional()
  @IsString()
  mentalBlockers?: string;
}

export class UpdateCurrentStateDto {
  currentStateData!: CurrentStateDataDto;
}
