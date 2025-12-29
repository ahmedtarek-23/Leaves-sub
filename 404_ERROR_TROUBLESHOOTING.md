## 404 Error Troubleshooting Guide

### Issue Summary
You're receiving a 404 error when calling the `/leaves/types` endpoint from the frontend.

### Root Causes (in order of likelihood):
1. **Backend server not running** - The NestJS server on port 5000 is not active
2. **RolesGuard rejecting request** - Missing JWT token or insufficient permissions
3. **CORS issues** - Frontend origin not whitelisted
4. **Wrong base URL** - Environment variable not set correctly
5. **Route not registered** - Controller method missing

---

## Checklist to Fix

### 1. Verify Backend is Running
```bash
# Check if NestJS server is listening on port 5000
netstat -ano | findstr :5000

# Expected output: Should show a process listening on port 5000
# If not, restart the backend:
cd backend
npm run start:dev
```

### 2. Check Browser Console Logs
The updated error handling will now log detailed information:
```
{
  status: 404,
  statusText: "Not Found",
  url: "/leaves/types",
  baseURL: "http://localhost:5000",
  message: "Request failed with status code 404",
  responseData: { message: "..." }
}
```

### 3. Verify JWT Token Exists
- Open Browser DevTools → Application → LocalStorage
- Look for `access_token` key
- If missing, you're not authenticated
- **Solution**: Log in first before accessing admin pages

### 4. Check User Role & Permissions
The error might actually be a **403 Forbidden** disguised as 404:
- Ensure logged-in user is HR_ADMIN role
- HR_ADMIN has `MANAGE_LEAVES` permission required for create/update
- View roles in localStorage `access_token` JWT payload

### 5. Verify Backend Routes
```typescript
// src/leaves/leaves.controller.ts should have:
@Controller('leaves')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeaveController {
  
  @Get('types')
  listTypes() { ... }
  
  @Post('types')
  @Permissions(Permission.MANAGE_LEAVES)
  createType(@Body() dto: CreateLeaveTypeDto) { ... }
  
  @Put('types/:id')
  @Permissions(Permission.MANAGE_LEAVES)
  updateType(@Param('id') id: string, @Body() dto: UpdateLeaveTypeDto) { ... }
}
```

### 6. Verify Axios Configuration
```typescript
// src/lib/api.ts
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5000",
  withCredentials: true,
});
```

Check `.env.local`:
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

### 7. Check CORS Configuration
```typescript
// backend/src/main.ts
app.enableCors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

---

## Step-by-Step Fix Process

### Step 1: Verify Both Servers Running
```bash
# Terminal 1: Backend
cd c:\Users\mazen\Downloads\Leaves\Leaves\Leaves-sub\backend
npm run start:dev

# Terminal 2: Frontend
cd c:\Users\mazen\Downloads\Leaves\Leaves\Leaves-sub\frontend
npm run dev
```

### Step 2: Open Browser DevTools
- Press F12 or Ctrl+Shift+I
- Go to Console tab
- Go to Network tab

### Step 3: Log In First
1. Navigate to `http://localhost:3000/login`
2. Log in with HR_ADMIN credentials
3. Check LocalStorage for `access_token`

### Step 4: Navigate to Admin Page
1. Go to `http://localhost:3000/admin/leaves`
2. Check Network tab for API calls
3. Look for `/leaves/types` request
4. Click it and check:
   - **Status Code** (should be 200, not 404)
   - **Request Headers** (should have `Authorization: Bearer <token>`)
   - **Response** (should show leave types array)

### Step 5: Check Console Logs
Look for our detailed error logging output that shows:
```
{
  status: [HTTP status],
  message: [Error message],
  url: [Request URL],
  baseURL: [API base URL]
}
```

---

## Common Solutions

### If Backend Not Running
```bash
npm run start:dev
# Wait for: "Nest running on http://localhost:5000  🚀"
```

### If No JWT Token
- Log out: Clear localStorage
- Log back in with correct credentials
- Verify login was successful

### If Wrong Base URL
Update `.env.local`:
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```
Then restart frontend: `npm run dev`

### If 403 Forbidden (Disguised as 404)
- Ensure user role is HR_ADMIN
- Check JWT payload for `role: "HR_ADMIN"`
- Verify `MANAGE_LEAVES` permission in ROLE_PERMISSIONS

### If Still Getting 404
Enable backend logging to see what route is being hit:
```typescript
// In leaves.controller.ts, add at class level:
constructor(private readonly leavesService: LeaveService) {
  console.log('LeaveController initialized with routes: GET /leaves/types, etc.');
}
```

---

## Testing the API Directly

Use curl or Postman to test:
```bash
# Get access token (after logging in, copy from localStorage)
TOKEN="your_jwt_token_here"

# Test the endpoint
curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:5000/leaves/types

# Should return 200 with array of leave types
```

---

## Summary of Changes Made

✅ Added comprehensive error logging to `leavesService`
✅ Enhanced error handling in admin page with detailed messages
✅ All API calls now log: status, URL, baseURL, and response data
✅ Toast errors now show specific error messages from backend
✅ Console errors show full diagnostic information

Now when you get an error, check the browser console and you'll see exactly what went wrong!
