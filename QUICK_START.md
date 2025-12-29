# Quick Start Guide - Fixed Leave Type & Entitlements

## Prerequisites
- Node.js installed
- MongoDB Atlas connection (should already be configured)
- Both backend and frontend directories with package.json

## Step 1: Start Backend Server

```bash
# Terminal 1
cd backend
npm run start:dev
```

Expected output:
```
[Nest] 12345   - 12/27/2025, 10:30:45 AM     LOG [NestFactory] Starting Nest application...
[Nest] 12345   - 12/27/2025, 10:30:46 AM     LOG [InstanceLoader] MongooseModule dependencies initialized
[Nest] 12345   - 12/27/2025, 10:30:46 AM     LOG [RoutesResolver] LeaveController {/leaves}: routes registered
[Nest] 12345   - 12/27/2025, 10:30:46 AM     LOG [NestApplication] Nest application successfully started on [::1]:5000
```

✅ Backend is ready when you see: "successfully started on...5000"

## Step 2: Start Frontend Server

```bash
# Terminal 2 (new terminal window)
cd frontend
npm run dev
```

Expected output:
```
  ▲ Next.js 16.0.7
  - Local:        http://localhost:3000
  - Environments: .env.local

ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

✅ Frontend is ready when you see the "ready" message

## Step 3: Verify Connectivity

1. Open browser: `http://localhost:3000/admin/api-check`
2. Click "Run Health Check"
3. Verify these show ✅:
   - `basicConnectivity`: OK
   - `apiBaseURL`: http://localhost:5000
   - `token`: FOUND or NOT FOUND (OK if not logged in yet)
   - `leaveTypes`: SUCCESS
   - `employeeProfile`: SUCCESS

If all show ✅, skip to Step 5

## Step 4: Log In (if needed)

1. Go to: `http://localhost:3000/login`
2. Log in with HR Admin credentials
3. You should be redirected to the dashboard
4. Run the health check again - token should now show "FOUND"

## Step 5: Create Your First Leave Type

1. Navigate to: `http://localhost:3000/admin/leaves`
2. Click "Create Leave Type" button
3. Fill in the form:
   - Code: `AL`
   - Name: `Annual Leave`
   - Category ID: `ANNUAL`
   - Description: `Annual paid leave`
   - Paid: Yes (checked)
   - Deductible: Yes (checked)
   - Min Tenure: 0
   - Max Duration: 30
4. Click "Create" button

Expected result:
- Green toast notification: "Leave type created successfully"
- New row appears in the table below

Check browser console (F12 → Console):
```
🚀 Creating leave type with data: {code: 'AL', name: 'Annual Leave', ...}
✅ Leave type created successfully
```

## Step 6: Update an Existing Leave Type

1. Still on `/admin/leaves` page
2. Find the leave type you just created in the table
3. Click the "Edit" button in that row
4. Change the Name to: `Annual Leave - 30 Days`
5. Click "Update" button

Expected result:
- Green toast notification: "Leave type updated successfully"
- Table updates to show new name

Check browser console:
```
🔄 Updating leave type: [id] {code: 'AL', name: 'Annual Leave - 30 Days', ...}
✅ Leave type updated successfully
```

## Step 7: Create an Entitlement

1. Navigate to: `http://localhost:3000/admin/leaves/entitlements`
2. Click "Create Entitlement" button
3. Select from dropdowns:
   - Employee: (should show list of employees)
   - Leave Type: (should show "Annual Leave")
4. Fill in:
   - Yearly Entitlement: 20
   - Accrued Days: 0
   - Carry Forward: 2
5. Click "Create" button

Expected result:
- Green toast notification: "Entitlement created successfully"
- New row appears in the entitlements table

Check browser console:
```
🚀 Creating entitlement: {employeeId: '...', leaveTypeId: '...', ...}
✅ Entitlement created: {...}
```

## Troubleshooting

### Backend shows compilation errors
```
error TS2304: Cannot find name 'CreateLeaveTypeDto'
```
**Fix**: Make sure you did a full clean restart:
1. Stop backend (Ctrl+C)
2. Delete `node_modules` and `dist` folders
3. Run `npm install` again
4. Run `npm run start:dev`

### "Cannot POST /leaves/types" (404)
1. Check backend is still running
2. Look for red "error" messages in backend console
3. Try restarting backend
4. Visit http://localhost:3000/admin/api-check and check status

### Dropdown shows "Loading" forever
1. Check browser console for errors (F12 → Console)
2. Check if you're logged in
3. Visit http://localhost:3000/admin/api-check to verify employee endpoint works
4. Check that employees exist in database

### "401 Unauthorized" error
1. You need to log in first
2. Go to http://localhost:3000/login
3. Log in with your HR Admin account
4. Try again

### "403 Forbidden" error
1. Logged-in user doesn't have MANAGE_LEAVES permission
2. Make sure you're logged in as HR Admin role
3. Contact system admin to assign MANAGE_LEAVES permission

## Commands Summary

```bash
# Backend
cd backend
npm run start:dev              # Start with auto-reload
npm run build                 # Build for production
npm test                      # Run tests

# Frontend
cd frontend
npm run dev                   # Start dev server with auto-reload
npm run build                 # Build for production
npm run lint                  # Check for code issues
```

## Useful Links

- Admin Dashboard: `http://localhost:3000/admin/leaves`
- Entitlements Page: `http://localhost:3000/admin/leaves/entitlements`
- API Health Check: `http://localhost:3000/admin/api-check`
- Backend API: `http://localhost:5000` (no UI, just API)

## What's New/Fixed

✅ Leave types can now be created and updated
✅ Entitlements dropdown shows list of employees
✅ Detailed error messages and logging
✅ API health check page for diagnostics
✅ Employee list endpoint added to backend
✅ Comprehensive troubleshooting guides

## Next Steps

1. Create more leave types (Sick Leave, Personal Leave, etc.)
2. Create entitlements for employees
3. Test leave request submission on employee dashboard
4. Configure leave policies and rules
5. Set up leave calendar and holidays

## Getting Help

If you encounter issues:

1. Check the browser console (F12 → Console tab)
2. Look for emoji-marked logs:
   - 🚀 = Action started
   - ✅ = Success
   - ❌ = Error
   - 📋 = Information
3. Run the API health check: `http://localhost:3000/admin/api-check`
4. Refer to `LEAVE_TYPE_FIX_GUIDE.md` for detailed troubleshooting

Enjoy your HR system! 🎉
