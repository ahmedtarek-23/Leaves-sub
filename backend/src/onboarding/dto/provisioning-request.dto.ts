export class ProvisioningRequestDto {
  onboardingId!: string;
  taskType!: 'IT' | 'FACILITIES' | 'ACCESS';
  details?: any;

  // TODO[SCHEMA]: Provisioning metadata (e.g., equipment specs, systems list) is not explicitly modeled; capturing transient details only.
}