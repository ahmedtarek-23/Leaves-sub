import { IsMongoId, IsNumber, IsEnum, IsOptional } from 'class-validator';
import { BenefitStatus } from '../enums/payroll-execution-enum';

export class UpdateEmployeeTerminationResignationDto {
    @IsOptional()
    @IsMongoId()
    employeeId?: string;

    @IsOptional()
    @IsMongoId()
    benefitId?: string;

    @IsOptional()
    @IsNumber()
    givenAmount?: number;

    @IsOptional()
    @IsMongoId()
    terminationId?: string;

    @IsOptional()
    @IsEnum(BenefitStatus)
    status?: BenefitStatus;
}
