import { IsMongoId, IsOptional, IsString } from 'class-validator';

export class AssignVacationPackageDto {
  @IsMongoId()
  packageId: string;

  @IsMongoId()
  employeeId: string;

  @IsOptional()
  @IsString()
  assignedBy?: string;
}
