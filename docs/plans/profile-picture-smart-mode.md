# Plan: Enrollment Profile Picture — Smart Mode

**Status:** PARTIALLY DONE — Step 1 (token gap fix) applied 2026-07-07 and kept. Step 2 (flag flip) reverted — flag is back to `true` (force mode) while initial photo collection is still in progress. Flip flag to `false` when ready to switch to smart mode.

**Flag:** `IS_TO_FORCE_ENROLLMENT_PROFILE_PICTURE_UPLOAD` in [`src/configs/EnvironmentConfig.js`](../../src/configs/EnvironmentConfig.js)

---

## What the flag controls

| Value | Behavior |
|---|---|
| `true` (current) | **Force mode** — every enrollee (new and returning) is always shown the upload field, regardless of whether they already have a photo in GCP |
| `false` | **Smart mode** — the system checks GCP first; if the enrollee already has a photo the field is hidden and they don't need to upload again |

---

## How the smart path works (already coded)

`getEnrollmentProfilePictureRequirement` in [`src/managers/LrnManager.js`](../../src/managers/LrnManager.js) line ~491:

```
resolve context (contactInternalId + token)
  ↓
if IS_TO_FORCE_ENROLLMENT_PROFILE_PICTURE_UPLOAD → return { requiresUpload: true }  ← exits here in force mode
  ↓
if context resolved → call getContactEnrolleeKnowMeProfileImage
  ↓
if photo found → return { requiresUpload: false, profileUrl: <url> }
if no photo   → return { requiresUpload: true }
```

`EnrollmentProfilePictureField` render (after T1 fix, 2026-07-06):
- `requiresUpload: false && profileUrl exists` → returns null (field hidden, no upload asked)
- `requiresUpload: true` → shows the upload card

---

## What needs to change to enable smart mode

### Step 1 — Fix the token gap for unauthenticated found-enrollees (1 line)

**File:** [`src/managers/LrnManager.js`](../../src/managers/LrnManager.js) ~line 471

**Problem:** `resolveEnrollmentProfileContext` is called without `shouldRetrieveRegistrationToken: true`. For unauthenticated returning enrollees (email+year found, no token passed), `resolvedContext.token` is null, the GCP check is skipped, and the code falls back to `requiresUpload: true`. Smart mode silently degrades to force mode for this path.

**Fix:**
```javascript
// Before
const resolvedContext = await resolveEnrollmentProfileContext({
  emailId,
  dobOrYob,
  contactInternalId,
  token
});

// After
const resolvedContext = await resolveEnrollmentProfileContext({
  emailId,
  dobOrYob,
  contactInternalId,
  token,
  shouldRetrieveRegistrationToken: true   // ← add this
});
```

This causes `resolveEnrollmentProfileContext` to fetch a service JWT when no token is otherwise available. It is an extra HTTP call on enrollment form load (~100ms) but only fires when no token was passed in and no user-profile lookup resolved one.

### Step 2 — Flip the flag

**File:** [`src/configs/EnvironmentConfig.js`](../../src/configs/EnvironmentConfig.js) line 5

```javascript
// Before
IS_TO_FORCE_ENROLLMENT_PROFILE_PICTURE_UPLOAD: true,

// After
IS_TO_FORCE_ENROLLMENT_PROFILE_PICTURE_UPLOAD: false,
```

---

## Testing checklist (all 3 enrollment paths, smart mode)

### Authenticated path
- [ ] Enrollee WITH existing photo → upload field hidden, form submits without photo required
- [ ] Enrollee WITHOUT existing photo → upload field shown, photo required

### Unauthenticated — found (email + year match)
- [ ] Enrollee WITH existing photo → upload field hidden after loading spinner
- [ ] Enrollee WITHOUT existing photo → upload field shown after loading spinner
- [ ] Verify browser console shows `[EnrollmentProfilePictureField] render:showingUploadField { isChecking: false, requiresUpload: true }` when upload is needed
- [ ] Verify browser console shows `render:hidingFieldBecauseProfileExists` when upload is skipped

### Brand-new (not found at all)
- [ ] Upload field always shown — `skipExistingProfileLookup: true` bypasses the check, no change needed
- [ ] Photo uploads correctly on submission

### Edge cases
- [ ] Enrollee with photo updates their enrollment (re-enrolls) — field hidden, submission succeeds without photo
- [ ] Network failure during GCP photo check — verify fallback to `requiresUpload: true` (fail open = show field)

---

## Architecture notes

- `skipExistingProfileLookup` is a separate per-render flag computed in `QuickToFullEnrollment` from `shouldSkipExistingProfilePictureLookup`. It is NOT the same as `IS_TO_FORCE_ENROLLMENT_PROFILE_PICTURE_UPLOAD`. Brand-new enrollees use `skipExistingProfileLookup: true` regardless of the global flag — correct behavior.
- The authenticated path (`AuthenticatedQuickEnrollment`) passes `token={user?.innerToken}` directly, so `resolvedContext.token` is already set. No extra HTTP call for that path in smart mode.
- The `profileUrl` returned by the smart check is NOT currently displayed to the user — it only controls whether `requiresUpload` is true/false. Showing a preview of the existing photo is a future enhancement.

---

## Effort estimate

| Task | Estimate |
|---|---|
| Step 1 (token gap fix, 1 line) | 5 min |
| Step 2 (flag flip) | 1 min |
| Testing checklist | ~30 min |
| **Total** | ~40 min |
