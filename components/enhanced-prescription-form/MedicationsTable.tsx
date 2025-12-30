// components/MedicationsTable.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Pill, Plus, Trash2 } from "lucide-react";
import { SmartMedicationSearch } from "@/components/SmartMedicationSearch";
import { Prescription, FormMedicine } from "@/types/prescription";

interface MedicationsTableProps {
  prescription: Prescription;
  onUpdateMedicine: (
    index: number,
    field: keyof FormMedicine,
    value: any
  ) => void;
  onMedicineInput: (index: number, value: string, medication?: any) => void;
  onAddMedicine: () => void;
  onRemoveMedicine: (index: number) => void;
}

export function MedicationsTable({
  prescription,
  onUpdateMedicine,
  onMedicineInput,
  onAddMedicine,
  onRemoveMedicine,
}: MedicationsTableProps) {
  const medicinesCount = prescription.medicines?.length || 0;

  // Helper function to safely parse allergies
  const getParsedAllergies = () => {
    const allergies = prescription.allergies;

    // If allergies is undefined or null, return empty array
    if (!allergies) return [];

    // If allergies is already an array, return it
    if (Array.isArray(allergies)) return allergies;

    // If allergies is a string, parse it
    if (typeof allergies === "string") {
      return allergies
        .split(/[،,\s]+/)
        .filter((a) => a.trim())
        .map((a) => a.trim());
    }

    // Fallback for any other type
    return [];
  };

  // Helper function to safely parse symptoms from chief complaint
  const getParsedSymptoms = () => {
    const chiefComplaint = prescription.chiefComplaint;

    if (!chiefComplaint) return [];

    if (typeof chiefComplaint === "string") {
      return chiefComplaint
        .split(/[،,]/)
        .filter(Boolean)
        .map((s) => s.trim());
    }

    return [];
  };

  return (
    <div className="flex flex-col sm:flex-row hover:bg-muted/20">
      <div className="w-full sm:w-1/4 p-3 sm:p-4 border-b sm:border-b-0 sm:border-r dark:border-border/30 bg-muted/10">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 sm:p-2 bg-red-100 rounded-lg">
            <Pill className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-600" />
          </div>
          <div>
            <div className="font-medium text-sm sm:text-base">Medications</div>
            <div className="text-xs text-muted-foreground">
              {medicinesCount} medication(s)
            </div>
          </div>
        </div>
      </div>
      <div className="w-full sm:w-3/4 p-3 sm:p-4">
        <div className="space-y-4">
          <div className="border border-border/50 dark:border-border/30 rounded-lg overflow-hidden bg-card">
            <div className="overflow-x-auto">
              <table className="w-full min-w-full">
                <thead>
                  <tr className="bg-muted/70 dark:border-border/50">
                    <th className="text-right p-2 sm:p-3 text-xs sm:text-sm font-medium w-[120px] sm:w-[150px] border-r border-border/20">
                      <div className="flex flex-col items-end">
                        <span className="font-semibold">Medication</span>
                        <span className="text-[10px] sm:text-xs text-muted-foreground font-normal">
                          * Required
                        </span>
                      </div>
                    </th>
                    <th className="text-right p-2 sm:p-3 text-xs sm:text-sm font-medium w-[80px] sm:w-[100px] border-r border-border/20">
                      <div className="flex flex-col items-end">
                        <span className="font-semibold">Dosage</span>
                        <span className="text-[10px] sm:text-xs text-muted-foreground font-normal">
                          * Required
                        </span>
                      </div>
                    </th>
                    <th className="text-right p-2 sm:p-3 text-xs sm:text-sm font-medium w-[90px] sm:w-[110px] border-r border-border/20">
                      <div className="flex flex-col items-end">
                        <span className="font-semibold">Frequency</span>
                        <span className="text-[10px] sm:text-xs text-muted-foreground font-normal">
                          * Required
                        </span>
                      </div>
                    </th>
                    <th className="text-right p-2 sm:p-3 text-xs sm:text-sm font-medium w-[80px] sm:w-[100px] border-r border-border/20">
                      <div className="flex flex-col items-end">
                        <span className="font-semibold">Duration</span>
                        <span className="text-[10px] sm:text-xs text-muted-foreground font-normal">
                          * Required
                        </span>
                      </div>
                    </th>
                    <th className="text-right p-2 sm:p-3 text-xs sm:text-sm font-medium w-[60px] sm:w-[80px] border-r border-border/20">
                      Form
                    </th>
                    <th className="text-right p-2 sm:p-3 text-xs sm:text-sm font-medium w-[80px] sm:w-[100px] border-r border-border/20">
                      Instructions
                    </th>
                    <th className="text-right p-2 sm:p-3 text-xs sm:text-sm font-medium w-[60px] sm:w-[70px]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {prescription.medicines?.map((medicine, index) => (
                    <tr
                      key={medicine.id || index}
                      className="border-b dark:border-border/30 hover:bg-muted/30"
                    >
                      <td className="p-2 sm:p-3">
                        <SmartMedicationSearch
                          value={medicine.medicine}
                          onChange={(value, medication) => {
                            onMedicineInput(index, value, medication);
                          }}
                          context={{
                            symptoms: getParsedSymptoms(),
                            allergies: getParsedAllergies(),
                            age:
                              parseInt(prescription.patientAge || "0") ||
                              undefined,
                            weight:
                              parseFloat(prescription.weight || "0") ||
                              undefined,
                          }}
                          placeholder="Medication name"
                          className="w-full text-xs sm:text-sm h-7 sm:h-9"
                        />
                      </td>
                      <td className="p-2 sm:p-3">
                        <Input
                          value={medicine.dosage}
                          onChange={(e) =>
                            onUpdateMedicine(index, "dosage", e.target.value)
                          }
                          placeholder="Dosage"
                          className="text-xs h-7 sm:h-9"
                        />
                      </td>
                      <td className="p-2 sm:p-3">
                        <Input
                          value={medicine.frequency}
                          onChange={(e) =>
                            onUpdateMedicine(index, "frequency", e.target.value)
                          }
                          placeholder="Frequency"
                          className="text-xs h-7 sm:h-9"
                        />
                      </td>
                      <td className="p-2 sm:p-3">
                        <Input
                          value={medicine.duration}
                          onChange={(e) =>
                            onUpdateMedicine(index, "duration", e.target.value)
                          }
                          placeholder="Duration"
                          className="text-xs h-7 sm:h-9"
                        />
                      </td>
                      <td className="p-2 sm:p-3">
                        <Input
                          value={medicine.form}
                          onChange={(e) =>
                            onUpdateMedicine(index, "form", e.target.value)
                          }
                          placeholder="Form"
                          className="text-xs h-7 sm:h-9"
                        />
                      </td>
                      <td className="p-2 sm:p-3">
                        <Input
                          value={medicine.instructions}
                          onChange={(e) =>
                            onUpdateMedicine(
                              index,
                              "instructions",
                              e.target.value
                            )
                          }
                          placeholder="Instructions"
                          className="text-xs h-7 sm:h-9"
                        />
                      </td>
                      <td className="p-2 sm:p-3">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => onRemoveMedicine(index)}
                              disabled={prescription.medicines?.length === 1}
                              className="h-6 w-6 sm:h-8 sm:w-8 p-0"
                            >
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete medication</TooltipContent>
                        </Tooltip>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={onAddMedicine}
              size="sm"
              variant="outline"
              className="text-xs sm:text-sm h-7 sm:h-9 px-2 sm:px-4"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Add medication
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
