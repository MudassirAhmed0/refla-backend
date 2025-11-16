import { IsInt, IsOptional, IsString, IsDateString, Min, Max } from 'class-validator';

export class CreateCheckinDto {
  @IsOptional()
  @IsDateString()
  date?: string; // ISO string, e.g. "2025-11-15" or full datetime

  @IsInt()
  @Min(1)
  @Max(5)
  energy!: number;

  @IsInt()
  @Min(1)
  @Max(5)
  mood!: number;

  @IsInt()
  @Min(1)
  @Max(5)
  sleepQuality!: number;

  @IsInt()
  @Min(0)
  @Max(100)
  adherence!: number;

  @IsOptional()
  @IsString()
  note?: string;
}
