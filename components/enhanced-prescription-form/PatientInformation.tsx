import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, Phone, MapPin, Calendar } from "lucide-react";
import { Prescription } from "@/types/prescription";

interface PatientInformationProps {
  prescription: Prescription;
  onUpdateField: (field: keyof Prescription, value: any) => void;
}

export function PatientInformation({
  prescription,
  onUpdateField,
}: PatientInformationProps) {
  return (
    <div className="flex flex-col sm:flex-row border-b dark:border-border/30 hover:bg-muted/20 transition-colors">
      <div className="w-full sm:w-1/4 p-3 sm:p-4 border-b sm:border-b-0 sm:border-r dark:border-border/30 bg-gradient-to-b from-blue-50 to-white dark:from-blue-950/20 dark:to-gray-900">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-300" />
          </div>
          <div>
            <div className="font-semibold text-sm sm:text-base">
              Patient Information
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Personal & Contact Details
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-3 space-y-2">
          {prescription.patientAge && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-300">Age:</span>
              <span className="font-medium">{prescription.patientAge}</span>
            </div>
          )}
          {prescription.patientGender && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-300">Sex:</span>
              <span className="font-medium">{prescription.patientGender}</span>
            </div>
          )}
          {prescription.weight && prescription.height && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-300">
                Measurements:
              </span>
              <span className="font-medium">
                {prescription.weight}kg / {prescription.height}cm
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="w-full sm:w-3/4 p-3 sm:p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <Label
              htmlFor="patientName"
              className="text-xs sm:text-sm font-medium flex items-center gap-1"
            >
              <User className="h-3.5 w-3.5" />
              Full Patient Name *
            </Label>
            <Input
              id="patientName"
              value={prescription.patientName || ""}
              onChange={(e) => onUpdateField("patientName", e.target.value)}
              className="text-xs sm:text-sm h-8 sm:h-10"
              placeholder="First and Last Name"
              required
            />
          </div>

          {/* Age */}
          <div className="space-y-1.5">
            <Label
              htmlFor="patientAge"
              className="text-xs sm:text-sm font-medium flex items-center gap-1"
            >
              <Calendar className="h-3.5 w-3.5" />
              Age
            </Label>
            <Input
              id="patientAge"
              type="number"
              min="0"
              max="120"
              value={prescription.patientAge || ""}
              onChange={(e) => onUpdateField("patientAge", e.target.value)}
              className="text-xs sm:text-sm h-8 sm:h-10"
              placeholder="Example: 35"
            />
          </div>

          {/* Gender */}
          <div className="space-y-1.5">
            <Label
              htmlFor="patientGender"
              className="text-xs sm:text-sm font-medium"
            >
              Sex
            </Label>
            <Select
              value={prescription.patientGender || ""}
              onValueChange={(value) => onUpdateField("patientGender", value)}
            >
              <SelectTrigger className="text-xs sm:text-sm h-8 sm:h-10 text-foreground">
                <SelectValue placeholder="Select Sex" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
                <SelectItem value="Prefer not to say">
                  Prefer not to say
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Phone Number */}
          <div className="space-y-1.5">
            <Label
              htmlFor="patientPhone"
              className="text-xs sm:text-sm font-medium flex items-center gap-1"
            >
              <Phone className="h-3.5 w-3.5" />
              Phone Number
            </Label>
            <Input
              id="patientPhone"
              type="tel"
              value={prescription.patientPhone || ""}
              onChange={(e) => onUpdateField("patientPhone", e.target.value)}
              className="text-xs sm:text-sm h-8 sm:h-10"
              placeholder="09123456789"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
