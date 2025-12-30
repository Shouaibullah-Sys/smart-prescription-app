// components/prescription-details.tsx
"use client";

import { Prescription } from "../types/prescription";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Pill,
  Clock,
  User,
  Calendar,
  FileText,
  Heart,
  Activity,
  Thermometer,
  Wind,
  Gauge,
  Weight,
  Ruler,
  Phone,
  MapPin,
  Stethoscope,
  AlertTriangle,
  Users,
  UserCheck,
  Clock4,
  Shield,
  Brain,
  Bot,
} from "lucide-react";

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
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Patient Name
              </label>
              <p className="text-lg font-semibold">
                {prescription.patientName || "Not specified"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Age
              </label>
              <p className="text-lg">
                {prescription.patientAge || "Not specified"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Gender
              </label>
              <p className="text-lg">
                {prescription.patientGender || "Not specified"}
              </p>
            </div>
          </div>

          {(prescription.patientPhone || prescription.patientAddress) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {prescription.patientPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Phone
                    </label>
                    <p className="text-sm">{prescription.patientPhone}</p>
                  </div>
                </div>
              )}
              {prescription.patientAddress && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Address
                    </label>
                    <p className="text-sm">{prescription.patientAddress}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {prescription.chiefComplaint && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Chief Complaint
              </label>
              <p className="text-sm mt-1">{prescription.chiefComplaint}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vital Signs & Measurements */}
      {(prescription.pulseRate ||
        prescription.heartRate ||
        prescription.bloodPressure ||
        prescription.temperature ||
        prescription.respiratoryRate ||
        prescription.oxygenSaturation ||
        prescription.weight ||
        prescription.height) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Vital Signs & Measurements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Vital Signs */}
            {(prescription.pulseRate ||
              prescription.heartRate ||
              prescription.bloodPressure ||
              prescription.temperature ||
              prescription.respiratoryRate ||
              prescription.oxygenSaturation) && (
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Vital Signs
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {prescription.pulseRate && (
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-red-500" />
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Pulse Rate
                        </label>
                        <p className="text-sm font-medium">
                          {prescription.pulseRate}
                        </p>
                      </div>
                    </div>
                  )}
                  {prescription.heartRate && (
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-red-500" />
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Heart Rate
                        </label>
                        <p className="text-sm font-medium">
                          {prescription.heartRate}
                        </p>
                      </div>
                    </div>
                  )}
                  {prescription.bloodPressure && (
                    <div className="flex items-center gap-2">
                      <Gauge className="h-4 w-4 text-blue-500" />
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Blood Pressure
                        </label>
                        <p className="text-sm font-medium">
                          {prescription.bloodPressure}
                        </p>
                      </div>
                    </div>
                  )}
                  {prescription.temperature && (
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4 text-orange-500" />
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Temperature
                        </label>
                        <p className="text-sm font-medium">
                          {prescription.temperature}
                        </p>
                      </div>
                    </div>
                  )}
                  {prescription.respiratoryRate && (
                    <div className="flex items-center gap-2">
                      <Wind className="h-4 w-4 text-green-500" />
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Respiratory Rate
                        </label>
                        <p className="text-sm font-medium">
                          {prescription.respiratoryRate}
                        </p>
                      </div>
                    </div>
                  )}
                  {prescription.oxygenSaturation && (
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-purple-500" />
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Oxygen Saturation
                        </label>
                        <p className="text-sm font-medium">
                          {prescription.oxygenSaturation}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Anthropometry */}
            {(prescription.weight || prescription.height) && (
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Ruler className="h-4 w-4" />
                  Anthropometry
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {prescription.weight && (
                    <div className="flex items-center gap-2">
                      <Weight className="h-4 w-4 text-blue-500" />
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Weight
                        </label>
                        <p className="text-sm font-medium">
                          {prescription.weight}
                        </p>
                      </div>
                    </div>
                  )}
                  {prescription.height && (
                    <div className="flex items-center gap-2">
                      <Ruler className="h-4 w-4 text-green-500" />
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Height
                        </label>
                        <p className="text-sm font-medium">
                          {prescription.height}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Medical History */}
      {(prescription.pastMedicalHistory ||
        prescription.familyHistory ||
        prescription.socialHistory) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Medical History
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {prescription.pastMedicalHistory && (
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  Past Medical History
                </label>
                <p className="text-sm mt-1">
                  {prescription.pastMedicalHistory}
                </p>
              </div>
            )}
            {prescription.familyHistory && (
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Family History
                </label>
                <p className="text-sm mt-1">{prescription.familyHistory}</p>
              </div>
            )}
            {prescription.socialHistory && (
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Social History
                </label>
                <p className="text-sm mt-1">{prescription.socialHistory}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Physical Examination */}
      {(prescription.physicalExam ||
        (prescription.medicalExams && prescription.medicalExams.length > 0) ||
        prescription.examNotes) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Physical Examination
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {prescription.physicalExam && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Physical Examination
                </label>
                <p className="text-sm mt-1">{prescription.physicalExam}</p>
              </div>
            )}
            {prescription.medicalExams &&
              prescription.medicalExams.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Medical Examinations
                  </label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {prescription.medicalExams.map((exam, index) => (
                      <Badge key={index} variant="outline">
                        {exam}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            {prescription.examNotes && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Examination Notes
                </label>
                <p className="text-sm mt-1">{prescription.examNotes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

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

      {
        (() => {
          const tests = prescription.prescriptionTests;
          if (!tests || tests.length === 0) return null as any;

          return (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Medical Tests & Procedures ({tests.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tests.map((test, index) => (
                    <div
                      key={test.id || index}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">
                            {index + 1}. {test.testName || "Unknown Test"}
                          </h4>
                          {test.priority && (
                            <Badge
                              variant={
                                test.priority === "urgent"
                                  ? "destructive"
                                  : test.priority === "stat"
                                  ? "default"
                                  : "outline"
                              }
                              className="mt-1"
                            >
                              {test.priority}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {test.notes && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Notes
                          </label>
                          <p className="text-sm mt-1">{test.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })() as any
      }

      {/* Allergies & Current Medications */}
      {((prescription.allergies && prescription.allergies.trim()) ||
        (prescription.currentMedications &&
          prescription.currentMedications.trim())) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Allergies & Current Medications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {prescription.allergies && prescription.allergies.trim() && (
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  Allergies
                </label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {prescription.allergies.split(",").map((allergy, index) => (
                    <Badge key={index} variant="destructive">
                      {allergy.trim()}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {prescription.currentMedications &&
              prescription.currentMedications.trim() && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Current Medications
                  </label>
                  <div className="space-y-1 mt-1">
                    {prescription.currentMedications
                      .split(",")
                      .map((med, index) => (
                        <p key={index} className="text-sm">
                          {med.trim()}
                        </p>
                      ))}
                  </div>
                </div>
              )}
          </CardContent>
        </Card>
      )}

      {/* Treatment Information */}
      {(prescription.instructions ||
        prescription.followUp ||
        prescription.restrictions) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Treatment Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {prescription.instructions && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Instructions
                </label>
                <p className="text-sm mt-1">{prescription.instructions}</p>
              </div>
            )}
            {prescription.followUp && (
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Clock4 className="h-4 w-4" />
                  Follow-up
                </label>
                <p className="text-sm mt-1">{prescription.followUp}</p>
              </div>
            )}
            {prescription.restrictions && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Restrictions
                </label>
                <p className="text-sm mt-1">{prescription.restrictions}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Doctor Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            Doctor Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Doctor Name
              </label>
              <p className="text-lg font-semibold">
                {prescription.doctorName || "Not specified"}
              </p>
            </div>
            {prescription.doctorLicenseNumber && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  License Number
                </label>
                <p className="text-sm">{prescription.doctorLicenseNumber}</p>
              </div>
            )}
          </div>
          {(prescription.clinicName ||
            prescription.clinicAddress ||
            prescription.doctorFree) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {prescription.clinicName && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Clinic Name
                  </label>
                  <p className="text-sm">{prescription.clinicName}</p>
                </div>
              )}
              {prescription.clinicAddress && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Clinic Address
                  </label>
                  <p className="text-sm">{prescription.clinicAddress}</p>
                </div>
              )}
              {prescription.doctorFree && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Visit Fee
                  </label>
                  <p className="text-sm">{prescription.doctorFree}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Prescription Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Prescription Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Prescription ID
              </label>
              <p className="font-mono text-xs break-all">{prescription.id}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Prescription Number
              </label>
              <p>{prescription.prescriptionNumber || "Not assigned"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Source
              </label>
              <p className="capitalize">{prescription.source || "Unknown"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Status
              </label>
              <Badge
                variant={
                  prescription.status === "active" ? "default" : "outline"
                }
                className="mt-1"
              >
                {prescription.status || "active"}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Prescription Date
              </label>
              <p>
                {new Date(prescription.prescriptionDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Created At
              </label>
              <p>{new Date(prescription.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Last Updated
              </label>
              <p>{new Date(prescription.updatedAt).toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Information */}
      {(prescription.aiConfidence ||
        prescription.aiModelUsed ||
        prescription.processingTime ||
        prescription.rawAiResponse) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              AI Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {prescription.aiConfidence && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    AI Confidence
                  </label>
                  <p className="font-medium">{prescription.aiConfidence}</p>
                </div>
              )}
              {prescription.aiModelUsed && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    AI Model Used
                  </label>
                  <p className="font-mono text-xs">
                    {prescription.aiModelUsed}
                  </p>
                </div>
              )}
              {prescription.processingTime && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Processing Time (ms)
                  </label>
                  <p>{prescription.processingTime}</p>
                </div>
              )}
            </div>
            {prescription.rawAiResponse !== undefined && (
              <div className="mt-4">
                <label className="text-sm font-medium text-muted-foreground">
                  Raw AI Response
                </label>
                <pre className="text-xs bg-muted p-3 rounded-md mt-1 overflow-x-auto">
                  {String(JSON.stringify(prescription.rawAiResponse, null, 2))}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
