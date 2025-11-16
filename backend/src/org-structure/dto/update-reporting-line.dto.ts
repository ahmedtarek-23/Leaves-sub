import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateReportingLineDto {
  @IsString()
  @IsNotEmpty()
  positionId: string;

  @IsString()
  @IsNotEmpty()
  newManagerId: string;
}
