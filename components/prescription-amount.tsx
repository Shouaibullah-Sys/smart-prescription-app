// components/prescription-amount.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DollarSign,
  Calendar,
  User,
  FileText,
  Search,
  Filter,
  Download,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { Prescription } from "@/types/prescription";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// API function to fetch prescriptions
async function fetchPrescriptions(): Promise<Prescription[]> {
  const response = await fetch("/api/prescriptions");
  if (!response.ok) {
    throw new Error("Failed to fetch prescriptions");
  }
  return response.json();
}

// Date utility functions
const getDateRange = (range: string) => {
  const now = new Date();
  const start = new Date();
  const end = new Date();

  switch (range) {
    case "today":
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case "this-week":
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      start.setDate(diff);
      start.setHours(0, 0, 0, 0);
      end.setDate(diff + 6);
      end.setHours(23, 59, 59, 999);
      break;
    case "this-month":
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(now.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case "this-year":
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(11, 31);
      end.setHours(23, 59, 59, 999);
      break;
    case "last-month":
      start.setMonth(now.getMonth() - 1, 1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(now.getMonth(), 0);
      end.setHours(23, 59, 59, 999);
      break;
    default:
      return { start: null, end: null };
  }

  return { start, end };
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("fa-IR").format(amount);
};

const formatDate = (dateInput: string | Date) => {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  return date.toLocaleDateString("fa-IR");
};

// Table columns definition
const columns: ColumnDef<Prescription>[] = [
  {
    accessorKey: "patientName",
    header: "نام بیمار",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full">
          <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <div className="font-medium">{row.getValue("patientName")}</div>
          <div className="text-sm text-muted-foreground">
            {row.original.chiefComplaint}
          </div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "chiefComplaint",
    header: "شکایت اصلی",
    cell: ({ row }) => (
      <div
        className="max-w-[200px] truncate"
        title={row.getValue("chiefComplaint")}
      >
        {row.getValue("chiefComplaint")}
      </div>
    ),
  },
  {
    accessorKey: "prescriptionDate",
    header: "تاریخ نسخه",
    cell: ({ row }) => formatDate(row.getValue("prescriptionDate")),
  },
  {
    accessorKey: "doctorFree",
    header: "مبلغ ویزیت",
    cell: ({ row }) => {
      const amount = row.getValue("doctorFree") as string;
      const numericAmount = parseFloat(amount?.replace(/[^\d.]/g, "") || "0");
      return (
        <Badge variant="secondary" className="text-lg font-bold">
          {formatCurrency(numericAmount)} افغانی
        </Badge>
      );
    },
  },
];

export function PrescriptionAmount() {
  const [dateRange, setDateRange] = useState<string>("this-month");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const {
    data: prescriptions = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["prescriptions"],
    queryFn: fetchPrescriptions,
    staleTime: 5 * 60 * 1000,
  });

  // Apply date range filter
  const filteredByDate = useMemo(() => {
    if (!startDate && !endDate && dateRange === "all") {
      return prescriptions;
    }

    let range = { start: startDate, end: endDate };
    if (dateRange !== "custom" && dateRange !== "all") {
      range = getDateRange(dateRange);
    }

    return prescriptions.filter((prescription) => {
      const prescriptionDate = new Date(prescription.prescriptionDate);

      if (range.start && range.end) {
        return prescriptionDate >= range.start && prescriptionDate <= range.end;
      } else if (range.start) {
        return prescriptionDate >= range.start;
      } else if (range.end) {
        return prescriptionDate <= range.end;
      }

      return true;
    });
  }, [prescriptions, dateRange, startDate, endDate]);

  // Filter prescriptions that have doctorFree amount and apply search
  const prescriptionsWithAmount = useMemo(() => {
    return filteredByDate.filter((prescription) => {
      const hasAmount =
        prescription.doctorFree && prescription.doctorFree.trim() !== "";
      const matchesSearch =
        prescription.patientName
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        prescription.doctorFree
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());

      return hasAmount && (searchQuery === "" || matchesSearch);
    });
  }, [filteredByDate, searchQuery]);

  // Calculate total amounts
  const totalAmount = useMemo(() => {
    return prescriptionsWithAmount.reduce((sum, prescription) => {
      const amountString =
        prescription.doctorFree?.replace(/[^\d.]/g, "") || "0";
      const amount = parseFloat(amountString) || 0;
      return sum + amount;
    }, 0);
  }, [prescriptionsWithAmount]);

  // Initialize TanStack Table
  const table = useReactTable({
    data: prescriptionsWithAmount,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  // Quick date range buttons
  const dateRangeButtons = [
    { value: "today", label: "امروز" },
    { value: "this-week", label: "این هفته" },
    { value: "this-month", label: "این ماه" },
    { value: "last-month", label: "ماه قبل" },
    { value: "this-year", label: "امسال" },
    { value: "all", label: "همه زمان" },
  ];

  const handleDateRangeChange = (value: string) => {
    setDateRange(value);
    if (value !== "custom") {
      setStartDate(null);
      setEndDate(null);
    }
  };

  const handleExport = () => {
    const data = prescriptionsWithAmount.map((prescription) => ({
      patientName: prescription.patientName,
      chiefComplaint: prescription.chiefComplaint,
      prescriptionDate: formatDate(prescription.prescriptionDate),
      doctorFree: prescription.doctorFree,
      amount: parseFloat(
        prescription.doctorFree?.replace(/[^\d.]/g, "") || "0"
      ),
    }));

    const csvContent = [
      ["نام بیمار", "تشخیص", "تاریخ نسخه", "مبلغ ویزیت", "مبلغ (عدد)"],
      ...data.map((row) => [
        row.patientName,
        row.chiefComplaint,
        row.prescriptionDate,
        row.doctorFree,
        row.amount.toString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `prescription-amounts-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    link.click();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="mr-2">در حال بارگذاری...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-500">
            خطا در بارگذاری اطلاعات نسخه‌ها
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              تعداد کل نسخه‌ها
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {prescriptionsWithAmount.length}
            </div>
            <p className="text-xs text-muted-foreground">
              نسخه‌های دارای هزینه
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مجموع درآمد</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalAmount)} افغانی
            </div>
            <p className="text-xs text-muted-foreground">کل هزینه‌های ویزیت</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">میانگین ویزیت</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {prescriptionsWithAmount.length > 0
                ? formatCurrency(totalAmount / prescriptionsWithAmount.length)
                : 0}{" "}
              افغانی
            </div>
            <p className="text-xs text-muted-foreground">متوسط هر ویزیت</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">بازه زمانی</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {dateRangeButtons.find((btn) => btn.value === dateRange)?.label}
            </div>
            <p className="text-xs text-muted-foreground">فیلتر فعال</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            فیلترها و جستجو
          </CardTitle>
          <CardDescription>
            می‌توانید نسخه‌ها را بر اساس تاریخ و سایر معیارها فیلتر کنید
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Quick Date Range Buttons */}
            <div className="lg:col-span-2">
              <label className="text-sm font-medium mb-2 block">
                بازه زمانی سریع
              </label>
              <div className="flex flex-wrap gap-2">
                {dateRangeButtons.map((button) => (
                  <Button
                    key={button.value}
                    variant={dateRange === button.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleDateRangeChange(button.value)}
                  >
                    {button.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Date Range */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                تاریخ شروع
              </label>
              <DatePicker
                date={startDate}
                setDate={setStartDate}
                onSelect={() => setDateRange("custom")}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                تاریخ پایان
              </label>
              <DatePicker
                date={endDate}
                setDate={setEndDate}
                onSelect={() => setDateRange("custom")}
              />
            </div>
          </div>

          {/* Search */}
          <div className="mt-4">
            <label className="text-sm font-medium mb-2 block">جستجو</label>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="جستجو بر اساس نام بیمار، تشخیص یا مبلغ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              جزئیات درآمد نسخه‌ها
            </CardTitle>
            <CardDescription>
              لیست کامل تمام نسخه‌های دارای هزینه ویزیت (
              {prescriptionsWithAmount.length} مورد)
            </CardDescription>
          </div>
          <Button
            variant="outline"
            onClick={handleExport}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            خروجی Excel
          </Button>
        </CardHeader>
        <CardContent>
          {prescriptionsWithAmount.length > 0 ? (
            <div className="space-y-4">
              {/* Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => {
                          return (
                            <TableHead key={header.id}>
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                            </TableHead>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow
                          key={row.id}
                          data-state={row.getIsSelected() && "selected"}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          className="h-24 text-center"
                        >
                          موردی یافت نشد.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  نمایش {table.getFilteredRowModel().rows.length} از{" "}
                  {prescriptionsWithAmount.length} مورد
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className="flex items-center gap-1"
                  >
                    <ChevronRight className="h-4 w-4" />
                    قبلی
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from(
                      { length: table.getPageCount() },
                      (_, i) => i + 1
                    ).map((page) => (
                      <Button
                        key={page}
                        variant={
                          table.getState().pagination.pageIndex === page - 1
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => table.setPageIndex(page - 1)}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    className="flex items-center gap-1"
                  >
                    بعدی
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>هیچ نسخه‌ای با هزینه ویزیت یافت نشد</p>
              <p className="text-sm mt-2">
                برای نمایش درآمدها، لطفاً در فرم نسخه‌ها هزینه ویزیت دکتر را
                وارد کنید یا فیلترها را تنظیم کنید
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
