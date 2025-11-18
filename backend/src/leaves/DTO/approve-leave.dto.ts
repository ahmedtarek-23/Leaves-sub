import { IsString, IsNotEmpty } from 'class-validator';

export class ApproveLeaveDto {
  @IsString()
  @IsNotEmpty()
  leaveId: string;

  @IsString()
  @IsNotEmpty()
  approverId: string;

  @IsString()
  @IsNotEmpty()
  status: 'Approved' | 'Rejected';

  @IsString()
  @IsOptional()
  comment?: string;
}

function IsOptional(): (
  target: ApproveLeaveDto,
  propertyKey: 'comment',
) => void {
  throw new Error('Function not implemented.');
}
