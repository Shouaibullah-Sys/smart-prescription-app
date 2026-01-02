// Doctor Info component for the enhanced prescription form
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp, DollarSign } from "lucide-react";
import { Prescription } from "@/types/prescription";

interface DoctorInfoProps {
  prescription: Prescription;
  onUpdateField: (field: keyof Prescription, value: any) => void;
}

export function DoctorInfo({ prescription, onUpdateField }: DoctorInfoProps) {
  return (
    <div
      id="doctor-info"
      className="flex flex-col sm:flex-row border-b dark:border-border/30 hover:bg-muted/20"
    >
      <div className="w-full sm:w-1/4 p-3 sm:p-4 border-b sm:border-b-0 sm:border-r dark:border-border/30 bg-muted/10">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 sm:p-2 bg-indigo-100 rounded-lg">
            <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-indigo-600" />
          </div>
          <div>
            <div className="font-medium text-sm sm:text-base">
              Doctor & Clinic
            </div>
            <div className="text-xs text-muted-foreground">
              Prescriber details
            </div>
          </div>
        </div>
      </div>
      <div className="w-full sm:w-3/4 p-3 sm:p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <Label
              htmlFor="doctorName"
              className="text-xs sm:text-sm font-medium"
            >
              Doctor Name
            </Label>
            <Input
              id="doctorName"
              value={prescription.doctorName || ""}
              onChange={(e) => onUpdateField("doctorName", e.target.value)}
              className="mt-1.5 text-xs sm:text-sm h-8 sm:h-10"
              placeholder="Enter doctor name"
            />
          </div>
          <div>
            <Label
              htmlFor="clinicName"
              className="text-xs sm:text-sm font-medium"
            >
              Clinic Name
            </Label>
            <Input
              id="clinicName"
              value={prescription.clinicName || ""}
              onChange={(e) => onUpdateField("clinicName", e.target.value)}
              className="mt-1.5 text-xs sm:text-sm h-8 sm:h-10"
              placeholder="Enter clinic name"
            />
          </div>
          <div>
            <Label
              htmlFor="doctorFree"
              className="text-xs sm:text-sm font-medium"
            >
              <DollarSign className="h-3 w-3 inline ml-1" />
              Visit Fee
            </Label>
            <Input
              id="doctorFree"
              value={prescription.doctorFree || ""}
              onChange={(e) => onUpdateField("doctorFree", e.target.value)}
              className="mt-1.5 text-xs sm:text-sm h-8 sm:h-10"
              placeholder="Enter fee"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
