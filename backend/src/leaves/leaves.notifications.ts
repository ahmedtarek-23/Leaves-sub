import { Injectable } from '@nestjs/common';
import { LeaveRequestDocument } from './models/leave-request.schema';
import { LeaveStatus } from './enums/leave-status.enum';

@Injectable()
export class LeavesNotifications {
  /**
   * Stub – replace with real mail/push later
   */
  async send(event: string, to: string, data: any) {
    console.log(`[NOTIFICATION] ${event} → ${to}`, JSON.stringify(data));
    /* TODO: inject MailerService or external queue */
  }

  /* ----------------------------------------------------------
     Helper methods for every leave event
  ---------------------------------------------------------- */
  async requestSubmitted(req: LeaveRequestDocument, empEmail: string, managerEmail: string) {
    await this.send('LEAVE_REQUEST_SUBMITTED', managerEmail, { reqId: req._id, empEmail });
  }

  async managerApproved(req: LeaveRequestDocument, empEmail: string) {
    await this.send('MANAGER_APPROVED', empEmail, { reqId: req._id });
  }

  async managerRejected(req: LeaveRequestDocument, empEmail: string) {
    await this.send('MANAGER_REJECTED', empEmail, { reqId: req._id });
  }

  async hrFinalized(req: LeaveRequestDocument, empEmail: string, managerEmail: string) {
    const list = [empEmail, managerEmail];
    if (req.status === LeaveStatus.APPROVED) {
      await Promise.all(list.map(e => this.send('LEAVE_FINALIZED', e, { reqId: req._id, status: 'APPROVED' })));
    }
  }
}