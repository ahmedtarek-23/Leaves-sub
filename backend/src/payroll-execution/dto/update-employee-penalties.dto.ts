import { IsArray, IsMongoId, IsOptional, IsString, IsNumber, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';


class PenaltyDto {
    @IsString()
    reason: string;

    @IsNumber()
    @Min(0)
    amount: number;
}

export class UpdateEmployeePenaltiesDto {
    @IsOptional()
    @IsMongoId()
    employeeId?: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PenaltyDto)
    penalties?: PenaltyDto[];
}

// @ValidateNested({ each: true }) tells class-validator to validate each item
// in the array as a nested object using the rules defined in the PenaltyDto class.
// Without this, class-validator would not check the properties of objects inside the array.

