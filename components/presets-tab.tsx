// components/presets-tab.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import type { Prescription } from "../types/prescription";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Stethoscope,
  Search,
  Pill,
  Clock,
  Heart,
  Brain,
  Activity,
  Zap,
  Filter,
  Edit,
  Trash2,
} from "lucide-react";
import CreatePresetForm from "./create-preset-form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface PresetTemplate {
  id: string;
  name: string;
  category: string;
  urgency: "low" | "medium" | "high";
  description: string;
  prescription: Prescription;
}

interface PresetsTabProps {
  onPresetSelect: (presetData: Prescription) => void;
  onError: (error: string) => void;
}

const categoryIcons = {
  Respiratory: Activity,
  Cardiovascular: Heart,
  Endocrine: Activity,
  Psychiatric: Brain,
  Genitourinary: Activity,
  Neurological: Brain,
  Allergy: Zap,
  Musculoskeletal: Activity,
  Gastrointestinal: Activity,
  "Infectious Disease": Zap,
  Dermatology: Activity,
};

const urgencyConfig = {
  low: {
    bg: "bg-emerald-50 dark:bg-emerald-950/20",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-800",
    badge:
      "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
    dot: "bg-emerald-500",
    label: "Low Priority",
  },
  medium: {
    bg: "bg-amber-50 dark:bg-amber-950/20",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-800",
    badge:
      "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
    dot: "bg-amber-500",
    label: "Medium Priority",
  },
  high: {
    bg: "bg-rose-50 dark:bg-rose-950/20",
    text: "text-rose-700 dark:text-rose-300",
    border: "border-rose-200 dark:border-rose-800",
    badge:
      "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800",
    dot: "bg-rose-500",
    label: "High Priority",
  },
};

export default function PresetsTab({
  onPresetSelect,
  onError,
}: PresetsTabProps) {
  const [presets, setPresets] = useState<Record<string, Prescription>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [urgencyFilter, setUrgencyFilter] = useState<string>("all");
  const [editingPreset, setEditingPreset] = useState<PresetTemplate | null>(
    null
  );
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  // Function to load presets
  const loadPresets = async () => {
    try {
      const response = await fetch("/api/presets");
      if (!response.ok) {
        throw new Error("Failed to load presets");
      }
      const data = await response.json();
      setPresets(data);
    } catch (err) {
      console.error("Error loading presets:", err);
      onError(err instanceof Error ? err.message : "Failed to load presets");
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await loadPresets();
      } catch (err) {
        console.error("Error loading presets:", err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [onError]);

  const presetTemplates: PresetTemplate[] = useMemo(() => {
    return Object.values(presets).map((preset) => ({
      id: preset.id,
      name: preset.chiefComplaint || "Unknown Condition",
      category: getCategoryFromDiagnosis(preset.chiefComplaint || ""),
      urgency: getUrgencyFromCategory(
        getCategoryFromDiagnosis(preset.chiefComplaint || "")
      ),
      description: preset.chiefComplaint || "Medical condition",
      prescription: preset,
    }));
  }, [presets]);

  function getCategoryFromDiagnosis(diagnosis: string): string {
    const diagnosisLower = diagnosis.toLowerCase();
    if (
      diagnosisLower.includes("hypertension") ||
      diagnosisLower.includes("cardiovascular")
    ) {
      return "Cardiovascular";
    } else if (
      diagnosisLower.includes("diabetes") ||
      diagnosisLower.includes("endocrine")
    ) {
      return "Endocrine";
    } else if (
      diagnosisLower.includes("anxiety") ||
      diagnosisLower.includes("psychiatric") ||
      diagnosisLower.includes("depression") ||
      diagnosisLower.includes("insomnia")
    ) {
      return "Psychiatric";
    } else if (
      diagnosisLower.includes("uti") ||
      diagnosisLower.includes("genitourinary")
    ) {
      return "Genitourinary";
    } else if (
      diagnosisLower.includes("migraine") ||
      diagnosisLower.includes("neurological")
    ) {
      return "Neurological";
    } else if (
      diagnosisLower.includes("allergic") ||
      diagnosisLower.includes("allergy")
    ) {
      return "Allergy";
    } else if (
      diagnosisLower.includes("arthritis") ||
      diagnosisLower.includes("musculoskeletal") ||
      diagnosisLower.includes("back pain")
    ) {
      return "Musculoskeletal";
    } else if (
      diagnosisLower.includes("gerd") ||
      diagnosisLower.includes("gastroesophageal") ||
      diagnosisLower.includes("gastrointestinal")
    ) {
      return "Gastrointestinal";
    } else if (
      diagnosisLower.includes("pneumonia") ||
      diagnosisLower.includes("bronchitis") ||
      diagnosisLower.includes("otitis") ||
      diagnosisLower.includes("infectious")
    ) {
      return "Infectious Disease";
    } else if (
      diagnosisLower.includes("eczema") ||
      diagnosisLower.includes("dermatitis") ||
      diagnosisLower.includes("dermatology")
    ) {
      return "Dermatology";
    } else {
      return "Respiratory"; // Default category
    }
  }

  function getUrgencyFromCategory(category: string): "low" | "medium" | "high" {
    const urgencyMap: Record<string, "low" | "medium" | "high"> = {
      Cardiovascular: "medium",
      Endocrine: "medium",
      Psychiatric: "medium",
      Genitourinary: "high",
      Neurological: "medium",
      Allergy: "low",
      Musculoskeletal: "medium",
      Respiratory: "low",
      Gastrointestinal: "medium",
      "Infectious Disease": "high",
      Dermatology: "low",
    };
    return urgencyMap[category] || "medium";
  }

  const categories = useMemo(() => {
    const cats = new Set(presetTemplates.map((p) => p.category));
    return Array.from(cats).sort();
  }, [presetTemplates]);

  const filteredPresets = useMemo(() => {
    return presetTemplates.filter((preset) => {
      const matchesSearch =
        search.trim() === "" ||
        preset.name.toLowerCase().includes(search.toLowerCase()) ||
        preset.description.toLowerCase().includes(search.toLowerCase()) ||
        preset.category.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        categoryFilter === "all" || preset.category === categoryFilter;
      const matchesUrgency =
        urgencyFilter === "all" || preset.urgency === urgencyFilter;

      return matchesSearch && matchesCategory && matchesUrgency;
    });
  }, [presetTemplates, search, categoryFilter, urgencyFilter]);

  const handlePresetSelect = (preset: PresetTemplate) => {
    onPresetSelect(preset.prescription);
  };

  const handleEditPreset = (preset: PresetTemplate, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPreset(preset);
    setShowEditDialog(true);
  };

  const handleDeletePreset = async (
    preset: PresetTemplate,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();

    if (!preset.id.startsWith("user_")) {
      onError("Cannot delete predefined presets");
      return;
    }

    setDeleteLoading(preset.id);
    try {
      const response = await fetch(`/api/presets/${preset.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete preset");
      }

      // Refresh presets after deletion
      await loadPresets();
    } catch (error) {
      console.error("Error deleting preset:", error);
      onError(
        error instanceof Error ? error.message : "Failed to delete preset"
      );
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleEditSuccess = () => {
    setShowEditDialog(false);
    setEditingPreset(null);
    loadPresets(); // Refresh presets after edit
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span>Loading medical presets...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl font-bold">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Stethoscope className="h-6 w-6 text-primary" />
            </div>
            Medical Presets
          </CardTitle>
          <CardDescription className="text-muted-foreground leading-relaxed">
            Choose from pre-configured medical templates for common conditions.
            These templates can be customized to fit specific patient needs.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conditions, categories, or descriptions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-10 bg-background"
              />
            </div>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full lg:w-[200px]">
                <Filter className="h-4 w-4 ml-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Urgency Filter */}
            <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
              <SelectTrigger className="w-full lg:w-[200px]">
                <Clock className="h-4 w-4 ml-2" />
                <SelectValue placeholder="Urgency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Urgency</SelectItem>
                <SelectItem value="low">Low Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active filters display */}
          {(search || categoryFilter !== "all" || urgencyFilter !== "all") && (
            <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
              <span>Active filters:</span>
              {search && <Badge variant="secondary">Search: {search}</Badge>}
              {categoryFilter !== "all" && (
                <Badge variant="secondary">Category: {categoryFilter}</Badge>
              )}
              {urgencyFilter !== "all" && (
                <Badge variant="secondary">Urgency: {urgencyFilter}</Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setCategoryFilter("all");
                  setUrgencyFilter("all");
                }}
                className="h-6 px-2 text-xs"
              >
                Clear all
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Preset Button */}
      <div className="flex justify-end">
        <CreatePresetForm
          onPresetCreated={() => {
            // Refresh presets after creation
            loadPresets();
          }}
          onError={onError}
        />
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredPresets.length} of {presetTemplates.length} templates
        </p>
      </div>

      {/* Presets Grid */}
      {filteredPresets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPresets.map((preset) => {
            const urgency = urgencyConfig[preset.urgency];
            const IconComponent =
              categoryIcons[preset.category as keyof typeof categoryIcons] ||
              Stethoscope;

            return (
              <Card
                key={preset.id}
                className={`cursor-pointer transition-all hover:shadow-md border-2 ${urgency.border} hover:${urgency.bg}`}
                onClick={() => handlePresetSelect(preset)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${urgency.bg}`}>
                        <IconComponent className={`h-4 w-4 ${urgency.text}`} />
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-xs ${urgency.badge}`}
                      >
                        {urgency.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${urgency.dot}`} />
                      {/* Edit and Delete buttons for user-created presets */}
                      {preset.id.startsWith("user_") && (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleEditPreset(preset, e)}
                            className="h-6 w-6 p-0 hover:bg-primary/10"
                            title="Edit preset"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => e.stopPropagation()}
                                className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20"
                                title="Delete preset"
                                disabled={deleteLoading === preset.id}
                              >
                                {deleteLoading === preset.id ? (
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current" />
                                ) : (
                                  <Trash2 className="h-3 w-3" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Preset
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{preset.name}
                                  "? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={(e) => handleDeletePreset(preset, e)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </div>
                  </div>

                  <CardTitle className="text-lg font-semibold leading-tight">
                    {preset.name}
                  </CardTitle>

                  <CardDescription className="text-sm">
                    {preset.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-medium">
                        Category: {preset.category}
                      </span>
                      <span>
                        {preset.prescription.medicines?.length || 0} medications
                      </span>
                    </div>

                    {/* Medicine Preview */}
                    {preset.prescription.medicines &&
                      preset.prescription.medicines.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">
                            Medications:
                          </p>
                          {preset.prescription.medicines
                            .slice(0, 2)
                            .map((med, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 text-xs text-muted-foreground"
                              >
                                <Pill className="h-3 w-3" />
                                <span className="flex-1 truncate">
                                  <span className="font-medium">
                                    {med.medicine}
                                  </span>
                                  {med.dosage && ` — ${med.dosage}`}
                                </span>
                              </div>
                            ))}
                          {preset.prescription.medicines.length > 2 && (
                            <p className="text-xs text-muted-foreground">
                              +{preset.prescription.medicines.length - 2} more
                              medications
                            </p>
                          )}
                        </div>
                      )}

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePresetSelect(preset);
                      }}
                    >
                      Use This Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Stethoscope className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No templates found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or filters to find relevant
              templates.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearch("");
                setCategoryFilter("all");
                setUrgencyFilter("all");
              }}
            >
              Clear all filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      <Card className="border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-1 bg-amber-100 dark:bg-amber-900/30 rounded">
              <Stethoscope className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                Important Medical Disclaimer
              </p>
              <div className="text-xs text-amber-700 dark:text-amber-400 space-y-1">
                <p>
                  These templates are for educational and reference purposes
                  only. Clinical decisions must be made by qualified healthcare
                  professionals considering individual patient factors.
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Always verify drug interactions and contraindications</li>
                  <li>
                    Consider patient age, pregnancy status, and comorbidities
                  </li>
                  <li>
                    Follow current clinical guidelines and local protocols
                  </li>
                  <li>Document all clinical decisions and rationale</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Preset Dialog */}
      {editingPreset && (
        <CreatePresetForm
          preset={editingPreset.prescription}
          isOpen={showEditDialog}
          onClose={() => {
            setShowEditDialog(false);
            setEditingPreset(null);
          }}
          onSuccess={handleEditSuccess}
          onError={onError}
        />
      )}
    </div>
  );
}
