import {
    IsInt,
    IsOptional,
    IsNumber,
    IsString,
    Min,
    Max,
  } from 'class-validator';
  
  export class UpdateProfileDto {
    @IsOptional()
    @IsInt()
    @Min(10)
    @Max(120)
    age?: number;
  
    @IsOptional()
    @IsString()
    sex?: string; // "male" | "female" | "other" — flexible for now
  
    @IsOptional()
    @IsNumber()
    height?: number; // cm
  
    @IsOptional()
    @IsNumber()
    weight?: number; // kg
  
    @IsOptional()
    @IsString()
    activityLevel?: string; // sedentary, light, moderate, high
  
    @IsOptional()
    @IsString()
    dietaryPreferences?: string;
  
    @IsOptional()
    @IsString()
    constraints?: string;
  }
  