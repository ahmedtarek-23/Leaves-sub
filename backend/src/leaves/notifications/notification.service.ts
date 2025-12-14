import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  LeaveNotification,
  NotificationType,
  NotificationChannel,
  NotificationStatus,
} from '../models/leave-notification.schema';
import { LeaveRequest } from '../models/leave-request.schema';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectModel(LeaveNotification.name)
    private notificationModel: Model<LeaveNotification>,
  ) {}

  /**
   * Mock Email Provider
   */
  private async sendEmail(
    to: string,
    subject: string,
    body: string,
  ): Promise<boolean> {
    // Mock implementation - in production, integrate with actual email service
    this.logger.log(`[MOCK EMAIL] To: ${to}, Subject: ${subject}`);
    this.logger.debug(`[MOCK EMAIL] Body: ${body}`);
    // Simulate async email sending
    await new Promise((resolve) => setTimeout(resolve, 100));
    return true;
  }

  /**
   * Mock SMS Provider
   */
  private async sendSMS(to: string, message: string): Promise<boolean> {
    // Mock implementation - in production, integrate with actual SMS service
    this.logger.log(`[MOCK SMS] To: ${to}, Message: ${message}`);
    // Simulate async SMS sending
    await new Promise((resolve) => setTimeout(resolve, 100));
    return true;
  }

  /**
   * Create and send notification
   */
  async sendNotification(
    recipientId: Types.ObjectId,
    type: NotificationType,
    channel: NotificationChannel,
    subject: string,
    message: string,
    leaveRequestId?: Types.ObjectId,
    metadata?: Record<string, any>,
  ): Promise<LeaveNotification> {
    const notification = new this.notificationModel({
      recipientId,
      type,
      channel,
      subject,
      message,
      leaveRequestId,
      metadata,
      status: NotificationStatus.PENDING,
    });

    await notification.save();

    try {
      let success = false;
      const recipientEmail = `employee-${recipientId}@company.com`; // Mock email
      const recipientPhone = `+1234567890`; // Mock phone

      if (channel === NotificationChannel.EMAIL) {
        success = await this.sendEmail(recipientEmail, subject, message);
      } else if (channel === NotificationChannel.SMS) {
        success = await this.sendSMS(recipientPhone, message);
      } else {
        // IN_APP notification - always successful
        success = true;
      }

      notification.status = success
        ? NotificationStatus.SENT
        : NotificationStatus.FAILED;
      notification.sentAt = new Date();

      if (success) {
        notification.status = NotificationStatus.DELIVERED;
        notification.deliveredAt = new Date();
      }

      await notification.save();
      return notification;
    } catch (error) {
      this.logger.error(`Failed to send notification: ${error.message}`, error.stack);
      notification.status = NotificationStatus.FAILED;
      notification.errorMessage = error.message;
      await notification.save();
      throw error;
    }
  }

  /**
   * Send leave request submitted notification
   */
  async notifyRequestSubmitted(
    request: LeaveRequest,
    managerId: Types.ObjectId,
  ): Promise<void> {
    const message = `New leave request submitted by employee ${request.employeeId} from ${request.startDate} to ${request.endDate}`;
    
    await this.sendNotification(
      managerId,
      NotificationType.REQUEST_SUBMITTED,
      NotificationChannel.EMAIL,
      'New Leave Request Submitted',
      message,
      request._id as Types.ObjectId,
      { employeeId: request.employeeId.toString() },
    );
  }

  /**
   * Send leave request approved notification
   */
  async notifyRequestApproved(
    request: LeaveRequest,
    employeeId: Types.ObjectId,
  ): Promise<void> {
    const message = `Your leave request from ${request.startDate} to ${request.endDate} has been approved.`;
    
    await this.sendNotification(
      employeeId,
      NotificationType.REQUEST_APPROVED,
      NotificationChannel.EMAIL,
      'Leave Request Approved',
      message,
      request._id as Types.ObjectId,
    );
  }

  /**
   * Send leave request rejected notification
   */
  async notifyRequestRejected(
    request: LeaveRequest,
    employeeId: Types.ObjectId,
    reason?: string,
  ): Promise<void> {
    const message = `Your leave request from ${request.startDate} to ${request.endDate} has been rejected.${reason ? ` Reason: ${reason}` : ''}`;
    
    await this.sendNotification(
      employeeId,
      NotificationType.REQUEST_REJECTED,
      NotificationChannel.EMAIL,
      'Leave Request Rejected',
      message,
      request._id as Types.ObjectId,
      { reason },
    );
  }

  /**
   * Send year-end processing notification
   */
  async notifyYearEndProcessing(
    employeeId: Types.ObjectId,
    year: number,
    summary: Record<string, any>,
  ): Promise<void> {
    const message = `Year-end leave processing completed for ${year}. Your leave balance has been updated.`;
    
    await this.sendNotification(
      employeeId,
      NotificationType.YEAR_END_PROCESSING,
      NotificationChannel.EMAIL,
      `Year-End Processing ${year}`,
      message,
      undefined,
      { year, summary },
    );
  }

  /**
   * Get notification logs for a user
   */
  async getNotificationLogs(
    recipientId: Types.ObjectId,
    limit: number = 50,
  ): Promise<LeaveNotification[]> {
    return this.notificationModel
      .find({ recipientId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }
}
