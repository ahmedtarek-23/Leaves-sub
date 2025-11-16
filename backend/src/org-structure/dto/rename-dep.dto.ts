import { IsNotEmpty, IsString } from 'class-validator';

export class RenameDepartmentDto {
  @IsString()
  @IsNotEmpty()
  newName: string;
}
