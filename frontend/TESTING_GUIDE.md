# Leaves Frontend Testing Guide

## Prerequisites

1. **Install Dependencies** (if not already installed):
   ```bash
   cd frontend
   npm install
   ```

2. **Backend Setup**:
   - Ensure your backend is running on `http://localhost:3000` (or update `NEXT_PUBLIC_API_URL` in `.env.local`)
   - Backend should have the leaves endpoints implemented

## Quick Start

### 1. Start Development Server

```bash
cd frontend
npm run dev
```

The frontend will be available at: `http://localhost:3001` (or the port shown in terminal)

### 2. Access the Leaves Module

Navigate to: `http://localhost:3001/leaves/dashboard`

## Testing Checklist

### ✅ Authentication & Role-Based Access

1. **Test Employee Role**:
   - Open browser DevTools → Application → Local Storage
   - Set user data:
     ```json
     {
       "userId": "1",
       "email": "employee@example.com",
       "role": "department employee",
       "employeeId": "emp1"
     }
     ```
   - Refresh page
   - Verify: Dashboard, New Request, History tabs are visible
   - Verify: Approvals, HR Review, Policies tabs are hidden

2. **Test Manager Role**:
   - Update localStorage with:
     ```json
     {
       "userId": "2",
       "email": "manager@example.com",
       "role": "department head",
       "employeeId": "mgr1"
     }
     ```
   - Verify: Approvals tab appears
   - Verify: Can access `/leaves/approvals`

3. **Test HR Admin Role**:
   - Update localStorage with:
     ```json
     {
       "userId": "3",
       "email": "hr@example.com",
       "role": "HR Admin",
       "employeeId": "hr1"
     }
     ```
   - Verify: All tabs visible (Review, Policies, Adjustments, Year-End, Offboarding)

### ✅ Leave Dashboard (`/leaves/dashboard`)

**Test Cases:**
- [ ] Page loads without errors
- [ ] Summary cards display (Accrued, Used, Remaining, Pending)
- [ ] Leave balance table displays correctly
- [ ] Quick action buttons work:
  - [ ] "Request Leave" → navigates to `/leaves/requests/new`
  - [ ] "View History" → navigates to `/leaves/history`
  - [ ] "Pending Approvals" (Manager) → navigates to `/leaves/approvals`
  - [ ] "HR Review" (HR) → navigates to `/leaves/review`
- [ ] Loading state shows while fetching data
- [ ] Error message displays if API fails

**Expected Behavior:**
- Shows current leave balances
- Real-time updates after actions
- Responsive layout on mobile/tablet

### ✅ New Leave Request (`/leaves/requests/new`)

**Test Cases:**
- [ ] Form loads with leave type dropdown
- [ ] Date pickers work correctly
- [ ] Start date cannot be in the past
- [ ] End date cannot be before start date
- [ ] Duration calculates automatically
- [ ] Validation shows errors for:
  - [ ] Missing required fields
  - [ ] Invalid date ranges
  - [ ] Insufficient balance
- [ ] Submit button disabled during validation/loading
- [ ] Success: Redirects to dashboard after submission
- [ ] Error: Shows error message on failure

**Test Scenarios:**
1. **Valid Request**:
   - Select leave type
   - Choose future dates
   - Add justification
   - Submit → Should succeed

2. **Invalid Request**:
   - Try to submit without dates → Should show error
   - Try past dates → Should be blocked
   - Try dates with insufficient balance → Should warn

3. **Post-Leave Submission**:
   - Check "Post-leave submission" checkbox
   - Submit → Should allow within grace period

### ✅ Leave History (`/leaves/history`)

**Test Cases:**
- [ ] Table displays all leave requests
- [ ] Filters work:
  - [ ] Status filter (Pending, Approved, Rejected, Cancelled)
  - [ ] Date range filters
  - [ ] Clear filters button resets
- [ ] Status badges display correctly
- [ ] Clicking a request navigates to detail page
- [ ] Empty state shows when no requests

### ✅ Manager Approvals (`/leaves/approvals`)

**Test Cases:**
- [ ] Only visible to managers
- [ ] Shows pending requests from team members
- [ ] Employee balance snapshot displays
- [ ] Approval panel shows workflow steps
- [ ] Can approve with comments
- [ ] Can reject with mandatory reason
- [ ] Modal forms work correctly
- [ ] After approval/rejection, request updates
- [ ] Escalation warning shows after 48 hours

**Test Flow:**
1. As Employee: Submit a leave request
2. As Manager: Go to Approvals page
3. Select the request
4. Approve with comment → Should update status
5. Verify: Request shows as approved in history

### ✅ HR Review (`/leaves/review`)

**Test Cases:**
- [ ] Only visible to HR roles
- [ ] Shows manager-approved requests
- [ ] Filter tabs work (Pending, Flagged, All)
- [ ] Can approve/reject/override
- [ ] Medical verification buttons work (for medical leaves)
- [ ] Flagging system works (Low/Medium/High priority)
- [ ] Override requires justification

### ✅ Policy Configuration (`/leaves/policies`)

**Test Cases:**
- [ ] Only visible to Admin/HR Manager
- [ ] Leave Types tab:
  - [ ] Table displays all leave types
  - [ ] Can create new leave type
  - [ ] Can edit existing type
  - [ ] Can activate/deactivate types
- [ ] Policies tab:
  - [ ] Table displays all policies
  - [ ] Can create new policy
  - [ ] Can edit existing policy
- [ ] Form validation works
- [ ] Success/error messages display

### ✅ Manual Adjustments (`/leaves/adjustments`)

**Test Cases:**
- [ ] Only visible to HR
- [ ] Form requires all fields
- [ ] Justification is mandatory
- [ ] Can adjust balance (positive/negative)
- [ ] Audit log displays:
  - [ ] Timestamp
  - [ ] User who made adjustment
  - [ ] Reason/justification
- [ ] Success message after adjustment

### ✅ Year-End Processing (`/leaves/year-end`)

**Test Cases:**
- [ ] Only visible to Admin
- [ ] Can select fiscal year
- [ ] Preview shows:
  - [ ] Carried forward days
  - [ ] Expired days
  - [ ] Encashment calculation
- [ ] Process button works
- [ ] Confirmation dialog appears
- [ ] Success message after processing

### ✅ Offboarding (`/leaves/offboarding`)

**Test Cases:**
- [ ] Only visible to HR
- [ ] Can search by employee ID
- [ ] Displays remaining balances
- [ ] Encashment calculation shows:
  - [ ] Eligible days (capped at 30)
  - [ ] Daily salary rate
  - [ ] Total encashment amount
- [ ] Process encashment button works
- [ ] Locked state prevents actions after termination

### ✅ Request Details (`/leaves/requests/[id]`)

**Test Cases:**
- [ ] Displays all request information
- [ ] Status badge shows current status
- [ ] Approval workflow visible
- [ ] Attachments section (if applicable)
- [ ] Cancel button (if pending and owner)
- [ ] Rejection reason displays (if rejected)
- [ ] Back button navigates correctly

## API Testing (Backend Integration)

### Mock Mode (Current)

The frontend currently uses mock data when backend is unavailable. To test with real backend:

1. **Set API URL**:
   Create `frontend/.env.local`:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   ```

2. **Backend Endpoints Required**:
   - `GET /api/leaves/balances/:employeeId` - Get leave balances
   - `GET /api/leaves/request` - Get leave requests
   - `POST /api/leaves/request` - Create leave request
   - `PUT /api/leaves/request/:id/review` - Review request
   - `GET /api/leaves/types` - Get leave types
   - `POST /api/leaves/types` - Create leave type
   - And more... (see `frontend/src/services/leaves.service.ts`)

3. **Authentication**:
   - Backend should accept JWT in `Authorization: Bearer <token>` header
   - Or use cookies with `withCredentials: true`

## Common Issues & Solutions

### Issue: "Cannot find module" errors
**Solution**: Run `npm install` in the frontend directory

### Issue: TypeScript errors
**Solution**: 
```bash
cd frontend
npm run build
```
Check the errors and fix type mismatches

### Issue: API calls failing
**Solution**: 
1. Check backend is running
2. Verify `NEXT_PUBLIC_API_URL` is correct
3. Check CORS settings on backend
4. Verify JWT token is valid

### Issue: Role-based access not working
**Solution**: 
1. Check localStorage has correct user data
2. Verify role matches SystemRole enum values
3. Check AuthContext is wrapping the app (see `app/layout.tsx`)

### Issue: Styling not working
**Solution**: 
1. Ensure Tailwind CSS is configured
2. Check `postcss.config.mjs` exists
3. Verify `globals.css` imports Tailwind

## Browser Testing

Test in multiple browsers:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if on Mac)

Test responsive design:
- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

## Performance Testing

1. **Load Time**: Check initial page load
2. **API Calls**: Monitor network tab for unnecessary requests
3. **Re-renders**: Use React DevTools to check component renders
4. **Memory**: Check for memory leaks with long sessions

## Automated Testing (Future)

Consider adding:
- Unit tests with Jest + React Testing Library
- Integration tests for API calls
- E2E tests with Playwright or Cypress

## Test Data Setup

For comprehensive testing, you may want to seed:
- Multiple leave types
- Sample leave requests in various states
- Employee with different balances
- Manager with pending approvals
- HR user for review testing

## Next Steps

1. ✅ Run `npm run dev` to start frontend
2. ✅ Test each page manually
3. ✅ Verify role-based access
4. ✅ Test form validations
5. ✅ Connect to real backend API
6. ✅ Test end-to-end workflows
7. ✅ Add automated tests (optional)

---

**Need Help?** Check the console for errors and network tab for API issues.

