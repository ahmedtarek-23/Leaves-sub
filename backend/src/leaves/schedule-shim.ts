/*
 * Local shim to avoid a hard dependency on @nestjs/schedule for tests/environments
 * where the package is not installed. This provides a no-op Cron decorator and a
 * minimal CronExpression object so code can be executed in unit tests without
 * failing to resolve the import.
 */
import { CustomDecorator } from '@nestjs/common';

// No-op decorator if schedule package isn't available
export function Cron(): MethodDecorator {
  return () => undefined as unknown as void;
}

// Minimal CronExpression constants used across the leaves service to keep parity
// with @nestjs/schedule without the hard dependency
export const CronExpression = {
  EVERY_DAY_AT_MIDNIGHT: '0 0 * * *',
  EVERY_HOUR: '0 * * * *',
} as const;

export type CronExpressionKeys = keyof typeof CronExpression;

// Re-export a no-op decorator factory signature compatible with Nest's Cron decorator
export const CronDecorator = Cron as unknown as (...args: any[]) => MethodDecorator;

export default {
  Cron: CronDecorator,
  CronExpression,
};
