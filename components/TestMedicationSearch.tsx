"use client";

import { useEffect } from "react";
import { SmartMedicationSearch } from "@/components/SmartMedicationSearch";
import { medicationDB } from "@/services/medicationDatabaseService";

export default function TestMedicationSearch() {
  useEffect(() => {
    console.log("=== Testing Medication Database ===");
    console.log("Total medications:", medicationDB.getAll().length);
    console.log("Search for 'استامینوفن':", medicationDB.search("استامینوفن"));
    console.log("Search for 'ibuprofen':", medicationDB.search("ibuprofen"));
    console.log("Search for 'آمو':", medicationDB.search("آمو"));
  }, []);

  const handleChange = (value: string, medication?: any) => {
    console.log("Selected:", value, medication);
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">تست جستجوی دارو</h2>
      <p className="text-sm text-gray-600 mb-4">
        برای تست، این کلمات را امتحان کنید: استامینوفن، ایبوپروفن، آموکسی‌سیلین
      </p>
      <SmartMedicationSearch
        onChange={handleChange}
        placeholder="نام دارو را جستجو کنید..."
      />
    </div>
  );
}
