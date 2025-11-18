import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsEnum,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

// Correct imports using the validated alias
import { IPayStructure } from '../../../shared/types/payroll/pay-structure.interface';
import { IPayComponent } from '../../../shared/types/payroll/payroll-utils.interface';

// Helper DTO for embedded IPayComponent
class PayComponentDto implements IPayComponent {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsEnum(['FIXED', 'PERCENTAGE', 'FORMULA'])
  type: 'FIXED' | 'PERCENTAGE' | 'FORMULA';

  @IsNumber()
  value: number;

  @IsNotEmpty()
  taxable: boolean;

  @IsNotEmpty()
  isGrossAddition: boolean;
}

/**
 * DTO for creating a new IPayStructure (Pay Grade).
 * Status is defaulted to 'DRAFT' upon creation.
 */
export class CreatePayStructureDto implements IPayStructure {
  @IsString()
  @IsNotEmpty()
  payGradeId: string;

  @IsString()
  @IsNotEmpty()
  gradeName: string;

  @IsNumber()
  @IsNotEmpty()
  grossSalary: number;

  @IsEnum(['FULL_TIME', 'PART_TIME', 'CONTRACTOR'])
  @IsNotEmpty()
  contractType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACTOR';

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PayComponentDto)
  allowances: PayComponentDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PayComponentDto)
  deductions: PayComponentDto[];

  // Note: These fields are usually set by the system based on the authenticated user and approval flow
  configuredByUserId: string;
  approvedDate: Date;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'ARCHIVED';
  lastApprovedByUserId: string;

  // External dependency fields
  @IsArray()
  validForDepartments: { departmentId: string; departmentCode: string }[];

  @IsArray()
  associatedPositions: string[];
}
