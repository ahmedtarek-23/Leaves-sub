import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationService {
  async sendLeaveRequestNotification(request: any): Promise<void> {
    // Implementation for sending notifications
    console.log('Sending leave request notification:', request);
  }

  async sendReviewNotification(request: any): Promise<void> {
    // Implementation for sending review notifications
    console.log('Sending review notification:', request);
  }

  async sendCancellationNotification(request: any): Promise<void> {
    // Implementation for sending cancellation notifications
    console.log('Sending cancellation notification:', request);
  }
}