import { Test, TestingModule } from '@nestjs/testing';
import { PayrollConfigurationController } from './payroll-configuration.controller';
import { PayrollConfigurationService } from './payroll-configuration.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Types } from 'mongoose';
import { ConfigStatus } from './enums/payroll-configuration-enums';
import { PolicyType } from './enums/payroll-configuration-enums';
import { Request } from 'express';
import { AuthUser } from '../auth/auth-user.interface';

// Mock the entire service
const mockPayrollConfigurationService = {
  // Company Settings
  createSettings: jest.fn(),
  updateSettings: jest.fn(),
  getSettings: jest.fn(),
  
  // Pay Grades
  createPayGrade: jest.fn(),
  updatePayGrade: jest.fn(),
  getPayGrades: jest.fn(),
  changePayGradeStatus: jest.fn(),
  deletePayGrade: jest.fn(),
  
  // Payroll Policies
  createPayrollPolicy: jest.fn(),
  updatePayrollPolicy: jest.fn(),
  getPayrollPolicies: jest.fn(),
  changePayrollPolicyStatus: jest.fn(),
  deletePayrollPolicy: jest.fn(),
  
  // Tax Rules
  createTaxRule: jest.fn(),
  updateTaxRule: jest.fn(),
  approveTaxRule: jest.fn(),
  getTaxRules: jest.fn(),
  deleteTaxRule: jest.fn(),
  
  // Insurance Brackets
  createInsurance: jest.fn(),
  updateInsurance: jest.fn(),
  approveInsurance: jest.fn(),
  getInsuranceBrackets: jest.fn(),
  
  // Allowances
  createAllowance: jest.fn(),
  updateAllowance: jest.fn(),
  approveAllowance: jest.fn(),
  getAllowances: jest.fn(),
  deleteAllowance: jest.fn(),
  
  // Pay Types
  createPayType: jest.fn(),
  updatePayType: jest.fn(),
  getPayTypes: jest.fn(),
  approvePayType: jest.fn(),
  deletePayType: jest.fn(),
  
  // Signing Bonus
  createSigningBonus: jest.fn(),
  updateSigningBonus: jest.fn(),
  getSigningBonuses: jest.fn(),
  approveSigningBonus: jest.fn(),
  deleteSigningBonus: jest.fn(),
  
  // Termination Benefits
  createTerminationBenefit: jest.fn(),
  updateTerminationBenefit: jest.fn(),
  getTerminationBenefits: jest.fn(),
  approveTerminationBenefit: jest.fn(),
  deleteTerminationBenefit: jest.fn(),
};

describe('PayrollConfigurationController', () => {
  let controller: PayrollConfigurationController;
  let service: PayrollConfigurationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PayrollConfigurationController],
      providers: [
        {
          provide: PayrollConfigurationService,
          useValue: mockPayrollConfigurationService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<PayrollConfigurationController>(PayrollConfigurationController);
    service = module.get<PayrollConfigurationService>(PayrollConfigurationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Company Settings', () => {
    it('should create company settings', async () => {
      const createDto = {
        payDate: new Date('2024-12-01'),
        timeZone: 'Africa/Cairo',
        currency: 'EGP',
      };

      const mockSettings = { ...createDto, _id: '123' };
      mockPayrollConfigurationService.createSettings.mockResolvedValue(mockSettings);

      const result = await controller.createSettings(createDto);

      expect(service.createSettings).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockSettings);
    });

    it('should update company settings', async () => {
      const updateDto = {
        payDate: new Date('2024-12-15'),
        timeZone: 'Africa/Cairo',
      };

      const mockSettings = { ...updateDto, _id: '123' };
      mockPayrollConfigurationService.updateSettings.mockResolvedValue(mockSettings);

      const result = await controller.updateSettings(updateDto);

      expect(service.updateSettings).toHaveBeenCalledWith(updateDto);
      expect(result).toEqual(mockSettings);
    });

    it('should get company settings', async () => {
      const mockSettings = {
        _id: '123',
        payDate: new Date('2024-12-01'),
        timeZone: 'Africa/Cairo',
        currency: 'EGP',
      };

      mockPayrollConfigurationService.getSettings.mockResolvedValue(mockSettings);

      const result = await controller.getSettings();

      expect(service.getSettings).toHaveBeenCalled();
      expect(result).toEqual(mockSettings);
    });
  });

  describe('Pay Grades', () => {
    const mockUser: AuthUser = {
      userId: '507f1f77bcf86cd799439011',
      email: 'test@example.com',
      role: 'Payroll Specialist' as any,
    };

    const mockReq = { user: mockUser } as any;

    it('should create pay grade', async () => {
      const createDto = {
        grade: 'Senior Developer',
        baseSalary: 20000,
        grossSalary: 25000,
      };

      const mockPayGrade = { ...createDto, _id: new Types.ObjectId() };
      mockPayrollConfigurationService.createPayGrade.mockResolvedValue(mockPayGrade);

      const result = await controller.createPayGrade(createDto, mockReq);

      expect(service.createPayGrade).toHaveBeenCalledWith(createDto, mockUser);
      expect(result).toEqual(mockPayGrade);
    });

    it('should update pay grade', async () => {
      const updateDto = { grade: 'Updated Grade', baseSalary: 22000 };
      const mockPayGrade = { ...updateDto, _id: new Types.ObjectId() };
      
      mockPayrollConfigurationService.updatePayGrade.mockResolvedValue(mockPayGrade);

      const result = await controller.updatePayGrade('123', updateDto, mockReq);

      expect(service.updatePayGrade).toHaveBeenCalledWith('123', updateDto, mockUser);
      expect(result).toEqual(mockPayGrade);
    });

    it('should get all pay grades', async () => {
      const mockPayGrades = [
        { _id: new Types.ObjectId(), grade: 'Grade 1', baseSalary: 10000 },
        { _id: new Types.ObjectId(), grade: 'Grade 2', baseSalary: 15000 },
      ];

      mockPayrollConfigurationService.getPayGrades.mockResolvedValue(mockPayGrades);

      const result = await controller.getPayGrades();

      expect(service.getPayGrades).toHaveBeenCalled();
      expect(result).toEqual(mockPayGrades);
    });

    it('should change pay grade status', async () => {
      const statusDto = { status: ConfigStatus.APPROVED };
      const mockResult = { _id: new Types.ObjectId(), status: ConfigStatus.APPROVED };
      
      mockPayrollConfigurationService.changePayGradeStatus.mockResolvedValue(mockResult);

      const result = await controller.changePayGradeStatus('123', statusDto, mockReq);

      expect(service.changePayGradeStatus).toHaveBeenCalledWith('123', statusDto, mockUser);
      expect(result).toEqual(mockResult);
    });

    it('should delete pay grade', async () => {
      const mockResult = { message: 'Pay Grade deleted successfully' };
      mockPayrollConfigurationService.deletePayGrade.mockResolvedValue(mockResult);

      const result = await controller.deletePayGrade('123', mockReq);

      expect(service.deletePayGrade).toHaveBeenCalledWith('123', mockUser);
      expect(result).toEqual(mockResult);
    });
  });

  describe('Payroll Policies', () => {
    const mockUser: AuthUser = {
      userId: '507f1f77bcf86cd799439011',
      email: 'test@example.com',
      role: 'Payroll Specialist' as any,
    };

    const mockReq = { user: mockUser } as any;

    it('should create payroll policy', async () => {
      const createDto = {
        policyName: 'Overtime Policy',
        policyType: PolicyType.ALLOWANCE,
        description: 'Overtime calculation policy',
        effectiveDate: new Date('2024-01-01'),
        ruleDefinition: {
          percentage: 50,
          fixedAmount: 0,
          thresholdAmount: 40,
        },
        applicability: 'All Employees' as any,
      };

      const mockPolicy = { ...createDto, _id: new Types.ObjectId() };
      mockPayrollConfigurationService.createPayrollPolicy.mockResolvedValue(mockPolicy);

      const result = await controller.createPayrollPolicy(createDto, mockReq);

      expect(service.createPayrollPolicy).toHaveBeenCalledWith(createDto, mockUser);
      expect(result).toEqual(mockPolicy);
    });

    it('should update payroll policy', async () => {
      const updateDto = { policyName: 'Updated Policy' };
      const mockPolicy = { ...updateDto, _id: new Types.ObjectId() };
      
      mockPayrollConfigurationService.updatePayrollPolicy.mockResolvedValue(mockPolicy);

      const result = await controller.updatePayrollPolicy('123', updateDto, mockReq);

      expect(service.updatePayrollPolicy).toHaveBeenCalledWith('123', updateDto, mockUser);
      expect(result).toEqual(mockPolicy);
    });

    it('should get all payroll policies', async () => {
      const mockPolicies = [
        { _id: new Types.ObjectId(), policyName: 'Policy 1' },
        { _id: new Types.ObjectId(), policyName: 'Policy 2' },
      ];

      mockPayrollConfigurationService.getPayrollPolicies.mockResolvedValue(mockPolicies);

      const result = await controller.getPayrollPolicies();

      expect(service.getPayrollPolicies).toHaveBeenCalled();
      expect(result).toEqual(mockPolicies);
    });

    it('should change payroll policy status', async () => {
      const statusDto = { status: ConfigStatus.APPROVED };
      const mockResult = { _id: new Types.ObjectId(), status: ConfigStatus.APPROVED };
      
      mockPayrollConfigurationService.changePayrollPolicyStatus.mockResolvedValue(mockResult);

      const result = await controller.changePayrollPolicyStatus('123', statusDto, mockReq);

      expect(service.changePayrollPolicyStatus).toHaveBeenCalledWith('123', statusDto, mockUser);
      expect(result).toEqual(mockResult);
    });

    it('should delete payroll policy', async () => {
      const mockResult = { message: 'Payroll Policy deleted successfully' };
      mockPayrollConfigurationService.deletePayrollPolicy.mockResolvedValue(mockResult);

      const result = await controller.deletePayrollPolicy('123', mockReq);

      expect(service.deletePayrollPolicy).toHaveBeenCalledWith('123', mockUser);
      expect(result).toEqual(mockResult);
    });
  });

  describe('Tax Rules', () => {
    const mockUser: AuthUser = {
      userId: '507f1f77bcf86cd799439011',
      email: 'test@example.com',
      role: 'Payroll Specialist' as any,
    };

    const mockReq = { user: mockUser } as any;

    it('should create tax rule', async () => {
      const createDto = {
        name: 'Income Tax',
        description: 'Annual income tax',
        rate: 10,
      };

      const mockTaxRule = { ...createDto, _id: new Types.ObjectId() };
      mockPayrollConfigurationService.createTaxRule.mockResolvedValue(mockTaxRule);

      const result = await controller.createTaxRule(createDto, mockReq);

      expect(service.createTaxRule).toHaveBeenCalledWith(createDto, mockUser);
      expect(result).toEqual(mockTaxRule);
    });

    it('should update tax rule', async () => {
      const updateDto = { name: 'Updated Tax', rate: 15 };
      const mockTaxRule = { ...updateDto, _id: new Types.ObjectId() };
      
      mockPayrollConfigurationService.updateTaxRule.mockResolvedValue(mockTaxRule);

      const result = await controller.updateTaxRule('123', updateDto, mockReq);

      expect(service.updateTaxRule).toHaveBeenCalledWith('123', updateDto, mockUser);
      expect(result).toEqual(mockTaxRule);
    });

    it('should change tax status', async () => {
      const statusDto = { status: ConfigStatus.APPROVED };
      const mockResult = { _id: new Types.ObjectId(), status: ConfigStatus.APPROVED };
      
      mockPayrollConfigurationService.approveTaxRule.mockResolvedValue(mockResult);

      const result = await controller.changeTaxStatus('123', statusDto, mockReq);

      expect(service.approveTaxRule).toHaveBeenCalledWith('123', statusDto, mockUser);
      expect(result).toEqual(mockResult);
    });

    it('should get all tax rules', async () => {
      const mockTaxRules = [
        { _id: new Types.ObjectId(), name: 'Tax 1', rate: 10 },
        { _id: new Types.ObjectId(), name: 'Tax 2', rate: 15 },
      ];

      mockPayrollConfigurationService.getTaxRules.mockResolvedValue(mockTaxRules);

      const result = await controller.getTaxRules();

      expect(service.getTaxRules).toHaveBeenCalled();
      expect(result).toEqual(mockTaxRules);
    });

    it('should delete tax rule', async () => {
      const mockResult = { message: 'Tax Rule deleted successfully' };
      mockPayrollConfigurationService.deleteTaxRule.mockResolvedValue(mockResult);

      const result = await controller.deleteTaxRule('123', mockReq);

      expect(service.deleteTaxRule).toHaveBeenCalledWith('123', mockUser);
      expect(result).toEqual(mockResult);
    });
  });

  describe('Insurance Brackets', () => {
    const mockUser: AuthUser = {
      userId: '507f1f77bcf86cd799439011',
      email: 'test@example.com',
      role: 'Payroll Specialist' as any,
    };

    const mockReq = { user: mockUser } as any;

    it('should create insurance bracket', async () => {
      const createDto = {
        name: 'Social Insurance',
        amount: 500,
        minSalary: 10000,
        maxSalary: 20000,
        employeeRate: 10,
        employerRate: 15,
      };

      const mockInsurance = { ...createDto, _id: new Types.ObjectId() };
      mockPayrollConfigurationService.createInsurance.mockResolvedValue(mockInsurance);

      const result = await controller.createInsurance(createDto, mockReq);

      expect(service.createInsurance).toHaveBeenCalledWith(createDto, mockUser);
      expect(result).toEqual(mockInsurance);
    });

    it('should update insurance bracket', async () => {
      const updateDto = { name: 'Updated Insurance', minSalary: 12000 };
      const mockInsurance = { ...updateDto, _id: new Types.ObjectId() };
      
      mockPayrollConfigurationService.updateInsurance.mockResolvedValue(mockInsurance);

      const result = await controller.updateInsurance('123', updateDto, mockReq);

      expect(service.updateInsurance).toHaveBeenCalledWith('123', updateDto, mockUser);
      expect(result).toEqual(mockInsurance);
    });

    it('should change insurance status', async () => {
      const statusDto = { status: ConfigStatus.APPROVED };
      const mockResult = { _id: new Types.ObjectId(), status: ConfigStatus.APPROVED };
      
      mockPayrollConfigurationService.approveInsurance.mockResolvedValue(mockResult);

      const result = await controller.changeInsuranceStatus('123', statusDto, mockReq);

      expect(service.approveInsurance).toHaveBeenCalledWith('123', statusDto, mockUser);
      expect(result).toEqual(mockResult);
    });

    it('should get all insurance brackets', async () => {
      const mockInsurance = [
        { _id: new Types.ObjectId(), name: 'Insurance 1', minSalary: 10000 },
        { _id: new Types.ObjectId(), name: 'Insurance 2', minSalary: 20000 },
      ];

      mockPayrollConfigurationService.getInsuranceBrackets.mockResolvedValue(mockInsurance);

      const result = await controller.getInsurance();

      expect(service.getInsuranceBrackets).toHaveBeenCalled();
      expect(result).toEqual(mockInsurance);
    });
  });

  describe('Allowances', () => {
    const mockUser: AuthUser = {
      userId: '507f1f77bcf86cd799439011',
      email: 'test@example.com',
      role: 'Payroll Specialist' as any,
    };

    const mockReq = { user: mockUser } as any;

    it('should create allowance', async () => {
      const createDto = {
        name: 'Housing Allowance',
        amount: 5000,
      };

      const mockAllowance = { ...createDto, _id: new Types.ObjectId() };
      mockPayrollConfigurationService.createAllowance.mockResolvedValue(mockAllowance);

      const result = await controller.createAllowance(createDto, mockReq);

      expect(service.createAllowance).toHaveBeenCalledWith(createDto, mockUser);
      expect(result).toEqual(mockAllowance);
    });

    it('should update allowance', async () => {
      const updateDto = { name: 'Transport Allowance', amount: 3000 };
      const mockAllowance = { ...updateDto, _id: new Types.ObjectId() };
      
      mockPayrollConfigurationService.updateAllowance.mockResolvedValue(mockAllowance);

      const result = await controller.updateAllowance('123', updateDto, mockReq);

      expect(service.updateAllowance).toHaveBeenCalledWith('123', updateDto, mockUser);
      expect(result).toEqual(mockAllowance);
    });

    it('should change allowance status', async () => {
      const statusDto = { status: ConfigStatus.APPROVED };
      const mockResult = { _id: new Types.ObjectId(), status: ConfigStatus.APPROVED };
      
      mockPayrollConfigurationService.approveAllowance.mockResolvedValue(mockResult);

      const result = await controller.changeAllowanceStatus('123', statusDto, mockReq);

      expect(service.approveAllowance).toHaveBeenCalledWith('123', statusDto, mockUser);
      expect(result).toEqual(mockResult);
    });

    it('should get all allowances', async () => {
      const mockAllowances = [
        { _id: new Types.ObjectId(), name: 'Housing', amount: 5000 },
        { _id: new Types.ObjectId(), name: 'Transport', amount: 3000 },
      ];

      mockPayrollConfigurationService.getAllowances.mockResolvedValue(mockAllowances);

      const result = await controller.getAllowances();

      expect(service.getAllowances).toHaveBeenCalled();
      expect(result).toEqual(mockAllowances);
    });

    it('should delete allowance', async () => {
      const mockResult = { message: 'Allowance deleted successfully' };
      mockPayrollConfigurationService.deleteAllowance.mockResolvedValue(mockResult);

      const result = await controller.deleteAllowance('123', mockReq);

      expect(service.deleteAllowance).toHaveBeenCalledWith('123', mockUser);
      expect(result).toEqual(mockResult);
    });
  });

  describe('Pay Types', () => {
    const mockUser: AuthUser = {
      userId: '507f1f77bcf86cd799439011',
      email: 'test@example.com',
      role: 'Payroll Specialist' as any,
    };

    const mockReq = { user: mockUser } as any;

    it('should create pay type', async () => {
      const createDto = {
        type: 'Monthly Salary',
        amount: 20000,
      };

      const mockPayType = { ...createDto, _id: new Types.ObjectId() };
      mockPayrollConfigurationService.createPayType.mockResolvedValue(mockPayType);

      const result = await controller.createPayType(createDto, mockReq);

      expect(service.createPayType).toHaveBeenCalledWith(createDto, mockUser);
      expect(result).toEqual(mockPayType);
    });

    it('should update pay type', async () => {
      const updateDto = { type: 'Hourly Wage', amount: 50 };
      const mockPayType = { ...updateDto, _id: new Types.ObjectId() };
      
      mockPayrollConfigurationService.updatePayType.mockResolvedValue(mockPayType);

      const result = await controller.updatePayType('123', updateDto, mockReq);

      expect(service.updatePayType).toHaveBeenCalledWith('123', updateDto, mockUser);
      expect(result).toEqual(mockPayType);
    });

    it('should change pay type status', async () => {
      const statusDto = { status: ConfigStatus.APPROVED };
      const mockResult = { _id: new Types.ObjectId(), status: ConfigStatus.APPROVED };
      
      mockPayrollConfigurationService.approvePayType.mockResolvedValue(mockResult);

      const result = await controller.changePayTypeStatus('123', statusDto, mockReq);

      expect(service.approvePayType).toHaveBeenCalledWith('123', statusDto, mockUser);
      expect(result).toEqual(mockResult);
    });

    it('should get all pay types', async () => {
      const mockPayTypes = [
        { _id: new Types.ObjectId(), type: 'Monthly', amount: 20000 },
        { _id: new Types.ObjectId(), type: 'Hourly', amount: 50 },
      ];

      mockPayrollConfigurationService.getPayTypes.mockResolvedValue(mockPayTypes);

      const result = await controller.getPayTypes();

      expect(service.getPayTypes).toHaveBeenCalled();
      expect(result).toEqual(mockPayTypes);
    });

    it('should delete pay type', async () => {
      const mockResult = { message: 'Pay Type deleted successfully' };
      mockPayrollConfigurationService.deletePayType.mockResolvedValue(mockResult);

      const result = await controller.deletePayType('123', mockReq);

      expect(service.deletePayType).toHaveBeenCalledWith('123', mockUser);
      expect(result).toEqual(mockResult);
    });
  });

  describe('Signing Bonus', () => {
    const mockUser: AuthUser = {
      userId: '507f1f77bcf86cd799439011',
      email: 'test@example.com',
      role: 'Payroll Specialist' as any,
    };

    const mockReq = { user: mockUser } as any;

    it('should create signing bonus', async () => {
      const createDto = {
        positionName: 'Senior Developer',
        amount: 10000,
      };

      const mockBonus = { ...createDto, _id: new Types.ObjectId() };
      mockPayrollConfigurationService.createSigningBonus.mockResolvedValue(mockBonus);

      const result = await controller.createSigningBonus(createDto, mockReq);

      expect(service.createSigningBonus).toHaveBeenCalledWith(createDto, mockUser);
      expect(result).toEqual(mockBonus);
    });

    it('should update signing bonus', async () => {
      const updateDto = { positionName: 'Lead Developer', amount: 15000 };
      const mockBonus = { ...updateDto, _id: new Types.ObjectId() };
      
      mockPayrollConfigurationService.updateSigningBonus.mockResolvedValue(mockBonus);

      const result = await controller.updateSigningBonus('123', updateDto, mockReq);

      expect(service.updateSigningBonus).toHaveBeenCalledWith('123', updateDto, mockUser);
      expect(result).toEqual(mockBonus);
    });

    it('should change signing bonus status', async () => {
      const statusDto = { status: ConfigStatus.APPROVED };
      const mockResult = { _id: new Types.ObjectId(), status: ConfigStatus.APPROVED };
      
      mockPayrollConfigurationService.approveSigningBonus.mockResolvedValue(mockResult);

      const result = await controller.changeBonusStatus('123', statusDto, mockReq);

      expect(service.approveSigningBonus).toHaveBeenCalledWith('123', statusDto, mockUser);
      expect(result).toEqual(mockResult);
    });

    it('should get all signing bonuses', async () => {
      const mockBonuses = [
        { _id: new Types.ObjectId(), positionName: 'Senior Developer', amount: 10000 },
        { _id: new Types.ObjectId(), positionName: 'Lead Developer', amount: 15000 },
      ];

      mockPayrollConfigurationService.getSigningBonuses.mockResolvedValue(mockBonuses);

      const result = await controller.getSigningBonuses();

      expect(service.getSigningBonuses).toHaveBeenCalled();
      expect(result).toEqual(mockBonuses);
    });

    it('should delete signing bonus', async () => {
      const mockResult = { message: 'Signing Bonus deleted successfully' };
      mockPayrollConfigurationService.deleteSigningBonus.mockResolvedValue(mockResult);

      const result = await controller.deleteSigningBonus('123', mockReq);

      expect(service.deleteSigningBonus).toHaveBeenCalledWith('123', mockUser);
      expect(result).toEqual(mockResult);
    });
  });

  describe('Termination Benefits', () => {
    const mockUser: AuthUser = {
      userId: '507f1f77bcf86cd799439011',
      email: 'test@example.com',
      role: 'Payroll Specialist' as any,
    };

    const mockReq = { user: mockUser } as any;

    it('should create termination benefit', async () => {
      const createDto = {
        name: 'End of Service Gratuity',
        amount: 15000,
        terms: 'Payable after 5 years of service',
      };

      const mockTermination = { ...createDto, _id: new Types.ObjectId() };
      mockPayrollConfigurationService.createTerminationBenefit.mockResolvedValue(mockTermination);

      const result = await controller.createTermination(createDto, mockReq);

      expect(service.createTerminationBenefit).toHaveBeenCalledWith(createDto, mockUser);
      expect(result).toEqual(mockTermination);
    });

    it('should update termination benefit', async () => {
      const updateDto = { name: 'Severance Package', amount: 20000 };
      const mockTermination = { ...updateDto, _id: new Types.ObjectId() };
      
      mockPayrollConfigurationService.updateTerminationBenefit.mockResolvedValue(mockTermination);

      const result = await controller.updateTermination('123', updateDto, mockReq);

      expect(service.updateTerminationBenefit).toHaveBeenCalledWith('123', updateDto, mockUser);
      expect(result).toEqual(mockTermination);
    });

    it('should change termination benefit status', async () => {
      const statusDto = { status: ConfigStatus.APPROVED };
      const mockResult = { _id: new Types.ObjectId(), status: ConfigStatus.APPROVED };
      
      mockPayrollConfigurationService.approveTerminationBenefit.mockResolvedValue(mockResult);

      const result = await controller.changeTermStatus('123', statusDto, mockReq);

      expect(service.approveTerminationBenefit).toHaveBeenCalledWith('123', statusDto, mockUser);
      expect(result).toEqual(mockResult);
    });

    it('should get all termination benefits', async () => {
      const mockBenefits = [
        { _id: new Types.ObjectId(), name: 'End of Service Gratuity', amount: 15000 },
        { _id: new Types.ObjectId(), name: 'Severance Package', amount: 20000 },
      ];

      mockPayrollConfigurationService.getTerminationBenefits.mockResolvedValue(mockBenefits);

      const result = await controller.getTerminationBenefits();

      expect(service.getTerminationBenefits).toHaveBeenCalled();
      expect(result).toEqual(mockBenefits);
    });

    it('should delete termination benefit', async () => {
      const mockResult = { message: 'Termination Benefit deleted successfully' };
      mockPayrollConfigurationService.deleteTerminationBenefit.mockResolvedValue(mockResult);

      const result = await controller.deleteTerminationBenefit('123', mockReq);

      expect(service.deleteTerminationBenefit).toHaveBeenCalledWith('123', mockUser);
      expect(result).toEqual(mockResult);
    });
  });

  describe('Error Handling', () => {
    const mockUser: AuthUser = {
      userId: '507f1f77bcf86cd799439011',
      email: 'test@example.com',
      role: 'Payroll Specialist' as any,
    };

    const mockReq = { user: mockUser } as any;

    it('should handle service errors for create pay grade', async () => {
      const createDto = {
        grade: 'Senior Developer',
        baseSalary: 20000,
        grossSalary: 15000, // Invalid: gross < base
      };

      const error = new Error('Gross Salary cannot be less than Base Salary');
      mockPayrollConfigurationService.createPayGrade.mockRejectedValue(error);

      await expect(controller.createPayGrade(createDto, mockReq))
        .rejects.toThrow('Gross Salary cannot be less than Base Salary');
    });

    it('should handle not found errors', async () => {
      const error = new Error('Record not found');
      mockPayrollConfigurationService.updatePayGrade.mockRejectedValue(error);

      await expect(controller.updatePayGrade('invalid-id', {}, mockReq))
        .rejects.toThrow('Record not found');
    });
  });
});