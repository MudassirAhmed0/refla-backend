import { IsArray, IsIn, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { GoalData, GoalType } from '../onboarding-types';

export class GoalDataDto implements GoalData {
  @IsIn(['fat_loss', 'muscle_gain', 'performance', 'recomp', 'health'])
  primaryGoal!: GoalType;

  @IsOptional()
  @IsNumber()
  targetWeightKg?: number;

  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(60)
  targetBodyFatPercent?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(104)
  timelineWeeks?: number;

  @IsOptional()
  @IsString()
  mainWhy?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  priorityAreas?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hardConstraints?: string[];
}

export class UpdateGoalDataDto {
  goalData!: GoalDataDto;
}
