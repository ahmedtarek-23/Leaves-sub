import { Module } from '@nestjs/common';
<<<<<<< Updated upstream
import { PayrollConfigurationController } from './payroll-configuration.controller';
import { PayrollConfigurationService } from './payroll-configuration.service';
import { CompanyWideSettings, CompanyWideSettingsSchema } from './models/CompanyWideSettings.schema';
=======
>>>>>>> Stashed changes
import { MongooseModule } from '@nestjs/mongoose';
import { PayrollConfigurationService } from './payroll-configuration.service';
import { PayrollConfigurationController } from './payroll-configuration.controller';
// --- Auth Module Integration ---
import { AuthModule } from '../auth/auth.module'; // Import AuthModule

// Import All Schemas
import { allowance, allowanceSchema } from './models/allowance.schema';
<<<<<<< Updated upstream
import { insuranceBrackets, insuranceBracketsSchema } from './models/insuranceBrackets.schema';
import { payrollPolicies, payrollPoliciesSchema } from './models/payrollPolicies.schema';
import { payType, payTypeSchema } from './models/payType.schema';
import { signingBonus, signingBonusSchema } from './models/signingBonus.schema';
import { taxRules, taxRulesSchema } from './models/taxRules.schema';
import { terminationAndResignationBenefits, terminationAndResignationBenefitsSchema } from './models/terminationAndResignationBenefits';
import { payGrade } from './models/payGrades.schema';
=======
import { taxRules, taxRulesSchema } from './models/taxRules.schema';
import { insuranceBrackets, insuranceBracketsSchema } from './models/insuranceBrackets.schema';
import { signingBonus, signingBonusSchema } from './models/signingBonus.schema';
import { CompanyWideSettings, CompanyWideSettingsSchema } from './models/CompanyWideSettings.schema';
import { payGrade, payGradeSchema } from './models/payGrades.schema';
import { payType, payTypeSchema } from './models/payType.schema';
import { terminationAndResignationBenefits, terminationAndResignationBenefitsSchema } from './models/terminationAndResignationBenefits';
import { payrollPolicies, payrollPoliciesSchema } from './models/payrollPolicies.schema';
>>>>>>> Stashed changes

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: allowance.name, schema: allowanceSchema },
      { name: taxRules.name, schema: taxRulesSchema },
      { name: insuranceBrackets.name, schema: insuranceBracketsSchema },
<<<<<<< Updated upstream
      { name: payType.name, schema: payTypeSchema },
      { name: payrollPolicies.name, schema: payrollPoliciesSchema },
      { name: terminationAndResignationBenefits.name, schema: terminationAndResignationBenefitsSchema },
      { name: CompanyWideSettings.name, schema: CompanyWideSettingsSchema },
      { name: payGrade.name, schema: payTypeSchema }
=======
      { name: signingBonus.name, schema: signingBonusSchema },
      { name: CompanyWideSettings.name, schema: CompanyWideSettingsSchema },
      { name: payGrade.name, schema: payGradeSchema },
      { name: payType.name, schema: payTypeSchema },
      { name: terminationAndResignationBenefits.name, schema: terminationAndResignationBenefitsSchema },
      { name: payrollPolicies.name, schema: payrollPoliciesSchema },
>>>>>>> Stashed changes
    ]),
    AuthModule,
  ],
  controllers: [PayrollConfigurationController],
  providers: [PayrollConfigurationService],
  exports:[PayrollConfigurationService]
})
<<<<<<< Updated upstream
export class PayrollConfigurationModule { }
=======
export class PayrollConfigurationModule {}
>>>>>>> Stashed changes
