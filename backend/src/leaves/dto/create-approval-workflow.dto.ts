import {
  IsString,
  IsArray,
  ArrayNotEmpty,
  ValidateNested,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

class WorkflowStepDto {
  @IsString()
  role: string;

  @IsString()
  actionRequired: string;

  @IsOptional()
  @IsNumber()
  timeoutHours?: number;
}

export class CreateApprovalWorkflowDto {
  @IsString()
  name: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => WorkflowStepDto)
  steps: WorkflowStepDto[];
}
