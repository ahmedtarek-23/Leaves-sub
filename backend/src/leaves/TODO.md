# Leaves Subsystem QA Testing - TODO

## Current Status
- [x] Analyze requirements and code
- [x] Create test plan
- [x] Get user approval

## Test Implementation Tasks
- [ ] Fix test file structure and remove merge conflicts
- [ ] Set up proper mocks for all dependencies
- [ ] Implement Standard Submission/Approval tests
- [ ] Implement Unpaid Leave Conversion tests
- [ ] Implement Administrative Adjustments tests
- [ ] Implement Encashment Limit tests
- [ ] Run tests and verify results
- [ ] Document test results and any issues

## Test Scenarios Details

### 1. Standard Submission/Approval
- Test submitRequest with sufficient balance (BR 31)
- Test submitRequest with insufficient balance (BR 29)
- Test processReview approval by manager
- Test processReview approval by HR
- Test processReview rejection
- Test integration triggers on approval

### 2. Unpaid Leave Conversion
- Test excess days conversion when balance exceeded but some remains
- Test strict block when balance is zero
- Test HR flagging for conversion

### 3. Administrative Adjustments
- Test manualAdjustBalance with valid data
- Test audit trail creation
- Test balance updates
- Test error handling for missing justification

### 4. Encashment Limit
- Test processFinalSettlement with days under 30 cap
- Test processFinalSettlement with days over 30 cap (BR 53)
- Test payroll integration
- Test balance updates after encashment

## Dependencies to Mock
- 8 Mongoose Models: LeaveRequest, LeaveEntitlement, LeavePolicy, LeaveAdjustment, LeaveType, LeaveCategory, Calendar, Attachment
- 3 External Services: TimeManagementService, PayrollExecutionService, EmployeeProfileService
- 1 Internal Service: NotificationService
