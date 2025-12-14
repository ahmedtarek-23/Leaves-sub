# Quick Test Script for Leaves Frontend

## Step 1: Start the Frontend

```bash
cd frontend
npm install  # If not done already
npm run dev
```

Open browser: `http://localhost:3001/leaves/dashboard`

## Step 2: Set Test User (Browser Console)

Open DevTools (F12) → Console, run:

```javascript
// Test as Employee
localStorage.setItem('user', JSON.stringify({
  userId: '1',
  email: 'employee@test.com',
  role: 'department employee',
  employeeId: 'emp1'
}));
location.reload();
```

## Step 3: Quick Test Flow

### As Employee:
1. ✅ Go to Dashboard → Should see balances
2. ✅ Click "Request Leave" → Fill form → Submit
3. ✅ Go to History → Should see your request
4. ✅ Click on request → View details

### As Manager (Change role in console):
```javascript
localStorage.setItem('user', JSON.stringify({
  userId: '2',
  email: 'manager@test.com',
  role: 'department head',
  employeeId: 'mgr1'
}));
location.reload();
```

5. ✅ Go to Approvals → Should see pending requests
6. ✅ Select request → Approve/Reject

### As HR Admin:
```javascript
localStorage.setItem('user', JSON.stringify({
  userId: '3',
  email: 'hr@test.com',
  role: 'HR Admin',
  employeeId: 'hr1'
}));
location.reload();
```

7. ✅ Go to HR Review → Review requests
8. ✅ Go to Policies → View/Edit policies
9. ✅ Go to Adjustments → Test balance adjustment
10. ✅ Go to Year-End → Preview processing
11. ✅ Go to Offboarding → Test settlement

## Expected Results

- ✅ All pages load without errors
- ✅ Navigation works
- ✅ Forms validate correctly
- ✅ Role-based access enforced
- ✅ Loading states show
- ✅ Error messages display appropriately

## Common Errors to Check

1. **404 on pages**: Check route paths match
2. **API errors**: Check backend is running or mock data works
3. **Type errors**: Run `npm run build` to check TypeScript
4. **Styling issues**: Check Tailwind is configured

