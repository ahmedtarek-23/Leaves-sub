import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ProcessingExecutionService } from './processing-execution.service';

@Controller('payroll-execution')
export class ProcessingExecutionController {
  constructor(private readonly executionService: ProcessingExecutionService) {}

  @Post('run')
  async runPayroll(@Body() runConfig: any) {
    try {
      const result = await this.executionService.simulatePayrollRun(runConfig);
      return {
        statusCode: HttpStatus.OK,
        message: 'Payroll run simulated.',
        data: result,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('records/:employeeId')
  async getEmployeePayRecord(@Param('employeeId') employeeId: string) {
    const record = await this.executionService.getEmployeePayRecord(employeeId);
    if (!record) {
      throw new HttpException(
        `Pay record for employee '${employeeId}' not found.`,
        HttpStatus.NOT_FOUND,
      );
    }
    return {
      statusCode: HttpStatus.OK,
      message: 'Pay record retrieved.',
      data: record,
    };
  }

  @Get('employees')
  async getDummyEmployees() {
    const employees = await this.executionService.getDummyEmployees();
    return {
      statusCode: HttpStatus.OK,
      data: employees,
    };
  }
}
