import { Module } from '@nestjs/common';
import { ConfigurationPolicyModule } from './configuration-policy/configuration.module';
import { ProcessingModule } from './processing-execution/processing.module'; // Assuming file is named processing.module.ts
import { TrackingModule } from './tracking-self-service/tracking.module'; // Assuming file is named tracking.module.ts

@Module({
  imports: [
    // Register all three payroll subsystems here
    ConfigurationPolicyModule,
    ProcessingModule,
    TrackingModule,
  ],
  controllers: [],
  providers: [],
  exports: [ConfigurationPolicyModule, ProcessingModule, TrackingModule],
})
export class PayrollModule {}
