// components/SmartTextForm.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Stethoscope, Pill, Sparkles, Eraser, Brain } from "lucide-react";
import AutocompleteInput from "./AutocompleteInput";
import LoadingSpinner from "./LoadingSpinner";
import { validateInput } from "../utils/validation";
import { Prescription } from "../types/prescription";

interface SmartTextFormProps {
  onPrescriptionGenerated: (result: Prescription) => void;
  onLoadingChange: (loading: boolean) => void;
  onError: (error: string) => void;
  loading: boolean;
}

export default function SmartTextForm({
  onPrescriptionGenerated,
  onLoadingChange,
  onError,
  loading,
}: SmartTextFormProps) {
  const [inputText, setInputText] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateInput(inputText);
    if (!validation.isValid) {
      onError(validation.message);
      return;
    }

    onLoadingChange(true);
    setIsAnalyzing(true);

    try {
      // Use AI to generate prescription
      const response = await fetch("/api/generate-prescription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symptoms: inputText,
          patientHistory: "",
        }),
      });

      if (!response.ok) {
        throw new Error("AI service unavailable");
      }

      const result = await response.json();

      if (result.success) {
        const aiPrescription: Prescription = {
          id: Date.now().toString(),
          userId: "", // This should be set by the parent component
          patientName: "",
          patientAge: "",
          patientGender: "",
          patientPhone: "",
          medicines: result.prescription.medications,
          chiefComplaint: inputText,
          pulseRate: "",
          bloodPressure: "",
          temperature: "",
          respiratoryRate: "",
          oxygenSaturation: "",
          allergies: "",
          currentMedications: "",
          pastMedicalHistory: "",
          instructions: result.prescription.recommendations.join("\n"),
          followUp: "Return if no improvement",
          restrictions: result.prescription.warnings.join("\n"),
          doctorName: "Dr. Ahmad",
          doctorLicenseNumber: "",
          clinicName: "Specialized Clinic",
          clinicAddress: "",
          doctorFree: "",
          prescriptionDate: new Date(),
          prescriptionNumber: "",
          source: "",
          status: "active",
          createdAt: new Date(),
          updatedAt: new Date(),
          aiConfidence: result.prescription.confidence,
          aiModelUsed: result.prescription.aiModelUsed,
        };

        onPrescriptionGenerated(aiPrescription);
      } else {
        throw new Error(result.error || "Failed to generate prescription");
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      onLoadingChange(false);
      setIsAnalyzing(false);
    }
  };

  const handleSuggestionSelect = (suggestion: string) => {
    setInputText((prev) => prev + " " + suggestion);
  };

  const handleQuickAnalysis = async () => {
    if (!inputText.trim()) return;

    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/analyze-symptoms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symptoms: inputText,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        // You can show analysis in a preview or update form fields
        console.log("AI Analysis:", result.analysis);
      }
    } catch (error) {
      console.error("Quick analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="border-border bg-card shadow-lg">
      <CardHeader className="pb-4 space-y-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-2xl font-bold text-card-foreground">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Stethoscope className="h-6 w-6 text-primary" />
            </div>
            AI-Powered Prescription Generator
          </CardTitle>
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            <Sparkles className="h-3 w-3 ml-1" />
            AI Active
          </Badge>
        </div>
        <CardDescription className="text-base text-muted-foreground leading-relaxed">
          Enter patient symptoms and the system will use advanced AI to generate
          <span className="font-semibold text-card-foreground">
            {" "}
            comprehensive medical analysis and appropriate prescription{" "}
          </span>
          .
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="symptoms"
                className="text-sm font-semibold text-card-foreground"
              >
                Patient History
              </Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleQuickAnalysis}
                  disabled={isAnalyzing || !inputText.trim()}
                  className="flex items-center gap-2"
                >
                  <Brain className="h-4 w-4" />
                  Quick Analysis
                </Button>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full border">
                  Required
                </span>
              </div>
            </div>

            <div className="relative">
              <AutocompleteInput
                value={inputText}
                onChange={setInputText}
                onSuggestionSelect={handleSuggestionSelect}
                placeholder="Example: 45-year-old patient with dry cough, fever 38°C and sore throat. History of penicillin allergy..."
                className="min-h-[120px] resize-vertical border-input bg-background/80 focus:border-primary focus:ring-primary"
              />

              {inputText.length > 0 && (
                <div className="absolute bottom-2 left-2">
                  <Badge variant="outline" className="text-xs bg-background/90">
                    {inputText.length} characters
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* AI Features Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-blue-800">
                  AI Capabilities:
                </p>
                <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                  <li>Automatic symptom analysis and probable diagnosis</li>
                  <li>
                    Suitable medication recommendations based on latest medical
                    guidelines
                  </li>
                  <li>
                    Consideration of drug interactions and contraindications
                  </li>
                  <li>Generation of standard medical prescription</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="flex-1 flex items-center justify-center gap-3 shadow-md transition-all duration-200 hover:shadow-lg"
              size="lg"
            >
              {loading || isAnalyzing ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Analyzing and generating prescription...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  <span>Generate AI Prescription</span>
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => setInputText("")}
              disabled={loading || !inputText.trim()}
              className="flex items-center gap-2 transition-colors"
              size="lg"
            >
              <Eraser className="h-4 w-4" />
              Clear
            </Button>
          </div>
        </form>

        {/* AI Status */}
        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Brain className="h-3 w-3" />
              <span>Support for medical models BioGPT and BioMedLM</span>
            </div>
            <span>AI Version 1.0</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
