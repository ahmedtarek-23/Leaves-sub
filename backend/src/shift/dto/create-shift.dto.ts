export class CreateShiftDto {
  readonly name: string;
  readonly code: string;
  readonly startTime: string;
  readonly endTime: string;
  readonly breaks?: string;
  readonly rotationPattern?: string;
}
