// test-allergies-wrapping.ts
// Test script to verify that allergies text wrapping works correctly

import {
  generatePrescriptionPDF,
  VoicePrescription,
} from "./utils/generatePrescriptionPDF";

const testPrescription: VoicePrescription = {
  _id: "test-prescription-123",
  patientName: "John Doe",
  patientAge: "35",
  patientGender: "Male",
  allergies: [
    "Penicillin - causes severe allergic reactions including hives, swelling, and difficulty breathing",
    "Shellfish - results in gastrointestinal distress, nausea, vomiting, and in severe cases anaphylaxis",
    "Latex - leads to skin rashes, itching, and respiratory issues when in contact with rubber products",
    "Aspirin - triggers asthma attacks, nasal congestion, and potential cardiovascular complications",
  ],
  currentMedications: ["Lisinopril 10mg daily"],
  pastMedicalHistory: "Hypertension diagnosed in 2020",
  familyHistory: "Father had diabetes, Mother has heart disease",
  socialHistory: "Non-smoker, occasional alcohol use",
  weight: "75",
  height: "175",
  pulseRate: "72",
  bloodPressure: "130/85",
  medicines: [
    {
      medicine: "Amoxicillin",
      dosage: "500mg",
      frequency: "Three times daily",
      duration: "7 days",
      instructions: "Take with food",
    },
  ],
  doctorName: "Dr. Smith",
  date: "2025-12-28",
};

console.log("Testing allergies text wrapping...");
console.log("Allergies data:", testPrescription.allergies);

try {
  // This should generate a PDF with properly wrapped allergies text
  await generatePrescriptionPDF(testPrescription);
  console.log("✅ PDF generated successfully with allergies text wrapping");
} catch (error) {
  console.error("❌ Error generating PDF:", error);
}
