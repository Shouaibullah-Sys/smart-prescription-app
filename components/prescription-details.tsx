// components/prescription-details.tsx
"use client";

import { Prescription } from "../types/prescription";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pill, Clock, User, Calendar, FileText } from "lucide-react";

interface PrescriptionDetailsProps {
  prescription: Prescription;
  onClose: () => void;
}

export function PrescriptionDetails({
  prescription,
  onClose,
}: PrescriptionDetailsProps) {
  return (
    <div className="space-y-6">
      {/* Patient Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Patient Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Patient Name
              </label>
              <p className="text-lg">
                {prescription.patientName || "Not specified"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Prescription Date
              </label>
              <p className="text-lg">
                {new Date(prescription.prescriptionDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          {prescription.chiefComplaint && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Chief Complaint
              </label>
              <p className="text-sm">{prescription.chiefComplaint}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Medications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5" />
            Medications ({prescription.medicines?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {prescription.medicines && prescription.medicines.length > 0 ? (
              prescription.medicines.map((med, index) => (
                <div
                  key={med.id || index}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">
                        {index + 1}. {med.medicine}
                      </h4>
                      <p className="text-muted-foreground">{med.dosage}</p>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      {med.route}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="font-medium text-muted-foreground">
                        Frequency
                      </label>
                      <p>{med.frequency}</p>
                    </div>
                    <div>
                      <label className="font-medium text-muted-foreground">
                        Duration
                      </label>
                      <p>{med.duration}</p>
                    </div>
                    {med.withFood !== undefined && (
                      <div>
                        <label className="font-medium text-muted-foreground">
                          With Food
                        </label>
                        <p>{med.withFood ? "Yes" : "No"}</p>
                      </div>
                    )}
                  </div>

                  {med.instructions && (
                    <div>
                      <label className="font-medium text-muted-foreground">
                        Instructions
                      </label>
                      <p className="text-sm">{med.instructions}</p>
                    </div>
                  )}

                  {med.notes && (
                    <div>
                      <label className="font-medium text-muted-foreground">
                        Notes
                      </label>
                      <p className="text-sm">{med.notes}</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No medications specified
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      {((prescription.allergies &&
        prescription.allergies.length &&
        prescription.allergies.length > 0) ||
        (prescription.currentMedications &&
          prescription.currentMedications.length &&
          prescription.currentMedications.length > 0)) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Additional Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {prescription.allergies && prescription.allergies.length > 0 && (
              <div>
                <label className="font-medium text-muted-foreground">
                  Allergies
                </label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {prescription.allergies.map((allergy, index) => (
                    <Badge key={index} variant="destructive">
                      {allergy}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {prescription.currentMedications &&
              prescription.currentMedications.length > 0 && (
                <div>
                  <label className="font-medium text-muted-foreground">
                    Current Medications
                  </label>
                  <div className="space-y-1 mt-1">
                    {prescription.currentMedications.map((med, index) => (
                      <p key={index} className="text-sm">
                        {med}
                      </p>
                    ))}
                  </div>
                </div>
              )}
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Prescription Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="font-medium text-muted-foreground">
                Prescription ID
              </label>
              <p>{prescription.id}</p>
            </div>
            <div>
              <label className="font-medium text-muted-foreground">
                Source
              </label>
              <p className="capitalize">{prescription.source || "Unknown"}</p>
            </div>
            <div>
              <label className="font-medium text-muted-foreground">
                Created At
              </label>
              <p>{new Date(prescription.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <label className="font-medium text-muted-foreground">
                Last Updated
              </label>
              <p>{new Date(prescription.updatedAt).toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
