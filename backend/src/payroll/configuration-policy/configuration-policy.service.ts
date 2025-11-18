import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';

// Schema
import {
  PayrollPolicy,
  PayrollPolicyDocument,
} from './schema/payroll-pollicy.schema';
import {
  PayStructure,
  PayStructureDocument,
} from './schema/pay-structure.schema';
// DTOs
import { CreatePayStructureDto } from './dto/create-pay-structure.dto';
import { UpdatePayrollPolicyDto } from './dto/update-payroll-policy.dto';
// Interfaces for External Dependency Mocks - Correct imports using the validated alias @shared-types/
import { IEmployeeBasic } from '../../shared/types/payroll/external-deps.interface';

@Injectable()
export class ConfigurationPolicyService {
  private readonly logger = new Logger(ConfigurationPolicyService.name);
  private employeeLinkData: IEmployeeBasic[] = [];

  constructor(
    // Inject Mongoose Models
    @InjectModel(PayrollPolicy.name)
    private payrollPolicyModel: Model<PayrollPolicyDocument>,
    @InjectModel(PayStructure.name)
    private payStructureModel: Model<PayStructureDocument>,
  ) {
    // --- Milestone 1: Integration Foundation Setup ---
    this.loadDummyData();
  }

  /**
   * Milestone 1 requirement: Load dummy data to simulate external system integration.
   */
  private loadDummyData(): void {
    try {
      // Find the path to the dummy data
      const dataPath = path.join(
        __dirname,
        'dummy-data',
        'employee-link-data.json',
      );
      const rawData = fs.readFileSync(dataPath, 'utf-8');
      this.employeeLinkData = JSON.parse(rawData);
      this.logger.log(
        `Successfully loaded ${this.employeeLinkData.length} employee links for integration testing.`,
      );

      // Load initial pay grades (to ensure some exist on startup)
      const initialPayGradesPath = path.join(
        __dirname,
        'dummy-data',
        'initial-pay-grades.json',
      );
      const initialPayGradesRaw = fs.readFileSync(
        initialPayGradesPath,
        'utf-8',
      );
      const initialPayGrades = JSON.parse(
        initialPayGradesRaw,
      ) as CreatePayStructureDto[];

      // Insert initial pay grades if the collection is empty
      this.payStructureModel.countDocuments().then((count) => {
        if (count === 0) {
          this.payStructureModel
            .insertMany(initialPayGrades)
            .then(() =>
              this.logger.log(
                `Initialized ${initialPayGrades.length} Pay Structures (Pay Grades).`,
              ),
            );
        }
      });
    } catch (error) {
      this.logger.error(
        'Failed to load dummy integration data. Ensure dummy-data folder exists in the compiled path.',
        error.stack,
      );
    }
  }

  // --------------------------------------------------------------------------------
  // --- CORE CONFIGURATION LOGIC (CRUD) ---
  // --------------------------------------------------------------------------------

  /**
   * Implements REQ-PY-2: Create a new Pay Grade/Salary Structure (Status: DRAFT).
   * @param createPayStructureDto Data for the new Pay Grade.
   */
  async createPayStructure(
    createPayStructureDto: CreatePayStructureDto,
    userId: string,
  ): Promise<PayStructureDocument> {
    const newPayStructure = new this.payStructureModel({
      ...createPayStructureDto,
      configuredByUserId: userId,
      status: 'DRAFT', // All new configs start as DRAFT
    });
    return newPayStructure.save();
  }

  /**
   * Implements REQ-PY-1: Create or Update the main Payroll Policy (Status: DRAFT).
   * Note: This is simplified. In reality, it updates the single active policy or creates a new version.
   * @param updatePayrollPolicyDto Policy data.
   */
  async updateOrCreatePolicy(
    updatePayrollPolicyDto: UpdatePayrollPolicyDto,
    userId: string,
  ): Promise<PayrollPolicyDocument> {
    // Find the latest active policy version or create a new one
    const policyCode = updatePayrollPolicyDto.policyCode || 'DEFAULT_GLOBAL';

    // In a real system, this would handle version control and archiving the previous approved one.
    const updatedPolicy = await this.payrollPolicyModel.findOneAndUpdate(
      { policyCode: policyCode },
      {
        ...updatePayrollPolicyDto,
        configuredByUserId: userId,
        status: 'DRAFT', // Re-setting to DRAFT for approval workflow
      },
      { new: true, upsert: true }, // Creates if not found
    );
    return updatedPolicy;
  }

  // --------------------------------------------------------------------------------
  // --- INTEGRATION MOCK FUNCTIONS (Milestone 1) ---
  // --------------------------------------------------------------------------------

  /**
   * Simulates a call from the Payroll Processing Subsystem to retrieve the approved Pay Structure.
   * This is a crucial output for your subsystem.
   */
  async getApprovedPayStructure(
    payGradeId: string,
  ): Promise<PayStructureDocument | null> {
    // REQ-PY-2 / BR 10: Retrieve the approved pay structure needed for calculation.
    const payStructure = await this.payStructureModel
      .findOne({ payGradeId, status: 'APPROVED' })
      .exec();
    if (!payStructure) {
      this.logger.warn(
        `No APPROVED pay structure found for Pay Grade ID: ${payGradeId}`,
      );
    }
    return payStructure;
  }

  /**
   * Simulates a call to the Employee Profile subsystem to retrieve employee pay grade linkage.
   */
  getEmployeePayGradeLink(employeeId: string): IEmployeeBasic | null {
    // Simulates checking the central Employee Profile data to find the employee's assigned pay grade.
    const employeeData = this.employeeLinkData.find(
      (e) => e.employeeId === employeeId,
    );
    if (!employeeData) {
      this.logger.warn(`Employee ID ${employeeId} not found in mock data.`);
    }
    return employeeData || null;
  }

  /**
   * Simulates the final output for the Payroll Processing Subsystem.
   */
  async getApprovedPolicies(): Promise<PayrollPolicyDocument | null> {
    // Simulates retrieving the currently APPROVED policy configuration (tax, insurance, penalties)
    const approvedPolicy = await this.payrollPolicyModel
      .findOne({ status: 'APPROVED' })
      .exec();
    if (!approvedPolicy) {
      this.logger.error(
        'CRITICAL: No APPROVED Payroll Policy exists in the system!',
      );
    }
    return approvedPolicy;
  }

  // Add other necessary CRUD methods (view, list, delete, approval workflow stages) for Milestone 2...
}
