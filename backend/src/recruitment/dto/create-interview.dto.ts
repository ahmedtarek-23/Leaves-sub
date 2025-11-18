import {
  IsMongoId,
  IsDateString,
  IsEnum,
  IsArray,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateInterviewDto {
  @IsMongoId()
  applicationId: string;

  @IsDateString()
  interviewDate: string;

  @IsEnum(['IN_PERSON', 'VIDEO', 'PHONE'])
  interviewType: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsArray()
  @IsMongoId({ each: true })
  panelMembers: string[];

  @IsMongoId()
  scheduledBy: string;
}
