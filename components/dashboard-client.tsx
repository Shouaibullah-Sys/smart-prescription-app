// components/dashboard-client.tsx
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser, useClerk } from "@clerk/nextjs";
import SmartTextForm from "./SmartTextForm";
import QuickButtons from "./QuickButtons";
import ErrorAlert from "./ErrorAlert";
import { EnhancedPrescriptionForm } from "./enhanced-prescription-form";
import { PrescriptionDetails } from "./prescription-details";
import { PrescriptionAmount } from "./prescription-amount";
import { Prescription } from "@/types/prescription";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTable } from "@/components/prescriptions/data-table";
import { useColumns } from "@/components/prescriptions/columns";
import { Button } from "@/components/ui/button";
import { History, Plus, X, DollarSign, LogOut, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ThemeToggle } from "@/components/theme-toggle";

interface DashboardClientProps {
  initialPrescriptions: Prescription[];
}

// API functions
async function fetchPrescriptions(): Promise<Prescription[]> {
  try {
    const response = await fetch("/api/prescriptions");
    if (!response.ok) {
      throw new Error("Failed to fetch prescriptions");
    }
    const result = await response.json();

    // Handle different response formats
    if (result.data && Array.isArray(result.data.prescriptions)) {
      return result.data.prescriptions;
    } else if (Array.isArray(result.prescriptions)) {
      return result.prescriptions;
    } else if (Array.isArray(result.data)) {
      return result.data;
    } else if (Array.isArray(result)) {
      return result;
    }

    console.warn("Unexpected API response format:", result);
    return [];
  } catch (error) {
    console.error("Error fetching prescriptions:", error);
    throw new Error("Failed to fetch prescriptions");
  }
}

async function createPrescription(
  prescription: Prescription
): Promise<{ success: boolean; id: string }> {
  const response = await fetch("/api/prescriptions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(prescription),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create prescription");
  }

  return response.json();
}

async function deletePrescription(
  prescriptionId: string
): Promise<{ success: boolean }> {
  const response = await fetch(`/api/prescriptions/${prescriptionId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete prescription");
  }

  return response.json();
}

export default function DashboardClient({
  initialPrescriptions,
}: DashboardClientProps) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [selectedPrescription, setSelectedPrescription] =
    useState<Prescription | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"create" | "history" | "amounts">(
    "create"
  );
  const [detailsOpen, setDetailsOpen] = useState<boolean>(false);

  const queryClient = useQueryClient();

  // TanStack Query for prescriptions with initial data from server
  const {
    data: prescriptions = initialPrescriptions,
    isLoading: prescriptionsLoading,
    error: prescriptionsError,
  } = useQuery({
    queryKey: ["prescriptions"],
    queryFn: fetchPrescriptions,
    staleTime: 5 * 60 * 1000,
    initialData: initialPrescriptions,
    refetchOnMount: false, // Disable refetch on mount since we have initial data
  });

  // Mutation for saving prescriptions
  const createMutation = useMutation({
    mutationFn: createPrescription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
      setPrescription(null);
      setActiveTab("history");
      setError(null);
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  // Mutation for deleting prescriptions
  const deleteMutation = useMutation({
    mutationFn: deletePrescription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
      setError(null);
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  const handlePrescriptionGenerated = (result: Prescription) => {
    setPrescription(result);
    setError(null);
    setActiveTab("create");
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setPrescription(null);
  };

  const handleQuickPreset = (presetData: Prescription) => {
    setPrescription(presetData);
    setError(null);
    setActiveTab("create");
  };

  const handleSavePrescription = async (prescriptionToSave: Prescription) => {
    await createMutation.mutateAsync(prescriptionToSave);
  };

  const handleCancelEdit = () => {
    setPrescription(null);
  };

  const handleViewDetails = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedPrescription(null);
  };

  const handleDeletePrescription = (prescriptionId: string) => {
    deleteMutation.mutate(prescriptionId);
  };

  const handleLogout = async () => {
    await signOut();
  };

  const isSaving = createMutation.isPending;
  const isDeleting = deleteMutation.isPending;

  // Get columns with the view and delete handlers
  const columns = useColumns({
    onViewDetails: handleViewDetails,
    onDelete: handleDeletePrescription,
  });

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-40 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">سیستم نسخه‌پیچی پزشکی</h1>
                <p className="text-sm text-muted-foreground">
                  کاربر:{" "}
                  {user.fullName ||
                    user.primaryEmailAddress?.emailAddress ||
                    "کاربر سیستم"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              خروج
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Header Tabs */}
        <Card className="mb-8">
          <CardContent className="p-0">
            <div className="flex border-b">
              <Button
                variant={activeTab === "create" ? "default" : "ghost"}
                onClick={() => setActiveTab("create")}
                className="flex items-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-6 py-4 h-auto"
                data-state={activeTab === "create" ? "active" : "inactive"}
              >
                <Plus className="h-4 w-4" />
                <div className="text-right">
                  <div className="font-semibold">ایجاد نسخه جدید</div>
                  <div className="text-xs text-muted-foreground">
                    نسخه هوشمند و سریع
                  </div>
                </div>
              </Button>
              <Button
                variant={activeTab === "history" ? "default" : "ghost"}
                onClick={() => setActiveTab("history")}
                className="flex items-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-6 py-4 h-auto"
                data-state={activeTab === "history" ? "active" : "inactive"}
              >
                <History className="h-4 w-4" />
                <div className="text-right">
                  <div className="font-semibold">تاریخچه نسخه‌ها</div>
                  <div className="text-xs text-muted-foreground">
                    {prescriptions.length} نسخه ذخیره شده
                  </div>
                </div>
              </Button>
              <Button
                variant={activeTab === "amounts" ? "default" : "ghost"}
                onClick={() => setActiveTab("amounts")}
                className="flex items-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-6 py-4 h-auto"
                data-state={activeTab === "amounts" ? "active" : "inactive"}
              >
                <DollarSign className="h-4 w-4" />
                <div className="text-right">
                  <div className="font-semibold">مبالغ ویزیت</div>
                  <div className="text-xs text-muted-foreground">
                    مدیریت تعرفه‌ها
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {activeTab === "create" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quick Presets Sidebar */}
            <div className="lg:col-span-1">
              <QuickButtons
                onPresetSelect={handleQuickPreset}
                onError={handleError}
              />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {!prescription ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold">
                      نسخه‌نویس هوشمند
                    </CardTitle>
                    <CardDescription>
                      علائم بیمار یا متن نسخه را وارد کنید تا سیستم به صورت
                      هوشمند نسخه کامل را تولید کند.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SmartTextForm
                      onPrescriptionGenerated={handlePrescriptionGenerated}
                      onLoadingChange={setLoading}
                      onError={handleError}
                      loading={loading}
                    />
                  </CardContent>
                </Card>
              ) : (
                <EnhancedPrescriptionForm
                  prescription={prescription}
                  onSave={handleSavePrescription}
                  onCancel={handleCancelEdit}
                  isSaving={isSaving}
                />
              )}

              {error && (
                <ErrorAlert message={error} onDismiss={() => setError(null)} />
              )}
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>تاریخچه نسخه‌ها</CardTitle>
                <CardDescription>
                  لیست تمام نسخه‌های ذخیره شده در پایگاه داده. برای مشاهده
                  جزئیات کامل هر نسخه روی دکمه "مشاهده جزئیات" کلیک کنید.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {prescriptionsLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary ml-2"></div>
                    <span>در حال بارگذاری...</span>
                  </div>
                ) : prescriptionsError ? (
                  <ErrorAlert
                    message="خطا در بارگذاری تاریخچه نسخه‌ها"
                    onDismiss={() =>
                      queryClient.invalidateQueries({
                        queryKey: ["prescriptions"],
                      })
                    }
                  />
                ) : prescriptions.length > 0 ? (
                  <DataTable columns={columns} data={prescriptions} />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="mb-4">
                      <History className="h-12 w-12 mx-auto text-muted-foreground/50" />
                    </div>
                    <p className="mb-2">هنوز هیچ نسخه‌ای ثبت نشده است.</p>
                    <Button
                      variant="default"
                      onClick={() => setActiveTab("create")}
                      className="flex items-center gap-2 mx-auto"
                    >
                      <Plus className="h-4 w-4" />
                      ایجاد اولین نسخه
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "amounts" && <PrescriptionAmount />}

        {/* Prescription Details Dialog */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>جزئیات کامل نسخه</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCloseDetails}
                >
                  <X className="h-4 w-4" />
                </Button>
              </DialogTitle>
            </DialogHeader>
            {selectedPrescription && (
              <PrescriptionDetails
                prescription={selectedPrescription}
                onClose={handleCloseDetails}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
