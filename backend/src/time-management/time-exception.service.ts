import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TimeException, TimeExceptionDocument } from './models/time-exception.schema';
import { CreateTimeExceptionDto, UpdateTimeExceptionDto } from './dto';
import { TimeExceptionStatus, TimeExceptionType } from './models/enums';

@Injectable()
export class TimeExceptionService {
    constructor(
        @InjectModel(TimeException.name) private timeExceptionModel: Model<TimeExceptionDocument>,
    ) { }

    async createException(createTimeExceptionDto: CreateTimeExceptionDto): Promise<TimeException> {
        const createdException = new this.timeExceptionModel(createTimeExceptionDto);
        return createdException.save();
    }

    async getExceptions(): Promise<TimeException[]> {
        return this.timeExceptionModel.find().exec();
    }

    async getExceptionById(id: string): Promise<TimeException> {
        const exception = await this.timeExceptionModel.findById(id).exec();
        if (!exception) {
            throw new NotFoundException(`TimeException with ID ${id} not found`);
        }
        return exception;
    }

    async updateException(id: string, updateTimeExceptionDto: UpdateTimeExceptionDto): Promise<TimeException> {
        const updatedException = await this.timeExceptionModel
            .findByIdAndUpdate(id, updateTimeExceptionDto, { new: true })
            .exec();
        if (!updatedException) {
            throw new NotFoundException(`TimeException with ID ${id} not found`);
        }
        return updatedException;
    }

    async updateExceptionStatus(
        id: string, 
        status: TimeExceptionStatus
    ): Promise<TimeException> {
        // Validate status transition
        const validStatuses = [
            TimeExceptionStatus.OPEN,
            TimeExceptionStatus.PENDING,
            TimeExceptionStatus.APPROVED,
            TimeExceptionStatus.REJECTED,
            TimeExceptionStatus.ESCALATED,
            TimeExceptionStatus.RESOLVED
        ];

        if (!validStatuses.includes(status)) {
            throw new BadRequestException(`Invalid status: ${status}`);
        }

        const updatedException = await this.timeExceptionModel
            .findByIdAndUpdate(id, { status }, { new: true })
            .exec();
        
        if (!updatedException) {
            throw new NotFoundException(`TimeException with ID ${id} not found`);
        }

        return updatedException;
    }

    /**
     * Helper method to apply time exception logic to an attendance record
     * Focuses on business trip, early leave, WFH, and other exception scenarios
     * @param attendanceRecord - The attendance record to apply exception to
     * @param exception - The time exception with type and reason
     * @returns Object containing exception application results
     */
    applyExceptionToRecord(attendanceRecord: any, exception: TimeException): {
        exceptionType: TimeExceptionType;
        shouldExcuseAbsence: boolean;
        shouldExcuseLateness: boolean;
        shouldExcuseEarlyLeave: boolean;
        shouldAdjustHours: boolean;
        adjustmentReason: string;
        requiresManagerReview: boolean;
        isApproved: boolean;
        message: string;
        suggestedAction: string;
    } {
        const exceptionType = exception.type;
        const isApproved = exception.status === TimeExceptionStatus.APPROVED;
        const reason = exception.reason || 'No reason provided';

        // Initialize default response
        let shouldExcuseAbsence = false;
        let shouldExcuseLateness = false;
        let shouldExcuseEarlyLeave = false;
        let shouldAdjustHours = false;
        let requiresManagerReview = false;
        let message = '';
        let suggestedAction = '';

        switch (exceptionType) {
            case TimeExceptionType.MISSED_PUNCH:
                requiresManagerReview = true;
                shouldAdjustHours = isApproved;
                message = isApproved 
                    ? `Missed punch exception approved. Reason: ${reason}`
                    : `Missed punch reported. Pending approval. Reason: ${reason}`;
                suggestedAction = isApproved 
                    ? 'Adjust attendance record based on manager confirmation'
                    : 'Hold for manager review and approval';
                break;

            case TimeExceptionType.LATE:
                shouldExcuseLateness = isApproved;
                requiresManagerReview = !isApproved;
                message = isApproved
                    ? `Lateness excused. Reason: ${reason}`
                    : `Lateness exception pending approval. Reason: ${reason}`;
                suggestedAction = isApproved
                    ? 'Waive lateness penalties'
                    : 'Apply standard lateness rules until approved';
                break;

            case TimeExceptionType.EARLY_LEAVE:
                shouldExcuseEarlyLeave = isApproved;
                requiresManagerReview = !isApproved;
                message = isApproved
                    ? `Early leave approved. Reason: ${reason}`
                    : `Early leave exception pending approval. Reason: ${reason}`;
                suggestedAction = isApproved
                    ? 'Count as full day if approved by policy'
                    : 'Mark as incomplete shift until approved';
                break;

            case TimeExceptionType.SHORT_TIME:
                shouldAdjustHours = isApproved;
                requiresManagerReview = true;
                message = isApproved
                    ? `Short time exception approved. Reason: ${reason}`
                    : `Short time reported. Pending approval. Reason: ${reason}`;
                suggestedAction = isApproved
                    ? 'Adjust expected hours for this day'
                    : 'Flag as incomplete attendance';
                break;

            case TimeExceptionType.OVERTIME_REQUEST:
                shouldAdjustHours = isApproved;
                requiresManagerReview = true;
                message = isApproved
                    ? `Overtime request approved. Reason: ${reason}`
                    : `Overtime request pending approval. Reason: ${reason}`;
                suggestedAction = isApproved
                    ? 'Credit overtime hours to employee'
                    : 'Hold overtime calculation pending approval';
                break;

            case TimeExceptionType.MANUAL_ADJUSTMENT:
                shouldAdjustHours = isApproved;
                shouldExcuseAbsence = isApproved;
                shouldExcuseLateness = isApproved;
                shouldExcuseEarlyLeave = isApproved;
                requiresManagerReview = true;
                message = isApproved
                    ? `Manual adjustment approved. Reason: ${reason}`
                    : `Manual adjustment requested. Pending approval. Reason: ${reason}`;
                suggestedAction = isApproved
                    ? 'Apply manual adjustment as specified'
                    : 'Maintain current record until approved';
                break;

            default:
                message = `Unknown exception type: ${exceptionType}`;
                suggestedAction = 'Review exception manually';
                requiresManagerReview = true;
        }

        return {
            exceptionType,
            shouldExcuseAbsence,
            shouldExcuseLateness,
            shouldExcuseEarlyLeave,
            shouldAdjustHours,
            adjustmentReason: reason,
            requiresManagerReview,
            isApproved,
            message,
            suggestedAction
        };
    }
}

