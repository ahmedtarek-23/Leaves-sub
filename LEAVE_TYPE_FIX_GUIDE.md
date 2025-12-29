# Fix for Leave Type Create/Update 404 Error

## Problem Summary
When trying to create or update a leave type, you get a 404 error: "Request failed with status code 404". This means the POST /leaves/types endpoint is not being found.

## Root Causes
The 404 error typically occurs due to one of these reasons:

1. **Backend server is not running** - The backend needs to be started on port 5000
2. **Backend didn't recompile** - Changes to the controller weren't compiled
3. **JWT token is missing or invalid** - The request doesn't have a valid authentication token
4. **User doesn't have MANAGE_LEAVES permission** - The HR Admin role needs this permission
5. **CORS issue** - The frontend and backend CORS configuration don't match

## Fixes Applied

### ✅ Backend Changes
1. Added a new `@Get()` endpoint to `/employee-profile` controller to list all employees
   - This endpoint returns a list of employees for dropdown menus
   - It uses the existing `searchEmployees()` service method

2. Verified that all required endpoints exist:
   - `POST /leaves/types` - Create leave type
   - `GET /leaves/types` - List leave types
   - `PUT /leaves/types/:id` - Update leave type
   - `GET /employee-profile` - List employees (NEW)
   - `GET /leaves/entitlements` - List entitlements
   - `PATCH /leaves/entitlements/:id` - Update entitlements

### ✅ Frontend Changes
1. Enhanced error logging in:
   - `admin/leaves/page.tsx` - Added emoji icons and detailed logging
   - `admin/leaves/entitlements/page.tsx` - Fixed employee data transformation
   - `services/leaves.service.ts` - Added logging to all API methods

2. Fixed employee dropdown in entitlements page:
   - Backend now returns employee data in correct format
   - Frontend transforms response to match `EmployeeOption` interface
   - Dropdown will now populate with employees when page loads

3. Added comprehensive API health check page at `/admin/api-check`

## How to Test and Verify

### Step 1: Ensure Backend is Running
```powershell
# Terminal 1 - Navigate to backend directory
cd backend

# Start the backend with watch mode (auto-recompiles)
npm run start:dev
```
You should see:
```
[Nest] 12345   - 12/27/2025, 10:30:45 AM     LOG [NestFactory] Starting Nest application...
```

### Step 2: Check API Health
1. Open browser and navigate to: `http://localhost:3000/admin/api-check`
2. Click "Run Health Check"
3. Review the results:
   - ✅ **basicConnectivity OK**: Backend is running
   - ✅ **leaveTypes SUCCESS**: POST /leaves/types endpoint exists and you're authenticated
   - ✅ **token FOUND**: Authentication token is valid
   - ✅ **employeeProfile SUCCESS**: Employee list endpoint works

### Step 3: Log In as HR Admin
1. Go to `/login` page
2. Log in with an HR Admin account
3. Verify you see the navigation menu with "HR Admin" section

### Step 4: Test Leave Type Creation
1. Navigate to `/admin/leaves` (Leave Configuration)
2. Click "Create Leave Type" button
3. Fill in the form:
   - Code: `AL`
   - Name: `Annual Leave`
   - Category ID: `ANNUAL` (or any valid ID)
   - Description: `Paid annual leave`
   - Paid: Yes
   - Deductible: Yes
   - Min Tenure: 0
   - Max Duration: 30
4. Click "Create"
5. Check the browser console (F12 → Console tab) for logs:
   - You should see: `🚀 Creating leave type with data: {...}`
   - Then: `✅ Leave type created successfully`

### Step 5: Test Leave Type Update
1. In the leave types table, click "Edit" on any leave type
2. Modify any field
3. Click "Update"
4. Check console for:
   - `🔄 Updating leave type: [id] {...}`
   - `✅ Leave type updated successfully`

### Step 6: Test Entitlements Dropdown
1. Navigate to `/admin/leaves/entitlements`
2. Click "Create Entitlement" button
3. Verify the "Employee" dropdown shows a list of employees
4. Select an employee
5. Select a leave type
6. Fill in entitlement values
7. Click "Create"

## Debugging Checklist

If you still see errors, go through this checklist:

- [ ] Backend is running on port 5000 (`npm run start:dev`)
- [ ] Backend console shows no compilation errors
- [ ] Browser console shows the API health check succeeds
- [ ] You are logged in as an HR Admin user
- [ ] Your user has the `MANAGE_LEAVES` permission
- [ ] Browser DevTools (F12) shows requests are going to `http://localhost:5000`
- [ ] Response status codes are checked:
  - `200` = Success (GET requests)
  - `201` = Created (POST requests)
  - `400` = Bad Request (check error message)
  - `401` = Unauthorized (log in again)
  - `403` = Forbidden (wrong permissions)
  - `404` = Not Found (backend route doesn't exist)

## Console Log Interpretation

When you open the browser console (F12 → Console tab), you'll see detailed logs:

### Successful Creation:
```
🚀 Creating leave type with data: {code: 'AL', name: 'Annual Leave', ...}
[Request log from axios service]
✅ Leave type created successfully
```

### Failed Request:
```
🚀 Creating leave type with data: {code: 'AL', name: 'Annual Leave', ...}
❌ Create type error details: {
  status: 404,
  message: "Cannot POST /leaves/types",
  data: {...}
}
```

## What Each Error Code Means

| Code | Meaning | Solution |
|------|---------|----------|
| 404 | Route not found | Backend not running or didn't recompile |
| 401 | Unauthorized | Log in again, token expired |
| 403 | Forbidden | User doesn't have MANAGE_LEAVES permission |
| 400 | Bad Request | Invalid data sent (check error message) |
| 500 | Server Error | Backend error - check backend console |

## Environment Variables

The frontend uses these environment variables:

```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000  # Default if not set
```

If you're running the backend on a different port or machine, create a `.env.local` file:

```bash
# frontend/.env.local
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

## Common Issues & Solutions

### Issue: "CORS policy: Cross origin requests are blocked"
**Solution**: Backend CORS is not configured correctly. Verify in `backend/src/main.ts`:
```typescript
app.enableCors({
  origin: 'http://localhost:3000',
  credentials: true,
});
```

### Issue: "401 Unauthorized"
**Solution**: 
1. Check that token is in localStorage: `localStorage.getItem('access_token')`
2. Log out and log in again to get a fresh token
3. Verify the token is included in request headers: `Authorization: Bearer [token]`

### Issue: "Cannot POST /leaves/types" (404)
**Solution**:
1. Make sure backend is running: `netstat -ano | findstr :5000`
2. Check backend console for compilation errors
3. Verify the route exists in `backend/src/leaves/leaves.controller.ts`
4. Try visiting the API health check page

### Issue: "400 Bad Request: Code is required"
**Solution**: The endpoint exists but the data is invalid. Check the error message for missing required fields.

## Next Steps

1. ✅ Start backend: `npm run start:dev`
2. ✅ Visit health check page: `http://localhost:3000/admin/api-check`
3. ✅ Verify all checks pass
4. ✅ Log in as HR Admin
5. ✅ Navigate to `/admin/leaves`
6. ✅ Try creating a leave type
7. ✅ Check browser console for detailed logs

If you still have issues, provide:
- Screenshots of browser console errors
- Backend server output (npm run start:dev)
- Network tab in DevTools showing the failed request
- The exact error message displayed
