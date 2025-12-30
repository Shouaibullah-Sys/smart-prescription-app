// app/api/presets/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../db/index";
import { prescriptions, medicines } from "../../../db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    // Get user-created presets from database
    const userPrescriptionsResult = await db
      .select()
      .from(prescriptions)
      .where(eq(prescriptions.source, "user_created"));

    // Get medicines for user prescriptions
    const userPrescriptionsWithMedicines: Record<string, any> = {};

    for (const prescription of userPrescriptionsResult) {
      const prescriptionMedicines = await db
        .select()
        .from(medicines)
        .where(eq(medicines.prescriptionId, prescription.id));

      userPrescriptionsWithMedicines[prescription.id] = {
        ...prescription,
        medicines: prescriptionMedicines.map((med) => ({
          id: med.id,
          medicine: med.medicine,
          dosage: med.dosage,
          frequency: med.frequency,
          duration: med.duration,
          route: med.route,
          timing: med.timing,
          withFood: med.withFood,
          instructions: med.instructions,
          notes: med.notes,
          prescriptionId: med.prescriptionId,
        })),
      };
    }

    // Comprehensive preset prescriptions with diverse medical conditions
    const presetPrescriptions = {
      common_cold: {
        id: "common_cold",
        name: "Common Cold",
        category: "Respiratory",
        urgency: "low",
        description: "Viral upper respiratory tract infection",
        patientName: "",
        prescriptionDate: new Date().toISOString().split("T")[0],
        diagnosis: "Common Cold (Viral URI)",
        medicines: [
          {
            id: "med1",
            medicine: "Acetaminophen",
            dosage: "500 mg",
            frequency: "Every 6 hours as needed",
            duration: "3-5 days",
            route: "PO",
            withFood: false,
            instructions: "For fever and pain relief",
            notes: "Avoid exceeding 4g daily",
            prescriptionId: "common_cold",
          },
          {
            id: "med2",
            medicine: "Saline nasal spray",
            dosage: "As directed",
            frequency: "Every 4-6 hours",
            duration: "Until symptoms resolve",
            route: "Intranasal",
            withFood: false,
            instructions: "For nasal congestion",
            notes: "",
            prescriptionId: "common_cold",
          },
        ],
        chiefComplaint: "Runny nose, sneezing, mild cough",
        allergies: [],
        currentMedications: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        source: "api",
      },
      hypertension: {
        id: "hypertension",
        name: "Hypertension",
        category: "Cardiovascular",
        urgency: "medium",
        description: "High blood pressure management",
        patientName: "",
        prescriptionDate: new Date().toISOString().split("T")[0],
        diagnosis: "Essential Hypertension",
        medicines: [
          {
            id: "med1",
            medicine: "Lisinopril",
            dosage: "10 mg",
            frequency: "Once daily",
            duration: "Ongoing",
            route: "PO",
            withFood: false,
            instructions: "Take in the morning",
            notes: "Monitor blood pressure regularly",
            prescriptionId: "hypertension",
          },
          {
            id: "med2",
            medicine: "Hydrochlorothiazide",
            dosage: "12.5 mg",
            frequency: "Once daily",
            duration: "Ongoing",
            route: "PO",
            withFood: false,
            instructions: "Take in the morning",
            notes: "Monitor electrolytes",
            prescriptionId: "hypertension",
          },
        ],
        chiefComplaint: "Elevated blood pressure",
        allergies: [],
        currentMedications: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        source: "api",
      },
      diabetes_type2: {
        id: "diabetes_type2",
        name: "Type 2 Diabetes",
        category: "Endocrine",
        urgency: "medium",
        description: "Type 2 diabetes mellitus management",
        patientName: "",
        prescriptionDate: new Date().toISOString().split("T")[0],
        diagnosis: "Type 2 Diabetes Mellitus",
        medicines: [
          {
            id: "med1",
            medicine: "Metformin",
            dosage: "500 mg",
            frequency: "Twice daily with meals",
            duration: "Ongoing",
            route: "PO",
            withFood: true,
            instructions: "Take with breakfast and dinner",
            notes: "Monitor blood glucose regularly",
            prescriptionId: "diabetes_type2",
          },
        ],
        chiefComplaint: "Polyuria, polydipsia, weight loss",
        allergies: [],
        currentMedications: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        source: "api",
      },
      anxiety: {
        id: "anxiety",
        name: "Generalized Anxiety",
        category: "Psychiatric",
        urgency: "medium",
        description: "Generalized anxiety disorder",
        patientName: "",
        prescriptionDate: new Date().toISOString().split("T")[0],
        diagnosis: "Generalized Anxiety Disorder",
        medicines: [
          {
            id: "med1",
            medicine: "Sertraline",
            dosage: "50 mg",
            frequency: "Once daily",
            duration: "Ongoing",
            route: "PO",
            withFood: false,
            instructions: "Take in the morning",
            notes: "May take 2-4 weeks for full effect",
            prescriptionId: "anxiety",
          },
        ],
        chiefComplaint: "Excessive worry, restlessness, fatigue",
        allergies: [],
        currentMedications: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        source: "api",
      },
      uti: {
        id: "uti",
        name: "Urinary Tract Infection",
        category: "Genitourinary",
        urgency: "high",
        description: "Uncomplicated urinary tract infection",
        patientName: "",
        prescriptionDate: new Date().toISOString().split("T")[0],
        diagnosis: "Acute Uncomplicated UTI",
        medicines: [
          {
            id: "med1",
            medicine: "Nitrofurantoin",
            dosage: "100 mg",
            frequency: "Twice daily",
            duration: "5 days",
            route: "PO",
            withFood: true,
            instructions: "Take with food to reduce nausea",
            notes: "Complete full course even if symptoms improve",
            prescriptionId: "uti",
          },
        ],
        chiefComplaint: "Dysuria, frequency, urgency",
        allergies: [],
        currentMedications: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        source: "api",
      },
      migraine: {
        id: "migraine",
        name: "Migraine",
        category: "Neurological",
        urgency: "medium",
        description: "Acute migraine treatment",
        patientName: "",
        prescriptionDate: new Date().toISOString().split("T")[0],
        diagnosis: "Migraine without Aura",
        medicines: [
          {
            id: "med1",
            medicine: "Sumatriptan",
            dosage: "50 mg",
            frequency: "As needed",
            duration: "PRN",
            route: "PO",
            withFood: false,
            instructions: "Take at onset of migraine",
            notes: "Do not exceed 200mg in 24 hours",
            prescriptionId: "migraine",
          },
          {
            id: "med2",
            medicine: "Propranolol",
            dosage: "40 mg",
            frequency: "Twice daily",
            duration: "Ongoing",
            route: "PO",
            withFood: false,
            instructions: "For migraine prevention",
            notes: "May cause fatigue",
            prescriptionId: "migraine",
          },
        ],
        chiefComplaint: "Severe headache, photophobia, nausea",
        allergies: [],
        currentMedications: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        source: "api",
      },
      allergic_rhinitis: {
        id: "allergic_rhinitis",
        name: "Allergic Rhinitis",
        category: "Allergy",
        urgency: "low",
        description: "Seasonal allergic rhinitis",
        patientName: "",
        prescriptionDate: new Date().toISOString().split("T")[0],
        diagnosis: "Allergic Rhinitis",
        medicines: [
          {
            id: "med1",
            medicine: "Cetirizine",
            dosage: "10 mg",
            frequency: "Once daily",
            duration: "Until symptoms resolve",
            route: "PO",
            withFood: false,
            instructions: "Take in the evening",
            notes: "Non-drowsy antihistamine",
            prescriptionId: "allergic_rhinitis",
          },
          {
            id: "med2",
            medicine: "Fluticasone nasal spray",
            dosage: "As directed",
            frequency: "Once daily",
            duration: "Until symptoms resolve",
            route: "Intranasal",
            withFood: false,
            instructions: "Spray once in each nostril",
            notes: "May take several days to work",
            prescriptionId: "allergic_rhinitis",
          },
        ],
        chiefComplaint: "Sneezing, runny nose, itchy eyes",
        allergies: [],
        currentMedications: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        source: "api",
      },
      osteoarthritis: {
        id: "osteoarthritis",
        name: "Osteoarthritis",
        category: "Musculoskeletal",
        urgency: "medium",
        description: "Knee osteoarthritis pain management",
        patientName: "",
        prescriptionDate: new Date().toISOString().split("T")[0],
        diagnosis: "Osteoarthritis of Knee",
        medicines: [
          {
            id: "med1",
            medicine: "Ibuprofen",
            dosage: "400 mg",
            frequency: "Every 8 hours with food",
            duration: "As needed",
            route: "PO",
            withFood: true,
            instructions: "Take with food to reduce stomach upset",
            notes: "Monitor for GI side effects",
            prescriptionId: "osteoarthritis",
          },
          {
            id: "med2",
            medicine: "Topical Diclofenac",
            dosage: "As directed",
            frequency: "Twice daily",
            duration: "As needed",
            route: "Topical",
            withFood: false,
            instructions: "Apply to affected knee",
            notes: "Less systemic side effects",
            prescriptionId: "osteoarthritis",
          },
        ],
        chiefComplaint: "Knee pain, stiffness, decreased mobility",
        allergies: [],
        currentMedications: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        source: "api",
      },
      gerd: {
        id: "gerd",
        name: "GERD",
        category: "Gastrointestinal",
        urgency: "medium",
        description: "Gastroesophageal reflux disease management",
        patientName: "",
        prescriptionDate: new Date().toISOString().split("T")[0],
        diagnosis: "Gastroesophageal Reflux Disease",
        medicines: [
          {
            id: "med1",
            medicine: "Omeprazole",
            dosage: "20 mg",
            frequency: "Once daily",
            duration: "4-8 weeks",
            route: "PO",
            withFood: true,
            instructions: "Take 30 minutes before breakfast",
            notes: "May take several days for full effect",
            prescriptionId: "gerd",
          },
        ],
        chiefComplaint: "Heartburn, acid regurgitation, chest discomfort",
        allergies: [],
        currentMedications: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        source: "api",
      },
      asthma: {
        id: "asthma",
        name: "Asthma",
        category: "Respiratory",
        urgency: "high",
        description: "Acute asthma exacerbation management",
        patientName: "",
        prescriptionDate: new Date().toISOString().split("T")[0],
        diagnosis: "Acute Asthma Exacerbation",
        medicines: [
          {
            id: "med1",
            medicine: "Albuterol Inhaler",
            dosage: "2 puffs",
            frequency: "Every 4-6 hours as needed",
            duration: "As needed",
            route: "Inhalation",
            withFood: false,
            instructions: "Use inhaler with spacer if available",
            notes: "Rinse mouth after use to prevent thrush",
            prescriptionId: "asthma",
          },
          {
            id: "med2",
            medicine: "Fluticasone Inhaler",
            dosage: "2 puffs",
            frequency: "Twice daily",
            duration: "Ongoing",
            route: "Inhalation",
            withFood: false,
            instructions: "Daily maintenance inhaler",
            notes: "Do not use for acute symptoms",
            prescriptionId: "asthma",
          },
        ],
        chiefComplaint: "Wheezing, shortness of breath, chest tightness",
        allergies: [],
        currentMedications: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        source: "api",
      },
      bronchitis: {
        id: "bronchitis",
        name: "Acute Bronchitis",
        category: "Respiratory",
        urgency: "low",
        description: "Acute bronchitis with productive cough",
        patientName: "",
        prescriptionDate: new Date().toISOString().split("T")[0],
        diagnosis: "Acute Bronchitis",
        medicines: [
          {
            id: "med1",
            medicine: "Dextromethorphan",
            dosage: "15 mg",
            frequency: "Every 4 hours as needed",
            duration: "5-7 days",
            route: "PO",
            withFood: false,
            instructions: "For cough suppression",
            notes: "Avoid in productive cough",
            prescriptionId: "bronchitis",
          },
          {
            id: "med2",
            medicine: "Acetaminophen",
            dosage: "500 mg",
            frequency: "Every 6 hours as needed",
            duration: "As needed",
            route: "PO",
            withFood: false,
            instructions: "For fever and pain relief",
            notes: "Maximum 4g daily",
            prescriptionId: "bronchitis",
          },
        ],
        chiefComplaint: "Productive cough, chest congestion, low-grade fever",
        allergies: [],
        currentMedications: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        source: "api",
      },
      pneumonia: {
        id: "pneumonia",
        name: "Community-Acquired Pneumonia",
        category: "Infectious Disease",
        urgency: "high",
        description: "Community-acquired pneumonia treatment",
        patientName: "",
        prescriptionDate: new Date().toISOString().split("T")[0],
        diagnosis: "Community-Acquired Pneumonia",
        medicines: [
          {
            id: "med1",
            medicine: "Azithromycin",
            dosage: "500 mg",
            frequency: "Once daily",
            duration: "5 days",
            route: "PO",
            withFood: true,
            instructions: "Take with or without food",
            notes: "Complete full course even if feeling better",
            prescriptionId: "pneumonia",
          },
        ],
        chiefComplaint: "Fever, cough, shortness of breath, chest pain",
        allergies: [],
        currentMedications: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        source: "api",
      },
      eczema: {
        id: "eczema",
        name: "Atopic Dermatitis",
        category: "Dermatology",
        urgency: "low",
        description: "Atopic dermatitis/eczema management",
        patientName: "",
        prescriptionDate: new Date().toISOString().split("T")[0],
        diagnosis: "Atopic Dermatitis",
        medicines: [
          {
            id: "med1",
            medicine: "Hydrocortisone 1% Cream",
            dosage: "As directed",
            frequency: "Twice daily",
            duration: "7-10 days",
            route: "Topical",
            withFood: false,
            instructions: "Apply thin layer to affected areas",
            notes: "Avoid prolonged use on face",
            prescriptionId: "eczema",
          },
          {
            id: "med2",
            medicine: "Calamine Lotion",
            dosage: "As needed",
            frequency: "As needed",
            duration: "Until symptoms improve",
            route: "Topical",
            withFood: false,
            instructions: "Apply for itching relief",
            notes: "May cause dryness",
            prescriptionId: "eczema",
          },
        ],
        chiefComplaint: "Itchy, red, inflamed skin patches",
        allergies: [],
        currentMedications: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        source: "api",
      },
      insomnia: {
        id: "insomnia",
        name: "Insomnia",
        category: "Psychiatric",
        urgency: "low",
        description: "Short-term insomnia management",
        patientName: "",
        prescriptionDate: new Date().toISOString().split("T")[0],
        diagnosis: "Insomnia",
        medicines: [
          {
            id: "med1",
            medicine: "Diphenhydramine",
            dosage: "25 mg",
            frequency: "Once daily",
            duration: "7-10 days",
            route: "PO",
            withFood: false,
            instructions: "Take 30 minutes before bedtime",
            notes: "May cause drowsiness, avoid driving",
            prescriptionId: "insomnia",
          },
        ],
        chiefComplaint: "Difficulty falling asleep, frequent awakening",
        allergies: [],
        currentMedications: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        source: "api",
      },
      depression: {
        id: "depression",
        name: "Major Depression",
        category: "Psychiatric",
        urgency: "medium",
        description: "Major depressive episode management",
        patientName: "",
        prescriptionDate: new Date().toISOString().split("T")[0],
        diagnosis: "Major Depressive Episode",
        medicines: [
          {
            id: "med1",
            medicine: "Fluoxetine",
            dosage: "20 mg",
            frequency: "Once daily",
            duration: "Ongoing",
            route: "PO",
            withFood: false,
            instructions: "Take in the morning",
            notes: "May take 4-6 weeks for full effect",
            prescriptionId: "depression",
          },
        ],
        chiefComplaint: "Persistent sadness, loss of interest, fatigue",
        allergies: [],
        currentMedications: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        source: "api",
      },
      back_pain: {
        id: "back_pain",
        name: "Lower Back Pain",
        category: "Musculoskeletal",
        urgency: "medium",
        description: "Acute lower back pain management",
        patientName: "",
        prescriptionDate: new Date().toISOString().split("T")[0],
        diagnosis: "Acute Lower Back Pain",
        medicines: [
          {
            id: "med1",
            medicine: "Cyclobenzaprine",
            dosage: "10 mg",
            frequency: "Three times daily",
            duration: "7-10 days",
            route: "PO",
            withFood: true,
            instructions: "Take with food to reduce nausea",
            notes: "May cause drowsiness, avoid alcohol",
            prescriptionId: "back_pain",
          },
          {
            id: "med2",
            medicine: "Naproxen",
            dosage: "500 mg",
            frequency: "Twice daily with food",
            duration: "7-10 days",
            route: "PO",
            withFood: true,
            instructions: "Take with food or milk",
            notes: "Take with plenty of water",
            prescriptionId: "back_pain",
          },
        ],
        chiefComplaint: "Lower back pain, muscle spasm, limited mobility",
        allergies: [],
        currentMedications: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        source: "api",
      },
      otitis_media: {
        id: "otitis_media",
        name: "Acute Otitis Media",
        category: "Infectious Disease",
        urgency: "medium",
        description: "Middle ear infection in children",
        patientName: "",
        prescriptionDate: new Date().toISOString().split("T")[0],
        diagnosis: "Acute Otitis Media",
        medicines: [
          {
            id: "med1",
            medicine: "Amoxicillin",
            dosage: "500 mg",
            frequency: "Three times daily",
            duration: "7-10 days",
            route: "PO",
            withFood: true,
            instructions: "Take with food to reduce stomach upset",
            notes: "Complete full course even if symptoms improve",
            prescriptionId: "otitis_media",
          },
        ],
        chiefComplaint: "Ear pain, fever, irritability, hearing loss",
        allergies: [],
        currentMedications: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        source: "api",
      },
    };

    // Merge predefined presets with user-created presets
    const allPresets = {
      ...presetPrescriptions,
      ...userPrescriptionsWithMedicines,
    };

    return NextResponse.json(allPresets);
  } catch (error) {
    console.error("Presets API error:", error);
    return NextResponse.json(
      { error: "Failed to load preset prescriptions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      diagnosis,
      chiefComplaint,
      category,
      urgency,
      instructions,
      followUp,
      restrictions,
      medicines: presetMedicines,
      source = "user_created",
    } = body;

    // Validate required fields
    if (!name || !diagnosis || !category) {
      return NextResponse.json(
        { error: "Name, diagnosis, and category are required" },
        { status: 400 }
      );
    }

    // Generate unique ID for the preset
    const presetId = `user_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Create the prescription record
    const newPrescription = {
      id: presetId,
      userId: "system", // Using system user for presets
      patientName: "", // Empty for presets
      diagnosis,
      chiefComplaint: chiefComplaint || "",
      instructions: instructions || "",
      followUp: followUp || "",
      restrictions: restrictions || "",
      doctorName: "System Preset",
      source,
      status: "active" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Insert the prescription
    await db.insert(prescriptions).values(newPrescription);

    // Insert medicines if provided
    if (presetMedicines && Array.isArray(presetMedicines)) {
      for (let i = 0; i < presetMedicines.length; i++) {
        const med = presetMedicines[i];
        if (med.medicine && med.dosage) {
          const medicineId = `${presetId}_med_${i}`;
          await db.insert(medicines).values({
            id: medicineId,
            prescriptionId: presetId,
            medicine: med.medicine,
            dosage: med.dosage,
            frequency: med.frequency || "",
            duration: med.duration || "",
            route: med.route || "",
            timing: med.timing || "",
            withFood: med.withFood || false,
            instructions: med.instructions || "",
            notes: med.notes || "",
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }
    }

    // Return the created preset
    const createdPreset = {
      ...newPrescription,
      medicines: presetMedicines || [],
      name,
      category,
      urgency: urgency || "medium",
    };

    return NextResponse.json(createdPreset, { status: 201 });
  } catch (error) {
    console.error("Error creating preset:", error);
    return NextResponse.json(
      { error: "Failed to create preset" },
      { status: 500 }
    );
  }
}
