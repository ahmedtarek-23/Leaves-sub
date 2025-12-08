import { Prop, Schema, SchemaFactory, } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import {  EmployeeProfile as Employee} from '../../employee-profile/models/employee-profile.schema';
import { ClaimStatus } from '../enums/payroll-tracking-enum';

export type claimsDocument = HydratedDocument<claims>

@Schema({ timestamps: true })
export class claims {
    @Prop({ required: true, unique: true })
    claimId: string; // for frontend view purposes ex: CLAIM-0001

    @Prop({ required: true })
    description: string;

<<<<<<< Updated upstream
    @Prop({ required: true })
    claimType: string // for example: medical, etc

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Employee.name, required: true })
    employeeId: mongoose.Types.ObjectId;
=======
  @Prop({ required: true })
  claimType: string // for example: medical, etc

<<<<<<< Updated upstream
=======
  @Prop({ required: true })
  claimType: string // for example: medical, etc

>>>>>>> Stashed changes
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Employee.name, required: true })
  employeeId: mongoose.Types.ObjectId;
>>>>>>> Stashed changes

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Employee.name })
    financeStaffId?: mongoose.Types.ObjectId;

<<<<<<< Updated upstream
    @Prop({ required: true })
    amount: number;
=======
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Employee.name })
  payrollSpecialistId?: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Employee.name })
  payrollManagerId?: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Employee.name })
  payrollSpecialistId?: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Employee.name })
  payrollManagerId?: mongoose.Types.ObjectId;

  @Prop({ required: true })
  amount: number;
>>>>>>> Stashed changes

    @Prop({})
    approvedAmount?: number;

<<<<<<< Updated upstream
<<<<<<< Updated upstream
    @Prop({ required: true, type: String, enum: ClaimStatus, default: ClaimStatus.UNDER_REVIEW })
    status: ClaimStatus;// under review, approved, rejected
=======
  @Prop({ required: true, type: String, enum: ClaimStatus, default: ClaimStatus.UNDER_REVIEW })
  status: ClaimStatus;// under review,pending_manager_approval, approved, rejected
>>>>>>> Stashed changes
=======
  @Prop({ required: true, type: String, enum: ClaimStatus, default: ClaimStatus.UNDER_REVIEW })
  status: ClaimStatus;// under review,pending_manager_approval, approved, rejected
>>>>>>> Stashed changes

    @Prop()
    rejectionReason?: string;

    @Prop()
    resolutionComment?: string;

<<<<<<< Updated upstream
=======
  @Prop()
  resolutionComment?: string;

<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
}

export const claimsSchema = SchemaFactory.createForClass(claims);