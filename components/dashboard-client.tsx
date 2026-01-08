// components/dashboard-client.tsx
"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser, useClerk } from "@clerk/nextjs";

import PresetsTab from "./presets-tab";
import ErrorAlert from "./ErrorAlert";
import { EnhancedPrescriptionForm } from "./enhanced-prescription-form/enhanced-prescription-form";
import { PrescriptionAmount } from "./prescription-amount";
import { Prescription } from "@/types/prescription";
import { CyberpunkHeader } from "./CyberpunkHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { DataTable } from "@/components/prescriptions/data-table";
import { useColumns } from "@/components/prescriptions/columns";
import { Button } from "@/components/ui/button";
import {
  History,
  Plus,
  DollarSign,
  LogOut,
  User,
  FileText,
  Stethoscope,
  Clock,
  Calendar,
  TrendingUp,
  Activity,
  Shield,
  Database,
  Bell,
  Settings,
  HelpCircle,
  Menu,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface DashboardClientProps {
  initialPrescriptions: Prescription[];
  databaseStatus?: "connected" | "disconnected" | "error" | "unknown";
}

// API functions
async function fetchPrescriptions(): Promise<Prescription[]> {
  try {
    const response = await fetch("/api/prescriptions");
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        errorData.error || `Failed to fetch prescriptions (${response.status})`;

      if (
        errorMessage.includes("database") ||
        errorMessage.includes("connection") ||
        errorMessage.includes("timeout")
      ) {
        throw new Error(
          "Database connection is currently unavailable. Please try again later."
        );
      }

      throw new Error(errorMessage);
    }
    const result = await response.json();

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

    if (error instanceof Error) {
      if (error.message.includes("fetch")) {
        throw new Error(
          "Unable to connect to the server. Please check your internet connection."
        );
      }
      throw error;
    }

    throw new Error("Failed to fetch prescriptions");
  }
}

async function createPrescription(
  prescription: Prescription
): Promise<{ success: boolean; id: string }> {
  try {
    const response = await fetch("/api/prescriptions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(prescription),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const errorMessage =
        error.error || `Failed to create prescription (${response.status})`;

      if (
        errorMessage.includes("database") ||
        errorMessage.includes("connection") ||
        errorMessage.includes("timeout")
      ) {
        throw new Error(
          "Database connection is currently unavailable. Please try again later."
        );
      }

      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    console.error("Error creating prescription:", error);

    if (error instanceof Error) {
      if (error.message.includes("fetch")) {
        throw new Error(
          "Unable to connect to the server. Please check your internet connection."
        );
      }
      throw error;
    }

    throw new Error("Failed to create prescription");
  }
}

async function deletePrescription(
  prescriptionId: string
): Promise<{ success: boolean }> {
  try {
    const response = await fetch(`/api/prescriptions/${prescriptionId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const errorMessage =
        error.error || `Failed to delete prescription (${response.status})`;

      if (
        errorMessage.includes("database") ||
        errorMessage.includes("connection") ||
        errorMessage.includes("timeout")
      ) {
        throw new Error(
          "Database connection is currently unavailable. Please try again later."
        );
      }

      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    console.error("Error deleting prescription:", error);

    if (error instanceof Error) {
      if (error.message.includes("fetch")) {
        throw new Error(
          "Unable to connect to the server. Please check your internet connection."
        );
      }
      throw error;
    }

    throw new Error("Failed to delete prescription");
  }
}

// Helper function to create empty prescription
function createEmptyPrescription(userId?: string): Prescription {
  return {
    id: Date.now().toString(),
    userId: userId || "",
    patientName: "",
    patientAge: "",
    patientGender: "",
    patientPhone: "",
    patientAddress: "",
    medicines: [
      {
        id: Math.random().toString(36).substr(2, 9),
        medicine: "",
        dosage: "",
        frequency: "",
        duration: "",
        form: "tablet",
        route: "oral",
        timing: "after_meal",
        withFood: false,
        instructions: "",
        notes: "",
        prescriptionId: "",
      },
    ],
    chiefComplaint: "",
    pulseRate: "",
    heartRate: "",
    bloodPressure: "",
    temperature: "",
    respiratoryRate: "",
    oxygenSaturation: "",
    weight: "",
    height: "",
    allergies: "",
    currentMedications: "",
    pastMedicalHistory: "",
    familyHistory: "",
    socialHistory: "",
    physicalExam: "",
    medicalExams: [],
    examNotes: "",
    cnsExamination: "",
    cardiovascularExamination: "",
    respiratoryExamination: "",
    gastrointestinalExamination: "",
    musculoskeletalExamination: "",
    genitourinaryExamination: "",
    dermatologicalExamination: "",
    entExamination: "",
    ophthalmologicalExamination: "",
    bmi: "",
    instructions: "",
    followUp: "",
    restrictions: "",
    doctorName: "Dr. Ahmad Farid",
    doctorLicenseNumber: "",
    clinicName: "Specialty Clinic",
    clinicAddress: "",
    doctorFree: "",
    prescriptionDate: new Date(),
    prescriptionNumber: "",
    source: "manual",
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export default function DashboardClient({
  initialPrescriptions,
  databaseStatus = "unknown",
}: DashboardClientProps) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [prescription, setPrescription] = useState<Prescription>(() =>
    createEmptyPrescription(user?.id)
  );

  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "create" | "presets" | "history" | "amounts"
  >("create");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const queryClient = useQueryClient();

  // TanStack Query for prescriptions
  const {
    data: prescriptions = initialPrescriptions,
    isLoading: prescriptionsLoading,
    error: prescriptionsError,
    refetch: refetchPrescriptions,
  } = useQuery({
    queryKey: ["prescriptions"],
    queryFn: fetchPrescriptions,
    staleTime: 5 * 60 * 1000,
    initialData: initialPrescriptions,
    refetchOnMount: false,
  });

  // Mutation for saving prescriptions
  const createMutation = useMutation({
    mutationFn: createPrescription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
      setPrescription(createEmptyPrescription());
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

  // Calculate statistics
  const todayPrescriptions = prescriptions.filter((p) => {
    const today = new Date().toDateString();
    return new Date(p.createdAt).toDateString() === today;
  }).length;

  const monthlyPrescriptions = prescriptions.filter((p) => {
    const now = new Date();
    const prescriptionDate = new Date(p.createdAt);
    return (
      prescriptionDate.getMonth() === now.getMonth() &&
      prescriptionDate.getFullYear() === now.getFullYear()
    );
  }).length;

  const handleQuickPreset = (presetData: Prescription) => {
    setPrescription(presetData);
    setError(null);
    setActiveTab("create");
  };

  const handleSavePrescription = async (prescriptionToSave: Prescription) => {
    await createMutation.mutateAsync(prescriptionToSave);
  };

  const handleCancelEdit = () => {
    setPrescription(createEmptyPrescription());
  };

  const handleEditPrescription = (prescriptionToEdit: Prescription) => {
    setPrescription(prescriptionToEdit);
    setActiveTab("create");
    setError(null);
  };

  const handleDeletePrescription = (prescriptionId: string) => {
    deleteMutation.mutate(prescriptionId);
  };

  const handleLogout = async () => {
    await signOut();
  };

  const handleRoyalHeaderLogout = async () => {
    await signOut();
  };

  const handleError = (error: string) => {
    setError(error);
  };

  const isSaving = createMutation.isPending;
  const isDeleting = deleteMutation.isPending;

  const columns = useColumns({
    onEdit: handleEditPrescription,
    onDelete: handleDeletePrescription,
  });

  // Get user initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (!user) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        {/* Royal Header */}
        <CyberpunkHeader
          todayPrescriptions={todayPrescriptions}
          monthlyPrescriptions={monthlyPrescriptions}
          onLogout={handleRoyalHeaderLogout}
        />

        {/* Database Status Banner */}
        {databaseStatus !== "connected" && (
          <div
            className={`
              ${
                databaseStatus === "error"
                  ? "bg-destructive/10 border-destructive/20 text-destructive"
                  : "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200"
              } border-b
            `}
          >
            <div className="container px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`
                      h-2 w-2 rounded-full animate-pulse
                      ${
                        databaseStatus === "error"
                          ? "bg-destructive"
                          : "bg-yellow-500"
                      }
                    `}
                  ></div>
                  <span className="text-sm font-medium">
                    {databaseStatus === "disconnected" &&
                      "Database connection lost - some features are limited"}
                    {databaseStatus === "error" &&
                      "Database connection error - please refresh the page"}
                    {databaseStatus === "unknown" &&
                      "Checking database connection..."}
                  </span>
                </div>
                <Button variant="ghost" size="sm" className="h-7 px-2">
                  <Database className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="container mx-auto px-4 py-6 sm:py-8">
          {/* Main Tabs - Fixed for Mobile & Dark Mode */}
          <Card className="mb-6 sm:mb-8 border-border/50 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as any)}
                className="w-full"
              >
                <TabsList className="w-full justify-start h-auto p-0 border-b bg-transparent overflow-x-auto flex-nowrap scrollbar-hide">
                  <TabsTrigger
                    value="create"
                    className="
                        relative 
                        data-[state=active]:border-b-2 
                        data-[state=active]:border-primary 
                        data-[state=active]:bg-primary/5
                        rounded-none 
                        px-3 sm:px-4 md:px-6 
                        py-3 sm:py-4
                        h-auto 
                        text-xs sm:text-sm
                        flex-shrink-0
                        flex items-center gap-1 sm:gap-2
                        text-muted-foreground 
                        data-[state=active]:text-primary
                        dark:text-gray-300
                        dark:data-[state=active]:text-primary
                        dark:data-[state=active]:bg-primary/10
                        transition-colors duration-200
                        hover:text-foreground dark:hover:text-white
                      "
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
                    <div className="text-right">
                      <div className="font-medium sm:font-semibold">
                        ایجاد نسخه
                      </div>
                      <div className="hidden xs:block text-[10px] sm:text-xs text-muted-foreground dark:text-gray-400">
                        فرم جامع
                      </div>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger
                    value="presets"
                    className="
                        relative 
                        data-[state=active]:border-b-2 
                        data-[state=active]:border-primary 
                        data-[state=active]:bg-primary/5
                        rounded-none 
                        px-3 sm:px-4 md:px-6 
                        py-3 sm:py-4
                        h-auto 
                        text-xs sm:text-sm
                        flex-shrink-0
                        flex items-center gap-1 sm:gap-2
                        text-muted-foreground 
                        data-[state=active]:text-primary
                        dark:text-gray-300
                        dark:data-[state=active]:text-primary
                        dark:data-[state=active]:bg-primary/10
                        transition-colors duration-200
                        hover:text-foreground dark:hover:text-white
                      "
                  >
                    <FileText className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
                    <div className="text-right">
                      <div className="font-medium sm:font-semibold">
                        قالب‌ها
                      </div>
                      <div className="hidden xs:block text-[10px] sm:text-xs text-muted-foreground dark:text-gray-400">
                        قالب‌های آماده
                      </div>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger
                    value="history"
                    className="
                        relative 
                        data-[state=active]:text-primary 
                        data-[state=active]:border-b-2 
                        data-[state=active]:border-primary 
                        data-[state=active]:bg-primary/5
                        rounded-none 
                        px-3 sm:px-4 md:px-6 
                        py-3 sm:py-4
                        h-auto 
                        text-xs sm:text-sm
                        flex-shrink-0
                        flex items-center gap-1 sm:gap-2
                        text-muted-foreground
                        dark:text-gray-300
                        dark:data-[state=active]:text-primary
                        dark:data-[state=active]:bg-primary/10
                        transition-colors duration-200
                        hover:text-foreground dark:hover:text-white
                      "
                  >
                    <History className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
                    <div className="text-right">
                      <div className="font-medium sm:font-semibold">
                        تاریخچه
                      </div>
                      <div className="hidden xs:block text-[10px] sm:text-xs text-muted-foreground dark:text-gray-400">
                        {prescriptions.length} نسخه
                      </div>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger
                    value="amounts"
                    className="
                        relative 
                        data-[state=active]:text-primary 
                        data-[state=active]:border-b-2 
                        data-[state=active]:border-primary 
                        data-[state=active]:bg-primary/5
                        rounded-none 
                        px-3 sm:px-4 md:px-6 
                        py-3 sm:py-4
                        h-auto 
                        text-xs sm:text-sm
                        flex-shrink-0
                        flex items-center gap-1 sm:gap-2
                        text-muted-foreground
                        dark:text-gray-300
                        dark:data-[state=active]:text-primary
                        dark:data-[state=active]:bg-primary/10
                        transition-colors duration-200
                        hover:text-foreground dark:hover:text-white
                      "
                  >
                    <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
                    <div className="text-right">
                      <div className="font-medium sm:font-semibold">بل ها </div>
                      <div className="hidden xs:block text-[10px] sm:text-xs text-muted-foreground dark:text-gray-400">
                        مدیریت مبالغ
                      </div>
                    </div>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="create" className="p-4 sm:p-6">
                  <div className="space-y-6">
                    <EnhancedPrescriptionForm
                      prescription={prescription}
                      onSave={handleSavePrescription}
                      onCancel={handleCancelEdit}
                      isSaving={isSaving}
                    />

                    {error && (
                      <ErrorAlert
                        message={error}
                        onDismiss={() => setError(null)}
                      />
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="presets" className="p-4 sm:p-6">
                  <PresetsTab
                    onPresetSelect={handleQuickPreset}
                    onError={handleError}
                  />
                </TabsContent>

                <TabsContent value="history" className="p-4 sm:p-6">
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                      <div>
                        <h3 className="text-lg font-semibold">
                          تاریخچه نسخه‌ها
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          لیست تمام نسخه‌های ذخیره شده در پایگاه داده
                        </p>
                      </div>
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => refetchPrescriptions()}
                          className="flex-1 sm:flex-none"
                        >
                          <Clock className="h-4 w-4 ml-2" />
                          بروزرسانی
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => setActiveTab("create")}
                          className="flex-1 sm:flex-none"
                        >
                          <Plus className="h-4 w-4 ml-2" />
                          نسخه جدید
                        </Button>
                      </div>
                    </div>
                    {prescriptionsLoading ? (
                      <Card>
                        <CardContent className="flex justify-center items-center py-12">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-muted-foreground">
                              در حال بارگذاری نسخه‌ها...
                            </p>
                          </div>
                        </CardContent>
                      </Card>
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
                      <div className="overflow-x-auto">
                        <Card>
                          <CardContent className="p-0">
                            <DataTable columns={columns} data={prescriptions} />
                          </CardContent>
                        </Card>
                      </div>
                    ) : (
                      <Card>
                        <CardContent className="text-center py-12">
                          <div className="mb-6">
                            <History className="h-16 w-16 mx-auto text-muted-foreground/30" />
                          </div>
                          <h4 className="text-lg font-medium mb-2">
                            هنوز هیچ نسخه‌ای ثبت نشده است
                          </h4>
                          <p className="text-muted-foreground mb-6">
                            برای شروع، یک نسخه جدید ایجاد کنید یا از قالب‌های
                            آماده استفاده کنید.
                          </p>
                          <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button
                              variant="default"
                              onClick={() => setActiveTab("create")}
                              className="flex items-center gap-2"
                            >
                              <Plus className="h-4 w-4" />
                              ایجاد اولین نسخه
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setActiveTab("presets")}
                            >
                              مشاهده قالب‌ها
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="amounts" className="p-4 sm:p-6">
                  <PrescriptionAmount />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        {/* Footer */}
        <footer className="mt-8 sm:mt-12 border-t bg-card">
          <div className="container px-4 py-6 sm:py-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              <div>
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <Stethoscope className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  <span className="text-base sm:text-lg font-bold">
                    سیستم نسخه‌پیچی
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  پلتفرم هوشمند مدیریت نسخه‌های پزشکی با قابلیت‌های پیشرفته
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-3 sm:mb-4 text-sm sm:text-base">
                  امکانات
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                  <li>نسخه‌نویس هوشمند</li>
                  <li>قالب‌های آماده پزشکی</li>
                  <li>مدیریت تاریخچه نسخه‌ها</li>
                  <li>مدیریت تعرفه‌های ویزیت</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-3 sm:mb-4 text-sm sm:text-base">
                  پشتیبانی
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                  <li>راهنمای استفاده</li>
                  <li>پرسش‌های متداول</li>
                  <li>تماس با پشتیبانی</li>
                  <li>گزارش مشکل</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-3 sm:mb-4 text-sm sm:text-base">
                  امنیت
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                  تمامی اطلاعات بیماران با بالاترین سطح امنیتی ذخیره می‌شود.
                </p>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  <span className="text-xs sm:text-sm font-medium">
                    منطبق با HIPAA
                  </span>
                </div>
              </div>
            </div>
            <Separator className="my-4 sm:my-6" />
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-center sm:text-left">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  © {new Date().getFullYear()} سیستم نویسی آنلاین. تمامی حقوق
                  محفوظ است.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Developed by Rahimi Solution Team
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-xs">
                  نسخه ۱.۰.۰
                </Badge>
                <Badge variant="outline" className="text-xs">
                  آنلاین
                </Badge>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
}
