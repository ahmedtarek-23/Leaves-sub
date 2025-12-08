import { Module } from '@nestjs/common';
<<<<<<< Updated upstream
<<<<<<< Updated upstream
import { PayrollConfigurationController } from './payroll-configuration.controller';
import { PayrollConfigurationService } from './payroll-configuration.service';
import { CompanyWideSettings, CompanyWideSettingsSchema } from './models/CompanyWideSettings.schema';
=======
>>>>>>> Stashed changes
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
=======
import { taxRules, taxRulesSchema } from './models/taxRules.schema';
>>>>>>> Stashed changes
import { insuranceBrackets, insuranceBracketsSchema } from './models/insuranceBrackets.schema';
import { signingBonus, signingBonusSchema } from './models/signingBonus.schema';
import { CompanyWideSettings, CompanyWideSettingsSchema } from './models/CompanyWideSettings.schema';
import { payGrade, payGradeSchema } from './models/payGrades.schema';
import { payType, payTypeSchema } from './models/payType.schema';
import { terminationAndResignationBenefits, terminationAndResignationBenefitsSchema } from './models/terminationAndResignationBenefits';
import { payrollPolicies, payrollPoliciesSchema } from './models/payrollPolicies.schema';
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: allowance.name, schema: allowanceSchema },
      { name: taxRules.name, schema: taxRulesSchema },
      { name: insuranceBrackets.name, schema: insuranceBracketsSchema },
<<<<<<< Updated upstream
<<<<<<< Updated upstream
      { name: payType.name, schema: payTypeSchema },
      { name: payrollPolicies.name, schema: payrollPoliciesSchema },
      { name: terminationAndResignationBenefits.name, schema: terminationAndResignationBenefitsSchema },
      { name: CompanyWideSettings.name, schema: CompanyWideSettingsSchema },
      { name: payGrade.name, schema: payTypeSchema }
=======
      { name: signingBonus.name, schema: signingBonusSchema },
      { name: CompanyWideSettings.name, schema: CompanyWideSettingsSchema },
=======
      { name: signingBonus.name, schema: signingBonusSchema },
      { name: CompanyWideSettings.name, schema: CompanyWideSettingsSchema },
>>>>>>> Stashed changes
      { name: payGrade.name, schema: payGradeSchema },
      { name: payType.name, schema: payTypeSchema },
      { name: terminationAndResignationBenefits.name, schema: terminationAndResignationBenefitsSchema },
      { name: payrollPolicies.name, schema: payrollPoliciesSchema },
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
    ]),
    AuthModule,
  ],
  controllers: [PayrollConfigurationController],
  providers: [PayrollConfigurationService],
  exports:[PayrollConfigurationService]
})
<<<<<<< Updated upstream
<<<<<<< Updated upstream
export class PayrollConfigurationModule { }
=======
export class PayrollConfigurationModule {}
>>>>>>> Stashed changes
=======
export class PayrollConfigurationModule {}
>>>>>>> Stashed changes
