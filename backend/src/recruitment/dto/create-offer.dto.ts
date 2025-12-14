import { ArrayNotEmpty, IsArray, IsDateString, IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApprovalStatus } from '../enums/approval-status.enum';

export class CreateOfferDto {
  @IsMongoId()
  applicationId: string;

  @IsMongoId()
  candidateId: string;

  @IsMongoId()
  @IsOptional()
  hrEmployeeId?: string;

  @IsNumber()
  grossSalary: number;

  @IsNumber()
  @IsOptional()
  signingBonus?: number;

  @IsArray()
  @IsOptional()
  benefits?: string[];

  @IsString()
  @IsOptional()
  conditions?: string;

  @IsString()
  @IsOptional()
  insurances?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  role?: string;

  @IsDateString()
  @IsOptional()
  deadline?: Date;

  @IsArray()
  @IsOptional()
  approvers?: {
    employeeId: string;
    role: string;
    status?: ApprovalStatus;
    comment?: string;
  }[];
}
