// app/api/prescriptions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { prescriptions, medicines } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and, like, or, inArray, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

// Define the type for incoming medicine data
interface IncomingMedicine {
  id?: string;
  medicine?: string;
  name?: string;
  dosage: string;
  form?: string;
  frequency?: string;
  duration?: string;
  route?: string;
  timing?: string;
  withFood?: boolean;
  instructions?: string;
  notes?: string;
}

export async function GET(request: NextRequest) {
  try {
    console.log("GET /api/prescriptions called");

    const { userId } = await auth();
    console.log("User ID:", userId);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "دسترسی غیرمجاز" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    let whereCondition = eq(prescriptions.userId, userId);

    if (search) {
      const searchCondition = or(
        like(prescriptions.patientName, `%${search}%`),
        like(prescriptions.diagnosis, `%${search}%`),
        like(prescriptions.doctorName, `%${search}%`)
      );
      whereCondition = and(whereCondition, searchCondition) as any;
    }

    console.log("Fetching prescriptions for user:", userId);

    // Get total count first
    const totalCountResult = await db
      .select({ id: prescriptions.id })
      .from(prescriptions)
      .where(whereCondition);

    const totalCount = totalCountResult.length;
    console.log("Total prescriptions found:", totalCount);

    if (totalCount === 0) {
      return NextResponse.json({
        success: true,
        data: {
          prescriptions: [],
          pagination: {
            page,
            limit,
            totalCount: 0,
            totalPages: 0,
          },
        },
      });
    }

    // Get paginated prescription IDs - most recent first
    const prescriptionIds = await db
      .select({ id: prescriptions.id })
      .from(prescriptions)
      .where(whereCondition)
      .orderBy(desc(prescriptions.createdAt))
      .limit(limit)
      .offset(skip);

    console.log("Paginated prescription IDs:", prescriptionIds.length);

    // Get prescriptions with medicines
    const prescriptionsData = await db
      .select({
        prescription: prescriptions,
        medicine: medicines,
      })
      .from(prescriptions)
      .where(
        inArray(
          prescriptions.id,
          prescriptionIds.map((p) => p.id)
        )
      )
      .leftJoin(medicines, eq(prescriptions.id, medicines.prescriptionId))
      .orderBy(desc(prescriptions.createdAt));

    // Group prescriptions with their medicines
    const groupedPrescriptions = prescriptionsData.reduce((acc, row) => {
      const prescription = row.prescription;
      const medicine = row.medicine;

      if (!acc[prescription.id]) {
        acc[prescription.id] = {
          ...prescription,
          medicines: [],
        };
      }

      if (medicine) {
        acc[prescription.id].medicines.push(medicine);
      }

      return acc;
    }, {} as Record<string, any>);

    const prescriptionsWithMedicines = Object.values(groupedPrescriptions);
    console.log(
      "Final grouped prescriptions:",
      prescriptionsWithMedicines.length
    );

    return NextResponse.json({
      success: true,
      data: {
        prescriptions: prescriptionsWithMedicines,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get prescriptions error:", error);
    return NextResponse.json(
      { success: false, error: "خطا در دریافت نسخه‌ها" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("POST /api/prescriptions called");

    const { userId } = await auth();
    console.log("User ID:", userId);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "دسترسی غیرمجاز" },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log("Received prescription data:", body);

    // Basic validation
    if (!body.patientName || !body.diagnosis) {
      return NextResponse.json(
        { success: false, error: "نام بیمار و تشخیص بیماری الزامی است" },
        { status: 400 }
      );
    }

    const prescriptionId = uuidv4();

    // Create prescription
    const [prescription] = await db
      .insert(prescriptions)
      .values({
        id: prescriptionId,
        userId: userId,
        patientName: body.patientName,
        patientAge: body.patientAge || "",
        patientGender: body.patientGender || "",
        patientPhone: body.patientPhone || "",
        patientAddress: body.patientAddress || "",
        diagnosis: body.diagnosis,
        chiefComplaint: body.chiefComplaint || "",
        historyOfPresentIllness: body.historyOfPresentIllness || "",
        physicalExamination: body.physicalExamination || "",
        differentialDiagnosis: body.differentialDiagnosis || "",
        pulseRate: body.pulseRate || "",
        bloodPressure: body.bloodPressure || "",
        temperature: body.temperature || "",
        respiratoryRate: body.respiratoryRate || "",
        oxygenSaturation: body.oxygenSaturation || "",
        allergies: body.allergies || [],
        currentMedications: body.currentMedications || [],
        pastMedicalHistory: body.pastMedicalHistory || "",
        familyHistory: body.familyHistory || "",
        socialHistory: body.socialHistory || "",
        instructions: body.instructions || "",
        followUp: body.followUp || "",
        restrictions: body.restrictions || "",
        doctorName: body.doctorName || "دکتر",
        doctorLicenseNumber: body.doctorLicenseNumber || "",
        clinicName: body.clinicName || "",
        clinicAddress: body.clinicAddress || "",
        doctorFree: body.doctorFree || "",
        prescriptionDate: body.prescriptionDate
          ? new Date(body.prescriptionDate)
          : new Date(),
        prescriptionNumber: body.prescriptionNumber || "",
        source: body.source || "manual",
        status: "active",
        aiConfidence: body.aiConfidence || "",
        aiModelUsed: body.aiModelUsed || "",
        processingTime: body.processingTime || 0,
        rawAiResponse: body.rawAiResponse || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    console.log("Prescription created:", prescription.id);

    // Create medicines if provided. Accept either `body.prescription` (form) or
    // `body.medicines` (alternate clients). Build an array and insert in one
    // batch so we reliably persist all items.
    const incomingMeds: IncomingMedicine[] = Array.isArray(body.prescription)
      ? body.prescription
      : Array.isArray(body.medicines)
      ? body.medicines
      : [];

    if (incomingMeds.length > 0) {
      console.log("Incoming medicines payload:", incomingMeds);

      const medicinesData = incomingMeds
        .map((med: IncomingMedicine) => {
          const medicineName = med.medicine || med.name || "";
          const dosage = med.dosage || ""; // fix mapping; fall back to empty string
          if (!medicineName || !dosage) return null; // skip incomplete entries

          return {
            id: uuidv4(),
            prescriptionId: prescriptionId,
            medicine: medicineName,
            dosage: dosage,
            form: med.form || "",
            frequency: med.frequency || "",
            duration: med.duration || "",
            route: med.route || "oral",
            timing: med.timing || "",
            withFood: med.withFood || false,
            instructions: med.instructions || "",
            notes: med.notes || "",
            createdAt: new Date(),
            updatedAt: new Date(),
          } as any;
        })
        .filter(Boolean) as any[];

      if (medicinesData.length > 0) {
        // Insert all medicines in a single query for consistency and try to get returned rows (if DB supports)
        try {
          const inserted = await db
            .insert(medicines)
            .values(medicinesData)
            .returning();
          console.log(
            "Medicines inserted (returning):",
            Array.isArray(inserted) ? inserted.length : "unknown",
            inserted
          );
        } catch (insertErr) {
          // Some drivers/DBs (like SQLite with Drizzle) may not support returning(); still proceed and verify with select
          console.warn(
            "Insert returning() failed or unsupported, falling back to non-returning insert:",
            insertErr
          );
          await db.insert(medicines).values(medicinesData);
        }

        // Verify by selecting from DB to make sure rows exist
        try {
          const verify = await db
            .select()
            .from(medicines)
            .where(eq(medicines.prescriptionId, prescriptionId));
          console.log(
            "Verified medicines count in DB for prescription:",
            prescriptionId,
            "=>",
            verify.length
          );
          // optional: log the rows (be careful with sensitive data)
          console.log("Verified medicines rows:", verify);
        } catch (verifyErr) {
          console.error("Verification select after insert failed:", verifyErr);
        }
      } else {
        console.log(
          "No valid medicines to insert for prescription:",
          prescriptionId
        );
      }
    }

    // Fetch the complete prescription with medicines
    const completeData = await db
      .select({
        prescription: prescriptions,
        medicine: medicines,
      })
      .from(prescriptions)
      .where(eq(prescriptions.id, prescriptionId))
      .leftJoin(medicines, eq(prescriptions.id, medicines.prescriptionId));

    const groupedData = completeData.reduce((acc, row) => {
      if (!acc.prescription) {
        acc.prescription = row.prescription;
        acc.medicines = [];
      }
      if (row.medicine) {
        acc.medicines.push(row.medicine);
      }
      return acc;
    }, {} as any);

    const prescriptionWithMedicines = {
      ...groupedData.prescription,
      medicines: groupedData.medicines || [],
    };

    console.log("Returning complete prescription data");

    return NextResponse.json({
      success: true,
      data: prescriptionWithMedicines,
      message: "نسخه با موفقیت ایجاد شد",
    });
  } catch (error) {
    console.error("Create prescription error:", error);
    return NextResponse.json(
      { success: false, error: "خطا در ایجاد نسخه" },
      { status: 500 }
    );
  }
}
