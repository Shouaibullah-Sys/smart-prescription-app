// app/api/prescriptions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db, dbQuery, checkDatabaseConnection } from "@/db/index";
import { prescriptions, medicines, prescriptionTests } from "@/db/schema";
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    let whereCondition = eq(prescriptions.userId, userId);

    if (search) {
      const searchCondition = or(
        like(prescriptions.patientName, `%${search}%`),
        like(prescriptions.doctorName, `%${search}%`)
      );
      whereCondition = and(whereCondition, searchCondition) as any;
    }

    console.log("Fetching prescriptions for user:", userId);

    // Get total count first
    const totalCountResult = await dbQuery(async () => {
      return await db
        .select({ id: prescriptions.id })
        .from(prescriptions)
        .where(whereCondition);
    });

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
    const prescriptionIds = await dbQuery(async () => {
      return await db
        .select({ id: prescriptions.id })
        .from(prescriptions)
        .where(whereCondition)
        .orderBy(desc(prescriptions.createdAt))
        .limit(limit)
        .offset(skip);
    });

    console.log("Paginated prescription IDs:", prescriptionIds.length);

    // Get prescriptions with medicines and tests
    const prescriptionsData = await dbQuery(async () => {
      return await db
        .select({
          prescription: prescriptions,
          medicine: medicines,
          prescriptionTest: prescriptionTests,
        })
        .from(prescriptions)
        .where(
          inArray(
            prescriptions.id,
            prescriptionIds.map((p) => p.id)
          )
        )
        .leftJoin(medicines, eq(prescriptions.id, medicines.prescriptionId))
        .leftJoin(
          prescriptionTests,
          eq(prescriptions.id, prescriptionTests.prescriptionId)
        )
        .orderBy(desc(prescriptions.createdAt));
    });

    // Group prescriptions with their medicines and tests
    const groupedPrescriptions = prescriptionsData.reduce((acc, row) => {
      const prescription = row.prescription;
      const medicine = row.medicine;
      const prescriptionTest = row.prescriptionTest;

      if (!acc[prescription.id]) {
        acc[prescription.id] = {
          ...prescription,
          medicines: [],
          tests: [],
        };
      }

      if (medicine) {
        acc[prescription.id].medicines.push(medicine);
      }

      if (prescriptionTest) {
        acc[prescription.id].tests.push(prescriptionTest);
      }

      return acc;
    }, {} as Record<string, any>);

    // Convert arrays to strings for frontend
    const prescriptionsWithMedicines = Object.values(groupedPrescriptions).map(
      (prescription: any) => ({
        ...prescription,
        // Convert JSON arrays back to comma-separated strings for frontend
        allergies: Array.isArray(prescription.allergies)
          ? prescription.allergies.join(", ")
          : prescription.allergies || "",
        currentMedications: Array.isArray(prescription.currentMedications)
          ? prescription.currentMedications.join(", ")
          : prescription.currentMedications || "",
        // Ensure medicalExams is always an array
        medicalExams: Array.isArray(prescription.medicalExams)
          ? prescription.medicalExams
          : [],
        medicines: prescription.medicines || [],
        tests: prescription.tests || [],
      })
    );

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

    const body = await request.json();
    console.log("Received prescription data:", body);

    // Basic validation
    if (!body.patientName) {
      return NextResponse.json(
        { success: false, error: "نام بیمار الزامی است" },
        { status: 400 }
      );
    }

    const prescriptionId = uuidv4();

    // Prepare data - Simplified for text columns
    const medicalExams = body.medicalExams || [];
    const medicalExamsData = Array.isArray(medicalExams)
      ? medicalExams
      : typeof medicalExams === "string"
      ? medicalExams
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item)
      : [];

    // Always use strings for allergies and currentMedications (database columns are text)
    const allergiesForDb = (body.allergies || "").toString().trim();
    const currentMedicationsForDb = (body.currentMedications || "")
      .toString()
      .trim();

    console.log("Prepared data for insertion:", {
      allergiesForDb,
      currentMedicationsForDb,
      medicalExamsData,
    });

    // Insert prescription with consistent string values (database columns are text)
    const [prescription] = await dbQuery(async () => {
      return await db
        .insert(prescriptions)
        .values({
          id: prescriptionId,
          userId: userId,
          patientName: body.patientName,
          patientAge: body.patientAge || "",
          patientGender: body.patientGender || "",
          patientPhone: body.patientPhone || "",
          patientAddress: body.patientAddress || "",
          chiefComplaint: body.chiefComplaint || "",
          pulseRate: body.pulseRate || "",
          heartRate: body.heartRate || "",
          bloodPressure: body.bloodPressure || "",
          temperature: body.temperature || "",
          respiratoryRate: body.respiratoryRate || "",
          oxygenSaturation: body.oxygenSaturation || "",
          weight: body.weight || "",
          height: body.height || "",
          allergies: allergiesForDb, // Always string
          currentMedications: currentMedicationsForDb, // Always string
          pastMedicalHistory: body.pastMedicalHistory || "",
          familyHistory: body.familyHistory || "",
          socialHistory: body.socialHistory || "",
          physicalExam: body.physicalExam || "",
          medicalExams: medicalExamsData,
          examNotes: body.examNotes || "",
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
          // Additional Measurements
          bmi: body.bmi || "",
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
    });

    console.log("✅ Prescription created successfully:", prescription.id);

    // Create prescription tests if medical exams are provided
    if (medicalExamsData.length > 0) {
      console.log("Creating prescription tests for:", medicalExamsData);

      const prescriptionTestsData = medicalExamsData.map(
        (examName: string) => ({
          id: uuidv4(),
          prescriptionId: prescriptionId,
          testName: examName,
          notes: body.examNotes || "",
          priority: "routine",
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      );

      try {
        await dbQuery(async () => {
          return await db
            .insert(prescriptionTests)
            .values(prescriptionTestsData);
        });
        console.log("Prescription tests created:", medicalExamsData.length);
      } catch (testError) {
        console.error("Failed to create prescription tests:", testError);
        // Don't fail the whole request if test creation fails
      }
    }

    // Create medicines if provided
    const incomingMeds: IncomingMedicine[] = Array.isArray(body.prescription)
      ? body.prescription
      : Array.isArray(body.medicines)
      ? body.medicines
      : [];

    if (incomingMeds.length > 0) {
      console.log("Incoming medicines payload:", incomingMeds);

      const medicinesData = incomingMeds
        .map((med: IncomingMedicine) => {
          const medicineName = (med.medicine || med.name || "").trim();
          const dosage = (med.dosage || "").trim();

          console.log(
            `Processing medicine: "${medicineName}" with dosage: "${dosage}"`
          );

          if (!medicineName || !dosage) {
            console.log(
              `Skipping medicine ${
                medicineName || "unknown"
              }: missing medicine name or dosage`
            );
            return null;
          }

          const processedMed = {
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

          console.log(`Processed medicine data:`, processedMed);
          return processedMed;
        })
        .filter(Boolean) as any[];

      if (medicinesData.length > 0) {
        try {
          const inserted = await dbQuery(async () => {
            return await db.insert(medicines).values(medicinesData).returning();
          });
          console.log(
            "Medicines inserted (returning):",
            Array.isArray(inserted) ? inserted.length : "unknown",
            inserted
          );
        } catch (insertErr) {
          console.warn(
            "Insert returning() failed or unsupported, falling back to non-returning insert:",
            insertErr
          );
          await dbQuery(async () => {
            return await db.insert(medicines).values(medicinesData);
          });
        }

        // Verify by selecting from DB
        try {
          const verify = await dbQuery(async () => {
            return await db
              .select()
              .from(medicines)
              .where(eq(medicines.prescriptionId, prescriptionId));
          });
          console.log(
            "Verified medicines count in DB for prescription:",
            prescriptionId,
            "=>",
            verify.length
          );
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

    // Fetch the complete prescription with medicines and tests
    const completeData = await dbQuery(async () => {
      return await db
        .select({
          prescription: prescriptions,
          medicine: medicines,
          prescriptionTest: prescriptionTests,
        })
        .from(prescriptions)
        .where(eq(prescriptions.id, prescriptionId))
        .leftJoin(medicines, eq(prescriptions.id, medicines.prescriptionId))
        .leftJoin(
          prescriptionTests,
          eq(prescriptions.id, prescriptionTests.prescriptionId)
        );
    });

    const groupedData = completeData.reduce((acc, row) => {
      if (!acc.prescription) {
        acc.prescription = row.prescription;
        acc.medicines = [];
        acc.tests = [];
      }
      if (row.medicine) {
        acc.medicines.push(row.medicine);
      }
      if (row.prescriptionTest) {
        acc.tests.push(row.prescriptionTest);
      }
      return acc;
    }, {} as any);

    // Prepare response - convert arrays to strings for frontend
    const prescriptionWithMedicines = {
      ...groupedData.prescription,
      // Convert arrays back to comma-separated strings for frontend
      allergies: Array.isArray(groupedData.prescription.allergies)
        ? groupedData.prescription.allergies.join(", ")
        : groupedData.prescription.allergies || "",
      currentMedications: Array.isArray(
        groupedData.prescription.currentMedications
      )
        ? groupedData.prescription.currentMedications.join(", ")
        : groupedData.prescription.currentMedications || "",
      medicines: groupedData.medicines || [],
      tests: groupedData.tests || [],
      // Ensure medicalExams is always an array
      medicalExams: Array.isArray(groupedData.prescription.medicalExams)
        ? groupedData.prescription.medicalExams
        : [],
    };

    console.log("Returning complete prescription data");

    return NextResponse.json({
      success: true,
      data: prescriptionWithMedicines,
      message: "نسخه با موفقیت ایجاد شد",
    });
  } catch (error) {
    console.error("Create prescription error:", error);

    // More specific error handling
    if (error instanceof Error) {
      if (
        error.message.includes("invalid input syntax for type json") ||
        error.message.includes("22P02") ||
        error.message.includes("json") ||
        error.message.includes("JSON")
      ) {
        console.error("JSON syntax error:", error.message);
        return NextResponse.json(
          {
            success: false,
            error:
              "خطا در قالب داده‌های پزشکی. لطفاً مطمئن شوید که اطلاعات آلرژی و داروها به درستی وارد شده‌اند.",
            details:
              "Database column type mismatch. Please check database schema.",
          },
          { status: 400 }
        );
      }

      if (
        error.message.includes("database") ||
        error.message.includes("connection")
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
    }

    return NextResponse.json(
      { success: false, error: "خطا در ایجاد نسخه" },
      { status: 500 }
    );
  }
}
