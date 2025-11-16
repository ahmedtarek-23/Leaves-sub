import { IsString, IsArray, IsNumber, IsMongoId, IsOptional, IsEnum } from 'class-validator';

export class CreateJobRequisitionDto {
  @IsString()
  jobTitle: string;

  @IsMongoId()
  departmentId: string;

  @IsMongoId()
  positionId: string;

  @IsString()
  location: string;

  @IsNumber()
  openings: number;

  @IsArray()
  @IsString({ each: true })
  qualifications: string[];

  @IsArray()
  @IsString({ each: true })
  skillsRequired: string[];

  @IsMongoId()
  @IsOptional()
  hiringManagerId?: string;

  @IsMongoId()
  createdBy: string; // HR employee ID
}