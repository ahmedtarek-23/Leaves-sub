import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateLeaveCategoryDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}
