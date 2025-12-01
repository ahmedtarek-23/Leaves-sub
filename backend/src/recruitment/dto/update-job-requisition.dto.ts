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

export class UpdateJobRequisitionDto {
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
  @IsOptional()
  openings?: number;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  location?: string;

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
  @IsOptional()
  hiringManagerId?: string;

  @IsDateString()
  @IsOptional()
  postingDate?: Date;

  @IsDateString()
  @IsOptional()
  expiryDate?: Date;
}