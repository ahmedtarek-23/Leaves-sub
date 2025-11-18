import {
  Controller,
  Post,
  Body,
  Put,
  Param,
  Get,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ConfigurationPolicyService } from './configuration-policy.service';
import { CreatePayStructureDto } from './dto/create-pay-structure.dto';
import { UpdatePayrollPolicyDto } from './dto/update-payroll-policy.dto';
// Assuming a placeholder UserGuard and User decorator for demonstration
// import { AuthGuard } from '@nestjs/passport';
// import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('payroll-config')
// @UseGuards(AuthGuard('jwt')) // All routes require authentication
export class ConfigurationPolicyController {
  constructor(private readonly configService: ConfigurationPolicyService) {}

  // =========================================================================
  // PAY GRADE / PAY STRUCTURE ROUTES (REQ-PY-2)
  // =========================================================================

  /**
   * REQ-PY-2: Creates a new Pay Grade (Salary Band) configuration. Status starts as DRAFT.
   * @param createPayStructureDto The data for the new pay grade.
   */
  @Post('pay-grades')
  async createPayGrade(
    @Body() createPayStructureDto: CreatePayStructureDto,
    // @GetUser('userId') userId: string // Assuming authentication provides the user ID
  ) {
    // Mock user ID for Milestone 1 since auth is not implemented yet
    const userId = 'payroll_specialist_mock_id';
    try {
      const payGrade = await this.configService.createPayStructure(
        createPayStructureDto,
        userId,
      );
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Pay Grade created successfully and set to DRAFT status.',
        data: payGrade,
      };
    } catch (error) {
      // Check for unique index error (e.g., duplicate payGradeId)
      if (error.code === 11000) {
        throw new HttpException(
          'PayGradeId already exists.',
          HttpStatus.CONFLICT,
        );
      }
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // =========================================================================
  // PAYROLL POLICY ROUTES (REQ-PY-1, REQ-PY-10)
  // =========================================================================

  /**
   * REQ-PY-1, REQ-PY-10: Updates the core policy configuration (Tax, Insurance, Penalties).
   * Status is reset to DRAFT upon any modification for re-approval.
   */
  @Put('policies')
  async updatePolicy(
    @Body() updatePolicyDto: UpdatePayrollPolicyDto,
    // @GetUser('userId') userId: string
  ) {
    const userId = 'legal_admin_mock_id';
    try {
      const updatedPolicy = await this.configService.updateOrCreatePolicy(
        updatePolicyDto,
        userId,
      );
      return {
        statusCode: HttpStatus.OK,
        message:
          'Policy updated successfully. Status reset to DRAFT, awaiting approval.',
        data: updatedPolicy,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Gets the current draft or approved policy version.
   */
  @Get('policies/latest')
  async getLatestPolicy() {
    // In a real scenario, this would check the status
    const policy = await this.configService.updateOrCreatePolicy(
      { policyCode: 'DEFAULT_GLOBAL' },
      'system_check',
    );
    return {
      statusCode: HttpStatus.OK,
      data: policy,
    };
  }

  // --- MOCK INTEGRATION ENDPOINTS (Milestone 1 Testing) ---

  /**
   * Endpoint for internal testing to see the output for the Payroll Processing subsystem.
   */
  @Get('pay-grades/:id/approved')
  async getApprovedPayGradeForCalc(@Param('id') payGradeId: string) {
    const payGrade =
      await this.configService.getApprovedPayStructure(payGradeId);
    if (!payGrade) {
      throw new HttpException(
        `Approved Pay Grade ID ${payGradeId} not found.`,
        HttpStatus.NOT_FOUND,
      );
    }
    return {
      statusCode: HttpStatus.OK,
      message: 'Approved Pay Grade retrieved for calculation.',
      data: payGrade,
    };
  }
}
