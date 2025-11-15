import { IsOptional, IsDateString } from 'class-validator';

export class GetCheckinsQueryDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
