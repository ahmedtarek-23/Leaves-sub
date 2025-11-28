import { 
    Controller, 
    Get, 
    Post, 
    Put, 
    Body, 
    Param, 
    UsePipes, 
    ValidationPipe,
    Query 
} from '@nestjs/common';
import { LeavesService } from './leaves.service'; 
// Import DTOs for type safety (you will need to create these files)
// import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
// import { CreateLeavePolicyDto } from './dto/create-leave-policy.dto';

@Controller('leaves') // Base route is /leaves
export class LeavesController {
  constructor(private readonly leavesService: LeavesService) {}

  // --- 1. Employee Self-Service & Submission ---

  /**
   * POST /leaves/request
   * Handles submission of a new leave request (REQ-015).
   */
  @Post('request')
  @UsePipes(new ValidationPipe({ transform: true })) // Enables validation and automatic transformation
  async submitRequest(@Body() createRequestDto: any /* Replace 'any' with CreateLeaveRequestDto */) { 
    return this.leavesService.submitRequest(createRequestDto);
  }

  /**
   * GET /leaves/balances/:employeeId
   * Retrieves the current leave balances for an employee (Accrued, Taken, Remaining) (REQ-040).
   */
  @Get('balances/:employeeId')
  async getEmployeeBalance(@Param('employeeId') employeeId: string) { 
    return this.leavesService.getEmployeeBalance(employeeId);
  }

  // --- 2. Approval Workflow ---

  /**
   * PUT /leaves/request/:id/review
   * Handles the multi-level approval chain: Manager (REQ-021) or HR Admin (REQ-025).
   * The logic inside the service determines the next step and final synchronization (REQ-042).
   */
  @Put('request/:id/review')
  async reviewRequest(
    @Param('id') requestId: string, 
    @Body() reviewData: { 
        approverId: string, 
        action: 'APPROVE' | 'REJECT' | 'OVERRIDE', 
        isHR: boolean 
    }
  ) {
    // Service logic handles routing based on 'isHR' and 'action'
    return this.leavesService.processReview(requestId, reviewData);
  }

  // --- 3. HR/System Admin Configuration ---
  
  /**
   * POST /leaves/policies
   * Creates a new standardized leave policy (e.g., Annual, Sick). (REQ-006)
   */
  @Post('policies') 
  async createPolicy(@Body() policyData: any /* Replace 'any' with CreateLeavePolicyDto */) { 
    return this.leavesService.createPolicy(policyData);
  }

  /**
   * PUT /leaves/balances/adjust
   * Allows HR Admin to perform manual adjustments (e.g., for audit findings, bulk updates). (REQ-013)
   */
  @Put('balances/adjust')
  async adjustBalance(@Body() adjustmentData: { employeeId: string, typeCode: string, amount: number, justification: string }) {
    // The service must log this action to maintain a full audit trail (BR 17)
    return this.leavesService.manualAdjustBalance(adjustmentData);
  }

  /**
   * GET /leaves/reports/irregular
   * Managers monitor and flag irregular leave patterns (BR 55).
   */
  @Get('reports/irregular')
  async getIrregularLeaveReport(@Query('managerId') managerId: string) {
    return this.leavesService.getIrregularLeaveReport(managerId);
  }
}