# 🧪 Testing Your Leaves Frontend - Quick Start

## 🚀 Step 1: Start the Development Server

```bash
cd frontend
npm install  # Only if you haven't already
npm run dev
```

The frontend will start at: **http://localhost:3001** (or check the terminal for the actual port)

## 🎯 Step 2: Access the Application

1. Open your browser and go to: `http://localhost:3001/leaves/dashboard`

2. **OR** use the auth helper: `http://localhost:3001/test-auth.html`
   - This page lets you quickly switch between user roles
   - Click a role button to set your user and redirect

## 👤 Step 3: Test Different User Roles

### Option A: Using the Auth Helper Page
1. Go to `http://localhost:3001/test-auth.html`
2. Click a role button (Employee, Manager, HR Admin, System Admin)
3. You'll be redirected to the dashboard with that role

### Option B: Using Browser Console
Open DevTools (F12) → Console, then run:

**As Employee:**
```javascript
localStorage.setItem('user', JSON.stringify({
  userId: '1',
  email: 'employee@test.com',
  role: 'department employee',
  employeeId: 'emp1'
}));
location.reload();
```

**As Manager:**
```javascript
localStorage.setItem('user', JSON.stringify({
  userId: '2',
  email: 'manager@test.com',
  role: 'department head',
  employeeId: 'mgr1'
}));
location.reload();
```

**As HR Admin:**
```javascript
localStorage.setItem('user', JSON.stringify({
  userId: '3',
  email: 'hr@test.com',
  role: 'HR Admin',
  employeeId: 'hr1'
}));
location.reload();
```

## ✅ Quick Test Checklist

### As Employee:
- [ ] **Dashboard** (`/leaves/dashboard`) - See leave balances
- [ ] **New Request** (`/leaves/requests/new`) - Submit a leave request
- [ ] **History** (`/leaves/history`) - View your leave history
- [ ] **Request Details** - Click on any request to see details

### As Manager:
- [ ] **Approvals** (`/leaves/approvals`) - See pending requests from team
- [ ] Approve a request with comments
- [ ] Reject a request with reason
- [ ] View employee balance snapshot

### As HR Admin:
- [ ] **HR Review** (`/leaves/review`) - Review manager-approved requests
- [ ] **Policies** (`/leaves/policies`) - Configure leave types and policies
- [ ] **Adjustments** (`/leaves/adjustments`) - Manually adjust balances
- [ ] **Year-End** (`/leaves/year-end`) - Process year-end
- [ ] **Offboarding** (`/leaves/offboarding`) - Calculate final settlement

## 🔍 What to Check

### ✅ Functionality
- All pages load without errors
- Navigation works between pages
- Forms validate input correctly
- Buttons and actions work
- Role-based access is enforced (tabs show/hide based on role)

### ✅ UI/UX
- Loading states appear during API calls
- Error messages display when something fails
- Empty states show when no data
- Responsive design works on different screen sizes
- Status badges show correct colors

### ✅ Data Flow
- Dashboard shows balances
- Submitting a request updates the list
- Approvals reflect status changes
- History filters work correctly

## 🐛 Troubleshooting

### Issue: Pages show 404
**Fix:** Make sure you're using the correct routes:
- `/leaves/dashboard` (not `/leaves/balances`)
- `/leaves/requests/new` (not `/leaves/new`)

### Issue: "Cannot read property" errors
**Fix:** Check that user is set in localStorage. Use the auth helper page or console commands above.

### Issue: API calls failing
**Fix:** 
- The frontend uses mock data by default if backend is unavailable
- To use real backend, set `NEXT_PUBLIC_API_URL` in `.env.local`
- Make sure backend CORS allows frontend origin

### Issue: TypeScript errors
**Fix:** Run `npm run build` to see all errors, then fix them.

### Issue: Styling looks broken
**Fix:** 
- Check that Tailwind CSS is working
- Verify `postcss.config.mjs` exists
- Check browser console for CSS errors

## 📝 Testing Workflow Example

1. **Start as Employee:**
   - Set employee role
   - Submit a leave request
   - Check it appears in history

2. **Switch to Manager:**
   - Set manager role
   - Go to Approvals
   - Approve the request you just created

3. **Switch to HR:**
   - Set HR Admin role
   - Go to HR Review
   - See the approved request
   - Final approve it

4. **Test Admin Features:**
   - Go to Policies
   - Create/edit a leave type
   - Go to Adjustments
   - Adjust an employee's balance
   - Check audit log

## 🔗 Important URLs

- **Dashboard:** `http://localhost:3001/leaves/dashboard`
- **New Request:** `http://localhost:3001/leaves/requests/new`
- **History:** `http://localhost:3001/leaves/history`
- **Approvals:** `http://localhost:3001/leaves/approvals` (Manager only)
- **HR Review:** `http://localhost:3001/leaves/review` (HR only)
- **Policies:** `http://localhost:3001/leaves/policies` (Admin only)
- **Auth Helper:** `http://localhost:3001/test-auth.html`

## 📚 More Details

For comprehensive testing guide, see:
- `frontend/TESTING_GUIDE.md` - Full testing documentation
- `frontend/test-leaves.md` - Quick test script

## 🎉 Success Criteria

Your frontend is working correctly if:
- ✅ All pages load without errors
- ✅ Role-based navigation works
- ✅ Forms submit successfully
- ✅ Data displays correctly
- ✅ No console errors (except expected API errors if backend is down)
- ✅ UI is responsive and looks good

---

**Ready to test?** Start the dev server and open `http://localhost:3001/test-auth.html` to begin!

