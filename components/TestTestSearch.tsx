"use client";

import { useEffect } from "react";
import { SmartTestSearch } from "@/components/SmartTestSearch";
import { testDB } from "@/services/testDatabaseService";

export default function TestTestSearch() {
  useEffect(() => {
    console.log("=== Testing Test Database ===");
    console.log("Total tests:", testDB.getAll().length);
    console.log("Search for 'blood':", testDB.search("blood"));
    console.log("Search for 'chest':", testDB.search("chest"));
    console.log("Search for 'MRI':", testDB.search("MRI"));
    console.log("Laboratory tests:", testDB.getByType("Laboratory").length);
    console.log("Imaging tests:", testDB.getByType("Imaging").length);
    console.log("Special tests:", testDB.getByType("Special Test").length);
  }, []);

  const handleChange = (value: string, test?: any) => {
    console.log("Selected test:", value, test);
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">
        تست جستجوی آزمایش و تصویربرداری
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        برای تست، این کلمات را امتحان کنید: CBC،Chest X-ray،MRI،Ultrasound
      </p>
      <SmartTestSearch
        onChange={handleChange}
        placeholder="نام آزمایش یا تصویربرداری را جستجو کنید..."
      />
    </div>
  );
}
