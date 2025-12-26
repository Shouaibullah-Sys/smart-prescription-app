import { medicationDB, type Medication } from "./medicationDatabaseService";

export interface SmartSuggestion {
  medication: Medication;
  confidence: number;
  reasoning: string;
  dosage_suggestion?: string;
  frequency_suggestion?: string;
  precautions?: string[];
  alternatives?: Medication[];
}

export class AIMedicationService {
  async smartAutocomplete(
    query: string,
    context?: {
      symptoms?: string[];
      diagnosis?: string;
      allergies?: string[];
      age?: number;
      weight?: number;
    }
  ): Promise<SmartSuggestion[]> {
    try {
      console.log("Smart autocomplete for:", query);

      // Simply use local database for now
      const localResults = medicationDB.search(query);

      if (localResults.length === 0) {
        return [];
      }

      // Generate basic suggestions
      const suggestions = localResults.map((med) =>
        this.generateSuggestion(med, context)
      );

      return suggestions.slice(0, 10);
    } catch (error) {
      console.error("Error in smartAutocomplete:", error);
      return [];
    }
  }

  private generateSuggestion(
    medication: Medication,
    context?: {
      age?: number;
      weight?: number;
      diagnosis?: string;
    }
  ): SmartSuggestion {
    let confidence = 0.8;
    let reasoning = "Standard medication";
    let dosage = medication.strengths?.[0] || "Unknown";
    let frequency = "As directed by physician";

    // Simple age-based adjustments
    if (context?.age) {
      if (context.age < 12) {
        dosage = "Pediatric dose";
        reasoning = "Dosage adjusted for pediatric patient";
        confidence = 0.7;
      } else if (context.age > 65) {
        dosage = "Geriatric dose";
        reasoning = "Dosage adjusted for elderly patient";
        confidence = 0.7;
      }
    }

    return {
      medication,
      confidence,
      reasoning,
      dosage_suggestion: dosage,
      frequency_suggestion: frequency,
      precautions: medication.contraindications?.slice(0, 3) || [],
      alternatives: [],
    };
  }

  async suggestCompletions(query: string): Promise<string[]> {
    try {
      const completions = new Set<string>();

      // Get all medications for completion
      const allMeds = medicationDB.getAll();

      query = query.toLowerCase().trim();

      // Add exact and partial matches
      allMeds.forEach((med) => {
        const name = med.name.toLowerCase();
        const genericName = med.generic_name?.toLowerCase() || "";

        if (name.includes(query) || genericName.includes(query)) {
          completions.add(med.name);
        }
      });

      return Array.from(completions).slice(0, 10);
    } catch (error) {
      console.error("Error in suggestCompletions:", error);
      return [];
    }
  }
}

export const aiMedicationService = new AIMedicationService();
