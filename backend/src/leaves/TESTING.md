# Leaves Module Testing Documentation

## Overview

This document describes the comprehensive test suite for the Leaves module backend. The tests cover business rules, RBAC, edge cases, and auditability as defined in the project requirements.

## Test Structure

### Unit Tests

#### `leaves.service.comprehensive.spec.ts`
Comprehensive unit tests for `LeavesService` covering:
- Leave Request Lifecycle (REQ-015, REQ-017)
  - Creating leave requests with sufficient balance
  - Handling excess days with HR conversion flag
  - Rejecting requests with zero balance
  - Updating PENDING requests
  - Preventing updates to APPROVED/REJECTED requests
- Leave Calendar Management (REQ-010)
  - Adding holidays and blocked periods
  - Overlap validation
  - Rejecting leave requests on blocked dates
- Leave Type & Category Management (REQ-011)
  - CRUD operations
  - Referential integrity checks
  - Preventing deletion when referenced
- Manager Delegation (REQ-023)
  - Creating delegations
  - Overlap validation
  - Checking approval permissions
- Accrual & Unpaid Leave (REQ-042)
  - Detecting unpaid leave periods
  - Skipping accrual during unpaid leave
  - Creating accrual records
- Reset-Date Policy (REQ-012)
  - Yearly and custom reset policies
  - Calculating next reset dates

#### `leaves.edge-cases.spec.ts`
Edge case tests covering:
- Calendar edge cases (non-existent calendars, partial overlaps)
- Delegation edge cases (same dates, exact boundaries)
- Leave type/category edge cases (zero references, name updates)
- Leave request update edge cases (date-only updates, non-existent requests)
- Accrual edge cases (no unpaid types, multiple periods)
- Reset policy edge cases (past dates, updating existing policies)

#### `notification.service.spec.ts`
Tests for `NotificationService` covering:
- Sending notifications via different channels (Email, SMS, In-App)
- Request submission notifications (REQ-019)
- Approval/rejection notifications (REQ-024)
- Year-end processing notifications (REQ-030)
- Notification logging
- Mock email/SMS providers

### Integration/E2E Tests

#### `test/leaves.controller.e2e.spec.ts`
End-to-end tests for `LeavesController` covering:
- **RBAC & Authorization (REQ-002, REQ-014)**
  - EMPLOYEE role permissions
    - Can create leave requests
    - Can edit PENDING requests
    - Cannot approve or configure
  - MANAGER role permissions
    - Can approve/reject requests
    - Cannot modify policies or calendars
  - HR_ADMIN role permissions
    - Full access to configuration
    - Can manage types, categories, calendars
    - Can adjust balances
- **Leave Request Lifecycle**
  - Creating requests
  - Editing PENDING requests
  - Preventing edits after approval
  - Audit log creation
- **Leave Calendar Management (REQ-010)**
  - Creating blocked periods
  - Rejecting overlapping periods
  - Rejecting leave requests on blocked dates
- **Leave Type & Category Management (REQ-011)**
  - CRUD operations
  - Preventing deletion when referenced
- **Manager Delegation (REQ-023)**
  - Creating delegations
  - Rejecting overlapping delegations
  - Checking approval permissions
- **Accrual & Unpaid Leave (REQ-042)**
  - Skipping accrual during unpaid leave
  - Creating accrual records
  - Retrieving accrual history
- **Notifications (REQ-019, REQ-024, REQ-030)**
  - Request submission notifications
  - Approval notifications
  - Rejection notifications

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Unit Tests Only
```bash
npm test -- leaves.service.comprehensive.spec
npm test -- leaves.edge-cases.spec
npm test -- notification.service.spec
```

### Run E2E Tests
```bash
npm run test:e2e -- leaves.controller.e2e.spec
```

### Run with Coverage
```bash
npm run test:cov
```

### Run Specific Test Suite
```bash
npm test -- --testNamePattern="RBAC"
npm test -- --testNamePattern="Leave Request Lifecycle"
```

## Test Coverage

### Business Rules Covered

1. **REQ-002, REQ-014**: RBAC and Authorization
   - Role-based access control
   - Permission validation
   - 403 Forbidden for unauthorized actions

2. **REQ-010**: Leave Calendar Management
   - Holiday and blocked period CRUD
   - Overlap validation
   - Blocked date rejection

3. **REQ-011**: Leave Type & Category Management
   - CRUD operations
   - Referential integrity
   - Deletion prevention

4. **REQ-012**: Reset-Date Policy
   - Yearly and custom reset dates
   - Next reset date calculation

5. **REQ-015**: Leave Request Submission
   - Balance validation
   - HR conversion flagging
   - Status management

6. **REQ-017**: Edit Pending Requests
   - PENDING-only updates
   - Audit logging
   - State transition prevention

7. **REQ-019, REQ-024, REQ-030**: Notifications
   - Request submission
   - Approval/rejection
   - Year-end processing
   - Notification logging

8. **REQ-023**: Manager Delegation
   - Delegation creation
   - Overlap validation
   - Approval permissions

9. **REQ-042**: Accrual & Unpaid Leave
   - Unpaid leave detection
   - Accrual skipping
   - History tracking

## Mocking Strategy

### Models
All Mongoose models are mocked using `getModelToken()` to avoid database dependencies in unit tests.

### Services
External services (TimeManagementService, EmployeeProfileService, PayrollExecutionService) are mocked.

### Guards
JWT and Roles guards are mocked in E2E tests to simulate different user roles.

## Test Data

### Mock Users
- **Employee**: `DEPARTMENT_EMPLOYEE` role with `REQUEST_LEAVE` permission
- **Manager**: `DEPARTMENT_HEAD` role with `APPROVE_LEAVES` permission
- **HR Admin**: `HR_ADMIN` role with `MANAGE_LEAVES` permission

### Mock IDs
- Employee IDs, Manager IDs, Leave Type IDs, Category IDs are generated using `Types.ObjectId()`

## Best Practices

1. **Isolation**: Each test is isolated and doesn't depend on other tests
2. **Cleanup**: `afterEach` hooks clear all mocks
3. **Descriptive Names**: Test names clearly describe what is being tested
4. **Edge Cases**: Comprehensive edge case coverage
5. **RBAC**: All authorization scenarios are tested
6. **Audit**: Audit logging is verified for all state changes

## Continuous Integration

These tests should be run in CI/CD pipelines to ensure:
- All business rules are enforced
- RBAC is properly implemented
- Edge cases are handled
- No regressions are introduced

## Notes

- Tests use in-memory mocks to avoid database dependencies
- E2E tests require MongoDB connection (use test database)
- All async operations are properly awaited
- Error cases are thoroughly tested
- Success cases verify expected outcomes
