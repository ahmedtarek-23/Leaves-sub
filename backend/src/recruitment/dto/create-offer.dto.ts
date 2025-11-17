import { IsMongoId, IsNumber, IsString, IsDateString, IsOptional, IsEnum } from 'class-validator';

export class CreateOfferDto {
  @IsMongoId()
  applicationId: string;

  @IsString()
  positionTitle: string;

  @IsMongoId()
  departmentId: string;

  @IsNumber()
  salary: number;

  @IsString()
  @IsOptional()
  benefits?: string;

  @IsDateString()
  startDate: string;

  @IsMongoId()
  approvedBy: string; // HR Manager ID
}