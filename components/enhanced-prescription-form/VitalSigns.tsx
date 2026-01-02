// components/enhanced-prescription-form/VitalSigns.tsx
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Activity, Heart, Thermometer, Droplets } from "lucide-react";
import { Prescription } from "@/types/prescription";

interface VitalSignsProps {
  prescription: Prescription;
  onUpdateField: (field: keyof Prescription, value: any) => void;
}

export function VitalSigns({ prescription, onUpdateField }: VitalSignsProps) {
  return (
    <div
      id="vital-signs"
      className="flex flex-col sm:flex-row border-b dark:border-border/30 hover:bg-muted/20 transition-colors"
    >
      <div className="w-full sm:w-1/4 p-3 sm:p-4 border-b sm:border-b-0 sm:border-r dark:border-border/30 bg-gradient-to-b from-rose-50 to-white dark:from-rose-950/20 dark:to-gray-900">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 sm:p-2 bg-rose-100 dark:bg-rose-900 rounded-lg">
            <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-rose-600 dark:text-rose-300" />
          </div>
          <div>
            <div className="font-semibold text-sm sm:text-base">
              Vital Signs
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Real-time measurements
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-3 space-y-2">
          {prescription.bloodPressure && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-300">BP:</span>
              <span className="font-medium">{prescription.bloodPressure}</span>
            </div>
          )}
          {prescription.heartRate && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-300">HR:</span>
              <span className="font-medium">{prescription.heartRate} bpm</span>
            </div>
          )}
          {prescription.temperature && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-300">Temp:</span>
              <span className="font-medium">{prescription.temperature}°C</span>
            </div>
          )}
        </div>

        {/* Normal Range Reference */}
        <div className="mt-3 p-2 bg-white dark:bg-gray-800 rounded-md border border-rose-100 dark:border-rose-800">
          <div className="text-xs font-medium text-gray-600 dark:text-gray-300">
            Normal Ranges:
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            • BP: 120/80 mmHg
            <br />
            • HR: 60-100 bpm
            <br />• Temp: 36.5-37.5°C
          </div>
        </div>
      </div>

      <div className="w-full sm:w-3/4 p-3 sm:p-4">
        <div className="space-y-3">
          <Label className="text-xs sm:text-sm font-medium flex items-center gap-2 mb-2">
            <Heart className="h-3.5 w-3.5 text-rose-500" />
            Vital Sign Measurements
          </Label>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 rounded-lg border border-rose-100 dark:border-gray-700">
            {/* Blood Pressure */}
            <div className="space-y-1.5">
              <Label
                htmlFor="bloodPressure"
                className="text-xs font-medium flex items-center gap-1"
              >
                <Droplets className="h-3 w-3 text-red-500" />
                Blood Pressure
              </Label>
              <Input
                id="bloodPressure"
                value={prescription.bloodPressure || ""}
                onChange={(e) => onUpdateField("bloodPressure", e.target.value)}
                className="text-xs h-8 bg-white dark:bg-gray-800"
                placeholder="120/80"
              />
            </div>

            {/* Heart Rate */}
            <div className="space-y-1.5">
              <Label
                htmlFor="heartRate"
                className="text-xs font-medium flex items-center gap-1"
              >
                <Heart className="h-3 w-3 text-rose-500" />
                Heart Rate (bpm)
              </Label>
              <Input
                id="heartRate"
                type="number"
                min="0"
                value={prescription.heartRate || ""}
                onChange={(e) => onUpdateField("heartRate", e.target.value)}
                className="text-xs h-8 bg-white dark:bg-gray-800"
                placeholder="72"
              />
            </div>

            {/* Pulse Rate */}
            <div className="space-y-1.5">
              <Label
                htmlFor="pulseRate"
                className="text-xs font-medium flex items-center gap-1"
              >
                <Activity className="h-3 w-3 text-purple-500" />
                Pulse Rate (bpm)
              </Label>
              <Input
                id="pulseRate"
                type="number"
                min="0"
                value={prescription.pulseRate || ""}
                onChange={(e) => onUpdateField("pulseRate", e.target.value)}
                className="text-xs h-8 bg-white dark:bg-gray-800"
                placeholder="72"
              />
            </div>

            {/* Temperature */}
            <div className="space-y-1.5">
              <Label
                htmlFor="temperature"
                className="text-xs font-medium flex items-center gap-1"
              >
                <Thermometer className="h-3 w-3 text-orange-500" />
                Temperature (°C)
              </Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                value={prescription.temperature || ""}
                onChange={(e) => onUpdateField("temperature", e.target.value)}
                className="text-xs h-8 bg-white dark:bg-gray-800"
                placeholder="36.8"
              />
            </div>

            {/* Respiratory Rate */}
            <div className="space-y-1.5">
              <Label
                htmlFor="respiratoryRate"
                className="text-xs font-medium flex items-center gap-1"
              >
                <Activity className="h-3 w-3 text-blue-500" />
                Respiratory Rate (/min)
              </Label>
              <Input
                id="respiratoryRate"
                type="number"
                min="0"
                value={prescription.respiratoryRate || ""}
                onChange={(e) =>
                  onUpdateField("respiratoryRate", e.target.value)
                }
                className="text-xs h-8 bg-white dark:bg-gray-800"
                placeholder="16"
              />
            </div>

            {/* Oxygen Saturation */}
            <div className="space-y-1.5">
              <Label
                htmlFor="oxygenSaturation"
                className="text-xs font-medium flex items-center gap-1"
              >
                <Activity className="h-3 w-3 text-cyan-500" />
                SpO₂ (%)
              </Label>
              <Input
                id="oxygenSaturation"
                type="number"
                min="0"
                max="100"
                value={prescription.oxygenSaturation || ""}
                onChange={(e) =>
                  onUpdateField("oxygenSaturation", e.target.value)
                }
                className="text-xs h-8 bg-white dark:bg-gray-800"
                placeholder="98"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
