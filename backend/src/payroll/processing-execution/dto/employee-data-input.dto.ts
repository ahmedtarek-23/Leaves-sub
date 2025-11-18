import {
  IsString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
} from 'class-validator';

enum ContractType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  INTERN = 'INTERN',
}

enum EmployeeStatus {
  ACTIVE = 'ACTIVE',
  ON_LEAVE = 'ON_LEAVE',
  TERMINATED = 'TERMINATED',
}

export class EmployeeDataInputDto {
  @IsString()
  @IsNotEmpty()
  employeeId: string; // The plain string ID of the employee

  @IsEnum(ContractType)
  contractType: ContractType;

  @IsEnum(EmployeeStatus)
  status: EmployeeStatus;

  @IsString()
  @IsNotEmpty()
  departmentId: string;

  @IsNumber()
  baseSalary: number; // Assuming this comes from Team 1
}
