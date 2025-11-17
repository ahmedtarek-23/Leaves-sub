# Attendance Module - Member 2

## Overview
Core attendance tracking module responsible for employee clock-in/out operations and attendance status management.

## Endpoints

### POST /attendance/clock-in
Records employee clock-in with automatic validation and status determination.

**Request Body:**
```json
{
  "employeeId": "EMP-001",
  "timestamp": "2025-11-16T09:05:00.000Z"  // optional, defaults to current time
}
```

**Response:**
```json
{
  "employeeId": "EMP-001",
  "date": "2025-11-16T00:00:00.000Z",
  "clockIn": "2025-11-16T09:05:00.000Z",
  "shiftId": "SHIFT-001",
  "status": "present",
  "lateMinutes": 0,
  "shortTimeMinutes": 0,
  "notes": "On time",
  "_id": "...",
  "createdAt": "...",
  "updatedAt": "..."
}
```

**Status Codes:**
- `201 Created` - Successful clock-in
- `400 Bad Request` - Validation error (terminated, on leave, rest day, duplicate)
- `404 Not Found` - Employee or shift assignment not found

---

### POST /attendance/clock-out
Records employee clock-out with short-time detection.

**Request Body:**
```json
{
  "employeeId": "EMP-001",
  "timestamp": "2025-11-16T17:00:00.000Z"  // optional, defaults to current time
}
```

**Response:**
```json
{
  "employeeId": "EMP-001",
  "date": "2025-11-16T00:00:00.000Z",
  "clockIn": "2025-11-16T09:05:00.000Z",
  "clockOut": "2025-11-16T17:00:00.000Z",
  "shiftId": "SHIFT-001",
  "status": "present",
  "lateMinutes": 0,
  "shortTimeMinutes": 0,
  "notes": "Completed full shift",
  "_id": "...",
  "createdAt": "...",
  "updatedAt": "..."
}
```

**Status Codes:**
- `200 OK` - Successful clock-out
- `400 Bad Request` - Must clock in first or already clocked out
- `404 Not Found` - Employee or attendance record not found

---

## Business Rules

### Attendance Status Logic
1. **Present** - Clocked in within grace period, completed full shift
2. **Late** - Clocked in after shift start time + grace period
3. **Short-time** - Clocked out before shift end time
4. **Absent** - No clock-in record (status available in schema)
5. **Pending** - Default status (not yet clocked in)

### Lateness Calculation
- Calculated as: `clockInTime - shiftStartTime` (in minutes)
- Grace period applied from shift configuration
- Only counted if clock-in exceeds `shiftStartTime + gracePeriod`

### Short-time Calculation
- Calculated as: `shiftEndTime - clockOutTime` (in minutes)
- Applies even if employee was already late
- Notes field shows both late and short-time if applicable

### Overnight Shifts
- Automatically detected when `shift.shiftType === "overnight"`
- Shift end time calculated as next day
- Example: 22:00 - 06:00 = 22:00 today to 06:00 tomorrow

### Blocking Rules
Clock-in is **blocked** if:
1. Employee is terminated (found in `offboarding.json` with `effectiveDate <= today`)
2. Employee is on approved leave (found in `leaves.json` with `status="approved"` and date within range)
3. Day is a rest day (day name matches employee's shift assignment `restDays` array)
4. Employee already clocked in for the day

---

## Dependencies

### Input Data (from other modules/dummy data):

#### From Member 1 (Shifts Module):
- **shifts.json** - Shift definitions
  ```json
  {
    "shiftId": "SHIFT-001",
    "shiftName": "Morning Shift",
    "startTime": "09:00",
    "endTime": "17:00",
    "shiftType": "normal",
    "gracePeriodMinutes": 15
  }
  ```

- **shift-assignments.json** - Employee shift assignments
  ```json
  {
    "assignmentId": "ASSIGN-001",
    "employeeId": "EMP-001",
    "shiftId": "SHIFT-001",
    "startDate": "2025-01-01",
    "endDate": null,
    "restDays": ["Friday", "Saturday"]
  }
  ```

#### From Employee Profile Module:
- **employees.json** - Employee master data
  ```json
  {
    "employeeId": "EMP-001",
    "name": "Ahmed Ali"
  }
  ```

#### From Leaves Module:
- **leaves.json** - Approved leave records
  ```json
  {
    "employeeId": "EMP-001",
    "startDate": "2025-11-20",
    "endDate": "2025-11-22",
    "status": "approved"
  }
  ```

#### From Offboarding Module:
- **offboarding.json** - Terminated employees
  ```json
  {
    "employeeId": "EMP-999",
    "effectiveDate": "2025-10-01"
  }
  ```

### Output Data (used by other modules):

#### To Payroll Module:
- Attendance records with `lateMinutes` and `shortTimeMinutes` for penalty calculation
- Daily attendance status for salary calculations

#### To Leaves Module:
- Actual attendance records to cross-check with approved leaves

---

## Database Schema

**Collection:** `attendances`

**Fields:**
- `employeeId` (String, required, indexed) - Employee identifier
- `date` (Date, required, indexed) - Attendance date (normalized to 00:00:00)
- `clockIn` (Date, optional) - Actual clock-in timestamp
- `clockOut` (Date, optional) - Actual clock-out timestamp
- `shiftId` (String, required) - Reference to assigned shift
- `status` (String, required, enum, indexed) - Attendance status
  - Values: `present`, `late`, `absent`, `short-time`, `pending`
  - Default: `pending`
- `lateMinutes` (Number, default: 0) - Minutes late after grace period
- `shortTimeMinutes` (Number, default: 0) - Minutes left before shift end
- `notes` (String, optional) - Auto-generated attendance notes
- `createdAt` (Date, auto) - Record creation timestamp
- `updatedAt` (Date, auto) - Last update timestamp

**Indexes:**
- Compound unique index: `(employeeId, date)` - Prevents duplicate attendance per day
- Single field index: `employeeId` - Fast employee queries
- Single field index: `date` - Fast date queries
- Single field index: `status` - Fast status filtering

---

## File Structure

```
attendance/
├── dto/
│   ├── clock-in.dto.ts       # Clock-in request validation
│   └── clock-out.dto.ts      # Clock-out request validation
├── schemas/
│   └── attendance.schema.ts  # Mongoose schema definition
├── attendance.controller.ts  # REST API endpoints
├── attendance.service.ts     # Business logic
├── attendance.module.ts      # NestJS module configuration
└── README.md                 # This file
```

---

## Testing

### Prerequisites
1. MongoDB running (local or Atlas)
2. Dummy data files in `backend/dummy-data/`:
   - employees.json
   - leaves.json
   - offboarding.json
   - shifts.json
   - shift-assignments.json

### Test Cases

#### 1. Successful On-Time Clock-In
```bash
POST /attendance/clock-in
{
  "employeeId": "EMP-001",
  "timestamp": "2025-11-16T09:05:00.000Z"
}
# Expected: status="present", lateMinutes=0
```

#### 2. Late Clock-In
```bash
POST /attendance/clock-in
{
  "employeeId": "EMP-001",
  "timestamp": "2025-11-16T09:30:00.000Z"
}
# Expected: status="late", lateMinutes=30 (if grace is 15min)
```

#### 3. Blocked - Terminated Employee
```bash
POST /attendance/clock-in
{
  "employeeId": "EMP-999"
}
# Expected: 400 "Cannot record attendance for terminated employee"
```

#### 4. Blocked - On Approved Leave
```bash
POST /attendance/clock-in
{
  "employeeId": "EMP-001",
  "timestamp": "2025-11-20T09:00:00.000Z"
}
# Expected: 400 "Cannot clock in/out while on approved leave"
```

#### 5. Blocked - Rest Day
```bash
POST /attendance/clock-in
{
  "employeeId": "EMP-001"
  # Timestamp falls on Friday (rest day)
}
# Expected: 400 "Cannot clock in on rest day"
```

#### 6. Clock-Out with Short-time
```bash
POST /attendance/clock-out
{
  "employeeId": "EMP-001",
  "timestamp": "2025-11-16T16:00:00.000Z"
}
# Expected: status="short-time", shortTimeMinutes=60
```

---

## Integration Notes

### For Member 1 (Shifts):
- This module **reads** shift and shift-assignment data
- Ensure `shifts.json` and `shift-assignments.json` follow the expected format
- Field `gracePeriodMinutes` is required in shifts

### For Member 3 (Exceptions):
- Attendance records are available in MongoDB for correction requests
- Use attendance document `_id` for linking exception requests

### For Payroll:
- Query attendance records by `employeeId` and date range
- Fields `lateMinutes` and `shortTimeMinutes` ready for penalty calculations

---

## Milestone 1 Deliverables (Completed)

- ✅ Attendance schema
- ✅ Clock-in endpoint with full business logic
- ✅ Clock-out endpoint with full business logic
- ✅ Leave blocking logic
- ✅ Termination blocking logic
- ✅ Integration with all 5 dummy data files
- ✅ README documentation
