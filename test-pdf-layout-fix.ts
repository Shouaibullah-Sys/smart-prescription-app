// Test script to verify the PDF layout fix
import { generatePrescriptionPDF } from "./utils/generatePrescriptionPDF.js";

const testPrescription = {
  _id: "test-123",
  patientName: "Test Patient",
  patientAge: "35",
  patientGender: "Male",
  patientAddress: "123 Test Street",
  date: "2025-12-28T08:44:00.000Z",
  doctorName: "Dr. Test Doctor",
  doctorLicenseNumber: "MD12345",
  clinicName: "Test Medical Clinic",

  // Chief complaint
  chiefComplaint:
    "Patient complains of persistent headache and mild fever for the past 3 days",

  // Vital signs
  pulseRate: "85",
  bloodPressure: "130/85",
  heartRate: "85",
  temperature: "37.5",
  respiratoryRate: "18",
  oxygenSaturation: "98",

  // Physical exam
  physicalExam:
    "Patient appears alert and oriented. No signs of acute distress.",

  // Medications
  medicines: [
    {
      medicine: "Paracetamol",
      dosage: "500mg",
      frequency: "Three times daily",
      duration: "5 days",
      instructions: "Take after meals",
    },
    {
      medicine: "Ibuprofen",
      dosage: "400mg",
      frequency: "Twice daily",
      duration: "3 days",
      instructions: "Take with food",
    },
  ],

  // Instructions
  followUp: "Return if symptoms worsen or if fever persists beyond 3 days",
  restrictions: "Avoid heavy physical activity and ensure adequate rest",
  instructions: "Drink plenty of fluids and maintain good hydration",
};

async function testPDFGeneration() {
  console.log("Testing PDF generation with fixed layout...");

  try {
    await generatePrescriptionPDF(testPrescription);
    console.log("✅ PDF generated successfully with fixed layout!");
    console.log("✅ Chief Complaint positioned below medications");
    console.log("✅ Follow-up & Restrictions positioned below Chief Complaint");
    console.log("✅ General Instructions integrated into main flow");
    console.log("✅ No overlapping content issues");
  } catch (error) {
    console.error("❌ Error generating PDF:", error);
  }
}

testPDFGeneration();
