import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { LeaveService } from './leaves.service';

@Injectable()
export class LeavesScheduler {
  constructor(private readonly leavesService: LeaveService) {}

  /* ----------  nightly accrual  ---------- */
  @Cron('0 0 * * *') // midnight every day
  async nightlyAccrual() {
    await this.leavesService.runAccrual();
  }

  /* ----------  yearly carry-forward  ---------- */
  @Cron('0 0 1 1 *') // 1-Jan 00:00 every year
  async yearlyCarryForward() {
    await this.leavesService.runCarryForward();
  }
}