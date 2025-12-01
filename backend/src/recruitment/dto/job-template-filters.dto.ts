import { IsOptional, IsString } from 'class-validator';

export class JobTemplateFiltersDto {
  @IsString()
  @IsOptional()
  department?: string;

  @IsString()
  @IsOptional()
  title?: string;
}