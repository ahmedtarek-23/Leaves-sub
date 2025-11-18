import { PartialType } from '@nestjs/mapped-types';
import { CreateShiftDto } from './create-shift.dto';

export class UpdateShiftDto extends PartialType(CreateShiftDto) {
  readonly name?: string;
  readonly code?: string;
  readonly startTime?: string;
  readonly endTime?: string;
  readonly breaks?: string;
  readonly rotationPattern?: string;
  readonly isActive?: boolean;
}
