import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AttendanceCorrectionRequest, AttendanceCorrectionRequestDocument } from './models/attendance-correction-request.schema';
import { CreateCorrectionDto, UpdateCorrectionDto } from './dto';
import { CorrectionRequestStatus } from './models/enums';

@Injectable()
export class CorrectionService {
    constructor(
        @InjectModel(AttendanceCorrectionRequest.name) 
        private correctionRequestModel: Model<AttendanceCorrectionRequestDocument>,
    ) { }

    async createRequest(createCorrectionDto: CreateCorrectionDto): Promise<AttendanceCorrectionRequest> {
        const createdRequest = new this.correctionRequestModel(createCorrectionDto);
        return createdRequest.save();
    }

    async getCorrectionRequests(): Promise<AttendanceCorrectionRequest[]> {
        return this.correctionRequestModel.find().exec();
    }

    async getCorrectionRequestById(id: string): Promise<AttendanceCorrectionRequest> {
        const request = await this.correctionRequestModel.findById(id).exec();
        if (!request) {
            throw new NotFoundException(`CorrectionRequest with ID ${id} not found`);
        }
        return request;
    }

    async approveByManager(id: string): Promise<AttendanceCorrectionRequest> {
        const request = await this.correctionRequestModel.findById(id).exec();
        
        if (!request) {
            throw new NotFoundException(`CorrectionRequest with ID ${id} not found`);
        }

        if (request.status !== CorrectionRequestStatus.SUBMITTED) {
            throw new BadRequestException(
                `Cannot approve by manager. Current status: ${request.status}. Expected: SUBMITTED`
            );
        }

        request.status = CorrectionRequestStatus.IN_REVIEW;
        return request.save();
    }

    async approveByHR(id: string): Promise<AttendanceCorrectionRequest> {
        const request = await this.correctionRequestModel.findById(id).exec();
        
        if (!request) {
            throw new NotFoundException(`CorrectionRequest with ID ${id} not found`);
        }

        if (request.status !== CorrectionRequestStatus.IN_REVIEW) {
            throw new BadRequestException(
                `Cannot approve by HR. Current status: ${request.status}. Expected: IN_REVIEW`
            );
        }

        request.status = CorrectionRequestStatus.APPROVED;
        return request.save();
    }

    async reject(id: string): Promise<AttendanceCorrectionRequest> {
        const request = await this.correctionRequestModel.findById(id).exec();
        
        if (!request) {
            throw new NotFoundException(`CorrectionRequest with ID ${id} not found`);
        }

        if (request.status === CorrectionRequestStatus.APPROVED) {
            throw new BadRequestException(
                'Cannot reject an already approved correction request'
            );
        }

        request.status = CorrectionRequestStatus.REJECTED;
        return request.save();
    }

    async escalate(id: string): Promise<AttendanceCorrectionRequest> {
        const request = await this.correctionRequestModel.findById(id).exec();
        
        if (!request) {
            throw new NotFoundException(`CorrectionRequest with ID ${id} not found`);
        }

        request.status = CorrectionRequestStatus.ESCALATED;
        return request.save();
    }

    /**
     * Helper method to finalize a correction and prepare adjustment data
     * This method prepares the correction data for the attendance system to apply
     * @param attendanceRecord - The attendance record to be corrected
     * @param correctionRequest - The approved correction request
     * @returns Object containing correction finalization results
     */
    finalizeCorrection(attendanceRecord: any, correctionRequest: AttendanceCorrectionRequest): {
        canApplyCorrection: boolean;
        correctionStatus: CorrectionRequestStatus;
        attendanceRecordId: string;
        employeeId: string;
        reason: string;
        isApproved: boolean;
        isRejected: boolean;
        isPending: boolean;
        requiresEscalation: boolean;
        message: string;
        suggestedActions: string[];
    } {
        const status = correctionRequest.status;
        const isApproved = status === CorrectionRequestStatus.APPROVED;
        const isRejected = status === CorrectionRequestStatus.REJECTED;
        const isPending = status === CorrectionRequestStatus.SUBMITTED || status === CorrectionRequestStatus.IN_REVIEW;
        const requiresEscalation = status === CorrectionRequestStatus.ESCALATED;
        const canApplyCorrection = isApproved;

        let message = '';
        const suggestedActions: string[] = [];

        switch (status) {
            case CorrectionRequestStatus.SUBMITTED:
                message = 'Correction request submitted. Awaiting manager review.';
                suggestedActions.push('Notify manager for review');
                suggestedActions.push('Do not modify attendance record yet');
                break;

            case CorrectionRequestStatus.IN_REVIEW:
                message = 'Correction request approved by manager. Awaiting HR approval.';
                suggestedActions.push('Notify HR for final approval');
                suggestedActions.push('Do not modify attendance record yet');
                break;

            case CorrectionRequestStatus.APPROVED:
                message = 'Correction request fully approved. Ready to apply changes.';
                suggestedActions.push('Apply correction to attendance record');
                suggestedActions.push('Notify employee of approved correction');
                suggestedActions.push('Update attendance calculations');
                break;

            case CorrectionRequestStatus.REJECTED:
                message = 'Correction request has been rejected.';
                suggestedActions.push('Notify employee of rejection');
                suggestedActions.push('Keep original attendance record');
                suggestedActions.push('Close correction workflow');
                break;

            case CorrectionRequestStatus.ESCALATED:
                message = 'Correction request has been escalated for higher-level review.';
                suggestedActions.push('Notify HR or senior management');
                suggestedActions.push('Hold attendance record pending escalation review');
                suggestedActions.push('Provide additional documentation');
                break;

            default:
                message = `Unknown correction status: ${status}`;
                suggestedActions.push('Review correction request manually');
        }

        return {
            canApplyCorrection,
            correctionStatus: status,
            attendanceRecordId: correctionRequest.attendanceRecord?.toString() || '',
            employeeId: correctionRequest.employeeId?.toString() || '',
            reason: correctionRequest.reason || 'No reason provided',
            isApproved,
            isRejected,
            isPending,
            requiresEscalation,
            message,
            suggestedActions
        };
    }
}

