# PDF Generation Debugging Guide

This guide explains how to debug PDF generation issues in the Smart Prescription application, particularly focusing on the `medicalExams` field.

## Current Implementation

Your debugging function is already well-implemented:

```typescript
const handleGeneratePDF = async (prescriptionId: string) => {
  try {
    // Fetch the prescription
    const response = await fetch(`/api/prescriptions/${prescriptionId}`);
    const data = await response.json();

    console.log("Full prescription data:", data);
    console.log("Medical exams:", data.data.medicalExams);
    console.log("Medical exams type:", typeof data.data.medicalExams);
    console.log("Medical exams length:", data.data.medicalExams?.length);

    // Generate PDF
    await generatePrescriptionPDF(data.data);
  } catch (error) {
    console.error("Error generating PDF:", error);
  }
};
```

## Enhanced Debugging Tools

I've created two additional debugging tools:

### 1. PDF Debug Helper Component (`components/pdf-debug-helper.tsx`)

A React component that provides comprehensive debugging and visual feedback:

```tsx
import { PDFDebugHelper } from "@/components/pdf-debug-helper";

// Use in your component
<PDFDebugHelper
  prescriptionId={prescriptionId}
  onGeneratePDF={generatePrescriptionPDF}
/>;
```

### 2. Standalone Debug Function

For console-based debugging:

```typescript
import { debugPrescriptionData } from "@/components/pdf-debug-helper";

// Call this function to debug any prescription
const data = await debugPrescriptionData(prescriptionId);
```

### 3. Test Script (`test-pdf-debug.ts`)

A Node.js script for testing PDF generation:

```bash
npx tsx test-pdf-debug.ts
```

## Common Issues and Solutions

### 1. Medical Exams is Null or Undefined

**Problem**: `medicalExams` field is `null` or `undefined`

**Solution**: Check your database schema and API response:

```typescript
// In your API route, ensure medicalExams is properly extracted:
medicalExams: prescriptionData[0].prescription.medicalExams || [],
```

### 2. Medical Exams is Not an Array

**Problem**: `medicalExams` is a string instead of array

**Solution**: Parse the data properly:

```typescript
// Ensure medicalExams is always an array
medicalExams: Array.isArray(prescription.medicalExams)
  ? prescription.medicalExams
  : [],
```

### 3. Empty Medical Exams Array

**Problem**: `medicalExams` exists but is empty

**Solution**: This is normal behavior - the PDF generator handles empty arrays gracefully.

## Debugging Checklist

When debugging PDF generation issues:

- [ ] Check if prescription data exists (`data.success` and `data.data`)
- [ ] Verify `medicalExams` field structure:
  - [ ] `exists`: `!!data.data.medicalExams`
  - [ ] `isArray`: `Array.isArray(data.data.medicalExams)`
  - [ ] `length`: `data.data.medicalExams?.length`
  - [ ] `content`: Log the actual array content
- [ ] Check other related fields:
  - [ ] `medicines` array
  - [ ] `allergies` array
  - [ ] `currentMedications` array
- [ ] Verify PDF generation function receives correct data
- [ ] Check browser console for any JavaScript errors

## Enhanced Console Logging

For more comprehensive debugging, replace your current logs with:

```typescript
const handleGeneratePDF = async (prescriptionId: string) => {
  try {
    console.log("🔍 Starting PDF generation debugging...");
    console.log("📋 Prescription ID:", prescriptionId);

    const response = await fetch(`/api/prescriptions/${prescriptionId}`);
    const result = await response.json();

    console.log("📡 API Response:", result);

    if (!result.success) {
      throw new Error(`API Error: ${result.error}`);
    }

    const data = result.data;

    // Enhanced debugging
    console.log("🔬 Detailed Analysis:");
    console.log("===================");
    console.log("✓ Prescription exists:", !!data);
    console.log("✓ Patient name:", data.patientName);
    console.log("✓ Doctor name:", data.doctorName);
    console.log("✓ Medicines count:", data.medicines?.length || 0);
    console.log("✓ Medical exams exists:", !!data.medicalExams);
    console.log("✓ Medical exams type:", typeof data.medicalExams);
    console.log("✓ Medical exams is array:", Array.isArray(data.medicalExams));
    console.log("✓ Medical exams length:", data.medicalExams?.length);
    console.log("✓ Medical exams content:", data.medicalExams);

    // Additional field checks
    console.log("🔍 Other Fields:");
    console.log("- Allergies:", data.allergies);
    console.log("- Current medications:", data.currentMedications);
    console.log("- Vital signs present:", {
      pulse: !!data.pulseRate,
      bp: !!data.bloodPressure,
      temp: !!data.temperature,
    });

    await generatePrescriptionPDF(data);
    console.log("✅ PDF generation completed successfully");
  } catch (error) {
    console.error("❌ PDF generation failed:", error);
    console.error("🐛 Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      prescriptionId,
      timestamp: new Date().toISOString(),
    });
  }
};
```

## Testing the Debug Tools

1. **Use the React Component**: Add the `PDFDebugHelper` to your prescription details page
2. **Use Console Debugging**: Call `debugPrescriptionData(prescriptionId)` in your browser console
3. **Run Test Script**: Execute the TypeScript test file to verify PDF generation

## Expected Output

When debugging works correctly, you should see output like:

```
🔍 Starting PDF generation debugging...
📋 Prescription ID: abc-123-def
📡 API Response: { success: true, data: {...} }
🔬 Detailed Analysis:
===================
✓ Prescription exists: true
✓ Patient name: John Doe
✓ Doctor name: Dr. Smith
✓ Medicines count: 2
✓ Medical exams exists: true
✓ Medical exams type: object
✓ Medical exams is array: true
✓ Medical exams length: 4
✓ Medical exams content: ["CBC", "Lipid Panel", "HbA1c", "TSH"]
🔍 Other Fields:
- Allergies: ["Penicillin"]
- Current medications: ["Aspirin 81mg"]
- Vital signs present: { pulse: true, bp: true, temp: true }
✅ PDF generation completed successfully
```

## Integration Tips

1. **Add to existing components**: Use the debug helper in prescription list or details pages
2. **Conditional debugging**: Enable/disable detailed logs based on environment
3. **Error boundaries**: Wrap PDF generation in error boundaries for better error handling
4. **Performance monitoring**: Add timing logs to measure PDF generation performance

This debugging approach will help you identify exactly where issues occur in the PDF generation process, particularly with the `medicalExams` field handling.
