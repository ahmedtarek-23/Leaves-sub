import {
  IsArray,
  IsDateString,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateJobRequisitionDto {
  @IsString()
  @IsNotEmpty()
  requisitionId: string;

  @IsMongoId()
  @IsOptional()
  templateId?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  title?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  department?: string;

  @IsNumber()
  @Min(1)
  openings: number;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  qualifications?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  skills?: string[];

  @IsString()
  @IsOptional()
  description?: string;

  @IsMongoId()
  hiringManagerId: string;

  @IsDateString()
  @IsOptional()
  postingDate?: Date;

  @IsDateString()
  @IsOptional()
  expiryDate?: Date;
}