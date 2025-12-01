import { IsMongoId, IsNumber, IsEnum } from 'class-validator';
import { BenefitStatus } from '../enums/payroll-execution-enum';

export class CreateEmployeeTerminationResignationDto {
    @IsMongoId()
    employeeId: string;

    @IsMongoId()
    benefitId: string;

    @IsNumber()
    givenAmount: number;

    @IsMongoId()
    terminationId: string;

    @IsEnum(BenefitStatus)
    status: BenefitStatus;
}
