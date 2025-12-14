import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmployeeProfile } from '../../employee-profile/models/employee-profile.schema';

/**
 * Notification Service for Leaves Management
 * 
 * This service handles all notifications related to leave requests including:
 * - Email notifications
 * - SMS notifications (when configured)
 * - In-app notifications (when implemented)
 * 
 * The service uses a strategy pattern to support multiple notification channels.
 */

export interface NotificationChannel {
    sendEmail(to: string, subject: string, body: string): Promise<void>;
    sendSMS(to: string, message: string): Promise<void>;
}

export interface NotificationRecipient {
    email?: string;
    phone?: string;
    name?: string;
}

@Injectable()
export class NotificationService {
    private readonly logger = new Logger(NotificationService.name);
    private notificationChannels: NotificationChannel[] = [];

    constructor(
        @InjectModel('EmployeeProfile') private employeeProfileModel?: Model<EmployeeProfile>,
    ) {
        // Initialize notification channels
        this.initializeChannels();
    }

    /**
     * Initialize notification channels
     * In production, this would load configured channels (SMTP, SMS gateway, etc.)
     */
    private initializeChannels(): void {
        // For now, use console logging as fallback
        // In production, add actual email/SMS providers here
        this.notificationChannels.push({
            sendEmail: async (to: string, subject: string, body: string) => {
                this.logger.log(`📧 EMAIL to ${to}: ${subject}`);
                this.logger.debug(`Email body: ${body}`);
                // TODO: Integrate with actual email service (e.g., SendGrid, AWS SES, Nodemailer)
            },
            sendSMS: async (to: string, message: string) => {
                this.logger.log(`📱 SMS to ${to}: ${message}`);
                // TODO: Integrate with actual SMS service (e.g., Twilio, AWS SNS)
            },
        });
    }

    /**
     * Get employee contact information
     */
    private async getEmployeeContacts(employeeId: string): Promise<NotificationRecipient> {
        try {
            if (this.employeeProfileModel) {
                const employee = await this.employeeProfileModel.findById(employeeId).exec();
                if (employee) {
                    return {
                        email: employee.workEmail || (employee as any).personalEmail,
                        phone: employee.mobilePhone || (employee as any).phoneNumber,
                        name: `${employee.firstName} ${employee.lastName}`,
                    };
                }
            }
        } catch (error) {
            this.logger.warn(`Could not fetch employee contacts for ${employeeId}: ${error.message}`);
        }
        return {};
    }

    /**
     * Send notification via all available channels
     */
    private async sendNotification(
        recipient: NotificationRecipient,
        subject: string,
        emailBody: string,
        smsMessage?: string
    ): Promise<void> {
        const promises: Promise<void>[] = [];

        // Send email if recipient has email
        if (recipient.email) {
            for (const channel of this.notificationChannels) {
                promises.push(
                    channel.sendEmail(recipient.email!, subject, emailBody).catch((error) => {
                        this.logger.error(`Failed to send email to ${recipient.email}: ${error.message}`);
                    })
                );
            }
        }

        // Send SMS if recipient has phone and SMS message provided
        if (recipient.phone && smsMessage) {
            for (const channel of this.notificationChannels) {
                promises.push(
                    channel.sendSMS(recipient.phone!, smsMessage).catch((error) => {
                        this.logger.error(`Failed to send SMS to ${recipient.phone}: ${error.message}`);
                    })
                );
            }
        }

        await Promise.allSettled(promises);
    }

    /**
     * Send leave request notification to manager
     */
    async sendLeaveRequestNotification(requestId: string): Promise<void> {
        try {
            // In a real implementation, fetch request and manager details
            // For now, log the notification
            this.logger.log(`Sending leave request notification for request ${requestId}`);
            
            // TODO: Fetch request details and manager ID from database
            // const request = await this.leaveRequestModel.findById(requestId);
            // const manager = await this.getEmployeeContacts(request.managerId);
            // await this.sendNotification(
            //     manager,
            //     'New Leave Request Requires Your Review',
            //     `You have a new leave request from ${employee.name} that requires your review.`,
            //     `New leave request from ${employee.name} requires your review.`
            // );
        } catch (error) {
            this.logger.error(`Failed to send leave request notification: ${error.message}`);
        }
    }

    /**
     * Send review notification to employee
     */
    async sendReviewNotification(requestId: string): Promise<void> {
        try {
            this.logger.log(`Sending review notification for request ${requestId}`);
            
            // TODO: Fetch request details and employee ID from database
            // const request = await this.leaveRequestModel.findById(requestId);
            // const employee = await this.getEmployeeContacts(request.employeeId);
            // const status = request.status === LeaveStatus.APPROVED ? 'approved' : 'rejected';
            // await this.sendNotification(
            //     employee,
            //     `Leave Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
            //     `Your leave request has been ${status}.`,
            //     `Your leave request has been ${status}.`
            // );
        } catch (error) {
            this.logger.error(`Failed to send review notification: ${error.message}`);
        }
    }

    /**
     * Send cancellation notification
     */
    async sendCancellationNotification(requestId: string): Promise<void> {
        try {
            this.logger.log(`Sending cancellation notification for request ${requestId}`);
            
            // TODO: Implement full notification with employee and manager details
        } catch (error) {
            this.logger.error(`Failed to send cancellation notification: ${error.message}`);
        }
    }

    /**
     * Send medical verification notification
     */
    async sendMedicalVerificationNotification(
        employeeId: string,
        status: string,
        requestId: string
    ): Promise<void> {
        try {
            const employee = await this.getEmployeeContacts(employeeId);
            const statusText = status === 'APPROVED' ? 'approved' : 'rejected';
            
            await this.sendNotification(
                employee,
                `Medical Document Verification ${status}`,
                `Your medical documents for leave request ${requestId} have been ${statusText}.`,
                `Medical docs ${statusText} for request ${requestId}`
            );
        } catch (error) {
            this.logger.error(`Failed to send medical verification notification: ${error.message}`);
        }
    }

    /**
     * Send escalation notification
     */
    async sendEscalationNotification(requestId: string, managerId?: string): Promise<void> {
        try {
            this.logger.log(
                `Sending escalation notification for request ${requestId} to manager ${managerId || 'N/A'}`
            );
            
            if (managerId) {
                const manager = await this.getEmployeeContacts(managerId);
                await this.sendNotification(
                    manager,
                    'Leave Request Escalation',
                    `Leave request ${requestId} has been escalated and requires immediate attention.`,
                    `Leave request ${requestId} escalated - requires attention`
                );
            }
        } catch (error) {
            this.logger.error(`Failed to send escalation notification: ${error.message}`);
        }
    }

    /**
     * Add a notification channel (for extensibility)
     */
    addChannel(channel: NotificationChannel): void {
        this.notificationChannels.push(channel);
    }
}
