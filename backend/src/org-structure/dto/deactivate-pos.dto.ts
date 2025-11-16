import { IsNotEmpty, IsString } from 'class-validator';

export class DeactivatePositionDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  effectiveDate: string; // for historical tracking
}
