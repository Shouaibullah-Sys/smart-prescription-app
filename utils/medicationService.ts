// utils/medicationService.ts
import { FormMedicine } from "@/types/prescription";
import { translateTiming } from "@/lib/medicationTimingTranslations";

export async function getAIMedicationSuggestions(
  diagnosis: string,
  symptoms: string
): Promise<FormMedicine[]> {
  try {
    // Use Hugging Face inference API with medical dataset
    const response = await fetch(
      "https://api-inference.huggingface.co/models/truehealth/medicationqa",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: `Based on diagnosis: ${diagnosis} and symptoms: ${symptoms}, recommend appropriate medications with dosages and instructions.`,
          parameters: {
            max_new_tokens: 500,
            temperature: 0.3, // Lower for medical accuracy
          },
        }),
      }
    );

    if (!response.ok) {
      // Fallback to dataset-based matching
      return getDatasetBasedSuggestions(diagnosis, symptoms);
    }

    const result = await response.json();
    return parseAIMedicationResponse(result);
  } catch (error) {
    console.error("AI medication suggestion error:", error);
    return getDatasetBasedSuggestions(diagnosis, symptoms);
  }
}

// Parse AI response into FormMedicine format
function parseAIMedicationResponse(result: any): FormMedicine[] {
  try {
    // Extract generated text from Hugging Face response
    const generatedText = result[0]?.generated_text || "";

    if (!generatedText) {
      return getDatasetBasedSuggestions("", "");
    }

    // Simple parsing logic - you can enhance this based on your AI model's output format
    const medications: FormMedicine[] = [];

    // Split by medication sections (this is a simple example - adjust based on your AI output)
    const medicationSections = generatedText.split(/\d+\.\s+/).filter(Boolean);

    for (const section of medicationSections) {
      const medicineMatch = section.match(/(\w+)\s*(?:\(([^)]+)\))?/);
      const dosageMatch = section.match(/(\d+\s*(?:mg|mcg|g))/i);
      const frequencyMatch = section.match(
        /(?:every|each)\s+(\d+\s*(?:hour|day|week)s?)/i
      );
      const durationMatch = section.match(/(\d+\s*(?:day|week|month)s?)/i);

      if (medicineMatch) {
        medications.push({
          id: Math.random().toString(36).substr(2, 9),
          medicine: medicineMatch[1] || "",
          dosage: dosageMatch?.[1] || "500 mg",
          form: "tablet", // Default form
          frequency: frequencyMatch?.[1]
            ? `هر ${frequencyMatch[1]}`
            : "هر ۸ ساعت",
          duration: durationMatch?.[1] || "۷ روز",
          route: "oral",
          timing: translateTiming("after_meal"),
          withFood: false,
          instructions: "طبق دستور مصرف شود",
          notes: "داروی تجویزی",
          prescriptionId: "", // This will be set when saving
        });
      }
    }

    return medications.length > 0
      ? medications
      : getDatasetBasedSuggestions("", "");
  } catch (error) {
    console.error("Error parsing AI response:", error);
    return getDatasetBasedSuggestions("", "");
  }
}

// Enhanced dataset matching with complete FormMedicine types
function getDatasetBasedSuggestions(
  diagnosis: string,
  symptoms: string
): FormMedicine[] {
  const commonMedications: { [key: string]: FormMedicine[] } = {
    "برونشیت حاد": [
      {
        id: "1",
        medicine: "Amoxicillin",
        dosage: "500 mg",
        form: "capsule",
        frequency: "هر ۸ ساعت",
        duration: "۷ روز",
        route: "oral",
        timing: translateTiming("after_meal"),
        withFood: true,
        instructions: "قبل از غذا مصرف شود",
        notes: "آنتی بیوتیک وسیع الطیف",
        prescriptionId: "",
      },
      {
        id: "2",
        medicine: "Bromhexine",
        dosage: "8 mg",
        form: "tablet",
        frequency: "هر ۸ ساعت",
        duration: "۵ روز",
        route: "oral",
        timing: "after_meal",
        withFood: false,
        instructions: "بعد از غذا",
        notes: "اکسپکتورانت",
        prescriptionId: "",
      },
    ],
    "فارنژیت حاد": [
      {
        id: "1",
        medicine: "Penicillin V",
        dosage: "500 mg",
        form: "tablet",
        frequency: "هر ۶ ساعت",
        duration: "۱۰ روز",
        route: "oral",
        timing: translateTiming("before_meal"),
        withFood: false,
        instructions: "نیم ساعت قبل از غذا",
        notes: "برای عفونت استرپتوکوکی",
        prescriptionId: "",
      },
      {
        id: "2",
        medicine: "Ibuprofen",
        dosage: "400 mg",
        form: "tablet",
        frequency: "هر ۸ ساعت",
        duration: "۵ روز",
        route: "oral",
        timing: translateTiming("after_meal"),
        withFood: true,
        instructions: "با غذا مصرف شود",
        notes: "برای درد و التهاب",
        prescriptionId: "",
      },
    ],
    "سینوزیت حاد": [
      {
        id: "1",
        medicine: "Amoxicillin-Clavulanate",
        dosage: "625 mg",
        form: "tablet",
        frequency: "هر ۱۲ ساعت",
        duration: "۷ روز",
        route: "oral",
        timing: "after_meal",
        withFood: true,
        instructions: "با غذا",
        notes: "آنتی بیوتیک",
        prescriptionId: "",
      },
    ],
    "عفونت ادراری": [
      {
        id: "1",
        medicine: "Ciprofloxacin",
        dosage: "500 mg",
        form: "tablet",
        frequency: "هر ۱۲ ساعت",
        duration: "۷ روز",
        route: "oral",
        timing: translateTiming("before_meal"),
        withFood: false,
        instructions: "با معده خالی",
        notes: "آنتی بیوتیک",
        prescriptionId: "",
      },
    ],
    میگرن: [
      {
        id: "1",
        medicine: "Sumatriptan",
        dosage: "50 mg",
        form: "tablet",
        frequency: "در شروع حمله",
        duration: "طبق نیاز",
        route: "oral",
        timing: translateTiming("after_meal"),
        withFood: true,
        instructions: "در شروع سردرد مصرف شود",
        notes: "حداکثر ۲ عدد در روز",
        prescriptionId: "",
      },
    ],
  };

  // Find the best matching diagnosis
  const matchedDiagnosis = Object.keys(commonMedications).find(
    (key) => diagnosis.includes(key) || symptoms.includes(key)
  );

  return matchedDiagnosis
    ? commonMedications[matchedDiagnosis]
    : [
        {
          id: "default",
          medicine: "Consult Physician",
          dosage: "As directed",
          form: "tablet",
          frequency: "As needed",
          duration: "As directed",
          route: "oral",
          timing: translateTiming("after_meal"),
          withFood: false,
          instructions: "Please consult with healthcare provider",
          notes: "Diagnosis requires professional evaluation",
          prescriptionId: "",
        },
      ];
}

// Alternative: Use a more robust AI model with better structured output
export async function getStructuredAIMedications(
  diagnosis: string,
  symptoms: string
): Promise<FormMedicine[]> {
  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/microsoft/BioGPT-Large",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: `As a medical professional, prescribe appropriate medications for ${diagnosis} with symptoms: ${symptoms}. Format response as JSON with fields: medicine, dosage, form, frequency, duration, route, instructions.`,
          parameters: {
            max_new_tokens: 600,
            temperature: 0.2,
          },
        }),
      }
    );

    if (response.ok) {
      const result = await response.json();
      return parseStructuredAIResponse(result);
    }

    return getDatasetBasedSuggestions(diagnosis, symptoms);
  } catch (error) {
    console.error("Structured AI medication error:", error);
    return getDatasetBasedSuggestions(diagnosis, symptoms);
  }
}

// Parse structured JSON response from AI
function parseStructuredAIResponse(result: any): FormMedicine[] {
  try {
    const generatedText = result[0]?.generated_text || "";

    // Try to extract JSON from the response
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const medicationData = JSON.parse(jsonMatch[0]);

      // Handle both single medication and array
      const medications = Array.isArray(medicationData)
        ? medicationData
        : [medicationData];

      return medications.map((med: any, index: number) => ({
        id: Math.random().toString(36).substr(2, 9),
        medicine: med.medicine || "",
        dosage: med.dosage || "500 mg",
        form: med.form || "tablet",
        frequency: med.frequency || "هر ۸ ساعت",
        duration: med.duration || "۷ روز",
        route: med.route || "oral",
        timing: translateTiming("after_meal"),
        withFood: false,
        instructions: med.instructions || "طبق دستور مصرف شود",
        notes: med.notes || "داروی تجویزی",
        prescriptionId: "",
      }));
    }

    return getDatasetBasedSuggestions("", "");
  } catch (error) {
    console.error("Error parsing structured AI response:", error);
    return getDatasetBasedSuggestions("", "");
  }
}

// Utility function to ensure FormMedicine compatibility
export function ensureFormMedicineCompatibility(
  medications: any[]
): FormMedicine[] {
  return medications.map((med) => ({
    id: med.id || Math.random().toString(36).substr(2, 9),
    medicine: med.medicine || "",
    dosage: med.dosage || "",
    form: med.form || "tablet",
    frequency: med.frequency || "",
    duration: med.duration || "",
    route: med.route || "oral",
    timing: med.timing || translateTiming("after_meal"),
    withFood: med.withFood !== undefined ? med.withFood : false,
    instructions: med.instructions || "",
    notes: med.notes || "",
    prescriptionId: med.prescriptionId || "",
  }));
}
