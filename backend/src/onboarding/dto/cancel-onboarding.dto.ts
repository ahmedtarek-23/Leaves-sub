export class CancelOnboardingDto {
  onboardingId!: string;
  reason?: string;

  // TODO[SCHEMA]: ONB-013 requires explicit cancellation/no-show flags and reasons on onboarding records; current schema lacks these fields.
}