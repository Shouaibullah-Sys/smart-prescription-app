// test-pdf-debug.ts
// Test script to verify PDF generation debugging

import { generatePrescriptionPDF } from "./utils/generatePrescriptionPDF";

// Sample prescription data with medical exams for testing
const testPrescription = {
  _id: "test-prescription-123",
  patientName: "John Doe",
  patientAge: "35",
  patientGender: "Male",
  patientPhone: "+1234567890",
  patientAddress: "123 Main St, City",
  allergies: ["Penicillin", "Peanuts"],
  currentMedications: ["Aspirin 81mg daily"],
  medicationUsage: "For cardiovascular health",
  pastMedicalHistory: "Hypertension diagnosed 2020",
  familyHistory: "Father - diabetes, Mother - hypertension",
  socialHistory: "Non-smoker, occasional alcohol use",
  chiefComplaint: "Annual check-up and medication review",
  weight: "75",
  height: "175",
  pulseRate: "72",
  heartRate: "72",
  bloodPressure: "120/80",
  temperature: "98.6",
  respiratoryRate: "16",
  oxygenSaturation: "98",
  physicalExam: "General appearance good, no acute distress",
  medicalExams: [
    "Complete Blood Count (CBC)",
    "Lipid Panel",
    "HbA1c",
    "Thyroid Function Tests",
  ],
  examNotes: "All values within normal limits",
  medicines: [
    {
      medicine: "Lisinopril",
      dosage: "10mg",
      dosagePersian: "۱۰ میلی‌گرم",
      frequency: "Once daily",
      frequencyPersian: "روزانه یک بار",
      duration: "Ongoing",
      durationPersian: "مستمر",
      instructions: "Take in the morning",
      instructionsPersian: "صبح مصرف شود",
      form: "Tablet",
      formPersian: "قرص",
      route: "Oral",
      timing: "Morning",
      withFood: false,
      notes: "Monitor blood pressure regularly",
    },
  ],
  instructions: "Continue current lifestyle modifications",
  followUp: "Return in 3 months for follow-up",
  restrictions: "Avoid excessive salt intake",
  doctorName: "Dr. Smith",
  doctorLicenseNumber: "MD12345",
  clinicName: "Family Medicine Clinic",
  clinicAddress: "456 Medical Center Dr",
  date: "2025-12-28T05:01:18.287Z",
  source: "manual",
  status: "active",
};

// Test function to demonstrate debugging
export async function testPDFGeneration() {
  console.log("🧪 Testing PDF Generation with Medical Exams Debugging");
  console.log("=".repeat(60));

  try {
    console.log("📋 Test prescription data:");
    console.log("- Patient:", testPrescription.patientName);
    console.log(
      "- Medical Exams Count:",
      testPrescription.medicalExams?.length || 0
    );
    console.log("- Medical Exams Type:", typeof testPrescription.medicalExams);
    console.log("- Medical Exams:", testPrescription.medicalExams);
    console.log("");

    console.log("🔄 Starting PDF generation...");
    await generatePrescriptionPDF(testPrescription);

    console.log("✅ PDF generation completed successfully");
  } catch (error) {
    console.error("❌ PDF generation failed:", error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testPDFGeneration();
}
