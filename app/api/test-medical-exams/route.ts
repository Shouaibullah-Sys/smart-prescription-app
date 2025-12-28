// app/api/test-medical-exams/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { prescriptions, medicines } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    // Get a sample prescription with medical exams
    const samplePrescription = await db
      .select()
      .from(prescriptions)
      .where(eq(prescriptions.patientName, "Test Patient"))
      .limit(1);

    if (samplePrescription.length === 0) {
      // Create a test prescription
      const testPrescription = {
        id: `test_${Date.now()}`,
        userId: "test_user",
        patientName: "Test Patient",
        patientAge: "35",
        patientGender: "Male",
        chiefComplaint: "Headache",
        medicalExams: [
          "CBC",
          "Liver Function Test",
          "Thyroid Test",
          "MRI Brain",
        ],
        physicalExam: "Normal",
        doctorName: "Dr. Test",
        clinicName: "Test Clinic",
        source: "test",
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await db.insert(prescriptions).values(testPrescription);

      return NextResponse.json({
        message: "Test prescription created",
        prescription: testPrescription,
      });
    }

    return NextResponse.json({
      message: "Test prescription found",
      prescription: samplePrescription[0],
      medicalExams: samplePrescription[0].medicalExams,
      medicalExamsType: typeof samplePrescription[0].medicalExams,
    });
  } catch (error) {
    console.error("Test error:", error);
    return NextResponse.json({ error: "Test failed" }, { status: 500 });
  }
}
