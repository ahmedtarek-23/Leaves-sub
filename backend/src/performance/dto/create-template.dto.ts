import { IsString, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CriterionDto {
  @IsString()
  criterion: string;

  @IsNumber()
  maxScore: number;
}

export class CreateTemplateDto {
  @IsString()
  name: string;

  @IsString()
  department: string;

  @IsString()
  appraisalType: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CriterionDto)
  criteria: CriterionDto[];
}
