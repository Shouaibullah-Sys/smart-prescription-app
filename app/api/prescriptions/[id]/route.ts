// app/api/prescriptions/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db, dbQuery, checkDatabaseConnection } from "@/db/index";
import { prescriptions, medicines, prescriptionTests } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log("GET /api/prescriptions/[id] called");

    // Check authentication with Clerk
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "دسترسی غیرمجاز" },
        { status: 401 }
      );
    }

    // Check database connectivity first
    const connectionCheck = await checkDatabaseConnection();
    if (!connectionCheck.healthy) {
      console.error("Database connection failed:", connectionCheck.error);
      return NextResponse.json(
        {
          success: false,
          error:
            "Database connection is currently unavailable. Please try again later.",
        },
        { status: 503 }
      );
    }

    const { id } = await params;
    console.log("Fetching prescription with ID:", id);

    // Fetch prescription with medicines and tests using dbQuery wrapper
    const prescriptionData = await dbQuery(async () => {
      return await db
        .select({
          prescription: prescriptions,
          medicine: medicines,
          prescriptionTest: prescriptionTests,
        })
        .from(prescriptions)
        .where(and(eq(prescriptions.id, id), eq(prescriptions.userId, userId)))
        .leftJoin(medicines, eq(prescriptions.id, medicines.prescriptionId))
        .leftJoin(
          prescriptionTests,
          eq(prescriptions.id, prescriptionTests.prescriptionId)
        );
    });

    if (prescriptionData.length === 0) {
      return NextResponse.json(
        { success: false, error: "نسخه پیدا نشد" },
        { status: 404 }
      );
    }

    // Transform the data - group prescriptions with their medicines and tests
    const groupedData = prescriptionData.reduce((acc, row) => {
      const prescription = row.prescription;
      const medicine = row.medicine;
      const prescriptionTest = row.prescriptionTest;

      if (!acc.prescription) {
        acc.prescription = {
          ...prescription,
          // Ensure medicalExams is included (it might be null in DB)
          medicalExams: prescription.medicalExams || [],
          // Ensure other array fields are included
          allergies: prescription.allergies || "",
          currentMedications: prescription.currentMedications || "",
          medicines: [],
          tests: [],
        };
      }

      if (
        medicine &&
        !acc.prescription.medicines.find((m: any) => m.id === medicine.id)
      ) {
        acc.prescription.medicines.push(medicine);
      }

      if (
        prescriptionTest &&
        !acc.prescription.tests.find((t: any) => t.id === prescriptionTest.id)
      ) {
        acc.prescription.tests.push(prescriptionTest);
      }

      return acc;
    }, {} as any);

    const prescription = groupedData.prescription;

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

    // Check if it's a database connection error
    if (
      error instanceof Error &&
      (error.message.includes("database") ||
        error.message.includes("connection"))
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Database connection is currently unavailable. Please try again later.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { success: false, error: "خطا در دریافت نسخه" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log("DELETE /api/prescriptions/[id] called");

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "دسترسی غیرمجاز" },
        { status: 401 }
      );
    }

    // Check database connectivity first
    const connectionCheck = await checkDatabaseConnection();
    if (!connectionCheck.healthy) {
      console.error("Database connection failed:", connectionCheck.error);
      return NextResponse.json(
        {
          success: false,
          error:
            "Database connection is currently unavailable. Please try again later.",
        },
        { status: 503 }
      );
    }

    const { id } = await params;
    console.log("Deleting prescription with ID:", id);

    // Verify prescription belongs to user
    const existingPrescription = await dbQuery(async () => {
      return await db
        .select()
        .from(prescriptions)
        .where(and(eq(prescriptions.id, id), eq(prescriptions.userId, userId)))
        .limit(1);
    });

    if (existingPrescription.length === 0) {
      return NextResponse.json(
        { success: false, error: "نسخه پیدا نشد" },
        { status: 404 }
      );
    }

    // Delete related prescription tests first
    await dbQuery(async () => {
      return await db
        .delete(prescriptionTests)
        .where(eq(prescriptionTests.prescriptionId, id));
    });

    // Delete related medicines
    await dbQuery(async () => {
      return await db.delete(medicines).where(eq(medicines.prescriptionId, id));
    });

    // Delete the prescription itself
    await dbQuery(async () => {
      return await db.delete(prescriptions).where(eq(prescriptions.id, id));
    });

    console.log("✅ Prescription deleted successfully:", id);

    return NextResponse.json({
      success: true,
      message: "نسخه با موفقیت حذف شد",
    });
  } catch (error) {
    console.error("Delete prescription error:", error);

    // Check if it's a database connection error
    if (
      error instanceof Error &&
      (error.message.includes("database") ||
        error.message.includes("connection"))
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Database connection is currently unavailable. Please try again later.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { success: false, error: "خطا در حذف نسخه" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log("PUT /api/prescriptions/[id] called");

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "دسترسی غیرمجاز" },
        { status: 401 }
      );
    }

    // Check database connectivity first
    const connectionCheck = await checkDatabaseConnection();
    if (!connectionCheck.healthy) {
      console.error("Database connection failed:", connectionCheck.error);
      return NextResponse.json(
        {
          success: false,
          error:
            "Database connection is currently unavailable. Please try again later.",
        },
        { status: 503 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    console.log("Updating prescription with ID:", id);

    // Verify prescription belongs to user
    const existingPrescription = await dbQuery(async () => {
      return await db
        .select()
        .from(prescriptions)
        .where(and(eq(prescriptions.id, id), eq(prescriptions.userId, userId)))
        .limit(1);
    });

    if (existingPrescription.length === 0) {
      return NextResponse.json(
        { success: false, error: "نسخه پیدا نشد" },
        { status: 404 }
      );
    }

    // Prepare allergies and currentMedications as strings
    const allergies =
      typeof body.allergies === "string"
        ? body.allergies.trim()
        : Array.isArray(body.allergies)
        ? body.allergies.join(", ")
        : body.allergies !== null && body.allergies !== undefined
        ? String(body.allergies)
        : "";

    const currentMedications =
      typeof body.currentMedications === "string"
        ? body.currentMedications.trim()
        : Array.isArray(body.currentMedications)
        ? body.currentMedications.join(", ")
        : body.currentMedications !== null &&
          body.currentMedications !== undefined
        ? String(body.currentMedications)
        : "";

    // Prepare medicalExams as array
    const medicalExamsData = Array.isArray(body.medicalExams)
      ? body.medicalExams
      : typeof body.medicalExams === "string"
      ? body.medicalExams
          .split(",")
          .map((item: string) => item.trim())
          .filter((item: string) => item)
      : [];

    // Log the prepared data for debugging
    console.log("PUT - Prepared allergies data:", allergies);
    console.log("PUT - Prepared currentMedications data:", currentMedications);
    console.log("PUT - Prepared medicalExams data:", medicalExamsData);

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
      allergies: allergies,
      currentMedications: currentMedications,
      pastMedicalHistory: body.pastMedicalHistory,
      familyHistory: body.familyHistory,
      socialHistory: body.socialHistory,

      // Physical Examination
      physicalExam: body.physicalExam,
      medicalExams: medicalExamsData,
      examNotes: body.examNotes,

      // System Examinations
      cnsExamination: body.cnsExamination || "",
      cardiovascularExamination: body.cardiovascularExamination || "",
      respiratoryExamination: body.respiratoryExamination || "",
      gastrointestinalExamination: body.gastrointestinalExamination || "",
      musculoskeletalExamination: body.musculoskeletalExamination || "",
      genitourinaryExamination: body.genitourinaryExamination || "",
      dermatologicalExamination: body.dermatologicalExamination || "",
      entExamination: body.entExamination || "",
      ophthalmologicalExamination: body.ophthalmologicalExamination || "",

      // Treatment Information
      instructions: body.instructions,
      followUp: body.followUp,
      restrictions: body.restrictions,

      // Doctor Information
      doctorName: body.doctorName,
      doctorLicenseNumber: body.doctorLicenseNumber,
      clinicName: body.clinicName,
      clinicAddress: body.clinicAddress,
      doctorFree: body.doctorFree || "",

      // Updated at
      updatedAt: new Date(),
    };

    // Remove undefined values but keep empty arrays/strings
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    // Update prescription using dbQuery wrapper
    await dbQuery(async () => {
      return await db
        .update(prescriptions)
        .set(updateData)
        .where(eq(prescriptions.id, id));
    });

    // Update medicines if provided
    if (body.medicines && Array.isArray(body.medicines)) {
      // Delete existing medicines
      await dbQuery(async () => {
        return await db
          .delete(medicines)
          .where(eq(medicines.prescriptionId, id));
      });

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

        await dbQuery(async () => {
          return await db.insert(medicines).values(medicinesData);
        });
      }
    }

    // Fetch updated prescription with medicines and tests
    const updatedData = await dbQuery(async () => {
      return await db
        .select({
          prescription: prescriptions,
          medicine: medicines,
          prescriptionTest: prescriptionTests,
        })
        .from(prescriptions)
        .where(eq(prescriptions.id, id))
        .leftJoin(medicines, eq(prescriptions.id, medicines.prescriptionId))
        .leftJoin(
          prescriptionTests,
          eq(prescriptions.id, prescriptionTests.prescriptionId)
        );
    });

    // Transform the result
    const groupedData = updatedData.reduce((acc, row) => {
      const prescription = row.prescription;
      const medicine = row.medicine;
      const prescriptionTest = row.prescriptionTest;

      if (!acc.prescription) {
        acc.prescription = {
          ...prescription,
          medicalExams: prescription.medicalExams || [],
          allergies: prescription.allergies || "",
          currentMedications: prescription.currentMedications || "",
          medicines: [],
          tests: [],
        };
      }

      if (
        medicine &&
        !acc.prescription.medicines.find((m: any) => m.id === medicine.id)
      ) {
        acc.prescription.medicines.push(medicine);
      }

      if (
        prescriptionTest &&
        !acc.prescription.tests.find((t: any) => t.id === prescriptionTest.id)
      ) {
        acc.prescription.tests.push(prescriptionTest);
      }

      return acc;
    }, {} as any);

    const prescriptionWithMedicines = groupedData.prescription;

    return NextResponse.json({
      success: true,
      data: prescriptionWithMedicines,
      message: "نسخه با موفقیت بروزرسانی شد",
    });
  } catch (error) {
    console.error("Update prescription error:", error);

    // Check if it's a JSON syntax error
    if (
      error instanceof Error &&
      (error.message.includes("invalid input syntax for type json") ||
        error.message.includes("json") ||
        error.message.includes("JSON"))
    ) {
      console.error("JSON syntax error details:", error);
      return NextResponse.json(
        {
          success: false,
          error:
            "خطا در قالب داده‌های پزشکی. لطفاً اطلاعات را بررسی کرده و مجدداً تلاش کنید.",
        },
        { status: 400 }
      );
    }

    // Check if it's a database connection error
    if (
      error instanceof Error &&
      (error.message.includes("database") ||
        error.message.includes("connection"))
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Database connection is currently unavailable. Please try again later.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { success: false, error: "خطا در بروزرسانی نسخه" },
      { status: 500 }
    );
  }
}
