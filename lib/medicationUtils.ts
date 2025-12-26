// Utility functions for medication handling

export function formatMedicationName(
  name: string,
  language: "fa" | "en" = "fa"
): string {
  // Format medication names professionally
  const suffixes = [
    "قرص",
    "کپسول",
    "شربت",
    "آمپول",
    "ویال",
    "پماد",
    "کریم",
    "قطره",
    "اسپری",
  ];

  let formatted = name.trim();

  // Remove common suffixes for better matching
  suffixes.forEach((suffix) => {
    if (formatted.endsWith(` ${suffix}`)) {
      formatted = formatted.replace(` ${suffix}`, "");
    }
  });

  // Capitalize appropriately
  if (language === "fa") {
    return formatted;
  } else {
    return formatted
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }
}

export function validateDosage(dosage: string): {
  isValid: boolean;
  message?: string;
  parsed?: {
    value: number;
    unit: string;
  };
} {
  const regex = /^(\d+(?:\.\d+)?)\s*(mg|g|mcg|ml|µg|IU|%|واحد)$/i;
  const match = dosage.match(regex);

  if (!match) {
    return {
      isValid: false,
      message: "فرت دوز نامعتبر است. مثال: 500mg, 10ml",
    };
  }

  return {
    isValid: true,
    parsed: {
      value: parseFloat(match[1]),
      unit: match[2].toLowerCase(),
    },
  };
}

export function calculateDosageByWeight(
  dosagePerKg: number,
  weight: number,
  maxDosage?: number
): {
  calculated: number;
  unit: string;
  warning?: string;
} {
  const calculated = dosagePerKg * weight;

  let warning;
  if (maxDosage && calculated > maxDosage) {
    warning = `دوز محاسبه شده (${calculated}) از حداکثر مجاز (${maxDosage}) بیشتر است`;
  }

  return {
    calculated,
    unit: "mg",
    warning,
  };
}

export function checkDrugInteractions(
  medications: string[],
  database: any[]
): Array<{
  medication1: string;
  medication2: string;
  severity: "low" | "moderate" | "high";
  description: string;
  recommendation: string;
}> {
  const interactions = [];

  // Simple interaction checker
  const interactionRules = [
    {
      drugs: ["وارفارین", "آسپرین"],
      severity: "high" as const,
      description: "خطر خونریزی افزایش می‌یابد",
      recommendation: "نظارت دقیق بر INR",
    },
    {
      drugs: ["دیگوکسین", "فوروزماید"],
      severity: "moderate" as const,
      description: "خطر مسمومیت با دیگوکسین",
      recommendation: "پایش سطح دیگوکسین",
    },
    // Add more rules...
  ];

  for (let i = 0; i < medications.length; i++) {
    for (let j = i + 1; j < medications.length; j++) {
      const med1 = medications[i];
      const med2 = medications[j];

      for (const rule of interactionRules) {
        if (
          (rule.drugs.includes(med1) && rule.drugs.includes(med2)) ||
          (rule.drugs.some((d) => med1.includes(d)) &&
            rule.drugs.some((d) => med2.includes(d)))
        ) {
          interactions.push({
            medication1: med1,
            medication2: med2,
            severity: rule.severity,
            description: rule.description,
            recommendation: rule.recommendation,
          });
        }
      }
    }
  }

  return interactions;
}

export function generatePrescriptionGuidelines(
  medication: string,
  context: {
    age?: number;
    renalFunction?: "normal" | "impaired" | "dialysis";
    hepaticFunction?: "normal" | "impaired";
    pregnancy?: boolean;
    lactation?: boolean;
  }
): string[] {
  const guidelines = [];

  // Age-based guidelines
  if (context.age && context.age < 12) {
    guidelines.push("دوز بر اساس وزن بدن محاسبه شود");
  }

  if (context.age && context.age > 65) {
    guidelines.push("شروع با دوز پایین و افزایش تدریجی");
  }

  // Renal impairment
  if (context.renalFunction === "impaired") {
    guidelines.push("تنظیم دوز بر اساس عملکرد کلیه");
    guidelines.push("پایش سطح خونی در صورت نیاز");
  }

  // Hepatic impairment
  if (context.hepaticFunction === "impaired") {
    guidelines.push("احتیاط در بیماران با اختلال کبدی");
  }

  // Pregnancy
  if (context.pregnancy) {
    guidelines.push("مصرف فقط در صورت ضرورت و زیر نظر پزشک");
  }

  // Lactation
  if (context.lactation) {
    guidelines.push("احتیاط در دوران شیردهی");
  }

  return guidelines;
}
