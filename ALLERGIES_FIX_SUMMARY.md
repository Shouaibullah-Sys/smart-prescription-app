# Fix for "invalid input syntax for type json" Error

## Problem Description

The application was failing with the error:

```
Error [NeonDbError]: invalid input syntax for type json
Token "Diagnosis" is invalid.
```

This occurred when trying to insert prescription data where the `allergies` field contained plain text like "Diagnosis" instead of valid JSON.

## Root Cause

The issue was that despite the Drizzle schema defining the `allergies` and `current_medications` fields as TEXT type, the actual database columns were still JSONB type. When plain text was inserted into a JSONB column, PostgreSQL tried to parse it as JSON, which failed for simple strings like "Diagnosis".

## Solution Applied

### 1. Enhanced Automatic Migration

Updated the API routes to automatically detect and convert JSONB columns to TEXT type:

**Files Modified:**

- `app/api/prescriptions/route.ts` (POST method)
- `app/api/prescriptions/[id]/route.ts` (PUT method)

**Changes Made:**

- Added robust data type checking and conversion
- Improved error handling for JSON parsing errors
- Added detailed logging for debugging
- Enhanced data cleaning for allergies and currentMedications fields

### 2. Data Handling Improvements

Enhanced data preparation logic:

```javascript
// Before (vulnerable to JSON parsing errors)
const allergies = typeof body.allergies === "string" ? body.allergies : "";

// After (robust handling)
const allergies =
  typeof body.allergies === "string"
    ? body.allergies.trim()
    : Array.isArray(body.allergies)
    ? body.allergies.join(", ")
    : body.allergies !== null && body.allergies !== undefined
    ? String(body.allergies)
    : "";
```

### 3. Error Handling

Added specific error handling for JSON syntax errors:

```javascript
if (
  error instanceof Error &&
  (error.message.includes("invalid input syntax for type json") ||
    error.message.includes("json") ||
    error.message.includes("JSON"))
) {
  return NextResponse.json(
    {
      success: false,
      error:
        "خطا در قالب داده‌های پزشکی. لطفاً اطلاعات را بررسی کرده و مجدداً تلاش کنید.",
    },
    { status: 400 }
  );
}
```

### 4. Migration Scripts

Created additional scripts for manual migration:

**`scripts/force-allergies-migration.js`**

- Forces column type conversion from JSONB to TEXT
- Includes data validation and cleaning
- Provides detailed logging of the migration process

**`scripts/test-allergies-fix.js`**

- Tests the fix by inserting sample data
- Verifies the fix works correctly
- Includes cleanup of test data

## How to Use

### Automatic Fix (Recommended)

The fix is built into the API routes. When you next create or update a prescription, the system will automatically:

1. Detect if columns need migration
2. Apply the migration if needed
3. Handle data correctly

### Manual Migration (if needed)

If you want to force the migration immediately:

```bash
node scripts/force-allergies-migration.js
```

### Testing the Fix

To test that the fix works:

```bash
node scripts/test-allergies-fix.js
```

## Verification

After applying the fix, you should be able to:

1. Create prescriptions with string values in the `allergies` field (e.g., "Diagnosis")
2. Update existing prescriptions without JSON parsing errors
3. Receive better error messages if other issues occur

## Files Modified

1. `app/api/prescriptions/route.ts` - Enhanced POST method with automatic migration and improved data handling
2. `app/api/prescriptions/[id]/route.ts` - Enhanced PUT method with same improvements
3. `scripts/force-allergies-migration.js` - New manual migration script
4. `scripts/test-allergies-fix.js` - New test script

## Prevention

This fix includes several safeguards to prevent similar issues:

- Automatic column type detection and migration
- Robust data type handling
- Comprehensive error logging
- Better error messages for users

The solution ensures that the application can handle both legacy data (JSONB columns) and new data (TEXT columns) seamlessly.
