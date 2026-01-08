// components/enhanced-prescription-form/ChiefComplaint.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  MessageSquare,
  AlertCircle,
  FileText,
  Clock,
  User,
  X,
  Plus,
  ChevronRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
} from "lucide-react";
import { Prescription } from "@/types/prescription";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { z } from "zod";

interface ChiefComplaintProps {
  prescription: Prescription;
  onUpdateField: (field: keyof Prescription, value: any) => void;
}

interface ComplaintItem {
  id: string;
  text: string;
  duration?: string;
  severity?: string;
  symptoms: string[];
  createdAt: Date | string;
}

// Zod validation schemas
const complaintSchema = z.object({
  text: z
    .string()
    .min(3, "Complaint must be at least 3 characters")
    .max(500, "Complaint must be less than 500 characters")
    .regex(/^[a-zA-Z0-9\s.,!?'"-]+$/, "Complaint contains invalid characters"),

  duration: z.string().max(50, "Duration too long").optional(),

  severity: z.string().max(20, "Severity description too long").optional(),
});

const chiefComplaintSchema = z.object({
  chiefComplaint: z
    .string()
    .refine((val) => {
      if (!val) return true; // Allow empty
      try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) {
          return parsed.every((item: any) => {
            const result = complaintSchema.safeParse(item);
            return result.success;
          });
        }
        return complaintSchema.safeParse(parsed).success;
      } catch {
        // If not JSON, validate as simple string
        return val.length <= 500;
      }
    }, "Invalid complaint data structure")
    .optional(),
});

// Type for validation errors
type ValidationErrors = Partial<Record<string, string>>;

export function ChiefComplaint({
  prescription,
  onUpdateField,
}: ChiefComplaintProps) {
  // Helper functions for extracting symptoms, duration, and severity
  const extractSymptoms = useCallback((text: string): string[] => {
    const symptomKeywords = [
      "pain",
      "fever",
      "cough",
      "headache",
      "nausea",
      "vomiting",
      "diarrhea",
      "fatigue",
      "dizziness",
      "shortness of breath",
      "chest pain",
      "abdominal pain",
      "rash",
      "swelling",
      "bleeding",
      "weight loss",
      "palpitations",
      "anxiety",
      "chills",
      "sweating",
      "weakness",
      "numbness",
      "tingling",
      "vision problems",
      "hearing loss",
      "sore throat",
      "congestion",
      "runny nose",
      "joint pain",
      "back pain",
      "neck pain",
      "constipation",
      "indigestion",
      "heartburn",
    ];

    return symptomKeywords.filter((keyword) =>
      text.toLowerCase().includes(keyword)
    );
  }, []);

  const extractDuration = useCallback((text: string): string => {
    const durationPatterns = [
      /(\d+)\s*(day|days)/i,
      /(\d+)\s*(week|weeks)/i,
      /(\d+)\s*(month|months)/i,
      /(\d+)\s*(year|years)/i,
      /for\s+(\d+)\s*(day|week|month|year)/i,
      /since\s+(\d+)\s*(day|week|month|year)/i,
      /(\d+)\s*(hour|hours)/i,
      /(\d+)\s*(minute|minutes)/i,
    ];

    for (const pattern of durationPatterns) {
      const match = text.match(pattern);
      if (match) {
        return `${match[1]} ${match[2]}`;
      }
    }
    return "";
  }, []);

  const extractSeverity = useCallback((text: string): string => {
    const severeKeywords = [
      "severe",
      "acute",
      "emergency",
      "unbearable",
      "intense",
      "excruciating",
    ];
    const moderateKeywords = [
      "moderate",
      "intermittent",
      "comes and goes",
      "manageable",
    ];
    const mildKeywords = ["mild", "slight", "minor", "tolerable"];

    if (
      severeKeywords.some((keyword) => text.toLowerCase().includes(keyword))
    ) {
      return "Severe";
    } else if (
      moderateKeywords.some((keyword) => text.toLowerCase().includes(keyword))
    ) {
      return "Moderate";
    } else if (
      mildKeywords.some((keyword) => text.toLowerCase().includes(keyword))
    ) {
      return "Mild";
    }
    return "Not specified";
  }, []);

  // Initialize complaints from prescription only once
  const [complaints, setComplaints] = useState<ComplaintItem[]>(() => {
    if (prescription.chiefComplaint && prescription.chiefComplaint.trim()) {
      try {
        // Try to parse as JSON array first
        const parsed = JSON.parse(prescription.chiefComplaint);
        if (Array.isArray(parsed)) {
          // Ensure createdAt is a Date object for each complaint
          const normalizedComplaints = parsed.map((complaint: any) => ({
            ...complaint,
            id: complaint.id || Math.random().toString(36).substr(2, 9),
            text: complaint.text || "",
            symptoms: Array.isArray(complaint.symptoms)
              ? complaint.symptoms
              : [],
            duration:
              complaint.duration || extractDuration(complaint.text || ""),
            severity:
              complaint.severity || extractSeverity(complaint.text || ""),
            createdAt: ensureDateObject(complaint.createdAt || new Date()),
          }));
          return normalizedComplaints;
        } else {
          // Fallback: treat as single complaint string
          const complaintText =
            parsed.text || parsed || prescription.chiefComplaint;
          return [
            {
              id: "1",
              text: complaintText,
              symptoms: extractSymptoms(complaintText),
              duration: extractDuration(complaintText),
              severity: extractSeverity(complaintText),
              createdAt: new Date(),
            },
          ];
        }
      } catch (error) {
        console.warn("⚠️ Failed to parse chiefComplaint JSON:", error);
        // If not valid JSON, treat as single complaint string
        return [
          {
            id: "1",
            text: prescription.chiefComplaint,
            symptoms: extractSymptoms(prescription.chiefComplaint),
            duration: extractDuration(prescription.chiefComplaint),
            severity: extractSeverity(prescription.chiefComplaint),
            createdAt: new Date(),
          },
        ];
      }
    } else {
      return [];
    }
  });

  const [currentInput, setCurrentInput] = useState<string>("");
  const [activeComplaint, setActiveComplaint] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [activeSection, setActiveSection] = useState<"list" | "add">("list");
  const [hasJustAdded, setHasJustAdded] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const recordsContainerRef = useRef<HTMLDivElement>(null);

  // Track if we've already updated parent to prevent loops
  const isUpdatingParent = useRef(false);
  const prevComplaintsString = useRef<string>("");

  // Helper function to ensure createdAt is a Date object
  const ensureDateObject = (date: Date | string | number): Date => {
    if (date instanceof Date) return date;
    if (typeof date === "string" || typeof date === "number") {
      const d = new Date(date);
      return isNaN(d.getTime()) ? new Date() : d;
    }
    return new Date();
  };

  // Helper function to format time
  const formatTime = (date: Date | string): string => {
    const dateObj = ensureDateObject(date);
    return dateObj.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Validate a complaint
  const validateComplaint = useCallback((text: string): string => {
    try {
      complaintSchema.parse({ text });
      return ""; // No error
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.issues[0]?.message || "Validation error";
      }
      return "Invalid complaint";
    }
  }, []);

  // Update parent only when complaints meaningfully change
  useEffect(() => {
    // Don't update if we're in the middle of a parent update
    if (isUpdatingParent.current) {
      return;
    }

    const complaintsForStorage = complaints.map((complaint) => ({
      ...complaint,
      text: complaint.text.trim(),
      createdAt: ensureDateObject(complaint.createdAt).toISOString(),
    }));

    const complaintsText = JSON.stringify(complaintsForStorage);

    // Only update if different from previous
    if (prevComplaintsString.current !== complaintsText) {
      prevComplaintsString.current = complaintsText;

      // Prevent infinite loop by using setTimeout
      setTimeout(() => {
        onUpdateField("chiefComplaint", complaintsText);
      }, 0);
    }
  }, [complaints, onUpdateField]);

  // Handle updates from parent (when prescription.chiefComplaint changes externally)
  useEffect(() => {
    if (prescription.chiefComplaint && prescription.chiefComplaint.trim()) {
      try {
        const parsed = JSON.parse(prescription.chiefComplaint);
        const currentString = JSON.stringify(
          complaints.map((c) => ({
            ...c,
            createdAt: ensureDateObject(c.createdAt).toISOString(),
          }))
        );

        // Only update if different from what we have
        if (currentString !== prescription.chiefComplaint) {
          console.log("📥 Received updated complaints from parent");
          isUpdatingParent.current = true;

          if (Array.isArray(parsed)) {
            const normalizedComplaints = parsed.map((complaint: any) => ({
              ...complaint,
              id: complaint.id || Math.random().toString(36).substr(2, 9),
              text: complaint.text || "",
              symptoms: Array.isArray(complaint.symptoms)
                ? complaint.symptoms
                : [],
              duration:
                complaint.duration || extractDuration(complaint.text || ""),
              severity:
                complaint.severity || extractSeverity(complaint.text || ""),
              createdAt: ensureDateObject(complaint.createdAt || new Date()),
            }));
            setComplaints(normalizedComplaints);
          }

          // Reset flag after state update
          setTimeout(() => {
            isUpdatingParent.current = false;
          }, 100);
        }
      } catch (error) {
        console.warn("⚠️ Failed to parse updated chiefComplaint:", error);
      }
    }
  }, [prescription.chiefComplaint]);

  const handleAddComplaint = useCallback(() => {
    const text = currentInput.trim();
    if (!text) return;

    // Validate complaint
    const error = validateComplaint(text);
    if (error) {
      setValidationErrors((prev) => ({ ...prev, currentInput: error }));
      return;
    }

    const newComplaint: ComplaintItem = {
      id: Date.now().toString(),
      text,
      symptoms: extractSymptoms(text),
      duration: extractDuration(text),
      severity: extractSeverity(text),
      createdAt: new Date(),
    };

    setComplaints((prev) => [...prev, newComplaint]);
    setCurrentInput("");
    setValidationErrors((prev) => ({ ...prev, currentInput: "" }));
    setHasJustAdded(true);

    // Reset success state after delay
    setTimeout(() => setHasJustAdded(false), 2000);

    // Focus back on input
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  }, [
    currentInput,
    validateComplaint,
    extractSymptoms,
    extractDuration,
    extractSeverity,
  ]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleAddComplaint();
      } else if (e.key === "Tab") {
        // Allow normal tab navigation
        return;
      }
    },
    [handleAddComplaint]
  );

  const handleRemoveComplaint = useCallback((id: string) => {
    setComplaints((prev) => prev.filter((complaint) => complaint.id !== id));
  }, []);

  const handleEditComplaint = useCallback(
    (id: string, text: string) => {
      // Validate edited complaint
      const error = validateComplaint(text);
      if (error) {
        setValidationErrors((prev) => ({ ...prev, [`edit-${id}`]: error }));
        return;
      }

      setComplaints((prev) =>
        prev.map((complaint) =>
          complaint.id === id
            ? {
                ...complaint,
                text,
                symptoms: extractSymptoms(text),
                duration: extractDuration(text),
                severity: extractSeverity(text),
              }
            : complaint
        )
      );
      setValidationErrors((prev) => ({ ...prev, [`edit-${id}`]: "" }));
    },
    [validateComplaint, extractSymptoms, extractDuration, extractSeverity]
  );

  const handleClearAll = useCallback(() => {
    setComplaints([]);
    setCurrentInput("");
    setValidationErrors({});
  }, []);

  const handleScrollLeft = () => {
    if (recordsContainerRef.current) {
      recordsContainerRef.current.scrollLeft -= 200;
      setScrollPosition(recordsContainerRef.current.scrollLeft - 200);
    }
  };

  const handleScrollRight = () => {
    if (recordsContainerRef.current) {
      recordsContainerRef.current.scrollLeft += 200;
      setScrollPosition(recordsContainerRef.current.scrollLeft + 200);
    }
  };

  const severityLevels = [
    {
      label: "Mild",
      color:
        "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200 border-green-200 dark:border-green-800",
    },
    {
      label: "Moderate",
      color:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800",
    },
    {
      label: "Severe",
      color:
        "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200 border-red-200 dark:border-red-800",
    },
    {
      label: "Acute",
      color:
        "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200 border-orange-200 dark:border-orange-800",
    },
    {
      label: "Chronic",
      color:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200 border-blue-200 dark:border-blue-800",
    },
  ];

  // Calculate overall statistics
  const totalComplaints = complaints.length;
  const severeCount = complaints.filter((c) => c.severity === "Severe").length;
  const moderateCount = complaints.filter(
    (c) => c.severity === "Moderate"
  ).length;
  const mildCount = complaints.filter((c) => c.severity === "Mild").length;
  const allSymptoms = [...new Set(complaints.flatMap((c) => c.symptoms))];

  return (
    <div
      id="chief-complaint"
      className="group flex flex-col sm:flex-row border-2 border-border/50 dark:border-border rounded-xl overflow-hidden hover:border-border transition-all duration-300 bg-gradient-to-br from-background to-card/30 dark:from-background dark:to-card/10 shadow-sm hover:shadow-md cyber-card"
    >
      {/* Left Sidebar */}
      <div
        className={cn(
          "w-full sm:w-1/4 p-4 sm:p-5 border-b sm:border-b-0 sm:border-r border-border/30 transition-all duration-300",
          "bg-gradient-to-b from-sidebar/80 to-background",
          activeSection === "list" && "bg-sidebar/90"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-primary to-cyber-accent rounded-xl shadow-sm">
                <MessageSquare className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <div className="font-bold text-sm sm:text-base tracking-tight text-foreground">
                  Chief Complaints
                </div>
                <div className="text-xs text-muted-foreground font-medium mt-0.5">
                  Clinical Assessment
                </div>
              </div>
            </div>
            {totalComplaints > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs hover:bg-destructive/10 dark:hover:bg-destructive/20 hover:text-destructive"
                onClick={handleClearAll}
              >
                <X className="h-3 w-3 mr-1" />
                Clear All
              </Button>
            )}
          </div>

          {/* Complaint Stats */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground">
                Status
              </span>
              {totalComplaints > 0 ? (
                <div className="flex items-center gap-1 px-2 py-1 bg-accent/20 dark:bg-accent/30 rounded-full">
                  <CheckCircle2 className="h-3 w-3 text-accent dark:text-accent-foreground" />
                  <span className="text-xs font-medium text-accent-foreground">
                    {totalComplaints} complaint
                    {totalComplaints !== 1 ? "s" : ""}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded-full">
                  <AlertCircle className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">
                    No complaints
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {/* Overall Severity */}
              <div className="p-3 bg-card/50 dark:bg-card/30 rounded-lg border border-border/50">
                <div className="text-xs font-medium text-muted-foreground flex items-center gap-2 mb-2">
                  <AlertCircle className="h-3.5 w-3.5 text-primary" />
                  Overall Status
                </div>
                <div className="space-y-1.5">
                  {severeCount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        Severe:
                      </span>
                      <Badge
                        variant="destructive"
                        className="h-5 px-1.5 text-xs"
                      >
                        {severeCount}
                      </Badge>
                    </div>
                  )}
                  {moderateCount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        Moderate:
                      </span>
                      <Badge
                        variant="secondary"
                        className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200 h-5 px-1.5 text-xs"
                      >
                        {moderateCount}
                      </Badge>
                    </div>
                  )}
                  {mildCount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        Mild:
                      </span>
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200 h-5 px-1.5 text-xs"
                      >
                        {mildCount}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              {/* Symptoms Summary */}
              {allSymptoms.length > 0 && (
                <div className="p-3 bg-card/50 dark:bg-card/30 rounded-lg border border-border/50">
                  <div className="text-xs font-medium text-muted-foreground flex items-center gap-2 mb-2">
                    <User className="h-3.5 w-3.5 text-cyber-secondary" />
                    Symptoms Summary
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {allSymptoms.slice(0, 5).map((symptom, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs h-5 px-1.5 bg-cyber-secondary/10 text-cyber-secondary dark:bg-cyber-secondary/20 dark:text-cyber-secondary"
                      >
                        {symptom}
                      </Badge>
                    ))}
                    {allSymptoms.length > 5 && (
                      <Badge variant="outline" className="text-xs h-5 px-1.5">
                        +{allSymptoms.length - 5}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={cn(
          "w-full sm:w-3/4 p-4 sm:p-5 transition-all duration-300",
          activeSection === "add" &&
            "bg-gradient-to-br from-accent/5 to-background"
        )}
      >
        <Accordion type="multiple" className="w-full">
          <AccordionItem
            value="chief-complaint"
            className="border-2 border-border/30 rounded-lg px-4 bg-gradient-to-b from-card/50 to-background/50 medical-card"
          >
            <AccordionTrigger className="py-4 hover:no-underline group hover:bg-accent/5 transition-colors">
              <div className="flex items-center gap-3 w-full">
                <div className="p-2 bg-gradient-to-br from-primary to-cyber-accent rounded-lg group-hover:from-primary/90 group-hover:to-cyber-accent/90 transition-colors">
                  <MessageSquare className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="text-left flex-1">
                  <span className="text-base font-bold text-foreground">
                    Chief Complaints
                  </span>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {totalComplaints > 0
                      ? `${totalComplaints} complaint${
                          totalComplaints !== 1 ? "s" : ""
                        } recorded • ${allSymptoms.length} symptoms identified`
                      : "Primary reason for the patient's visit"}
                  </div>
                </div>
                {totalComplaints > 0 && (
                  <div className="text-xs font-medium px-3 py-1.5 rounded-full bg-primary/10 text-primary dark:bg-primary/20">
                    {totalComplaints} complaint
                    {totalComplaints !== 1 ? "s" : ""}
                  </div>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-5 space-y-5">
              {/* Add Complaint Section - Moved to top */}
              <div className="space-y-3">
                <Label className="text-sm font-bold flex items-center gap-2">
                  {hasJustAdded && (
                    <div className="ml-2 flex items-center gap-1 text-xs font-normal px-2 py-1 bg-accent/20 text-accent-foreground rounded-full">
                      <CheckCircle2 className="h-3 w-3" />
                      Added successfully
                    </div>
                  )}
                </Label>

                <div className="p-4 bg-gradient-to-br from-card to-accent/5 rounded-xl border-2 border-accent/20 cyber-card">
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <Input
                          ref={inputRef}
                          value={currentInput}
                          onChange={(e) => {
                            setCurrentInput(e.target.value);
                            if (validationErrors.currentInput) {
                              setValidationErrors((prev) => ({
                                ...prev,
                                currentInput: "",
                              }));
                            }
                          }}
                          onKeyPress={handleKeyPress}
                          onFocus={() => setActiveSection("add")}
                          onBlur={() => {
                            setActiveSection("list");
                            const error = validateComplaint(currentInput);
                            if (currentInput && error) {
                              setValidationErrors((prev) => ({
                                ...prev,
                                currentInput: error,
                              }));
                            }
                          }}
                          className={cn(
                            "h-10 text-sm bg-background border-accent/30 focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all",
                            validationErrors.currentInput &&
                              "border-destructive focus:border-destructive focus:ring-destructive/20",
                            hasJustAdded && "ring-2 ring-accent"
                          )}
                          placeholder="Describe complaint in detail (onset, location, severity, duration)"
                        />
                        {validationErrors.currentInput && (
                          <div className="text-xs text-destructive dark:text-destructive-foreground mt-1">
                            {validationErrors.currentInput}
                          </div>
                        )}
                      </div>
                      <Button
                        onClick={handleAddComplaint}
                        disabled={
                          !currentInput.trim() ||
                          !!validationErrors.currentInput
                        }
                        size="sm"
                        className="h-10 px-4 bg-gradient-to-r from-accent to-cyber-accent hover:from-accent/90 hover:to-cyber-accent/90 text-accent-foreground font-medium"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Compact Records Section - Horizontal scroll */}
              {totalComplaints > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-bold flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-gradient-to-br from-primary to-cyber-accent rounded-lg">
                        <FileText className="h-4 w-4 text-primary-foreground" />
                      </div>
                      Complaint Records
                      <div className="ml-2 text-xs font-normal px-2 py-1 bg-primary/10 text-primary dark:bg-primary/20 rounded-full">
                        {totalComplaints} recorded
                      </div>
                    </div>

                    {/* Scroll buttons for desktop */}
                    <div className="hidden sm:flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 w-6 p-0 border-border hover:bg-accent/10"
                        onClick={handleScrollLeft}
                        disabled={scrollPosition <= 0}
                      >
                        <ChevronLeft className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 w-6 p-0 border-border hover:bg-accent/10"
                        onClick={handleScrollRight}
                      >
                        <ChevronRightIcon className="h-3 w-3" />
                      </Button>
                    </div>
                  </Label>

                  {/* Compact Horizontal Records Container */}
                  <div className="relative">
                    <div
                      ref={recordsContainerRef}
                      className="flex gap-3 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
                      style={{ scrollbarWidth: "thin" }}
                    >
                      {complaints.map((complaint, index) => (
                        <div
                          key={complaint.id}
                          className="flex-shrink-0 w-64 sm:w-72 p-3 bg-card/50 dark:bg-card/30 rounded-xl border-2 border-border/30 hover:border-primary/30 transition-all duration-300 medical-card"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-primary to-cyber-accent text-primary-foreground text-xs font-bold">
                                {index + 1}
                              </div>
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-2.5 w-2.5" />
                                {formatTime(complaint.createdAt)}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0 hover:bg-destructive/10 hover:text-destructive"
                              onClick={() =>
                                handleRemoveComplaint(complaint.id)
                              }
                            >
                              <X className="h-2.5 w-2.5" />
                            </Button>
                          </div>

                          <div className="mb-2">
                            {activeComplaint === complaint.id ? (
                              <div>
                                <Input
                                  value={complaint.text}
                                  onChange={(e) =>
                                    handleEditComplaint(
                                      complaint.id,
                                      e.target.value
                                    )
                                  }
                                  onBlur={() => setActiveComplaint(null)}
                                  onKeyPress={(e) => {
                                    if (e.key === "Enter") {
                                      setActiveComplaint(null);
                                    }
                                  }}
                                  className={cn(
                                    "text-xs h-7 bg-background",
                                    validationErrors[`edit-${complaint.id}`] &&
                                      "border-destructive focus:border-destructive focus:ring-destructive/20"
                                  )}
                                  autoFocus
                                />
                                {validationErrors[`edit-${complaint.id}`] && (
                                  <div className="text-xs text-destructive dark:text-destructive-foreground mt-1">
                                    {validationErrors[`edit-${complaint.id}`]}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <p
                                className="text-xs cursor-pointer p-1.5 rounded hover:bg-accent/5 transition-colors line-clamp-2 text-foreground"
                                onClick={() => setActiveComplaint(complaint.id)}
                                title={complaint.text}
                              >
                                {complaint.text}
                              </p>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-1 mb-1">
                            {complaint.severity &&
                              complaint.severity !== "Not specified" && (
                                <Badge
                                  variant="secondary"
                                  className={cn(
                                    "text-xs px-1.5 py-0 h-5 border",
                                    severityLevels.find(
                                      (s) => s.label === complaint.severity
                                    )?.color || "bg-muted"
                                  )}
                                >
                                  {complaint.severity}
                                </Badge>
                              )}

                            {complaint.duration && (
                              <Badge
                                variant="outline"
                                className="text-xs px-1.5 py-0 h-5 border-border"
                              >
                                <Clock className="h-2.5 w-2.5 mr-0.5" />
                                {complaint.duration}
                              </Badge>
                            )}

                            {complaint.symptoms.length > 0 && (
                              <Badge
                                variant="outline"
                                className="text-xs px-1.5 py-0 h-5 border-border"
                              >
                                <User className="h-2.5 w-2.5 mr-0.5" />
                                {complaint.symptoms.length}
                              </Badge>
                            )}
                          </div>

                          {complaint.symptoms.length > 0 && (
                            <div className="pt-2 border-t border-border/30">
                              <div className="flex flex-wrap gap-1">
                                {complaint.symptoms
                                  .slice(0, 3)
                                  .map((symptom, idx) => (
                                    <Badge
                                      key={idx}
                                      variant="secondary"
                                      className="text-xs px-1.5 py-0 h-5 bg-cyber-secondary/10 text-cyber-secondary dark:bg-cyber-secondary/20 dark:text-cyber-secondary truncate max-w-[80px]"
                                      title={symptom}
                                    >
                                      {symptom}
                                    </Badge>
                                  ))}
                                {complaint.symptoms.length > 3 && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs px-1.5 py-0 h-5 border-border"
                                  >
                                    +{complaint.symptoms.length - 3}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Empty state for horizontal scroll area */}
                      {complaints.length === 0 && (
                        <div className="flex-shrink-0 w-64 sm:w-72 p-6 text-center border-2 border-dashed border-border rounded-xl">
                          <MessageSquare className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                          <p className="text-xs text-muted-foreground">
                            Add a complaint above to see it here
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Scroll hint for mobile */}
                    <div className="sm:hidden text-xs text-muted-foreground text-center mt-2">
                      ← Scroll to view more →
                    </div>
                  </div>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
