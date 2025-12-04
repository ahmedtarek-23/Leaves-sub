import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateJobTemplateDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  department: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayNotEmpty()
  qualifications: string[];

  @IsArray()
  @IsString({ each: true })
  @ArrayNotEmpty()
  skills: string[];

  @IsString()
  @IsOptional()
  description?: string;
}