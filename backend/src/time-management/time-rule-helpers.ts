import { LatenessRuleService } from './lateness-rule.service';
import { OvertimeRuleService } from './overtime-rule.service';
import { TimeExceptionService } from './time-exception.service';
import { CorrectionService } from './correction.service';
import { LatenessRule } from './models/lateness-rule.schema';
import { OvertimeRule } from './models/overtime-rule.schema';
import { TimeException } from './models/time-exception.schema';
import { AttendanceCorrectionRequest } from './models/attendance-correction-request.schema';

/**
 * Helper integration file for Team Member B (Attendance)
 * These are thin wrappers that delegate to the respective services
 * Do NOT import attendance or shift services here
 */

/**
 * Apply lateness rule to an attendance record
 * @param latenessRuleService - Injected service instance
 * @param attendanceRecord - Attendance record with clock-in time
 * @param shift - Shift with start time and grace period
 * @param rule - Lateness rule to apply
 */
export function applyLatenessRule(
    latenessRuleService: LatenessRuleService,
    attendanceRecord: any,
    shift: any,
    rule: LatenessRule
) {
    return latenessRuleService.applyLatenessRule(attendanceRecord, shift, rule);
}

/**
 * Apply overtime rule to an attendance record
 * @param overtimeRuleService - Injected service instance
 * @param attendanceRecord - Attendance record with clock-out time
 * @param shift - Shift with end time
 * @param rule - Overtime rule to apply
 */
export function applyOvertimeRule(
    overtimeRuleService: OvertimeRuleService,
    attendanceRecord: any,
    shift: any,
    rule: OvertimeRule
) {
    return overtimeRuleService.applyOvertimeRule(attendanceRecord, shift, rule);
}

/**
 * Apply time exception to an attendance record
 * @param timeExceptionService - Injected service instance
 * @param attendanceRecord - Attendance record to apply exception to
 * @param exception - Time exception with type and reason
 */
export function applyExceptionToRecord(
    timeExceptionService: TimeExceptionService,
    attendanceRecord: any,
    exception: TimeException
) {
    return timeExceptionService.applyExceptionToRecord(attendanceRecord, exception);
}

/**
 * Finalize correction and get suggested actions
 * @param correctionService - Injected service instance
 * @param attendanceRecord - Attendance record to be corrected
 * @param correctionRequest - Approved correction request
 */
export function finalizeCorrection(
    correctionService: CorrectionService,
    attendanceRecord: any,
    correctionRequest: AttendanceCorrectionRequest
) {
    return correctionService.finalizeCorrection(attendanceRecord, correctionRequest);
}

