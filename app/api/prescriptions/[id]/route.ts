// app/api/prescriptions/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { prescriptions, medicines } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";

/**
 * GET /api/prescriptions/[id]
 * Get a specific prescription by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication with Clerk
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "دسترسی غیرمجاز" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Fetch prescription with medicines
    const prescriptionData = await db
      .select({
        prescription: prescriptions,
        medicine: medicines,
      })
      .from(prescriptions)
      .where(and(eq(prescriptions.id, id), eq(prescriptions.userId, userId)))
      .leftJoin(medicines, eq(prescriptions.id, medicines.prescriptionId));

    if (prescriptionData.length === 0) {
      return NextResponse.json(
        { success: false, error: "نسخه پیدا نشد" },
        { status: 404 }
      );
    }

    // Transform the data - include ALL fields from prescription
    const prescription = {
      ...prescriptionData[0].prescription,
      // Ensure medicalExams is included (it might be null in DB)
      medicalExams: prescriptionData[0].prescription.medicalExams || [],
      // Ensure other array fields are included
      allergies: prescriptionData[0].prescription.allergies || [],
      currentMedications:
        prescriptionData[0].prescription.currentMedications || [],
      medicines: prescriptionData
        .filter((row) => row.medicine)
        .map((row) => row.medicine),
    };

    // Debug log
    console.log("API Response - medicalExams:", prescription.medicalExams);
    console.log(
      "API Response - medicalExams length:",
      prescription.medicalExams?.length
    );

    return NextResponse.json({
      success: true,
      data: prescription,
    });
  } catch (error) {
    console.error("Get prescription error:", error);
    return NextResponse.json(
      { success: false, error: "خطا در دریافت نسخه" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/prescriptions/[id]
 * Update a specific prescription
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication with Clerk
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "دسترسی غیرمجاز" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Verify prescription belongs to user
    const existingPrescription = await db
      .select()
      .from(prescriptions)
      .where(and(eq(prescriptions.id, id), eq(prescriptions.userId, userId)))
      .limit(1);

    if (existingPrescription.length === 0) {
      return NextResponse.json(
        { success: false, error: "نسخه پیدا نشد" },
        { status: 404 }
      );
    }

    // Update prescription data - include medicalExams
    const updateData: any = {
      // Patient Information
      patientName: body.patientName,
      patientAge: body.patientAge,
      patientGender: body.patientGender,
      patientPhone: body.patientPhone,
      patientAddress: body.patientAddress,

      // Medical Information
      chiefComplaint: body.chiefComplaint,

      // Vital Signs
      pulseRate: body.pulseRate,
      heartRate: body.heartRate,
      bloodPressure: body.bloodPressure,
      temperature: body.temperature,
      respiratoryRate: body.respiratoryRate,
      oxygenSaturation: body.oxygenSaturation,

      // Anthropometry
      weight: body.weight,
      height: body.height,

      // Medical History
      allergies: body.allergies,
      currentMedications: body.currentMedications,
      pastMedicalHistory: body.pastMedicalHistory,
      familyHistory: body.familyHistory,
      socialHistory: body.socialHistory,

      // Physical Examination
      physicalExam: body.physicalExam,
      medicalExams: body.medicalExams, // Include this!
      examNotes: body.examNotes,

      // Treatment Information
      instructions: body.instructions,
      followUp: body.followUp,
      restrictions: body.restrictions,

      // Doctor Information
      doctorName: body.doctorName,
      doctorLicenseNumber: body.doctorLicenseNumber,
      clinicName: body.clinicName,
      clinicAddress: body.clinicAddress,

      // Updated at
      updatedAt: new Date(),
    };

    // Remove undefined values but keep empty arrays
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    // Update prescription
    const updatedPrescription = await db
      .update(prescriptions)
      .set(updateData)
      .where(eq(prescriptions.id, id))
      .returning();

    // Update medicines if provided
    if (body.medicines && Array.isArray(body.medicines)) {
      // Delete existing medicines
      await db.delete(medicines).where(eq(medicines.prescriptionId, id));

      // Insert updated medicines
      if (body.medicines.length > 0) {
        const medicinesData = body.medicines.map((med: any) => ({
          id: `med_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          prescriptionId: id,
          medicine: med.medicine || med.name,
          dosage: med.dosage,
          dosagePersian: med.dosagePersian,
          form: med.form,
          formPersian: med.formPersian,
          frequency: med.frequency,
          frequencyPersian: med.frequencyPersian,
          duration: med.duration,
          durationPersian: med.durationPersian,
          route: med.route,
          timing: med.timing,
          withFood: med.withFood || false,
          instructions: med.instructions,
          instructionsPersian: med.instructionsPersian,
          notes: med.notes,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));

        await db.insert(medicines).values(medicinesData);
      }
    }

    // Fetch updated prescription with medicines
    const updatedData = await db
      .select({
        prescription: prescriptions,
        medicine: medicines,
      })
      .from(prescriptions)
      .where(eq(prescriptions.id, id))
      .leftJoin(medicines, eq(prescriptions.id, medicines.prescriptionId));

    // Transform the result
    const prescriptionWithMedicines = {
      ...updatedData[0].prescription,
      medicalExams: updatedData[0].prescription.medicalExams || [],
      allergies: updatedData[0].prescription.allergies || [],
      currentMedications: updatedData[0].prescription.currentMedications || [],
      medicines: updatedData
        .filter((row) => row.medicine)
        .map((row) => row.medicine),
    };

    return NextResponse.json({
      success: true,
      data: prescriptionWithMedicines,
      message: "نسخه با موفقیت بروزرسانی شد",
    });
  } catch (error) {
    console.error("Update prescription error:", error);
    return NextResponse.json(
      { success: false, error: "خطا در بروزرسانی نسخه" },
      { status: 500 }
    );
  }
}
