import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateApplicationStatusDto {
  @IsEnum([
    'SCREENING',
    'SHORTLISTED',
    'INTERVIEW',
    'OFFER',
    'HIRED',
    'REJECTED',
  ])
  stage: string;

  @IsString()
  @IsOptional()
  rejectionReason?: string;
}
