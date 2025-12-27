// app/api/prescriptions/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db, dbQuery, checkDatabaseConnection } from "@/db/index";
import { prescriptions, medicines } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

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

    // Transform the data
    const prescription = {
      ...prescriptionData[0].prescription,
      medicines: prescriptionData
        .filter((row) => row.medicine)
        .map((row) => row.medicine),
    };

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

    // Update prescription data
    const updateData: any = {
      // Patient Information
      patientName: body.patientName,
      patientAge: body.patientAge,
      patientGender: body.patientGender,
      patientPhone: body.patientPhone,
      patientAddress: body.patientAddress,

      // Medical Information
      chiefComplaint: body.chiefComplaint,
      historyOfPresentIllness: body.historyOfPresentIllness,
      physicalExamination: body.physicalExamination,
      differentialDiagnosis: body.differentialDiagnosis,

      // Vital Signs
      pulseRate: body.pulseRate,
      bloodPressure: body.bloodPressure,
      temperature: body.temperature,
      respiratoryRate: body.respiratoryRate,
      oxygenSaturation: body.oxygenSaturation,

      // Medical History
      allergies: body.allergies,
      currentMedications: body.currentMedications,
      pastMedicalHistory: body.pastMedicalHistory,
      familyHistory: body.familyHistory,
      socialHistory: body.socialHistory,

      // Treatment Information
      instructions: body.instructions,
      followUp: body.followUp,
      restrictions: body.restrictions,

      // Doctor Information
      doctorName: body.doctorName,
      doctorLicenseNumber: body.doctorLicenseNumber,
      clinicName: body.clinicName,
      clinicAddress: body.clinicAddress,
      doctorFree: body.doctorFree,

      // Updated at
      updatedAt: new Date(),
    };

    // Remove undefined values
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    // Update prescription (without transaction)
    const updatedPrescription = await db
      .update(prescriptions)
      .set(updateData)
      .where(eq(prescriptions.id, id))
      .returning();

    // Update medicines if provided (without transaction)
    if (body.medicines && Array.isArray(body.medicines)) {
      // Delete existing medicines
      await db.delete(medicines).where(eq(medicines.prescriptionId, id));

      // Insert updated medicines
      if (body.medicines.length > 0) {
        const medicinesData = body.medicines.map((med: any) => ({
          id: uuidv4(),
          prescriptionId: id,
          medicine: med.medicine || med.name,
          dosage: med.dosage,
          form: med.form,
          frequency: med.frequency,
          duration: med.duration,
          route: med.route,
          timing: med.timing,
          withFood: med.withFood || false,
          instructions: med.instructions,
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

/**
 * DELETE /api/prescriptions/[id]
 * Delete a specific prescription
 */
export async function DELETE(
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

    // First, verify the prescription exists and belongs to the user
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

    // Delete related medicines first (without transaction)
    await db.delete(medicines).where(eq(medicines.prescriptionId, id));

    // Then delete the prescription
    const deleteResult = await db
      .delete(prescriptions)
      .where(and(eq(prescriptions.id, id), eq(prescriptions.userId, userId)))
      .returning({ deletedId: prescriptions.id });

    if (deleteResult.length === 0) {
      return NextResponse.json(
        { success: false, error: "خطا در حذف نسخه" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "نسخه با موفقیت حذف شد",
    });
  } catch (error) {
    console.error("Delete prescription error:", error);
    return NextResponse.json(
      { success: false, error: "خطا در حذف نسخه" },
      { status: 500 }
    );
  }
}
