export class FlagLeaveDto {
  flaggedBy: string;
  reason: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}
