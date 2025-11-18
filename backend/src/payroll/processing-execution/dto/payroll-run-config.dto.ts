import { IsString, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class PayItemDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsNumber()
  rateOrAmount: number;
}

export class PayrollRunConfigDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PayItemDto)
  taxBrackets: PayItemDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PayItemDto)
  insuranceBrackets: PayItemDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PayItemDto)
  allowances: PayItemDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PayItemDto)
  deductionPolicies: PayItemDto[];
}
