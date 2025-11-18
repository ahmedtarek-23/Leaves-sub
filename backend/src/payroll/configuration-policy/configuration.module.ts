import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// Components
import { ConfigurationPolicyService } from './configuration-policy.service';
import { ConfigurationPolicyController } from './configuration-policy.controller';

// Schemas
import {
  PayrollPolicy,
  PayrollPolicySchema,
} from './schema/payroll-pollicy.schema';
import {
  PayStructure,
  PayStructureSchema,
} from './schema/pay-structure.schema';

@Module({
  imports: [
    // Register the models and schemas for this module
    MongooseModule.forFeature([
      { name: PayrollPolicy.name, schema: PayrollPolicySchema },
      { name: PayStructure.name, schema: PayStructureSchema },
    ]),
  ],
  controllers: [ConfigurationPolicyController],
  providers: [ConfigurationPolicyService],
  // CRUCIAL: Export the service so the downstream Payroll Processing module can access the configurations!
  exports: [ConfigurationPolicyService, MongooseModule],
})
export class ConfigurationPolicyModule {}
