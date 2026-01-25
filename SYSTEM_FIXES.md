# System Fixes - ProbateDesk Onboard Flow

## Fixes Applied - January 25, 2026

### Issue 1: Call Hold/IVR System ✅
**Status**: Working as designed (NO FIX NEEDED)

**How it works**:
1. Caller dials in to Twilio number
2. Twilio plays welcome greeting: "A team member will be with you in approximately 45 seconds"
3. **Twilio plays 30-40 seconds of hold music** (via `twiml.play({ loop: 4 })`)
4. Twilio says "Connecting you now"
5. Twilio connects to Retell AI agent
6. If agent doesn't answer → voicemail fallback

**Files**: `/api/twilio/voice/incoming/route.ts`

---

### Issue 2: System Detects Hangup But UI Never Lights Up "Continue" Button 🔧 FIXED

**Problem**: 
- When user hangs up on AI call, backend detects it via Retell webhook and updates DB
- Frontend polls `/api/retell/call-status` but only enables Continue button if `callStatus === 'completed'`
- If call ends early (no-answer, user hangs up), button stays disabled and user is stuck

**Root Cause**:
```tsx
// OLD - ONLY allows "completed" status
const canContinue = callStatus === 'completed';
```

**Solution Applied**:
```tsx
// NEW - Allow ANY terminal state
const terminalStates: CallStatus[] = ['completed', 'no_answer', 'failed'];
const canContinue = terminalStates.includes(callStatus);
```

**Also improved**:
- UI now shows Continue button for all terminal call states
- User gets retry option for no_answer/failed (up to 2 attempts)
- After 2 retries, shows Continue button to proceed anyway

**File Modified**: `/app/onboard/call/page.tsx` (lines 148-151, 341-365)

---

### Issue 3: Screening Questions Loop - Users Can't Advance Past Fit Questions 🔧 FIXED

**Problem**:
- Screening questions loop ("Did they have a will?" → "Do you have original?" → etc.)
- Sometimes users can't advance to next question
- Going back and re-answering causes state conflicts

**Root Cause**:
The `advanceQuestion()` function didn't validate that an answer was actually selected before advancing:
```tsx
// OLD - could advance with undefined/null value
const advanceQuestion = (currentKey, value) => {
  switch (question) {
    case "will":
      if (value === true) { ... }  // This would fail if value was undefined
```

**Solution Applied**:
1. Added validation to check if answer is valid before advancing:
```tsx
const advanceQuestion = (currentKey, value) => {
  // Validate that we actually got an answer before advancing
  if (value === undefined || value === null) {
    return;  // Don't advance if no valid answer
  }
  // ... rest of logic
```

2. Improved state machine with explicit false checks:
```tsx
case "will":
  if (value === true) {
    setQuestion("original");
  } else if (value === false) {  // Explicit check instead of else
    setQuestion("dispute");
  }
  break;
```

**File Modified**: `/app/onboard/screening/page.tsx` (lines 60-91)

---

## How to Test

### Test 1: Call Flow (with Continue Button)
1. Go to `/onboard/call`
2. Complete ready checks
3. Call completes (or hangs up early)
4. **Expected**: Continue button should appear regardless of call outcome
5. Click Continue → goes to `/onboard/screening`

### Test 2: Screening Questions
1. Go to `/onboard/screening`
2. Answer "Did they have a will?" → advances
3. Answer "Do you have original?" → advances
4. Answer "Expected dispute?" → if yes, goes to result; if no, continues
5. Answer "Foreign assets?" → if yes, goes to result; if no, continues  
6. Answer "Estate value?" → completes and goes to result page
7. **Expected**: No looping, smooth progression through all questions

### Test 3: Back Button in Screening
1. Answer first question
2. Click Back
3. First question re-appears
4. Answer differently
5. **Expected**: Should advance correctly without state conflicts

---

## Files Changed

| File | Changes | Lines |
|------|---------|-------|
| `/app/onboard/call/page.tsx` | Enable Continue for all terminal call states | 148-151, 341-365 |
| `/app/onboard/screening/page.tsx` | Add validation before advancing questions | 60-91 |

---

## Deployment Notes

- **Breaking Changes**: None
- **Environment Variables**: No new vars needed
- **Database Migrations**: None
- **Build**: No new dependencies
- **Testing**: Recommend manual testing of onboard flow with actual calls

---

## Questions & Support

- **Call hold timing too long/short?** Edit hold music loop count in `/api/twilio/voice/incoming/route.ts`
- **Need to add more screening questions?** Extend `advanceQuestion()` switch statement and add new `Question` type
- **Continue button still not showing?** Check browser console for polling errors in `/api/retell/call-status` response

