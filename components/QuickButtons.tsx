// components/QuickButtons.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { getPresetPrescriptions } from "../utils/apiClient";
import type { Prescription, FormMedicine } from "../types/prescription";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Stethoscope,
  Clock,
  AlertTriangle,
  Zap,
  ChevronDown,
  Search,
  Pill,
} from "lucide-react";

interface QuickButtonsProps {
  onPresetSelect: (presetData: Prescription) => void;
  onError: (error: string) => void;
}

interface ConditionPreset {
  id: string;
  name: string;
  description?: string;
  urgency?: "low" | "medium" | "high";
  preview?: string;
  prescription?: Prescription;
}

const DEFAULT_PRESETS: ConditionPreset[] = [
  {
    id: "common_cold",
    name: "سرماخوردگی معمولی",
    urgency: "low",
    preview: "استراحت، استامینوفن، مایعات فراوان",
    prescription: {
      id: "preset_common_cold",
      userId: "",
      patientName: "",
      prescriptionDate: new Date(),
      doctorName: "",
      medicines: [
        {
          id: "med1",
          medicine: "Paracetamol (Acetaminophen)",
          dosage: "500 mg",
          frequency: "1X3",
          duration: "3-5 روز",
          route: "PO",
          withFood: false,
          instructions: "برای تب و درد. بررسی عملکرد کبد در بیماران پرخطر.",
          notes: "",
          prescriptionId: "preset_common_cold",
        },
        {
          id: "med2",
          medicine: "Saline nasal spray / drops",
          dosage: "طبق دستور محصول",
          frequency: "1/1/1",
          duration: "تا رفع علائم",
          route: "Intranasal",
          withFood: false,
          instructions: "برای کاهش احتقان بینی.",
          notes: "",
          prescriptionId: "preset_common_cold",
        },
      ],
      chiefComplaint: "آبریزش بینی، عطسه، سرفه خفیف",
      allergies: [],
      currentMedications: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      source: "default",
    },
  },
  {
    id: "flu",
    name: "آنفولانزا",
    urgency: "high",
    preview: "تب بالا، بدن درد، شروع سریع؛ ارزیابی آنتی‌ویرال",
    prescription: {
      id: "preset_flu",
      userId: "",
      patientName: "",
      prescriptionDate: new Date(),
      doctorName: "",
      medicines: [
        {
          id: "med1",
          medicine: "Paracetamol",
          dosage: "500 mg",
          frequency: "1X2",
          duration: "تا بهبود",
          route: "PO",
          withFood: false,
          instructions: "کنترل تب و درد.",
          notes: "",
          prescriptionId: "preset_flu",
        },
        {
          id: "med2",
          medicine: "Oseltamivir",
          dosage: "75 mg",
          frequency: "1X2",
          duration: "5 روز",
          route: "PO",
          withFood: false,
          instructions: "در صورت اندیکاسیون و شروع در 48 ساعت اول.",
          notes: "بیماران پرخطر یا شدید.",
          prescriptionId: "preset_flu",
        },
      ],
      chiefComplaint: "تب، سردرد، درد بدن، سرفه خشک",
      allergies: [],
      currentMedications: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      source: "default",
    },
  },
  {
    id: "sinusitis",
    name: "سینوزیت حاد",
    urgency: "medium",
    preview: "گرفتگی بینی، درد صورت، ترشح غلیظ",
    prescription: {
      id: "preset_sinusitis",
      userId: "",
      patientName: "",
      prescriptionDate: new Date(),
      doctorName: "",
      medicines: [
        {
          id: "med1",
          medicine: "Amoxicillin",
          dosage: "500 mg",
          frequency: "1X4",
          duration: "5-7 روز",
          route: "PO",
          withFood: true,
          instructions: "در موارد طول کشیده یا بدتر شدن علائم؛ طبق راهنما.",
          notes: "",
          prescriptionId: "preset_sinusitis",
        },
        {
          id: "med2",
          medicine: "Mometasone nasal spray",
          dosage: "طبق دستور محصول",
          frequency: "1X1",
          duration: "تا 14 روز",
          route: "Intranasal",
          withFood: false,
          instructions: "کاهش التهاب سینوس.",
          notes: "",
          prescriptionId: "preset_sinusitis",
        },
      ],
      chiefComplaint: "درد صورت، گرفتگی بینی، ترشح پشت حلق",
      allergies: [],
      currentMedications: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      source: "default",
    },
  },
  {
    id: "tonsillitis",
    name: "التهاب لوزه (تونسیلیت)",
    urgency: "medium",
    preview: "گلودرد شدید، تب؛ ارزیابی برای استرپتوکوک",
    prescription: {
      id: "preset_tonsillitis",
      userId: "",
      patientName: "",
      prescriptionDate: new Date(),
      doctorName: "",
      medicines: [
        {
          id: "med1",
          medicine: "Amoxicillin",
          dosage: "500 mg",
          frequency: "1X3",
          duration: "10 روز",
          route: "PO",
          withFood: true,
          instructions: "در صورت تأیید استرپتوکوک یا علائم شدید.",
          notes: "",
          prescriptionId: "preset_tonsillitis",
        },
        {
          id: "med2",
          medicine: "Paracetamol",
          dosage: "500 mg",
          frequency: "1X3",
          duration: "تا بهبود",
          route: "PO",
          withFood: false,
          instructions: "کنترل تب و درد.",
          notes: "",
          prescriptionId: "preset_tonsillitis",
        },
      ],
      chiefComplaint: "گلودرد شدید، دشواری بلع، تب",
      allergies: [],
      currentMedications: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      source: "default",
    },
  },
  {
    id: "allergy",
    name: "حساسیت فصلی",
    urgency: "low",
    preview: "عطسه، آبریزش بینی، خارش",
    prescription: {
      id: "preset_allergy",
      userId: "",
      patientName: "",
      prescriptionDate: new Date(),
      doctorName: "",
      medicines: [
        {
          id: "med1",
          medicine: "Cetirizine",
          dosage: "10 mg",
          frequency: "1X1",
          duration: "تا رفع علائم",
          route: "PO",
          withFood: false,
          instructions: "آنتی‌هیستامین نسل دوم.",
          notes: "",
          prescriptionId: "preset_allergy",
        },
        {
          id: "med2",
          medicine: "Fluticasone nasal spray",
          dosage: "طبق دستور محصول",
          frequency: "1X1",
          duration: "تا رفع علائم",
          route: "Intranasal",
          withFood: false,
          instructions: "اسپری بینی برای حساسیت بینی.",
          notes: "",
          prescriptionId: "preset_allergy",
        },
      ],
      chiefComplaint: "عطسه، آبریزش بینی، خارش چشم",
      allergies: [],
      currentMedications: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      source: "default",
    },
  },
];

// Updated urgency config using shadcn semantic colors
const urgencyConfig = {
  low: {
    bg: "bg-emerald-50 dark:bg-emerald-950/20",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-800",
    badge:
      "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
    dot: "bg-emerald-500",
    label: "غیر فوری",
  },
  medium: {
    bg: "bg-amber-50 dark:bg-amber-950/20",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-800",
    badge:
      "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
    dot: "bg-amber-500",
    label: "نیمه فوری",
  },
  high: {
    bg: "bg-rose-50 dark:bg-rose-950/20",
    text: "text-rose-700 dark:text-rose-300",
    border: "border-rose-200 dark:border-rose-800",
    badge:
      "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800",
    dot: "bg-rose-500",
    label: "فوری",
  },
};

export default function QuickButtons({
  onPresetSelect,
  onError,
}: QuickButtonsProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [remotePresets, setRemotePresets] = useState<Record<
    string,
    Prescription
  > | null>(null);
  const [search, setSearch] = useState("");
  const [localPresets, setLocalPresets] =
    useState<ConditionPreset[]>(DEFAULT_PRESETS);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const presets = await getPresetPrescriptions();
        if (!mounted) return;
        if (presets && Object.keys(presets).length > 0) {
          setRemotePresets(presets);
          const augmented = DEFAULT_PRESETS.map((lp) => {
            const p = presets[lp.id];
            if (p) {
              return {
                ...lp,
                prescription: p,
                preview: lp.preview,
              };
            }
            return lp;
          });
          setLocalPresets(augmented);
        }
      } catch (err) {
        // ignore, keep defaults
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return localPresets;
    return localPresets.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.preview && p.preview.toLowerCase().includes(q))
    );
  }, [search, localPresets]);

  const handleQuickPreset = async (cond: ConditionPreset) => {
    setLoadingId(cond.id);
    setIsOpen(false);

    try {
      if (remotePresets && remotePresets[cond.id]) {
        onPresetSelect(remotePresets[cond.id]);
      } else if (cond.prescription) {
        onPresetSelect(cond.prescription);
      } else {
        throw new Error("پیش‌تنظیم یافت نشد");
      }
    } catch (err) {
      onError(err instanceof Error ? err.message : "خطای ناشناخته");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <Card className="border bg-card text-card-foreground shadow-sm">
      <CardHeader className="pb-4 space-y-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-xl font-bold">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            شرایط شایع
          </CardTitle>
          <Badge
            variant="secondary"
            className="bg-secondary text-secondary-foreground"
          >
            <Clock className="h-3 w-3 ml-1" />
            سریع
          </Badge>
        </div>

        <CardDescription className="text-muted-foreground leading-relaxed">
          برای شرایط شایع از پیش‌تنظیم‌های آماده استفاده کنید تا در زمان
          صرفه‌جویی شود.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search and Dropdown Section */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="جستجو در شرایط شایع..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10 bg-background"
            />
          </div>

          <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="min-w-[200px] justify-between bg-background hover:bg-accent"
              >
                <span>انتخاب شرایط پزشکی</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="w-[380px] max-h-80 overflow-y-auto bg-background border"
              align="start"
            >
              <DropdownMenuLabel className="flex items-center gap-2 text-foreground">
                <Stethoscope className="h-4 w-4" />
                شرایط شایع پزشکی
              </DropdownMenuLabel>

              <div className="p-2">
                <div className="relative">
                  <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                  <Input
                    placeholder="جستجو شرایط..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pr-8 bg-background text-sm h-8"
                  />
                </div>
              </div>

              <DropdownMenuSeparator />

              {filtered.map((p) => {
                const urgency = urgencyConfig[p.urgency || "medium"];
                return (
                  <DropdownMenuItem
                    key={p.id}
                    onSelect={() => handleQuickPreset(p)}
                    className="flex flex-col items-start gap-2 p-3 cursor-pointer hover:bg-accent focus:bg-accent"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${urgency.dot}`}
                        />
                        <span className="font-semibold text-foreground">
                          {p.name}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-xs ${urgency.badge}`}
                      >
                        {urgency.label}
                      </Badge>
                    </div>
                    <div className="w-full text-xs text-muted-foreground leading-relaxed">
                      {p.preview}
                    </div>

                    {/* Medicine Preview */}
                    {p.prescription?.medicines
                      ?.slice(0, 2)
                      .map((med, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-xs text-muted-foreground w-full"
                        >
                          <Pill className="h-3 w-3" />
                          <span className="flex-1">
                            <span className="font-medium">{med.medicine}</span>
                            {med.dosage && ` — ${med.dosage}`}
                          </span>
                        </div>
                      ))}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {/* Loading State */}
        {loadingId && (
          <Card className="border border-border bg-accent/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Spinner className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">
                      در حال تولید نسخه...
                    </p>
                    <p className="text-sm text-muted-foreground">
                      برای {localPresets.find((c) => c.id === loadingId)?.name}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Disclaimer */}
        <Card className="border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                  توجه: این پیش‌تنظیم‌ها صرفاً برای صرفه‌جویی در زمان طراحی
                  شده‌اند
                </p>
                <div className="text-xs text-amber-700 dark:text-amber-400 space-y-1">
                  <p>
                    تصمیم درمانی نهایی باید توسط پزشک با در نظر گرفتن موارد زیر
                    اتخاذ شود:
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>سن، بارداری، شیردهی و شرایط خاص بیمار</li>
                    <li>حساسیت‌ها و تداخلات دارویی</li>
                    <li>بیماری‌های مزمن و عملکرد کلیه/کبد</li>
                    <li>راهنمایی‌های منطقه‌ای و مقاومت آنتی‌بیوتیکی محلی</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
