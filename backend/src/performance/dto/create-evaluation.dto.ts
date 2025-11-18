import {
  IsNumber,
  IsString,
  IsArray,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class RatingDto {
  @IsString()
  criterion: string;

  @IsNumber()
  score: number;
}

export class CreateEvaluationDto {
  @IsNumber()
  employeeId: number;

  @IsNumber()
  managerId: number;

  @IsString()
  templateId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RatingDto)
  ratings: RatingDto[];

  @IsString()
  @IsOptional()
  comments?: string;
}
