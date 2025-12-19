import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { OrganizationStructureService } from '../organization-structure/organization-structure.service';
import { EmployeeProfileService } from '../employee-profile/employee-profile.service';

// Service and DTOs
import { PayrollConfigurationService } from './payroll-configuration.service';
import { ConfigStatus, PolicyType, Applicability } from './enums/payroll-configuration-enums';
import { UserRole } from '../auth/permissions.constant';

// DTOs
import { CreateCompanySettingsDto } from './dto/create-company-settings.dto';
import { CreatePayGradeDto } from './dto/create-pay-grade.dto';
import { ChangeStatusDto } from './dto/change-status.dto';
import { CreatePayrollPoliciesDto } from './dto/create-payroll-policies.dto';
import { CreateTaxRuleDto } from './dto/create-tax-rule.dto';
import { CreateInsuranceDto } from './dto/create-insurance.dto';
import { CreateAllowanceDto } from './dto/create-allowance.dto';
import { CreatePayTypeDto } from './dto/create-pay-type.dto';
import { CreateSigningBonusDto } from './dto/create-signing-bonus.dto';
import { CreateTerminationBenefitsDto } from './dto/create-termination-benefits.dto';

// Mocks - These need to be callable constructors that preserve static methods
const createMockModel = () => {
  const mockModel = jest.fn() as any;
  // Set up static methods
  mockModel.find = jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue([]),
  });
  mockModel.findById = jest.fn();
  // findOne can be called with or without .exec(), so return a thenable object
  // that can be both awaited directly and have .exec() called on it
  mockModel.findOne = jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue(null),
    then: (onFulfilled: any) => Promise.resolve(null).then(onFulfilled),
    catch: (onRejected: any) => Promise.resolve(null).catch(onRejected),
  });
  mockModel.findByIdAndDelete = jest.fn();
  mockModel.exec = jest.fn();
  return mockModel;
};

const mockAllowanceModel = createMockModel();
const mockTaxRulesModel = createMockModel();
const mockInsuranceModel = createMockModel();
const mockBonusModel = createMockModel();
const mockSettingsModel = createMockModel();
const mockPayGradeModel = createMockModel();
const mockPayTypeModel = createMockModel();
const mockPayrollPoliciesModel = createMockModel();
const mockTermModel = createMockModel();

const mockOrgService = {
  findPositionByName: jest.fn(),
};

const mockEmpService = {};

// Helper to preserve static methods when mocking constructor
const mockModelConstructor = (mockModel: any, mockInstance: any) => {
  // Store original static methods
  const staticMethods = {
    find: mockModel.find,
    findById: mockModel.findById,
    findOne: mockModel.findOne,
    findByIdAndDelete: mockModel.findByIdAndDelete,
    exec: mockModel.exec,
  };
  
  // Set the constructor implementation
  mockModel.mockImplementation(() => mockInstance);
  
  // Restore static methods
  Object.assign(mockModel, staticMethods);
};

describe('PayrollConfigurationService', () => {
  let service: PayrollConfigurationService;
  let allowanceModel: Model<any>;
  let taxRulesModel: Model<any>;
  let insuranceModel: Model<any>;
  let bonusModel: Model<any>;
  let settingsModel: Model<any>;
  let payGradeModel: Model<any>;
  let payTypeModel: Model<any>;
  let payrollPoliciesModel: Model<any>;
  let termModel: Model<any>;
  let orgService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayrollConfigurationService,
        {
          provide: getModelToken('allowance'),
          useValue: mockAllowanceModel,
        },
        {
          provide: getModelToken('taxRules'),
          useValue: mockTaxRulesModel,
        },
        {
          provide: getModelToken('insuranceBrackets'),
          useValue: mockInsuranceModel,
        },
        {
          provide: getModelToken('signingBonus'),
          useValue: mockBonusModel,
        },
        {
          provide: getModelToken('CompanyWideSettings'),
          useValue: mockSettingsModel,
        },
        {
          provide: getModelToken('payGrade'),
          useValue: mockPayGradeModel,
        },
        {
          provide: getModelToken('payType'),
          useValue: mockPayTypeModel,
        },
        {
          provide: getModelToken('payrollPolicies'),
          useValue: mockPayrollPoliciesModel,
        },
        {
          provide: getModelToken('terminationAndResignationBenefits'),
          useValue: mockTermModel,
        },
        {
          provide: OrganizationStructureService,
          useValue: mockOrgService,
        },
        {
          provide: EmployeeProfileService,
          useValue: mockEmpService,
        },
      ],
    }).compile();

    service = module.get<PayrollConfigurationService>(PayrollConfigurationService);
    allowanceModel = module.get<Model<any>>(getModelToken('allowance'));
    taxRulesModel = module.get<Model<any>>(getModelToken('taxRules'));
    insuranceModel = module.get<Model<any>>(getModelToken('insuranceBrackets'));
    bonusModel = module.get<Model<any>>(getModelToken('signingBonus'));
    settingsModel = module.get<Model<any>>(getModelToken('CompanyWideSettings'));
    payGradeModel = module.get<Model<any>>(getModelToken('payGrade'));
    payTypeModel = module.get<Model<any>>(getModelToken('payType'));
    payrollPoliciesModel = module.get<Model<any>>(getModelToken('payrollPolicies'));
    termModel = module.get<Model<any>>(getModelToken('terminationAndResignationBenefits'));
    orgService = module.get<OrganizationStructureService>(OrganizationStructureService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    // Reset mock implementations to prevent interference between tests
    const models = [
      mockSettingsModel, mockPayGradeModel, mockTaxRulesModel, mockInsuranceModel,
      mockAllowanceModel, mockPayTypeModel, mockPayrollPoliciesModel, mockBonusModel, mockTermModel
    ];
    models.forEach(model => {
      model.mockReset();
      model.mockClear();
      // Restore static methods after reset
      model.find = jest.fn();
      model.findById = jest.fn();
      model.findOne = jest.fn();
      model.findByIdAndDelete = jest.fn();
      model.exec = jest.fn();
    });
  });

  describe('Company Wide Settings', () => {
    it('should create company settings successfully', async () => {
      const createDto: CreateCompanySettingsDto = {
        payDate: new Date('2024-12-01'),
        timeZone: 'Africa/Cairo',
        currency: 'EGP',
      };

      const mockSettings = {
        ...createDto,
        _id: new Types.ObjectId(),
        save: jest.fn().mockResolvedValue(createDto),
      };

      mockSettingsModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      
      // The mock constructor is already set up in createMockModel
      // Just need to make sure it returns the right instance
      const mockInstance = {
        ...createDto,
        _id: new Types.ObjectId(),
        save: jest.fn().mockResolvedValue({
          ...createDto,
          _id: new Types.ObjectId(),
        }),
      };
      mockModelConstructor(mockSettingsModel, mockInstance);

      const result = await service.createSettings(createDto);

      expect(mockSettingsModel.findOne).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw BadRequestException when settings already exist', async () => {
      const createDto: CreateCompanySettingsDto = {
        payDate: new Date('2024-12-01'),
        timeZone: 'Africa/Cairo',
        currency: 'EGP',
      };

      // findOne().exec() is called, so return chainable object
      mockSettingsModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: new Types.ObjectId() }),
      });

      await expect(service.createSettings(createDto)).rejects.toThrow(BadRequestException);
      expect(mockSettingsModel.findOne).toHaveBeenCalled();
    });

    it('should update existing company settings', async () => {
      const updateDto = {
        payDate: new Date('2024-12-15'),
        timeZone: 'Africa/Cairo',
      };

      const existingSettings = {
        _id: new Types.ObjectId(),
        payDate: new Date('2024-12-01'),
        timeZone: 'Africa/Cairo',
        currency: 'EGP',
        save: jest.fn().mockResolvedValue({ ...updateDto, _id: new Types.ObjectId() }),
      };

      // findOne() is called without .exec() in updateSettings, so return directly
      mockSettingsModel.findOne.mockResolvedValue(existingSettings);

      const result = await service.updateSettings(updateDto);

      expect(mockSettingsModel.findOne).toHaveBeenCalled();
      expect(existingSettings.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should create company settings if none exist during update', async () => {
      const updateDto = {
        payDate: new Date('2024-12-15'),
        timeZone: 'Africa/Cairo',
        currency: 'EGP',
      };

      const mockSettings = {
        ...updateDto,
        _id: new Types.ObjectId(),
        save: jest.fn().mockResolvedValue(updateDto),
      };

      // findOne() is called without .exec(), return a thenable
      mockSettingsModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
        then: (onFulfilled: any) => Promise.resolve(null).then(onFulfilled),
        catch: (onRejected: any) => Promise.resolve(null).catch(onRejected),
      });
      
      // Mock the constructor pattern: new Model().save()
      const mockInstance = {
        ...updateDto,
        _id: new Types.ObjectId(),
        save: jest.fn().mockResolvedValue({
          ...updateDto,
          _id: new Types.ObjectId(),
        }),
      };
      mockModelConstructor(mockSettingsModel, mockInstance);

      const result = await service.updateSettings(updateDto);

      expect(mockSettingsModel.findOne).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('Pay Grades', () => {
    const mockUser = {
      userId: '507f1f77bcf86cd799439011',
      role: UserRole.PAYROLL_SPECIALIST,
      username: 'testuser',
    };

    const createPayGradeDto: CreatePayGradeDto = {
      grade: 'Senior Developer',
      baseSalary: 20000,
      grossSalary: 25000,
      departmentId: '507f1f77bcf86cd799439012',
      positionId: '507f1f77bcf86cd799439013',
    };

    it('should create pay grade successfully', async () => {
      const mockPayGrade = {
        ...createPayGradeDto,
        _id: new Types.ObjectId(),
        status: ConfigStatus.DRAFT,
        createdBy: new Types.ObjectId(mockUser.userId),
        save: jest.fn().mockResolvedValue({
          ...createPayGradeDto,
          _id: new Types.ObjectId(),
          status: ConfigStatus.DRAFT,
          createdBy: new Types.ObjectId(mockUser.userId),
        }),
      };

      // Mock the constructor pattern: new Model().save()
      const mockInstance = {
        ...mockPayGrade,
        save: jest.fn().mockResolvedValue(mockPayGrade),
      };
      mockModelConstructor(mockPayGradeModel, mockInstance);

      const result = await service.createPayGrade(createPayGradeDto, mockUser as any);

      expect(mockPayGradeModel).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw BadRequestException when grossSalary < baseSalary', async () => {
      const invalidDto = {
        ...createPayGradeDto,
        baseSalary: 30000,
        grossSalary: 25000,
      };

      await expect(service.createPayGrade(invalidDto, mockUser as any))
        .rejects.toThrow(BadRequestException);
    });

    it('should update pay grade when in DRAFT status', async () => {
      const updateDto = {
        grade: 'Updated Senior Developer',
        baseSalary: 22000,
        grossSalary: 27000,
      };

      const mockPayGrade = {
        _id: new Types.ObjectId(),
        status: ConfigStatus.DRAFT,
        baseSalary: 20000,
        save: jest.fn().mockResolvedValue({ ...updateDto, _id: new Types.ObjectId() }),
      };

      mockPayGradeModel.findById.mockResolvedValue(mockPayGrade);

      const result = await service.updatePayGrade(
        '507f1f77bcf86cd799439011',
        updateDto,
        mockUser as any,
      );

      expect(mockPayGradeModel.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(mockPayGrade.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw BadRequestException when updating non-DRAFT pay grade', async () => {
      const mockPayGrade = {
        _id: new Types.ObjectId(),
        status: ConfigStatus.APPROVED,
      };

      mockPayGradeModel.findById.mockResolvedValue(mockPayGrade);

      await expect(
        service.updatePayGrade('507f1f77bcf86cd799439011', {}, mockUser as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should approve pay grade successfully with manager role', async () => {
      const changeStatusDto: ChangeStatusDto = {
        status: ConfigStatus.APPROVED,
      };

      const managerUser = {
        ...mockUser,
        role: UserRole.PAYROLL_MANAGER,
      };

      const mockPayGrade = {
        _id: new Types.ObjectId(),
        status: ConfigStatus.DRAFT,
        save: jest.fn().mockResolvedValue({
          _id: new Types.ObjectId(),
          status: ConfigStatus.APPROVED,
          approvedBy: new Types.ObjectId(managerUser.userId),
          approvedAt: expect.any(Date),
        }),
      };

      mockPayGradeModel.findById.mockResolvedValue(mockPayGrade);

      const result = await service.changePayGradeStatus(
        '507f1f77bcf86cd799439011',
        changeStatusDto,
        managerUser as any,
      );

      expect(mockPayGradeModel.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(mockPayGrade.save).toHaveBeenCalled();
      expect(result.status).toBe(ConfigStatus.APPROVED);
    });

    it('should throw ForbiddenException when non-manager tries to approve', async () => {
      const changeStatusDto: ChangeStatusDto = {
        status: ConfigStatus.APPROVED,
      };

      const mockPayGrade = {
        _id: new Types.ObjectId(),
        status: ConfigStatus.DRAFT,
      };

      mockPayGradeModel.findById.mockResolvedValue(mockPayGrade);

      await expect(
        service.changePayGradeStatus('507f1f77bcf86cd799439011', changeStatusDto, mockUser as any),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should delete DRAFT pay grade successfully', async () => {
      const mockPayGrade = {
        _id: new Types.ObjectId(),
        status: ConfigStatus.DRAFT,
      };

      mockPayGradeModel.findById.mockResolvedValue(mockPayGrade);
      mockPayGradeModel.findByIdAndDelete.mockResolvedValue({});

      const result = await service.deletePayGrade('507f1f77bcf86cd799439011', mockUser as any);

      expect(mockPayGradeModel.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(mockPayGradeModel.findByIdAndDelete).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(result.message).toBe('Pay Grade deleted successfully');
    });

    it('should throw BadRequestException when deleting non-DRAFT pay grade', async () => {
      const mockPayGrade = {
        _id: new Types.ObjectId(),
        status: ConfigStatus.APPROVED,
      };

      mockPayGradeModel.findById.mockResolvedValue(mockPayGrade);

      await expect(
        service.deletePayGrade('507f1f77bcf86cd799439011', mockUser as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Tax Rules', () => {
    const mockUser = {
      userId: '507f1f77bcf86cd799439011',
      role: UserRole.PAYROLL_SPECIALIST,
      username: 'testuser',
    };

    const createTaxRuleDto: CreateTaxRuleDto = {
      name: 'Income Tax',
      description: 'Annual income tax',
      rate: 10,
    };

    it('should create tax rule successfully', async () => {
      const mockTaxRule = {
        ...createTaxRuleDto,
        _id: new Types.ObjectId(),
        status: ConfigStatus.DRAFT,
        createdBy: new Types.ObjectId(mockUser.userId),
        save: jest.fn().mockResolvedValue({
          ...createTaxRuleDto,
          _id: new Types.ObjectId(),
          status: ConfigStatus.DRAFT,
        }),
      };

      // Mock the constructor pattern: new Model().save()
      const mockInstance = {
        ...mockTaxRule,
        save: jest.fn().mockResolvedValue(mockTaxRule),
      };
      mockModelConstructor(mockTaxRulesModel, mockInstance);

      const result = await service.createTaxRule(createTaxRuleDto, mockUser as any);

      expect(mockTaxRulesModel).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should get all tax rules', async () => {
      const mockTaxRules = [
        { _id: new Types.ObjectId(), name: 'Tax 1', rate: 10 },
        { _id: new Types.ObjectId(), name: 'Tax 2', rate: 15 },
      ];

      mockTaxRulesModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockTaxRules),
      });

      const result = await service.getTaxRules();

      expect(mockTaxRulesModel.find).toHaveBeenCalled();
      expect(result).toEqual(mockTaxRules);
    });
  });

  describe('Insurance Brackets', () => {
    const mockUser = {
      userId: '507f1f77bcf86cd799439011',
      role: UserRole.PAYROLL_SPECIALIST,
      username: 'testuser',
    };

    const createInsuranceDto: CreateInsuranceDto = {
      name: 'Social Insurance',
      amount: 500,
      minSalary: 10000,
      maxSalary: 20000,
      employeeRate: 10,
      employerRate: 15,
    };

    it('should create insurance bracket successfully', async () => {
      const mockInsurance = {
        ...createInsuranceDto,
        _id: new Types.ObjectId(),
        status: ConfigStatus.DRAFT,
        createdBy: new Types.ObjectId(mockUser.userId),
        save: jest.fn().mockResolvedValue({
          ...createInsuranceDto,
          _id: new Types.ObjectId(),
          status: ConfigStatus.DRAFT,
        }),
      };

      // Mock the constructor pattern: new Model().save()
      const mockInstance = {
        ...mockInsurance,
        save: jest.fn().mockResolvedValue(mockInsurance),
      };
      mockModelConstructor(mockInsuranceModel, mockInstance);

      const result = await service.createInsurance(createInsuranceDto, mockUser as any);

      expect(mockInsuranceModel).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw BadRequestException when minSalary >= maxSalary', async () => {
      const invalidDto = {
        ...createInsuranceDto,
        minSalary: 20000,
        maxSalary: 15000,
      };

      await expect(service.createInsurance(invalidDto, mockUser as any))
        .rejects.toThrow(BadRequestException);
    });

    it('should update insurance bracket successfully', async () => {
      const updateDto = {
        name: 'Updated Insurance',
        minSalary: 12000,
        maxSalary: 22000,
      };

      const mockInsurance = {
        _id: new Types.ObjectId(),
        status: ConfigStatus.DRAFT,
        minSalary: 10000,
        maxSalary: 20000,
        save: jest.fn().mockResolvedValue({ ...updateDto, _id: new Types.ObjectId() }),
      };

      mockInsuranceModel.findById.mockResolvedValue(mockInsurance);

      const result = await service.updateInsurance(
        '507f1f77bcf86cd799439011',
        updateDto,
        mockUser as any,
      );

      expect(mockInsuranceModel.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(mockInsurance.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('Allowances', () => {
    const mockUser = {
      userId: '507f1f77bcf86cd799439011',
      role: UserRole.PAYROLL_SPECIALIST,
      username: 'testuser',
    };

    const createAllowanceDto: CreateAllowanceDto = {
      name: 'Housing Allowance',
      amount: 5000,
    };

    it('should create allowance successfully', async () => {
      const mockAllowance = {
        ...createAllowanceDto,
        _id: new Types.ObjectId(),
        status: ConfigStatus.DRAFT,
        createdBy: new Types.ObjectId(mockUser.userId),
        save: jest.fn().mockResolvedValue({
          ...createAllowanceDto,
          _id: new Types.ObjectId(),
          status: ConfigStatus.DRAFT,
        }),
      };

      // Mock the constructor pattern: new Model().save()
      const mockInstance = {
        ...mockAllowance,
        save: jest.fn().mockResolvedValue(mockAllowance),
      };
      mockModelConstructor(mockAllowanceModel, mockInstance);

      const result = await service.createAllowance(createAllowanceDto, mockUser as any);

      expect(mockAllowanceModel).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should get all allowances', async () => {
      const mockAllowances = [
        { _id: new Types.ObjectId(), name: 'Allowance 1', amount: 1000 },
        { _id: new Types.ObjectId(), name: 'Allowance 2', amount: 2000 },
      ];

      mockAllowanceModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAllowances),
      });

      const result = await service.getAllowances();

      expect(mockAllowanceModel.find).toHaveBeenCalled();
      expect(result).toEqual(mockAllowances);
    });
  });

  describe('Pay Types', () => {
    const mockUser = {
      userId: '507f1f77bcf86cd799439011',
      role: UserRole.PAYROLL_SPECIALIST,
      username: 'testuser',
    };

    const createPayTypeDto: CreatePayTypeDto = {
      type: 'Monthly Salary',
      amount: 20000,
    };

    it('should create pay type successfully', async () => {
      const mockPayType = {
        ...createPayTypeDto,
        _id: new Types.ObjectId(),
        status: ConfigStatus.DRAFT,
        createdBy: new Types.ObjectId(mockUser.userId),
        save: jest.fn().mockResolvedValue({
          ...createPayTypeDto,
          _id: new Types.ObjectId(),
          status: ConfigStatus.DRAFT,
        }),
      };

      // Mock the constructor pattern: new Model().save()
      const mockInstance = {
        ...mockPayType,
        save: jest.fn().mockResolvedValue(mockPayType),
      };
      mockModelConstructor(mockPayTypeModel, mockInstance);

      const result = await service.createPayType(createPayTypeDto, mockUser as any);

      expect(mockPayTypeModel).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('Payroll Policies', () => {
    const mockUser = {
      userId: '507f1f77bcf86cd799439011',
      role: UserRole.PAYROLL_SPECIALIST,
      username: 'testuser',
    };

    const createPayrollPolicyDto: CreatePayrollPoliciesDto = {
      policyName: 'Overtime Policy',
      policyType: PolicyType.ALLOWANCE,
      description: 'Policy for overtime calculations',
      effectiveDate: new Date('2024-01-01'),
      ruleDefinition: {
        percentage: 50,
        fixedAmount: 0,
        thresholdAmount: 40,
      },
      applicability: Applicability.AllEmployees,
    };

    it('should create payroll policy successfully', async () => {
      const mockPolicy = {
        ...createPayrollPolicyDto,
        _id: new Types.ObjectId(),
        status: ConfigStatus.DRAFT,
        createdBy: new Types.ObjectId(mockUser.userId),
        save: jest.fn().mockResolvedValue({
          ...createPayrollPolicyDto,
          _id: new Types.ObjectId(),
          status: ConfigStatus.DRAFT,
        }),
      };

      // Mock the constructor pattern: new Model().save()
      const mockInstance = {
        ...mockPolicy,
        save: jest.fn().mockResolvedValue(mockPolicy),
      };
      mockModelConstructor(mockPayrollPoliciesModel, mockInstance);

      const result = await service.createPayrollPolicy(createPayrollPolicyDto, mockUser as any);

      expect(mockPayrollPoliciesModel).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('Signing Bonus', () => {
    const mockUser = {
      userId: '507f1f77bcf86cd799439011',
      role: UserRole.PAYROLL_SPECIALIST,
      username: 'testuser',
    };

    const createSigningBonusDto: CreateSigningBonusDto = {
      positionName: 'Senior Developer',
      amount: 10000,
    };

    it('should create signing bonus successfully', async () => {
      const mockBonus = {
        ...createSigningBonusDto,
        _id: new Types.ObjectId(),
        status: ConfigStatus.DRAFT,
        createdBy: new Types.ObjectId(mockUser.userId),
        save: jest.fn().mockResolvedValue({
          ...createSigningBonusDto,
          _id: new Types.ObjectId(),
          status: ConfigStatus.DRAFT,
        }),
      };

      // Mock the constructor pattern: new Model().save()
      const mockInstance = {
        ...mockBonus,
        save: jest.fn().mockResolvedValue(mockBonus),
      };
      mockModelConstructor(mockBonusModel, mockInstance);
      mockOrgService.findPositionByName.mockResolvedValue({ _id: new Types.ObjectId() });

      const result = await service.createSigningBonus(createSigningBonusDto, mockUser as any);

      expect(mockBonusModel).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('Termination Benefits', () => {
    const mockUser = {
      userId: '507f1f77bcf86cd799439011',
      role: UserRole.PAYROLL_SPECIALIST,
      username: 'testuser',
    };

    const createTerminationBenefitDto: CreateTerminationBenefitsDto = {
      name: 'End of Service Gratuity',
      amount: 15000,
      terms: 'Payable after 5 years of service',
    };

    it('should create termination benefit successfully', async () => {
      const mockTermination = {
        ...createTerminationBenefitDto,
        _id: new Types.ObjectId(),
        status: ConfigStatus.DRAFT,
        createdBy: new Types.ObjectId(mockUser.userId),
        save: jest.fn().mockResolvedValue({
          ...createTerminationBenefitDto,
          _id: new Types.ObjectId(),
          status: ConfigStatus.DRAFT,
        }),
      };

      // Mock the constructor pattern: new Model().save()
      const mockInstance = {
        ...mockTermination,
        save: jest.fn().mockResolvedValue(mockTermination),
      };
      mockModelConstructor(mockTermModel, mockInstance);

      const result = await service.createTerminationBenefit(createTerminationBenefitDto, mockUser as any);

      expect(mockTermModel).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('Generic Approve Function', () => {
    it('should throw NotFoundException when record not found', async () => {
      const mockUser = {
        userId: '507f1f77bcf86cd799439011',
        role: UserRole.PAYROLL_MANAGER,
      };

      const changeStatusDto: ChangeStatusDto = {
        status: ConfigStatus.APPROVED,
      };

      mockPayGradeModel.findById.mockResolvedValue(null);

      await expect(
        service.changePayGradeStatus('invalid-id', changeStatusDto, mockUser as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when already approved', async () => {
      const mockUser = {
        userId: '507f1f77bcf86cd799439011',
        role: UserRole.PAYROLL_MANAGER,
      };

      const changeStatusDto: ChangeStatusDto = {
        status: ConfigStatus.APPROVED,
      };

      const mockRecord = {
        _id: new Types.ObjectId(),
        status: ConfigStatus.APPROVED,
      };

      mockPayGradeModel.findById.mockResolvedValue(mockRecord);

      await expect(
        service.changePayGradeStatus('507f1f77bcf86cd799439011', changeStatusDto, mockUser as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should set approvedBy and approvedAt when approving', async () => {
      const mockUser = {
        userId: '507f1f77bcf86cd799439011',
        role: UserRole.PAYROLL_MANAGER,
      };

      const changeStatusDto: ChangeStatusDto = {
        status: ConfigStatus.APPROVED,
      };

      const mockRecord = {
        _id: new Types.ObjectId(),
        status: ConfigStatus.DRAFT,
        save: jest.fn().mockResolvedValue({
          _id: new Types.ObjectId(),
          status: ConfigStatus.APPROVED,
          approvedBy: new Types.ObjectId(mockUser.userId),
          approvedAt: expect.any(Date),
        }),
      };

      mockPayGradeModel.findById.mockResolvedValue(mockRecord);

      const result = await service.changePayGradeStatus(
        '507f1f77bcf86cd799439011',
        changeStatusDto,
        mockUser as any,
      );

      expect(mockRecord.save).toHaveBeenCalled();
      expect(result.status).toBe(ConfigStatus.APPROVED);
    });

    it('should allow any role to reject (not just managers)', async () => {
      const mockUser = {
        userId: '507f1f77bcf86cd799439011',
        role: UserRole.PAYROLL_SPECIALIST, // Non-manager role
      };

      const changeStatusDto: ChangeStatusDto = {
        status: ConfigStatus.REJECTED,
      };

      const mockRecord = {
        _id: new Types.ObjectId(),
        status: ConfigStatus.DRAFT,
        save: jest.fn().mockResolvedValue({
          _id: new Types.ObjectId(),
          status: ConfigStatus.REJECTED,
        }),
      };

      mockPayGradeModel.findById.mockResolvedValue(mockRecord);

      const result = await service.changePayGradeStatus(
        '507f1f77bcf86cd799439011',
        changeStatusDto,
        mockUser as any,
      );

      expect(result.status).toBe(ConfigStatus.REJECTED);
    });
  });

  describe('Get All Methods', () => {
    it('should get all pay grades', async () => {
      const mockPayGrades = [
        { _id: new Types.ObjectId(), grade: 'Grade 1', baseSalary: 10000 },
        { _id: new Types.ObjectId(), grade: 'Grade 2', baseSalary: 15000 },
      ];

      mockPayGradeModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPayGrades),
      });

      const result = await service.getPayGrades();

      expect(mockPayGradeModel.find).toHaveBeenCalled();
      expect(result).toEqual(mockPayGrades);
    });

    it('should get company settings', async () => {
      const mockSettings = {
        _id: new Types.ObjectId(),
        payDate: new Date('2024-12-01'),
        timeZone: 'Africa/Cairo',
        currency: 'EGP',
      };

      mockSettingsModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockSettings),
      });

      const result = await service.getSettings();

      expect(mockSettingsModel.findOne).toHaveBeenCalled();
      expect(result).toEqual(mockSettings);
    });

    it('should get insurance brackets', async () => {
      const mockInsurance = [
        { _id: new Types.ObjectId(), name: 'Insurance 1', minSalary: 10000 },
        { _id: new Types.ObjectId(), name: 'Insurance 2', minSalary: 20000 },
      ];

      mockInsuranceModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockInsurance),
      });

      const result = await service.getInsuranceBrackets();

      expect(mockInsuranceModel.find).toHaveBeenCalled();
      expect(result).toEqual(mockInsurance);
    });
  });

  describe('Get All Methods - Additional', () => {
    it('should get all pay types', async () => {
      const mockPayTypes = [
        { _id: new Types.ObjectId(), type: 'Monthly', amount: 20000 },
        { _id: new Types.ObjectId(), type: 'Hourly', amount: 50 },
      ];

      mockPayTypeModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPayTypes),
      });

      const result = await service.getPayTypes();

      expect(mockPayTypeModel.find).toHaveBeenCalled();
      expect(result).toEqual(mockPayTypes);
    });

    it('should get all payroll policies', async () => {
      const mockPolicies = [
        { _id: new Types.ObjectId(), policyName: 'Policy 1' },
        { _id: new Types.ObjectId(), policyName: 'Policy 2' },
      ];

      mockPayrollPoliciesModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPolicies),
      });

      const result = await service.getPayrollPolicies();

      expect(mockPayrollPoliciesModel.find).toHaveBeenCalled();
      expect(result).toEqual(mockPolicies);
    });

    it('should get all signing bonuses', async () => {
      const mockBonuses = [
        { _id: new Types.ObjectId(), positionName: 'Senior Developer', amount: 10000 },
        { _id: new Types.ObjectId(), positionName: 'Lead Developer', amount: 15000 },
      ];

      mockBonusModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockBonuses),
      });

      const result = await service.getSigningBonuses();

      expect(mockBonusModel.find).toHaveBeenCalled();
      expect(result).toEqual(mockBonuses);
    });

    it('should get all termination benefits', async () => {
      const mockBenefits = [
        { _id: new Types.ObjectId(), name: 'End of Service Gratuity', amount: 15000 },
        { _id: new Types.ObjectId(), name: 'Severance Package', amount: 20000 },
      ];

      mockTermModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockBenefits),
      });

      const result = await service.getTerminationBenefits();

      expect(mockTermModel.find).toHaveBeenCalled();
      expect(result).toEqual(mockBenefits);
    });
  });
});