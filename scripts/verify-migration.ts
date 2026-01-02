// scripts/verify-migration.ts
import { db } from "../db/index";
import { sql } from "drizzle-orm";

async function verifyMigration() {
  try {
    console.log("🔍 Checking if body metrics columns exist...");

    // Check if the body metrics columns exist
    const result = await db.execute(sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'prescriptions' 
      AND column_name IN (
        'waist_circumference', 'hip_circumference', 'body_fat_percentage', 
        'lean_body_mass', 'ideal_body_weight', 'adjusted_body_weight',
        'basal_metabolic_rate', 'total_daily_energy_expenditure', 
        'body_surface_area', 'waist_to_height_ratio', 'water_requirement'
      )
      ORDER BY column_name
    `);
    console.log("🔍 Body metrics columns check:");
    if ((result as any).rows.length === 0) {
      console.log(
        "❌ No body metrics columns found - migration may have failed"
      );
    } else {
      console.log("✅ Found body metrics columns:");
      (result as any).rows.forEach((row: any) => {
        console.log(
          `  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`
        );
      });
    }

    const expectedColumns = [
      "waist_circumference",
      "hip_circumference",
      "body_fat_percentage",
      "lean_body_mass",
      "ideal_body_weight",
      "adjusted_body_weight",
      "basal_metabolic_rate",
      "total_daily_energy_expenditure",
      "body_surface_area",
      "waist_to_height_ratio",
      "water_requirement",
    ];

    const existingColumns = (result as any).rows.map(
      (row: any) => row.column_name
    );
    const missingColumns = expectedColumns.filter(
      (col) => !existingColumns.includes(col)
    );

    if (missingColumns.length === 0) {
      console.log("\n🎉 Migration verification successful!");
      console.log(
        "✅ All expected body metrics columns are present in the database"
      );
      console.log(
        "✅ The application should now be able to fetch prescriptions without errors"
      );
      console.log(
        "✅ You can now restart your application and the 'waist_circumference does not exist' error should be resolved"
      );
    } else {
      console.log(
        `\n❌ Migration verification failed! Missing columns: ${missingColumns.join(
          ", "
        )}`
      );
    }
  } catch (error) {
    console.error("❌ Verification failed:", error);
    process.exit(1);
  }
}

// Run the verification
verifyMigration()
  .then(() => {
    console.log("Verification completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Verification failed:", error);
    process.exit(1);
  });
